/**
 * API 基础路径
 * 在开发环境和生产环境都使用相对路径,让 Next.js 处理代理
 */
const API_BASE = "/api";

/**
 * API 端点配置
 * 所有的 API 路由都在这里集中管理
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
 * 标准响应类型
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {any} [data] - 响应数据
 * @property {string} [error] - 错误信息
 */

/**
 * 通用请求头
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * 处理 API 错误的工具函数
 * @param {Error} error - 错误对象
 * @returns {string} 格式化的错误信息
 */
export const formatError = (error) => {
  return error?.message || "An unexpected error occurred";
};
