import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 最小的有效 1x1 像素红色 GIF 文件的十六进制数据
const MINIMAL_GIF = new Uint8Array([
  0x47,
  0x49,
  0x46,
  0x38,
  0x39,
  0x61, // header "GIF89a"
  0x01,
  0x00,
  0x01,
  0x00, // width=1, height=1
  0xf0, // Global Color Table
  0xff,
  0x00,
  0x00, // RGB Red color
  0x00,
  0x00,
  0x00, // RGB Black color
  0x2c,
  0x00,
  0x00,
  0x00,
  0x00, // Image Descriptor
  0x01,
  0x00,
  0x01,
  0x00, // Image size
  0x00, // No local color table
  0x02,
  0x02,
  0x44,
  0x01,
  0x00, // Image data
]);

// 安全的 base64 编码函数
function safeBase64Encode(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
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

    // 使用预定义的最小 GIF 数据
    const imageData = MINIMAL_GIF;
    console.log("Using minimal GIF, size:", imageData.length, "bytes");

    // 保存到 R2
    const outputName = "public/test-output.gif";
    await env.MY_BUCKET.put(outputName, imageData, {
      httpMetadata: {
        contentType: "image/gif",
      },
    });
    console.log("Image saved to R2");

    // 转换为 base64
    const base64Data = safeBase64Encode(imageData);
    console.log("Base64 length:", base64Data.length);

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/gif;base64,${base64Data}`,
        debug: {
          imageInfo: {
            type: "image/gif",
            size: imageData.length,
            name: outputName,
          },
          bytesProcessed: imageData.length,
          base64Length: base64Data.length,
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
          stack: error.stack,
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
