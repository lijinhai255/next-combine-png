// API 基础路径
const API_BASE = ""; // 移除 /api 前缀，因为我们直接使用完整 URL

// API 端点配置
export const ENDPOINTS = {
  images: `/api/images`,
  upload: `/api/upload`,
  createGif: `/api/create-gif`,
};

// 处理 API 错误
export const formatError = (
  error,
  fallback = "An unexpected error occurred"
) => {
  if (error?.message?.includes("<!DOCTYPE html>")) {
    return "Server error occurred. Please try again.";
  }
  return error?.message || fallback;
};

// 通用请求头
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// 检查响应状态
export const checkResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      throw new Error("Server error occurred");
    }
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
