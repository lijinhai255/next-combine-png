import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 安全的将 ArrayBuffer 转换为 Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 1024;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    chunk.forEach((byte) => (binary += String.fromCharCode(byte)));
  }
  return btoa(binary);
}

const app = {
  fetch: async (request, env, ctx) => {
    return router.handle(request, { env, ctx }).catch((error) => {
      console.error("Router error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal Server Error",
          details: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    });
  },
};

router.post("/api/gif-converter", async (request, { env }) => {
  try {
    console.log("Starting image processing");

    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Invalid content type. Expected multipart/form-data");
    }

    const formData = await request.formData();
    console.log("Form data parsed");

    const image = formData.get("image");
    if (!image) {
      throw new Error("No image found in request");
    }

    console.log("Image info:", {
      type: image.type,
      size: image.size,
      name: image.name,
    });

    const imageData = await image.arrayBuffer();
    console.log("Image data read, size:", imageData.byteLength);

    // 保存到 R2
    const outputName = "public/test-output.png";
    await env.MY_BUCKET.put(outputName, imageData, {
      httpMetadata: {
        contentType: image.type || "image/png",
      },
    });
    console.log("Image saved to R2");

    // 转换为 base64 并返回正确格式的响应
    const base64Data = arrayBufferToBase64(imageData);

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:${image.type || "image/png"};base64,${base64Data}`,
        debug: {
          imageInfo: {
            type: image.type,
            size: image.size,
            name: image.name,
          },
          outputName,
          bytesProcessed: imageData.byteLength,
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
    console.error("Image processing failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Image processing failed",
        details: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name,
          requestMethod: request.method,
          contentType: request.headers.get("content-type"),
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});

router.options("*", () => {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      "Access-Control-Allow-Headers": "Content-Type, Accept",
    },
  });
});

export default app;
