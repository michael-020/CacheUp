# 📚 CampusConnect

CampusConnect is a college-based social platform with a backend (Node.js), an ML service (Python), and a frontend (React). This guide will help you set up the project locally.

---

## 📁 Project Structure

```
CampusConnect/
├── backend/         → Node.js + Express (API & Auth)
├── python-server/   → Python server (ML services)
├── web/             → React frontend
```

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/michael-020/CampusConnect.git
cd CampusConnect
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

> **Now fill the `.env` file with the following values:**

```env
MONGO_URL=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Then, spin up the weaviate database container:

```bash
docker compose up -d
```

---

### 3. Python Server Setup

```bash
cd python-server
python3 download_models.py
```

This downloads required transformer models for ML services.

---

### 4. Web Frontend Setup

```bash
cd web
npm install
```

---

## 🚀 Running the Project

### 🔹 Backend

Make sure your `.env` has a valid MongoDB connection string and the other variables.

Run in development mode:

```bash
cd backend
npm run dev
```

Or for production:

```bash
npm run build
npm run start
```

---

### 🔹 Python Server

```bash
cd python-server
python3 transformer_api.py
```

---

### 🔹 Web Frontend

For development:

```bash
cd web
npm run dev
```

Or production:

```bash
npm run build
npm run start
```

---

## 📝 Notes

- Make sure all three servers are running for full functionality.
- Ensure ports don’t conflict; update `.env` or config files if needed.
- The Python server is required for smart ML-based features like vector search.
