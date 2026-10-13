# Detailed Local Setup Instructions for DLMS (Monolithic-LMS)

This file provides **comprehensive, step-by-step instructions** to run the DLMS project locally. Instructions are derived from README.md files and project structure. Follow these to avoid missing any prerequisites or steps.

## 📋 Prerequisites (Install These First)

Before starting, ensure you have the following installed and running:

1. **Docker Desktop** (Recommended for easiest setup):
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Ensure it's running and you can execute `docker --version` and `docker-compose --version`.

2. **Java 17+** (for backend):
   - Verify: `java -version` (should show 17 or higher).
   - Install if needed: Use SDKMAN (`curl -s \"https://get.sdkman.io\" | bash` then `sdk install java 17.0.8-tem`), Homebrew (`brew install openjdk@17`), or Oracle/OpenJDK site.

3. **Node.js 18+ and npm** (for frontend):
   - Verify: `node -v` and `npm -v`.
   - Install if needed: [nodejs.org](https://nodejs.org/) or `brew install node`.

4. **Python 3.10+** (for chatbot):
   - Verify: `python3 --version`.
   - Install if needed: [python.org](https://www.python.org/downloads/) or `brew install python@3.12`.

5. **Maven** (comes with backend via `./mvnw`, but optional native install):
   - The project uses wrapper `./mvnw`, so no install needed.

6. **Database Clients** (optional, for verification):
   - MySQL client or TiDB-compatible (e.g., MySQL Workbench).
   - MongoDB Compass or `mongosh`.

## 🔐 Environment Configuration (.env File)

**Critical Step**: The project requires a `.env` file in the **root** `/Users/rohit/Monolithic-LMS/` directory. Create it with your secrets:

```env
# Database (Use TiDB cloud free tier or local MySQL/MongoDB)
TIDB_URL=jdbc:mysql://your-tidb-host:4000/your-db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
TIDB_USER=your_username
TIDB_PASSWORD=your_password

# MongoDB (Use MongoDB Atlas free tier or local)
COURSE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms_courses?retryWrites=true&w=majority

# JWT Security
JWT_SECRET_KEY=your-super-secret-jwt-key-at-least-256-bits-long-change-this-in-production

# Pinata/IPFS for Media Storage (Sign up at pinata.cloud for free API keys)
PINATA_API_KEY=your_pinata_jwt_or_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key

# Hugging Face for AI Chatbot (Get token from huggingface.co/settings/tokens)
HF_TOKEN=hf_your_huggingface_token
```

**Sources for Services**:

- TiDB: [tidbcloud.com](https://tidbcloud.com/) (free serverless).
- MongoDB Atlas: [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier).
- Pinata: [pinata.cloud](https://pinata.cloud) (free 1GB).
- Hugging Face: [huggingface.co](https://huggingface.co).

**Warning**: Never commit `.env` to Git. Add to `.gitignore` if not already.

Update `backend/src/main/resources/application.properties` if needed to load `.env` (Spring Boot supports it via config).

## 🚀 Option 1: Docker Compose (Recommended - One Command Setup)

This orchestrates everything: Backend, Chatbot, Frontend, MySQL/TiDB proxy, MongoDB.

1. Ensure Docker Desktop is running.
2. Navigate to root:
   ```bash
   cd /Users/rohit/Monolithic-LMS
   ```
3. Start services:
   ```bash
   docker-compose up --build
   ```

   - `--build` ensures fresh images.
   - Wait for all services to start (check logs for 'Started' messages).
4. Access:
   - Frontend: http://localhost:3000
   - Backend APIs: http://localhost:8080
   - Chatbot: http://localhost:8000 (internal, proxied)

**Stop**: `docker-compose down` (add `-v` to remove volumes).

**Troubleshooting**:

- Port conflicts: Kill processes on 3000, 8080, 8000 or change in `docker-compose.yml`.
- Build fails: `docker system prune -f` to clean images.
- Env vars: Ensure `.env` is loaded (docker-compose uses it).

## 🔧 Option 2: Manual Startup (For Development/Debugging)

Run each service separately. Databases must be running first.

### 2.1 Start Databases

- **MongoDB**: Use Docker:
  ```bash
  docker run -d -p 27017:27017 --name mongodb mongo:latest
  ```
  Or install locally/MongoDB Atlas (update URI in .env).
- **MySQL/TiDB**: Use Docker for MySQL:
  ```bash
  docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=lms --name mysql mysql:8.0
  ```
  Or TiDB Cloud.

### 2.2 Backend (Spring Boot Monolith)

```bash
cd /Users/rohit/Monolithic-LMS/backend
./mvnw clean install  # Build (first time)
./mvnw spring-boot:run  # Start on http://localhost:8080
```

- Wait for 'Started DLMSApplication'.
- Seeds data via DataSeeder.

### 2.3 Chatbot (Python FastAPI)

```bash
cd /Users/rohit/Monolithic-LMS/chatbot
pip install -r requirements.txt  # Install deps (uvicorn, requests, etc.)
python main.py  # Start on http://localhost:8000
```

### 2.4 Frontend (React)

```bash
cd /Users/rohit/Monolithic-LMS/frontend
npm install  # Install deps
npm start  # Start on http://localhost:3000
```

**Order**: Databases → Backend → Chatbot → Frontend.

## ✅ Verification Steps

1. **Frontend**: Open http://localhost:3000 → See login/signup.
2. **Backend Health**: `curl http://localhost:8080/actuator/health` (if enabled).
3. **Register/Login**: Create user via frontend → Check backend logs.
4. **Courses**: Admin login → Create course (uses MongoDB).
5. **Media**: Upload → Check Pinata dashboard.
6. **Chatbot**: Student dashboard → Ask course question.

**Admin Defaults** (if seeded): Check `DataSeeder.java` or create manually.

## 🛠️ Common Issues & Fixes

| Issue                   | Fix                                           |
| ----------------------- | --------------------------------------------- |
| Connection refused (DB) | Start DBs first, check .env URIs.             |
| Maven fails             | `brew install maven` or use `./mvnw`.         |
| Pip fails               | `python3 -m pip install -r requirements.txt`. |
| CORS errors             | Backend handles via SecurityConfig.           |
| JWT invalid             | Check JWT_SECRET_KEY.                         |
| IPFS upload fails       | Valid Pinata keys, internet.                  |
| No data seeded          | Run backend, check logs.                      |

## 📱 Ports Summary

- Frontend: 3000
- Backend: 8080
- Chatbot: 8000
- MongoDB: 27017
- MySQL/TiDB: 3306

## 🔄 Update TODO.md Progress (if using planning mode)

N/A for this task.

## 🐙 How to Push this Project to Your GitHub

The local repository is currently pointing to the original remote:
```bash
git remote -v
# origin  https://github.com/Sanjuthecoder/Monolithic-LMS.git (fetch)
# origin  https://github.com/Sanjuthecoder/Monolithic-LMS.git (push)
```

To push to **your own** GitHub account, follow these steps:

### Step 1: Create a New Repository on GitHub
1. Go to [GitHub New Repository](https://github.com/new).
2. Enter a repository name (e.g. `Monolithic-LMS` or `DLMS`).
3. Choose **Public** or **Private**.
4. **Do NOT** initialize with a README, .gitignore, or license (this repository already has them).
5. Click **Create repository**.
6. Copy the HTTPS or SSH URL (e.g., `https://github.com/<YOUR-USERNAME>/Monolithic-LMS.git`).

### Step 2: Update the Git Remote
In your terminal, navigate to the project directory:
```bash
cd /Users/rohit/Monolithic-LMS
```

Update your `origin` remote to point to your new GitHub repository:
```bash
git remote set-url origin https://github.com/<YOUR-USERNAME>/Monolithic-LMS.git
```
*(If using SSH: `git remote set-url origin git@github.com:<YOUR-USERNAME>/Monolithic-LMS.git`)*

Verify the new remote:
```bash
git remote -v
```

### Step 3: Check Git Status and Verify Ignored Files
Make sure secrets (like `.env`) are **NOT** staged:
```bash
git status
```
`.env` is automatically ignored in `.gitignore`.

### Step 4: Stage, Commit, and Push
Stage all desired changes:
```bash
git add .
git commit -m "Configure local setup and prepare project"
```

Rename current branch to `main` (if not already) and push:
```bash
git branch -M main
git push -u origin main
```

*(If you ever get an authentication prompt, use a GitHub Personal Access Token or GitHub CLI `gh auth login`.)*

---

## 📄 Sources

- Root README.md (primary)
- backend/README.md (supplemental)
- frontend/README.md
- docker-compose.yml
- application.properties

**Setup Complete!** Access http://localhost:3000 and start using DLMS.

