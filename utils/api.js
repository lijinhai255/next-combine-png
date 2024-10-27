/**
 * API 基础路径
 */
const API_BASE = "/api";

/**
 * API 端点配置
 * @type {{
 *   images: string,
 *   upload: string,
 *   createGif: string
 * }}
 */
export const ENDPOINTS = {
  images: `${API_BASE}/images`, // 获取图片列表
  upload: `${API_BASE}/upload`, // 上传新图片
  createGif: `${API_BASE}/create-gif`, // 创建 GIF
};

/**
 * 处理 API 错误
 * @param {Error} error - 错误对象
 * @param {string} [fallback] - 默认错误信息
 * @returns {string} 格式化的错误信息
 */
export const formatError = (
  error,
  fallback = "An unexpected error occurred"
) => {
  return error?.message || fallback;
};

/**
 * 通用请求头
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * 检查响应状态
 * @param {Response} response - Fetch API 响应对象
 * @throws {Error} 当响应状态不是 2xx 时抛出错误
 */
export const checkResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
