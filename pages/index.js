import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(null);
  const [imageStats, setImageStats] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const fetchImages = async () => {
    try {
      setIsLoadingImages(true);
      setError(null);

      const response = await fetch("your-worker-url/api/create-gif")
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          // 显示GIF
          const img = document.createElement("img");
          img.src = url;
          document.body.appendChild(img);
        });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.success && data.images) {
        setImages(data.images);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      setError(error.message);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Converter Test</h1>

      {/* 原始图片展示区域 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Original Images:</h2>
        {isLoadingImages ? (
          <div className="text-gray-600">Loading images...</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.name}
                className="p-4 bg-white border-2 border-gray-200 rounded-lg"
              >
                <div className="bg-gray-100 p-2 rounded-md">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-32 object-contain border border-gray-300"
                    loading="lazy"
                  />
                </div>
                <div className="mt-2 text-sm text-center text-gray-600">
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-semibold text-red-600">Error:</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
