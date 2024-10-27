import { Router } from "itty-router";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return res.status(204).end();
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to fetch images");
    }

    // Get direct URL for each image
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

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function getDirectUrl(imageId) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().getTime() + 3600000,
          expiry: Math.floor(Date.now() / 1000) + 3600,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to get direct URL");
    }

    return `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${imageId}/public?token=${data.result.token}`;
  } catch (error) {
    console.error("Error getting direct URL:", error);
    throw error;
  }
}
