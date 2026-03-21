import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import brandsData from '../../../data/brands.json';

export async function POST(req: Request) {
  const serpApiKey = process.env.SERPAPI_API_KEY || '';
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
       console.warn('Missing OPENAI_API_KEY');
    }

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
              text: `Identify this clothing item. Return JSON only in this exact format, with no extra markdown:
{
  "item_type": "oversized hoodie",
  "color": "navy blue",
  "style": "casual streetwear",
  "material_guess": "cotton"
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
          role: "user",
          content: `Given a [${itemDescription}, ${identifiedItem.style} style], suggest exactly 3 complementary pieces to complete the outfit. Return JSON only:
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
    const suggestedOutfit = JSON.parse(outfitResultText);
    const suggestedPieces: { item: string, color: string, reason: string }[] = suggestedOutfit.pieces || [];

    // STEP 3 & 4 in parallel: SerpApi searches and DALL-E generation
    const pieceDescriptions = suggestedPieces.map(p => `${p.color} ${p.item}`);
    
    // Start DALL-E 3 image generation
    const dallePromise = openai.images.generate({
      model: "dall-e-3",
      prompt: `Fashion flat lay photo on white background: ${itemDescription}, ${pieceDescriptions.join(', ')}. Clean editorial style, soft lighting.`,
      n: 1,
      size: "1024x1024",
    }).then(res => {
         console.log("DALL-E raw response:", JSON.stringify(res.data));
         return res?.data?.[0]?.url || '';
    }).catch(err => {
         console.error("DALL-E 3 error:", err);
         return '';
    });

    // Start SerpApi concurrent searches
    const serpApiPromises = suggestedPieces.map(async (piece) => {
      try {
         const query = `${piece.color} ${piece.item} secondhand sustainable`;
         const queryParams = new URLSearchParams({
             engine: "google_shopping",
             q: query,
             sort_by: "price_low_to_high",
             api_key: serpApiKey
         });

         const searchResponse = await fetch(`https://www.searchapi.io/api/v1/search?${queryParams}`);
         if (!searchResponse.ok) {
             throw new Error(`SearchAPI failed: ${searchResponse.statusText}`);
         }
         
         const result = await searchResponse.json();
         const shoppingResults = result.shopping_results || [];
         
         // Pick the best item, preferably sustainable
         let finalProduct = null;
         for (const product of shoppingResults) {
             const title = (product.title || '').toLowerCase();
             const source = (product.source || '').toLowerCase();
             
             // Simple fast fashion filter
             const isFastFashion = brandsData.fast_fashion.some(b => 
                 title.includes(b.toLowerCase()) || source.includes(b.toLowerCase())
             );
             if (isFastFashion) continue; // skip this product entirely
             
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
                 // Upgrade to a sustainable option if we find one
                 finalProduct = {
                     title: product.title,
                     price: product.price,
                     link: product.link,
                     thumbnail: product.thumbnail,
                     source: product.source,
                     isSustainable: true
                 };
                 break;
             }
         }

         if (!finalProduct && shoppingResults.length > 0) {
             // Fallback
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

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
