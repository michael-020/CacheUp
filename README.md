# 📚 CacheUp

CacheUp is a social platform with a full-stack architecture: a backend built on **Node.js + WebSockets**, an **ML service in Python**, and a **React frontend**. This guide will help you set up the project locally and in a Dockerized environment.

---

## 📁 Project Structure

```

CacheUp/
├── backend/         → Node.js + Express (API & Auth)
├── python-server/   → Python server (ML services)
├── web/             → React frontend

````

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/michael-020/CacheUp.git
cd CacheUp
````

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

> **Important:**
> After copying the `.env.example` to `.env`, make sure to **fill in the `.env` file** with the appropriate values for your project:

```env
MONGO_URL=                # Your MongoDB connection string
JWT_SECRET=               # Secret for JWT signing
SESSION_SECRET=           # Secret for session management
EMAIL_USER=               # Email for sending notifications
EMAIL_PASS=               # Password for email account
CLOUDINARY_CLOUD_NAME=    # Your Cloudinary cloud name
CLOUDINARY_API_KEY=       # Your Cloudinary API key
CLOUDINARY_API_SECRET=    # Your Cloudinary API secret
GOOGLE_CLIENT_ID=         # Google OAuth Client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth Client Secret
WEAVIATE_HOST=weaviate:8080 # Host for Weaviate DB (docker-compose: `weaviate:8080`, local: `localhost:8080`)
TRANSFORMER_API=http://python-service:8081 # API URL for Python ML service
WEAVIATE_API_KEY=         # If using a cloud Weaviate DB
BACKEND_URL=http://localhost:3000  # URL for the backend (adjust if needed)
FRONTEND_URL=http://localhost:5173 # URL for the frontend (adjust if needed)
```

Once the `.env` file is correctly filled, start the **Weaviate database container**:

```bash
docker compose up -d
```

---

### 3. Python Server Setup

The **Python ML services** require downloading transformer models:

```bash
cd python-server
python3 download_models.py
```

This command will download the necessary transformer models for the ML services.

---

### 4. Web Frontend Setup

```bash
cd web
npm install
```

---

## 🚀 Running the Project Locally

### 🔹 Backend

Ensure your `.env` file is correctly configured with a valid MongoDB connection string and other required credentials.

To run the backend in development mode:

```bash
cd backend
npm run dev
```

---

### 🔹 Python Server

To start the Python server:

```bash
cd python-server
python3 transformer_api.py
```

---

### 🔹 Web Frontend

To run the frontend in development mode:

```bash
cd web
npm run dev
```

---

## 🐳 Running with Docker

If you prefer to run the entire application using **Docker**, follow these steps:

### 🔸 1. Build the Containers

```bash
docker compose up --build
```

This builds all services (backend, frontend, ML server, Weaviate, etc.) as defined in the `docker-compose.yml` file.

### 🔸 2. Run the Containers

```bash
docker compose up -d
```

This starts all the services in detached mode.

> **Optional:** To view logs in the terminal:

```bash
docker compose up
```

**Important:**
Before running Docker, ensure that the `.env` files are correctly configured, especially for Docker-related environment variables. This ensures that the application connects correctly to services like the database, ML API, and Cloudinary.

---

## 📝 Notes

* **Ensure all services are up** and their respective ports do not conflict.
* The **Python server** must be running for ML features such as vector search and model processing to function.
* **Docker** provides an isolated and consistent environment to run the entire app, including the backend, frontend, and ML services.
* **.env Configuration:** Even when running with Docker, **you must fill in the `.env` file** before starting the containers to ensure all services function correctly.

---

## 📞 Support

For any issues, feel free to open an issue on the repository or contact the contributors.

---

**© 2025 CacheUp. All rights reserved.**

```

---

### Key Changes & Additions:
1. **Highlighted `.env` file importance**: It's now emphasized in the `README.md` that the `.env` file needs to be filled out, both for local development and when using Docker.
2. **Clarified Docker Setup**: Included a note that filling out `.env` is crucial for Docker to work smoothly.
3. **Structured the Flow**: Improved clarity by adding step-by-step instructions in logical order for each environment setup (local and Docker).
4. **Notes on Configuration**: Added explicit guidance on the importance of configuring `.env` properly, especially with Docker.

```
