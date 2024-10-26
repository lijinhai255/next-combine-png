import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);
  const [imageStats, setImageStats] = useState(null);

  const convertImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebug(null);
      setImageStats(null);
      setImageUrl(null);

      console.log("Sending request...");

      const response = await fetch(
        "https://gif-converter.lijinhai255.workers.dev/api/gif-converter",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        setDebug(data.debug || {});
        throw new Error(data.details || `Server error: ${response.status}`);
      }

      if (data.success && data.image) {
        // 验证图片数据
        if (!data.image.startsWith("data:image/gif;base64,")) {
          throw new Error("Invalid image data format");
        }

        // 计算图片统计信息
        setImageStats({
          format: "GIF",
          size: Math.round(data.image.length * 0.75), // base64 到实际大小的估算
          dimensions: "1x1 px (scaled to 100x100)",
        });

        setImageUrl(data.image);
        setDebug(data.debug || {});

        // 预加载图片
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = data.image;
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Converter Test</h1>

      <button
        onClick={convertImage}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mb-6 
                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Test Conversion"}
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-semibold text-red-600">Error:</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {debug && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="font-semibold mb-2">Debug Info:</div>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Processed Image:</h2>

          {imageStats && (
            <div className="mb-4 text-sm text-gray-600">
              <div>Format: {imageStats.format}</div>
              <div>Size: {imageStats.size} bytes</div>
              <div>Dimensions: {imageStats.dimensions}</div>
            </div>
          )}

          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg inline-block">
            <div className="bg-gray-100 p-2 rounded-md">
              <img
                src={imageUrl}
                alt="Processed"
                className="border border-gray-300"
                style={{
                  imageRendering: "pixelated",
                  width: "100px",
                  height: "100px",
                  backgroundColor: "white",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="font-semibold mb-2">Image Data URL:</div>
            <div className="text-xs text-gray-600 break-all font-mono">
              {imageUrl.substring(0, 100)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
