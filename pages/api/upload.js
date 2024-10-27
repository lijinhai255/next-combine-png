export const runtime = "edge";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

async function getDirectUrl(imageId, env) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.API_TOKEN}`,
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

  return `https://imagedelivery.net/${env.CLOUDFLARE_ACCOUNT_ID}/${imageId}/public?token=${data.result.token}`;
}

export default async function handler(req) {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
          metadata: {
            filename: file.name,
          },
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to get upload URL");
    }

    // Upload image to Cloudflare
    const uploadResponse = await fetch(data.result.uploadURL, {
      method: "POST",
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image");
    }

    // Get direct URL for the uploaded image
    const directUrl = await getDirectUrl(data.result.id, {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      API_TOKEN: process.env.API_TOKEN,
    });

    return new Response(
      JSON.stringify({
        success: true,
        image: {
          id: data.result.id,
          url: directUrl,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}
