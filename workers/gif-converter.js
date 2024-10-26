import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 创建一个简单的 1x1 像素的测试图片数据
function createTestImageData() {
  // GIF 文件头
  const header = new Uint8Array([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61, // GIF89a
    0x01,
    0x00,
    0x01,
    0x00, // width=1, height=1
    0x80,
    0x00,
    0x00, // GCT=2 entries
    0xff,
    0x00,
    0x00, // red
    0x00,
    0x00,
    0x00, // black
    0x21,
    0xf9,
    0x04, // Graphic Control Extension
    0x00,
    0x00,
    0x00,
    0x00, // no delay, no transparent color
    0x2c,
    0x00,
    0x00,
    0x00,
    0x00, // Image Descriptor
    0x01,
    0x00,
    0x01,
    0x00,
    0x00, // 1x1 pixels, no local color table
    0x02,
    0x02,
    0x44,
    0x01,
    0x00, // LZW min code size=2, 1 byte of data, block terminator
  ]);

  return header;
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

    // 创建测试图片数据
    const imageData = createTestImageData();
    console.log("Created test image data, size:", imageData.length);

    // 保存到 R2
    const outputName = "public/test-output.gif";
    await env.MY_BUCKET.put(outputName, imageData, {
      httpMetadata: {
        contentType: "image/gif",
      },
    });
    console.log("Image saved to R2");

    // 转换为 base64
    const base64Data = btoa(String.fromCharCode.apply(null, imageData));

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
