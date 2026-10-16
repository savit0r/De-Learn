# Comprehensive Production Deployment Guide: DLMS (De-Learn)

This step-by-step guide walks you through deploying the complete **De-Learn (DLMS)** architecture to production using:
- **Databases:** TiDB Cloud (MySQL-compatible) & MongoDB Atlas (Free tiers)
- **Backend & Chatbot:** Render (Docker Web Service & Python FastAPI)
- **Frontend:** Vercel (Single-Page React App)

---

## 🏗️ Architecture & Deployment Flow

```
+-------------------------------------------------------------+
|                 1. CLOUD DATABASES                          |
|  - TiDB Cloud (MySQL): Users, Auth, Enrollments             |
|  - MongoDB Atlas: Courses, Modules, Lessons, Media Metadata |
+-------------------------------------------------------------+
                              ▲
                              │
+-----------------------------┴-------------------------------+
|                 2. RENDER SERVICES                          |
|  - dlms-chatbot (FastAPI): https://<your-chatbot>.onrender.com |
|  - dlms-backend (Spring Boot): https://<your-backend>.onrender.com|
+-------------------------------------------------------------+
                              ▲
                              │ REACT_APP_API_GATEWAY_URL
+-----------------------------┴-------------------------------+
|                 3. VERCEL FRONTEND                          |
|  - React SPA: https://<your-app>.vercel.app                 |
+-------------------------------------------------------------+
```

---

## 📋 Step 1: Set Up Cloud Databases (Free Tier)

Because Render does not persist container local databases across restarts, use free cloud-hosted managed databases:

### 1.1 TiDB Cloud (MySQL Compatible - For Auth & Enrollments)
1. Sign up at [tidbcloud.com](https://tidbcloud.com/).
2. Click **Create Cluster** and select **Serverless (Free Forever)**.
3. Click **Connect** -> Choose **General Connection (MySQL)**.
4. Note your credentials:
   - Host (e.g., `gateway01.us-west-2.prod.aws.tidbcloud.com`)
   - Port: `4000`
   - User: `xxxxxx.root`
   - Password: `<your-password>`
   - Database name: `dlms_db` (or create it from the Web SQL console with `CREATE DATABASE dlms_db;`).
5. Your JDBC URL format will be:
   ```text
   jdbc:mysql://<your-tidb-host>:4000/dlms_db?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```

### 1.2 MongoDB Atlas (For Courses & Media Metadata)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create an **M0 (Free)** cluster.
3. Under **Security** -> **Quickstart**:
   - Create a database user with username & password (e.g. `dlms_user` / `<strong-password>`).
   - Under **IP Access List**, click **Add IP Address** -> Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
4. Click **Connect** -> **Drivers** (Node.js/Java/General) and copy your connection string:
   ```text
   mongodb+srv://dlms_user:<password>@cluster0.xxxxx.mongodb.net/dlms_mongo_db?retryWrites=true&w=majority
   ```

---

## 🤖 Step 2: Deploy AI Chatbot on Render (Optional)

If you are using the AI Chatbot feature:

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`savit0r/De-Learn`).
4. Configure service settings:
   - **Name:** `dlms-chatbot`
   - **Region:** Choose closest to you (e.g., Frankfurt / Oregon / Singapore)
   - **Root Directory:** `chatbot`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. **Environment Variables:**
   - `HF_TOKEN`: Your Hugging Face API token ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))
   - `PYTHON_VERSION`: `3.10.12`
6. Click **Deploy Web Service**.
7. Once deployed, copy your Chatbot URL (e.g. `https://dlms-chatbot.onrender.com`).

---

## ☕ Step 3: Deploy Spring Boot Backend on Render

1. On [dashboard.render.com](https://dashboard.render.com/), click **New +** -> **Web Service**.
2. Connect your GitHub repository (`savit0r/De-Learn`).
3. Configure the service:
   - **Name:** `dlms-backend`
   - **Region:** Same region as your chatbot and databases
   - **Root Directory:** `backend`
   - **Runtime:** **Docker** *(Render will detect and use `backend/Dockerfile`)*
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Production Spring profile |
| `TIDB_URL` | `jdbc:mysql://<tidb-host>:4000/dlms_db?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true` | TiDB Cloud JDBC Connection |
| `TIDB_USER` | `<tidb-user>` | TiDB Cloud User |
| `TIDB_PASSWORD` | `<tidb-password>` | TiDB Cloud Password |
| `COURSE_MONGODB_URI` | `mongodb+srv://dlms_user:...@cluster0.../dlms_mongo_db?retryWrites=true&w=majority` | MongoDB Atlas Connection String |
| `JWT_SECRET_KEY` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit JWT Signing Key |
| `CHATBOT_SERVICE_URL` | `https://dlms-chatbot.onrender.com` | Chatbot URL from Step 2 |
| `PINATA_JWT` | `(Optional)` | Pinata Cloud JWT (if using cloud IPFS) |
| `PINATA_API_KEY` | `(Optional)` | Pinata API Key (if using legacy keys) |
| `PINATA_SECRET_API_KEY` | `(Optional)` | Pinata Secret Key |

5. Click **Deploy Web Service**.
6. Wait for the Docker build to complete (you will see `Started DLMSApplication in ... seconds` in the Render logs).
7. Copy your live Backend URL:
   ```text
   https://dlms-backend.onrender.com
   ```

---

## ⚡ Step 4: Deploy Frontend on Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`savit0r/De-Learn`).
4. In the **Configure Project** screen:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** Click **Edit** and choose `frontend`.
5. Expand the **Environment Variables** section and add:
   - **Key:** `REACT_APP_API_GATEWAY_URL`
   - **Value:** `https://dlms-backend.onrender.com` *(Paste your Render backend URL without any trailing slash)*
6. Click **Deploy**.
7. Vercel will build and assign you a production domain (e.g., `https://de-learn.vercel.app`).

> **Note on Routing:** The included `frontend/vercel.json` already has SPA rewrites configured so refreshing routes like `/admin`, `/login`, or `/student` works seamlessly.

---

## ✅ Step 5: Verification Checklist

Once both services are deployed:

1. **Visit your Vercel URL:** Open `https://<your-app>.vercel.app`.
2. **Sign In / Sign Up:**
   - Test logging in with the pre-seeded admin user (`admin` / `admin123`) or register a new student account.
3. **Admin Course & Media Upload:**
   - Log in as admin -> Go to `/admin`.
   - Create a course and upload a video/file to verify end-to-end communication with MongoDB and storage.
4. **Student Dashboard:**
   - Log in as student -> Go to `/student` -> Enroll in a course -> Open the Course Player.
5. **AI Chatbot:**
   - Open chatbot assistant and ask a course question to verify Render backend <-> Chatbot connection.

---

## 💡 Common Production Tips

- **Render Cold Starts (Free Tier):** Render free instances spin down after 15 minutes of inactivity. The first request after idle can take ~30-50 seconds to boot up.
- **CORS Support:** The backend code already includes `https://*.vercel.app` and `https://*.onrender.com` in allowed origins, so Vercel preview and production links work without additional configuration.
