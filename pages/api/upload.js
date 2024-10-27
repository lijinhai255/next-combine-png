// pages/api/upload.js
import formidable from "formidable";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "*");

  const form = formidable({ multiples: true });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Get upload URL from Cloudflare
    const uploadUrlResponse = await fetch(
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

    const uploadUrlData = await uploadUrlResponse.json();
    if (!uploadUrlData.success) {
      throw new Error("Failed to get upload URL");
    }

    // Upload the file to Cloudflare
    const stream = createReadStream(file.filepath);
    const uploadResponse = await fetch(uploadUrlData.result.uploadURL, {
      method: "POST",
      body: stream,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to Cloudflare");
    }

    // Get the direct URL
    const directUrl = await getDirectUrl(uploadUrlData.result.id);

    res.status(200).json({
      success: true,
      image: {
        id: uploadUrlData.result.id,
        url: directUrl,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: error.message });
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
