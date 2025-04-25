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

Then, spin up the Weaviate database container:

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

## 🐳 Running with Docker

If you prefer to run the entire app using Docker, follow these steps:

### 🔸 1. Build the Containers

```bash
docker compose up --build
```

This builds all services (backend, frontend, ML server, Weaviate, etc.) defined in the `docker-compose.yml` file.

### 🔸 2. Run the Containers

```bash
docker compose up -d
```

This starts all the services in detached mode.

> If you want to see logs in the terminal, use:

```bash
docker compose up
```

Make sure to set up the `.env` files before running Docker to ensure proper configuration.

---

## 📝 Notes

- Ensure all services are up and ports don’t conflict.
- The Python server must be running for ML features like vector search.
- Docker simplifies running the project in a consistent environment.
