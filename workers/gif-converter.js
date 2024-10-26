import { Router } from "itty-router";

const router = Router();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

const app = {
  fetch: async (request, env, ctx) => {
    return router.handle(request, { env, ctx }).catch((error) => {
      console.error("Router error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal Server Error",
          details: error.message,
          debug: {
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
    });
  },
};

router.post("/api/gif-converter", async (request, { env }) => {
  try {
    console.log("Starting image processing");

    // 验证环境
    if (!env?.MY_BUCKET) {
      throw new Error("R2 bucket not configured");
    }

    // 解析请求
    const contentType = request.headers.get("content-type") || "";
    console.log("Content-Type:", contentType);

    // 确保是 multipart/form-data
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("Invalid content type. Expected multipart/form-data");
    }

    // 解析表单数据
    const formData = await request.formData();
    console.log("Form data parsed");

    // 获取图片文件
    const image = formData.get("image");
    if (!image) {
      throw new Error("No image found in request");
    }

    console.log("Image found:", {
      type: image.type,
      size: image.size,
      name: image.name,
    });

    // 读取图片数据
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

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
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
          stack: error.stack,
          requestMethod: request.method,
          requestHeaders: Object.fromEntries(request.headers),
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
