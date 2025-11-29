# 我的学习博客 (My Learning Blog) - 全栈豪华版

本项目已经升级，包含了**用户认证 (Login/Register)**、**图片上传**以及全新的 **Apple/Google 风格设计**。

## 1. 核心功能更新
*   **安全认证**: 使用 JWT 和 bcrypt 加密，支持多用户注册与登录。
*   **图片支持**: 可以在日记中添加封面图片（自动转为 Base64 存储）。
*   **极简设计**: 融合了磨砂玻璃 (Glassmorphism) 与大圆角卡片设计。

---

## 2. ⚠️ 关键配置步骤 (请务必执行)

由于引入了新的后端依赖，请在启动前执行以下命令：

### 后端配置 (Backend)
1.  进入服务器目录：
    ```bash
    cd server
    ```
2.  **安装新依赖** (必须步骤):
    ```bash
    npm install bcryptjs jsonwebtoken
    ```
    *(之前的 express, mongoose, cors, dotenv 依然需要)*

3.  启动服务器：
    ```bash
    node server.js
    ```

### 前端配置 (Frontend)
1.  回到根目录并启动：
    ```bash
    npm run dev
    ```

---

## 3. 数据模型更新

### User (用户)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `username` | String | 用户名 |
| `email` | String | 登录邮箱 (唯一) |
| `password` | String | 加密后的密码 |

### Log (日记)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `user` | ObjectId | 关联的用户 ID |
| `title` | String | 标题 |
| `content` | String | 内容 |
| `image` | String | **[新增]** 图片的 Base64 编码字符串 |
| `tags` | [String] | 标签数组 |
| `date` | Date | 日期 |

---

## 4. 使用说明
1.  首次打开应用会显示 **登录/注册** 页面。
2.  注册一个新账户。
3.  登录后即可看到主界面。
4.  点击右上角 "+ New Entry" 创建日记，可以点击虚线框上传图片。
