import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// 创建一个 10x10 彩色 GIF 动画
function createColorfulGif() {
  const header = [
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61, // GIF89a
    0x0a,
    0x00,
    0x0a,
    0x00, // width=10, height=10
    0xf0,
    0x00,
    0x00, // Global Color Table follows
    // Color Table (8 colors)
    0xff,
    0x00,
    0x00, // Red
    0x00,
    0xff,
    0x00, // Green
    0x00,
    0x00,
    0xff, // Blue
    0xff,
    0xff,
    0x00, // Yellow
    0xff,
    0x00,
    0xff, // Magenta
    0x00,
    0xff,
    0xff, // Cyan
    0xff,
    0xff,
    0xff, // White
    0x00,
    0x00,
    0x00, // Black
  ];

  const graphicControl = [
    0x21,
    0xf9, // Graphic Control Extension
    0x04, // 4 bytes follow
    0x00, // No transparency
    0x32,
    0x00, // Delay time (50ms)
    0x00, // No transparent color
    0x00, // Block terminator
  ];

  const imageDescriptor = [
    0x2c, // Image separator
    0x00,
    0x00,
    0x00,
    0x00, // Left, Top
    0x0a,
    0x00,
    0x0a,
    0x00, // Width, Height
    0x00, // No local color table
  ];

  // 创建图像数据
  const imageData = [
    0x02, // LZW min code size
    0x16,
    0x8c,
    0x2d,
    0x99,
    0x87,
    0x2a,
    0x1c,
    0xdc,
    0x33,
    0xa0,
    0x02,
    0x75,
    0xec,
    0x95,
    0xfa,
    0xa8,
    0xde,
    0x60,
    0x8c,
    0x04,
    0x91,
    0x4c,
    0x01,
    0x00, // Block terminator
  ];

  // 文件结束标记
  const trailer = [0x3b];

  // 合并所有部分
  const gifData = new Uint8Array([
    ...header,
    ...graphicControl,
    ...imageDescriptor,
    ...imageData,
    ...trailer,
  ]);

  return gifData;
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
    console.log("Starting GIF creation");

    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    // 创建彩色 GIF
    const gifData = createColorfulGif();
    console.log("Created GIF data, size:", gifData.length, "bytes");

    // 保存到 R2
    const outputName = "public/test-output.gif";
    await env.MY_BUCKET.put(outputName, gifData, {
      httpMetadata: {
        contentType: "image/gif",
      },
    });
    console.log("Saved GIF to R2");

    // 转换为 base64
    const base64Data = btoa(String.fromCharCode.apply(null, gifData));
    console.log("Base64 encoding complete, length:", base64Data.length);

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/gif;base64,${base64Data}`,
        debug: {
          imageInfo: {
            type: "image/gif",
            size: gifData.length,
            name: outputName,
            dimensions: "10x10",
          },
          bytesProcessed: gifData.length,
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
    console.error("GIF creation failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "GIF creation failed",
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
