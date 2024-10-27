export const runtime = "edge";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const { imageIds, delay = 500, quality = 80 } = await req.json();

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/animate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageIds,
          options: {
            delay,
            loop: 0,
            quality,
          },
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Failed to create GIF");
    }

    // 获取直接 URL
    const directUrlResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${data.result.id}/token`,
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

    const tokenData = await directUrlResponse.json();
    const gifUrl = `https://imagedelivery.net/${process.env.CLOUDFLARE_ACCOUNT_ID}/${data.result.id}/public?token=${tokenData.result.token}`;

    return new Response(
      JSON.stringify({
        success: true,
        gifUrl,
        gifId: data.result.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
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
        },
      }
    );
  }
}
