import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const fetchImages = async () => {
    try {
      setIsLoadingImages(true);
      setError(null);

      const response = await fetch(
        "https://gif-converter.lijinhai255.workers.dev/api/images",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

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

  // 处理文件上传
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setUploadStatus("uploading");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        "https://gif-converter.lijinhai255.workers.dev/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.success) {
        setUploadStatus("success");
        // 刷新图片列表
        await fetchImages();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(error.message);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Gallery</h1>

      {/* 上传按钮 */}
      <div className="mb-8">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={isLoading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`inline-block px-6 py-3 rounded-lg cursor-pointer
            ${isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
            text-white transition-colors`}
        >
          {isLoading ? "Uploading..." : "Upload Image"}
        </label>
        {uploadStatus === "success" && (
          <span className="ml-4 text-green-600">Upload successful!</span>
        )}
      </div>

      {/* 图片展示区域 */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Images:</h2>
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
