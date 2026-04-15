# 英语学习 App 数据结构与后端开发方案

## 一、 现有前端数据结构分析

根据前端 `types.ts` 和应用逻辑，目前核心的数据模型如下：

### 1. 用户 (User)
*   `id`: string (主键)
*   `phoneNumber`: string (手机号，用于登录)
*   `nickname`: string (昵称)
*   `avatar`: string (头像 URL)

### 2. 课程 (Course)
*   `id`: string (主键)
*   `title`: string (主标题)
*   `subtitle`: string (副标题)
*   `description`: string (详细描述，可选)
*   `imageUrl`: string (封面图 URL)
*   `vocabularyCount`: number (词汇量，可选)
*   `playCount`: number (播放/学习人次)
*   `tags`: string[] (标签，如分类、难度等)
*   `isVip`: boolean (是否为 VIP 专属)
*   `themeColor`: string (主题色，用于 UI 渲染)
*   `author`: string (作者/发布者)
*   `price`: number (价格)

### 3. 课程章节/课时 (Lesson)
*   `id`: string (主键)
*   `courseId`: string (外键，关联 Course，前端目前为隐式关联)
*   `title`: string (章节标题)
*   `duration`: string (时长，如 "05:30")
*   `isLearned`: boolean (当前用户是否已学完，属于用户状态数据)

### 4. 课时句子/字幕 (LessonSentence)
*   `id`: string (主键)
*   `lessonId`: string (外键，关联 Lesson)
*   `text`: string (英文原文)
*   `translation`: string (中文翻译)
*   `startTime`: number (开始时间，秒)
*   `duration`: number (持续时间，秒)

### 5. 关联数据 (User Relations)
*   **已购课程 (Purchased Courses)**: User ID <-> Course ID
*   **收藏章节 (Collected Lessons / Bookshelf)**: User ID <-> Lesson ID
*   **缓存章节 (Downloaded Lessons)**: 本地状态为主，也可同步至云端
*   **AI 聊天记录 (AI Chat History)**: User ID <-> Message Data (包含 role, text, audioUrl 等)

---

## 二、 后端数据库设计方案 (关系型数据库 MySQL/PostgreSQL)

建议采用关系型数据库，因为课程、章节、用户之间的关联性较强。

### 表结构设计概览

1.  **`users` 表**
    *   `id` (VARCHAR/UUID, PK)
    *   `phone_number` (VARCHAR, UNIQUE)
    *   `nickname` (VARCHAR)
    *   `avatar_url` (VARCHAR)
    *   `created_at` (TIMESTAMP)

2.  **`courses` 表**
    *   `id` (VARCHAR/UUID, PK)
    *   `title` (VARCHAR)
    *   `subtitle` (VARCHAR)
    *   `description` (TEXT)
    *   `image_url` (VARCHAR)
    *   `price` (DECIMAL)
    *   `is_vip` (BOOLEAN)
    *   `author` (VARCHAR)
    *   `play_count` (INT)
    *   `created_at` (TIMESTAMP)

3.  **`lessons` 表**
    *   `id` (VARCHAR/UUID, PK)
    *   `course_id` (VARCHAR/UUID, FK)
    *   `title` (VARCHAR)
    *   `duration_seconds` (INT)
    *   `audio_url` (VARCHAR) - 音频文件地址
    *   `sort_order` (INT) - 排序

4.  **`lesson_sentences` 表**
    *   `id` (VARCHAR/UUID, PK)
    *   `lesson_id` (VARCHAR/UUID, FK)
    *   `text` (TEXT)
    *   `translation` (TEXT)
    *   `start_time` (FLOAT)
    *   `duration` (FLOAT)

5.  **`user_course_purchases` 表 (用户购买记录)**
    *   `id` (PK)
    *   `user_id` (FK)
    *   `course_id` (FK)
    *   `paid_amount` (DECIMAL)
    *   `created_at` (TIMESTAMP)

6.  **`user_lesson_collections` 表 (用户收藏/书架)**
    *   `user_id` (FK)
    *   `lesson_id` (FK)
    *   `created_at` (TIMESTAMP)
    *   *Primary Key (user_id, lesson_id)*

---

## 三、 后端 API 接口设计 (RESTful)

统一返回格式 (`ApiResponse<T>`):
\`\`\`json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
\`\`\`

### 1. 认证模块 (Auth)
*   `POST /api/auth/send-code`: 发送手机验证码
*   `POST /api/auth/login`: 手机号+验证码登录，返回 JWT Token
*   `GET /api/auth/me`: 获取当前登录用户信息

### 2. 课程模块 (Courses)
*   `GET /api/courses`: 获取课程列表 (支持分页、分类筛选、推荐排序)
*   `GET /api/courses/:id`: 获取课程详情
*   `GET /api/courses/:id/lessons`: 获取课程下的章节目录

### 3. 学习模块 (Learning)
*   `GET /api/lessons/:id`: 获取章节详情 (包含音频 URL)
*   `GET /api/lessons/:id/sentences`: 获取章节的逐句字幕数据
*   `POST /api/user/lessons/:id/progress`: 上报学习进度 (标记为已学)

### 4. 用户资产模块 (User Assets)
*   `GET /api/user/purchases`: 获取已购课程列表
*   `POST /api/orders/create`: 创建购买订单 (对接微信/支付宝支付)
*   `GET /api/user/collections`: 获取收藏的章节 (书架)
*   `POST /api/user/collections/:lessonId`: 添加收藏
*   `DELETE /api/user/collections/:lessonId`: 取消收藏

### 5. AI 助教模块 (AI Tutor)
*   *说明：前端目前直接调用 Gemini API，出于安全考虑，生产环境应由后端代理转发。*
*   `POST /api/ai/chat`: 发送文本消息，后端调用 LLM 并返回流式响应或完整文本。
*   `POST /api/ai/transcribe`: 接收前端录音文件，调用 STT (Speech-to-Text) 返回文本。
*   `POST /api/ai/tts`: 接收文本，调用 TTS (Text-to-Speech) 返回音频流。

---

## 四、 技术栈推荐

*   **后端框架**: Node.js (NestJS 或 Express) / Go (Gin) / Java (Spring Boot)
*   **数据库**: PostgreSQL 或 MySQL
*   **缓存**: Redis (用于存储短信验证码、高频访问的课程列表、用户 Session)
*   **对象存储 (OSS)**: 阿里云 OSS / 腾讯云 COS / AWS S3 (用于存储课程封面图、音频文件、用户头像)
*   **AI 服务**: Google Gemini API (后端封装调用)

## 五、 实施步骤建议

1.  **搭建基础框架**: 初始化后端项目，配置数据库连接和 ORM (如 Prisma, TypeORM, GORM)。
2.  **实现用户认证**: 接入短信服务，完成手机号登录和 JWT 鉴权中间件。
3.  **开发核心业务**: 实现课程、章节的 CRUD 接口，并录入测试数据。
4.  **对接前端**: 将前端 `apiService` 中的 Mock 数据替换为真实的 Axios 请求。
5.  **支付与订单**: 接入第三方支付 SDK，实现购买逻辑。
6.  **AI 接口代理**: 将前端直连 Gemini 的逻辑迁移至后端，保护 API Key 不泄露。
