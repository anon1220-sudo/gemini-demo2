# 我的学习博客 (My Learning Blog) - 全栈搭建指南

本项目分为 **前端** (React/Vite) 和 **后端** (Node.js/Express) 两个主要部分。

## 1. 数据模型概览 (Log)

MongoDB 的 Schema 定义 (`server/models/Log.js`) 包含以下字段：

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `_id` | `ObjectId` | MongoDB 自动生成的唯一标识符。 |
| `title` | `String` | 学习记录的标题。**必填**。 |
| `content` | `String` | 记录的正文内容/笔记。**必填**。 |
| `tags` | `[String]` | 字符串数组，用于分类 (例如: "React", "CSS")。 |
| `date` | `Date` | 学习发生的日期。默认为当前时间。 |
| `createdAt` | `Date` | 创建时间戳 (由 Mongoose 自动管理)。 |
| `updatedAt` | `Date` | 最后更新时间戳 (由 Mongoose 自动管理)。 |

---

## 2. 配置与运行指南

你需要分别在两个终端窗口中运行后端和前端。

### 前置条件
- 已安装 Node.js
- 正在运行的 MongoDB 实例 (本地数据库或 Atlas 云数据库)

### 第一步：后端配置 (Backend)
1.  进入 `server` 文件夹 (或者将 `server/` 目录下的文件移动到一个独立的 `backend` 文件夹中)。
2.  初始化项目并安装依赖：
    ```bash
    npm init -y
    npm install express mongoose cors dotenv
    ```
    *注意：请确保生成的 `package.json` 中包含 `"type": "module"` 以支持代码中使用的 ESM (import/export) 语法。*
3.  在 `server` 目录下创建一个 `.env` 文件，内容如下：
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/learning-blog
    ```
    *(如果你使用的是 MongoDB Atlas，请将 `MONGODB_URI` 替换为你的云数据库连接字符串)*
4.  启动服务器：
    ```bash
    node server.js
    ```
    *成功启动后，你应该会看到： "🚀 Server running on port 5000" 和 "✅ Connected to MongoDB"*

### 第二步：前端配置 (Frontend)
1.  回到项目根目录。
2.  安装依赖：
    ```bash
    npm install
    ```
3.  启动开发服务器：
    ```bash
    npm run dev
    ```
4.  打开浏览器访问 (通常是 `http://localhost:5173`)。

前端应用已配置为向 `http://localhost:5000/api/logs` 发送 API 请求。如果后端未启动，应用会自动切换到**离线演示模式**。