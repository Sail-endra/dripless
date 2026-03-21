const axios = require("axios");
require("dotenv").config();

async function searchProducts(itemName) {
    if (!itemName || typeof itemName !== "string") {
        throw new Error("searchProducts requires a valid itemName string");
    }

    const query = `${itemName} secondhand`;

    const response = await axios.get("https://serpapi.com/search.json", {
        params: {
            engine: "google_shopping",
            q: query,
            api_key: process.env.SERPAPI_KEY,
        },
    });

    const results = response.data.shopping_results || [];

    return results.slice(0, 3).map((item) => ({
        title: item.title || null,
        price: item.price || null,
        link: item.link || null,
        thumbnail: item.thumbnail || null,
    }));
}

module.exports = { searchProducts };