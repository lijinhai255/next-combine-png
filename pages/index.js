import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);

  const convertImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebug(null);

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
        setImageUrl(data.image);
        setDebug(data.debug || {});
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Converter Test</h1>

      <button
        onClick={convertImage}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400"
      >
        {isLoading ? "Processing..." : "Test Conversion"}
      </button>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
          <div className="font-bold">Error:</div>
          <div>{error}</div>
        </div>
      )}

      {debug && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="font-bold">Debug Info:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}

      {imageUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Processed Image:</h2>
          <img
            src={imageUrl}
            alt="Processed"
            className="w-96 border-2 border-gray-300 rounded"
            style={{
              imageRendering: "pixelated",
              width: "100px",
              height: "100px",
              backgroundColor: "#f0f0f0",
            }}
            onError={(e) => {
              console.error("Image load error:", e);
              setError("Failed to load processed image");
            }}
          />
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <div className="font-bold">Image URL:</div>
          <div className="break-all bg-gray-50 p-2 rounded">{imageUrl}</div>
        </div>
      )}
    </div>
  );
}
