// pages/api/images.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const API_TOKEN = process.env.API_TOKEN;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch images");
    }

    // Get direct URLs for all images
    const images = await Promise.all(
      data.result.images.map(async (image) => {
        const directUrl = await getDirectUrl(image.id);
        return {
          id: image.id,
          url: directUrl,
          uploaded: image.uploaded,
          filename: image.filename,
        };
      })
    );

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getDirectUrl(imageId) {
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const API_TOKEN = process.env.API_TOKEN;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiry: Math.floor(Date.now() / 1000) + 3600,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to get direct URL");
    }

    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/public?token=${data.result.token}`;
  } catch (error) {
    console.error("Error getting direct URL:", error);
    throw error;
  }
}
