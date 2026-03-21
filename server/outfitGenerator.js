const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function buildOutfitPrompt(pieces) {
    const cleanedPieces = pieces
        .filter((piece) => typeof piece === "string" && piece.trim().length > 0)
        .map((piece) => piece.trim());

    if (cleanedPieces.length === 0) {
        throw new Error("generateOutfitImage requires at least one valid clothing piece");
    }

    const joinedPieces = cleanedPieces.join(", ");

    return [
        "Create a fashion flat lay image on a clean white background.",
        "Use soft editorial lighting, minimal shadows, and a polished modern styling aesthetic.",
        "Arrange the outfit neatly as a cohesive look.",
        "Include only these clothing/accessory pieces:",
        joinedPieces + ".",
        "Do not include mannequins, models, hands, or extra props.",
        "Make it look like an e-commerce editorial flat lay."
    ].join(" ");
}

async function generateOutfitImage(pieces) {
    if (!Array.isArray(pieces)) {
        throw new Error("generateOutfitImage expects an array of clothing piece descriptions");
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is missing in server/.env");
    }

    const prompt = buildOutfitPrompt(pieces);

    const response = await client.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
        response_format: "url",
    });

    const imageUrl = response?.data?.[0]?.url;

    if (!imageUrl) {
        throw new Error("Image generation succeeded but no image URL was returned");
    }

    return imageUrl;
}

module.exports = {
    generateOutfitImage,
};