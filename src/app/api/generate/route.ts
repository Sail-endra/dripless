import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import brandsData from '../../../data/brands.json';

export async function POST(req: Request) {
  const serpApiKey = process.env.SERPAPI_API_KEY || '';
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  try {
    const { imageBase64, gender, season } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY. Add it to your .env file and restart the app.' },
        { status: 500 }
      );
    }

    const genderPhrase = gender === 'men' ? "men's" : gender === 'women' ? "women's" : 'unisex';

    // STEP 1: Identify clothing item using GPT-4o Vision
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this clothing image and identify its details. Return JSON only:
{
  "item_type": "string (e.g. oversized hoodie)",
  "color": "string (e.g. navy blue)",
  "style": "string (e.g. casual streetwear)",
  "brand": "string (identify if possible, otherwise 'Unknown')",
  "material_guess": "string"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              }
            }
          ]
        }
      ],
    });

    const visionResultText = visionResponse.choices[0]?.message?.content || '{}';
    const identifiedItem = JSON.parse(visionResultText);
    const itemDescription = `${identifiedItem.color} ${identifiedItem.item_type}`;

    // STEP 2: Suggest complementary pieces
    const outfitResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional fashion stylist. Given a clothing item, suggest exactly 3 complementary pieces for a ${genderPhrase} outfit appropriate for ${season} season. Respond only with JSON.`
        },
        {
          role: "user",
          content: `I have a ${itemDescription} in ${identifiedItem.style} style. Suggest pieces to complete the outfit:
{
  "pieces": [
    {"item": "white straight leg jeans", "color": "white", "reason": "contrast"},
    {"item": "tan chunky sneakers", "color": "tan", "reason": "neutral base"},
    {"item": "black crossbody bag", "color": "black", "reason": "accent"}
  ]
}`
        }
      ],
    });

    const outfitResultText = outfitResponse.choices[0]?.message?.content || '{"pieces":[]}';
    const suggestedOutfitResult = JSON.parse(outfitResultText);
    const suggestedPieces: { item: string, color: string, reason: string }[] = suggestedOutfitResult.pieces || [];

    // STEP 3 & 4 in parallel: SerpApi searches and DALL-E generation
    const pieceDescriptions = suggestedPieces.map(p => `${p.color} ${p.item}`);
    
    // Start DALL-E 3 image generation
    const dallePrompt = `Editorial fashion flat lay on a pristine white background. A ${genderPhrase} ${season} outfit featuring: a ${itemDescription} (main piece), paired with ${pieceDescriptions.join(', ')}. Studio lighting, sharp focus, high-end magazine quality. No humans.`;
    
    const dallePromise = openai.images.generate({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1024",
      response_format: 'b64_json',
    }).then(res => {
         const base64Image = res?.data?.[0]?.b64_json;
         return base64Image ? `data:image/png;base64,${base64Image}` : '';
    }).catch(err => {
         console.error("DALL-E 3 error:", err);
         return '';
    });

    // Start SerpApi concurrent searches
    const serpApiPromises = suggestedPieces.map(async (piece) => {
      try {
         // Improved search query for better secondhand/resale results
         const query = `${piece.color} ${piece.item} secondhand resale pre-owned`;
         const queryParams = new URLSearchParams({
             engine: "google_shopping",
             q: query,
             api_key: serpApiKey,
             num: "5" // Get more results to filter effectively
         });

         const searchResponse = await fetch(`https://www.searchapi.io/api/v1/search?${queryParams}`);
         if (!searchResponse.ok) {
             throw new Error(`SearchAPI failed: ${searchResponse.statusText}`);
         }
         
         const result = await searchResponse.json();
         const shoppingResults = result.shopping_results || [];
         
         let finalProduct = null;
         for (const product of shoppingResults) {
             const title = (product.title || '').toLowerCase();
             const source = (product.source || '').toLowerCase();
             
             // Check for fast fashion brands to exclude
             const isFastFashion = brandsData.fast_fashion.some(b => 
                 title.includes(b.toLowerCase()) || source.includes(b.toLowerCase())
             );
             if (isFastFashion) continue;
             
             // prioritize sustainable brands
             const isSustainable = brandsData.sustainable.some(b => 
                 title.includes(b.toLowerCase()) || source.includes(b.toLowerCase())
             );
             
             if (!finalProduct) {
                 finalProduct = {
                     title: product.title,
                     price: product.price,
                     link: product.link,
                     thumbnail: product.thumbnail,
                     source: product.source,
                     isSustainable: isSustainable
                 };
             } else if (isSustainable && !finalProduct.isSustainable) {
                 finalProduct = {
                     title: product.title,
                     price: product.price,
                     link: product.link,
                     thumbnail: product.thumbnail,
                     source: product.source,
                     isSustainable: true
                 };
                 break; // Found a sustainable one, we're good
             }
         }

         if (!finalProduct && shoppingResults.length > 0) {
             finalProduct = {
                 title: shoppingResults[0].title,
                 price: shoppingResults[0].price,
                 link: shoppingResults[0].link,
                 thumbnail: shoppingResults[0].thumbnail,
                 source: shoppingResults[0].source,
                 isSustainable: false
             };
         }

         return {
             requestedItem: piece,
             product: finalProduct
         };
      } catch (err) {
         console.error(`Error fetching Serpai for ${piece.item}:`, err);
         return {
             requestedItem: piece,
             product: null
         };
      }
    });

    const [dalleImageUrl, products] = await Promise.all([
      dallePromise,
      Promise.all(serpApiPromises)
    ]);

    return NextResponse.json({
      success: true,
      identifiedItem,
      suggestedOutfit: products,
      outfitImageUrl: dalleImageUrl
    });

  } catch (error: unknown) {
    console.error('API Route Error:', error);
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
    const messageText = typeof error === 'object' && error !== null && 'message' in error ? error.message : undefined;
    const message =
      status === 401
        ? 'OpenAI API key is invalid or missing access.'
        : status === 429
          ? 'OpenAI rate limit or quota reached. Please try again later.'
          : typeof messageText === 'string'
            ? messageText
            : 'Internal Server Error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
