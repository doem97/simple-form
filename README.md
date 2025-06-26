# DistriBrain 预定系统

这是一个简单的客户信息收集和时间段预订应用。用户可以填写他们的信息，选择一个可用的日期/时间段/地点进行预约。

## ✨ 线上示例

- **示例网站**: [booking.distribrain.com](https://booking.distribrain.com)
- **示例后台**: [booking.distribrain.com/admin](https://booking.distribrain.com/admin) (密码: `admin`)

<table>
  <tbody>
    <tr>
      <td width="50%" valign="top">
        <img alt="预定系统截图" src="https://github.com/user-attachments/assets/5c1a0d03-bee6-4f09-bcad-c7276d23d5ee" width="100%">
      </td>
      <td width="50%" valign="top">
        <img alt="预定成功" src="https://github.com/user-attachments/assets/7ed37f97-21c1-402f-8152-697c1712cee4" width="100%"><br>
        <img alt="登录后台" src="https://github.com/user-attachments/assets/60f6b7d2-894a-4425-b8c4-7d4b3a0b5f11" width="100%"><br>
        <img alt="后台系统" src="https://github.com/user-attachments/assets/bca12968-a8f2-43a1-8705-520da2de4882" width="100%">
      </td>
    </tr>
  </tbody>
</table>
<br/>

## 🚀 推荐流程：一键部署到 Vercel

1.  **点击这个按钮**:
<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdoem97%2Fsimple-form" target="_blank" rel="noopener noreferrer">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
</a>

2.  **连接 Git 提供商**：Vercel 会提示您创建一个新的 Git 仓库，项目代码会被克隆到这个新仓库中。
3.  **连接数据库 (关键！)**
    - **注意**: 此时的部署会因为没有连接数据库而 **失败**。这是预期行为。
    - 部署失败后，在项目页面点击 **"Go to Project"**，然后选择顶部的 **"Storage"** 标签页。
    - 点击 **"Create Database"**，然后选择 **"Upstash" (Redis)**。
    - 按照指引创建并连接数据库。
3.  **配置并部署**:
    - 展开 **"Environment Variables"** 部分，手动添加以下变量：
      - `NEXTAUTH_SECRET`: 这是一个用于保护会话安全的密钥。您可以通过在本地终端运行 `openssl rand -hex 32` 生成一个随机字符串，然后粘贴到这里。
      - `ADMIN_PASSWORD`: 为您的后台管理页面设置一个访问密码。
    - 设置完成后，回到项目的 "Deployments" 标签页。
    - 找到刚才失败的部署，点击其右侧的 "..." 菜单，选择 **"Redeploy"**。
    - 部署成功后，您的应用就可以正常访问了！
      - **表单地址**: `your-app-name.vercel.app` (或您的自定义域名)
      - **管理后台**: `your-app-name.vercel.app/admin` (使用您设置的 `ADMIN_PASSWORD` 登录)

6.  **(可选) 绑定自定义域名**
    - 在项目 "Settings" -> "Domains" 中，您可以将自己的域名绑定到此项目。

## （可选）在本地运行

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
