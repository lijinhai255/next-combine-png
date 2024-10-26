import { useState, useEffect } from "react";

export default function Home() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 获取图片列表
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/images");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch images");
      }

      setImages(data.images);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 上传图片
  const handleUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // 刷新图片列表
      await fetchImages();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // 删除图片
  const handleDelete = async (imageId) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete image");
      }

      // 刷新图片列表
      await fetchImages();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Manager</h1>

      {/* 上传按钮 */}
      <div className="mb-8">
        <label className="block">
          <span className="sr-only">Choose files</span>
          <input
            type="file"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            onChange={handleUpload}
            accept="image/*"
            disabled={isLoading}
          />
        </label>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 图片网格 */}
      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.filename}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
                <button
                  onClick={() => handleDelete(image.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-semibold text-red-600">Error:</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
