# DistriBrain 预定系统

这是一个简单的客户信息收集和时间段预订应用。用户可以填写他们的信息，选择一个可用的日期/时间段/地点进行预约。

## 🚀 推荐流程：从 Vercel 开始

### 第 1 步：一键部署到 Vercel

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdistribrain%2Fsimple-booking-app-template" target="_blank" rel="noopener noreferrer">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
</a>

1.  **点击上方黑色的 "Deploy with Vercel" 按钮**。
2.  **连接 Git 提供商**：Vercel 会提示您创建一个新的 Git 仓库 (例如在您的 GitHub 账户下)。项目代码会被克隆到这个新仓库中。
3.  **配置集成 (关键步骤)**:
    - 在 "Configure Project" 页面，Vercel 会自动检测到这是一个 Next.js 项目。
    - 最关键的一步是连接数据库。选择 **"Integrations"**，然后从 Vercel Marketplace 中搜索并添加 **"Upstash Redis"**。
    - 按照指引选择或创建一个新的 Redis 数据库。Vercel 将自动为您设置 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 环境变量。
    - 接下来，展开 **"Environment Variables"** 部分，手动添加 `NEXTAUTH_SECRET`。
      - `NEXTAUTH_SECRET`: 这是一个用于保护会话安全的密钥。您可以通过在本地终端运行 `openssl rand -hex 32` 生成一个随机字符串，然后粘贴到这里。
4.  **部署**：点击 "Deploy"。Vercel 会开始构建和部署您的应用。

> **关于 `NEXTAUTH_URL`**: Vercel 会自动为您的部署分配一个 URL，并将其设置为 `VERCEL_URL` 环境变量。`next-auth` 会自动使用这个变量，所以您**无需**在 Vercel 上手动设置 `NEXTAUTH_URL`。

### 第 2 步：在本地运行

部署成功后，您可以轻松地将项目和环境变量拉取到本地进行开发。

1.  **克隆您的 Git 仓库**:
    将您在 Vercel 部署流程中创建的 Git 仓库克隆到本地。
    ```bash
    git clone https://github.com/your-username/your-new-repo-name.git
    cd your-new-repo-name/client
    ```

2.  **安装 Vercel CLI 并登录**:
    ```bash
    npm install -g vercel
    vercel login
    ```

3.  **关联本地项目**:
    ```bash
    vercel link
    ```

4.  **拉取环境变量**:
    这个命令会从您的 Vercel 项目中拉取环境变量，并创建一个 `.env.local` 文件。
    ```bash
    vercel env pull .env.local
    ```

5.  **安装依赖并启动**:
    ```bash
    npm install
    npm run dev
    ```

现在，您可以在 [http://localhost:3000](http://localhost:3000) 访问本地开发服务器，它连接的是您在 Vercel 上配置的同一个 Upstash 数据库。

---

## 备用流程：从本地开始 (进阶)

如果您不想先部署到 Vercel，也可以先在本地进行配置。

1.  **克隆本项目**: `git clone ...`
2.  **安装依赖**: `cd client && npm install`
3.  **配置环境变量**:
    在 `/client` 目录下创建一个 `.env.local` 文件，并添加以下变量。

    ```env
    UPSTASH_REDIS_REST_URL="..."
    UPSTASH_REDIS_REST_TOKEN="..."
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="..."
    ```
    - `UPSTASH_...`: 从 [Upstash 控制台](https://console.upstash.com/) 获取。
    - `NEXTAUTH_URL`: 在本地开发时固定为 `http://localhost:3000`。
    - `NEXTAUTH_SECRET`: 运行 `openssl rand -hex 32` 生成。

4.  **启动开发服务器**: `npm run dev`
