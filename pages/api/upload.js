export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("No file provided");
    }

    // Get upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requireSignedURLs: false,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to get upload URL");
    }

    // Upload image
    const uploadResponse = await fetch(data.result.uploadURL, {
      method: "POST",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    // Get direct URL
    const directUrl = await getDirectUrl(data.result.id);

    return res.status(200).json({
      success: true,
      image: {
        id: data.result.id,
        url: directUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
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
