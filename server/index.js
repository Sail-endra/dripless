const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// POST /api/outfit — Analyze clothing image and suggest complementary pieces
app.post('/api/outfit', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing "image" field in request body' });
    }

    // ── Step 1: GPT-4o Vision — extract clothing details from the image ──
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this clothing image and extract the following details as a JSON object with exactly these keys:
- "brand": the brand name (use "Unknown" if not identifiable)
- "itemType": the type of clothing item (e.g., "T-Shirt", "Jeans", "Sneakers")
- "color": the primary color(s)
- "style": the style category (e.g., "Casual", "Streetwear", "Formal", "Athletic")

Respond ONLY with the JSON object, no extra text.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:')
                  ? image
                  : `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    // Parse the vision analysis result
    const visionText = visionResponse.choices[0].message.content.trim();
    let clothingDetails;
    try {
      // Strip markdown code fences if present
      const cleaned = visionText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      clothingDetails = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse vision analysis',
        raw: visionText,
      });
    }

    // ── Step 2: GPT-4o — generate 3 complementary outfit suggestions ──
    const suggestionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional fashion stylist. Given details about a clothing item, suggest exactly 3 complementary clothing pieces that would complete a stylish outfit. Respond ONLY with a JSON array.',
        },
        {
          role: 'user',
          content: `I have the following clothing item:
${JSON.stringify(clothingDetails, null, 2)}

Suggest exactly 3 complementary clothing pieces. Each piece should be a JSON object with these keys:
- "item": the name/type of the clothing piece (e.g., "Slim-Fit Chinos")
- "color": the recommended color
- "style": the style category

Respond ONLY with a JSON array of 3 objects, no extra text.`,
        },
      ],
      max_tokens: 500,
    });

    // Parse outfit suggestions
    const suggestionText = suggestionResponse.choices[0].message.content.trim();
    let suggestions;
    try {
      const cleaned = suggestionText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      suggestions = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse outfit suggestions',
        raw: suggestionText,
      });
    }

    // ── Step 3: SearchApi — find secondhand products for each suggestion ──
    const suggestionsWithProducts = await Promise.all(
      suggestions.map(async (suggestion) => {
        try {
          const searchUrl = `https://www.searchapi.io/api/v1/search?engine=google_shopping&q=${encodeURIComponent(suggestion.item + ' secondhand')}&api_key=${process.env.SEARCHAPI_KEY}`;
          const serpResponse = await fetch(searchUrl);
          const serpData = await serpResponse.json();

          const shoppingResults = (serpData.shopping_results || []).slice(0, 2);
          const products = shoppingResults.map((result) => ({
            title: result.title,
            price: result.price,
            link: result.link || result.product_link || result.url || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(suggestion.item)}`,
            thumbnail: result.thumbnail,
          }));

          return { ...suggestion, products };
        } catch (serpErr) {
          console.error(`SerpApi error for "${suggestion.item}":`, serpErr);
          return { ...suggestion, products: [] };
        }
      })
    );

    // ── Step 4: DALL-E 3 — generate outfit flat lay image ──
    const dallePrompt = `High-end fashion photography. A ${clothingDetails.style} outfit displayed on a sleek white invisible mannequin against a pure white background. The mannequin is wearing: a ${clothingDetails.color} ${clothingDetails.itemType} as the base piece, paired with ${suggestions[0].color} ${suggestions[0].item}, ${suggestions[1].color} ${suggestions[1].item}, and ${suggestions[2].color} ${suggestions[2].item}. Studio lighting, clean shadows, editorial fashion magazine quality. Full body shot showing the complete outfit. No face, no hands, invisible mannequin only. Photorealistic.`;

    let outfitImage = null;
    try {
      const dalleResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: dallePrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });
      const imageUrl = dalleResponse.data[0].url;
      const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const base64String = Buffer.from(imgResponse.data).toString('base64');
      outfitImage = `data:image/png;base64,${base64String}`;
    } catch (dalleErr) {
      console.error('DALL-E error:', dalleErr.message);
    }

    // Return combined response
    res.json({
      analysis: clothingDetails,
      suggestions: suggestionsWithProducts,
      outfitImage,
    });
  } catch (err) {
    console.error('Error in /api/outfit:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
