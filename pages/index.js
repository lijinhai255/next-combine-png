import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { listMyCustomTypes } from "../src/graphql/queries";
import { createMyCustomType } from "../src/graphql/mutations";
import { Amplify } from "aws-amplify";
import config from "../aws-exports.js";

export default function CustomTypes() {
  const client = generateClient();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取列表
  async function fetchItems() {
    setLoading(true);
    try {
      const response = await client.graphql({
        query: listMyCustomTypes,
        variables: { limit: 10 },
      });
      const data = response.data.listMyCustomTypes.items;
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 创建新项目
  async function handleCreate() {
    try {
      const newItem = {
        title: "测试标题",
        content: "测试内容",
        price: 100,
        rating: 4.5,
      };

      const response = await client.graphql({
        query: createMyCustomType,
        variables: { input: newItem },
      });

      // 刷新列表
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  }

  // 只在组件挂载时执行一次
  useEffect(() => {
    // 配置 Amplify
    Amplify.configure(config);

    // 初始化时获取列表
    fetchItems();

    // 不要在这里调用 handleCreate
  }, []); // 添加空依赖数组

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">自定义类型列表</h1>
        <div className="space-x-4">
          {/* 添加创建按钮 */}
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          >
            创建新项目
          </button>
          <button
            onClick={fetchItems}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "加载中..." : "刷新列表"}
          </button>
        </div>
      </div>

      {/* 显示错误信息 */}
      {error && <div className="text-red-500 mb-4">错误: {error}</div>}

      {/* 显示列表 */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-gray-600">{item.content}</p>
            <div className="mt-2 text-sm text-gray-500">
              <span>价格: ¥{item.price}</span>
              <span className="ml-4">评分: {item.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
