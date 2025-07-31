#!/bin/bash

set -e

echo "🔧 Updating package list..."
sudo apt update

echo "📦 Installing required dependencies..."
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

echo "🔐 Adding Docker's official GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "➕ Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "🔄 Updating package list again..."
sudo apt update

echo "⬇️ Installing Docker Engine and tools..."
sudo apt install -y docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

echo "✅ Docker installation complete."
docker --version

echo "👤 Adding current user to the docker group..."
sudo usermod -aG docker $USER

echo "🔌 Creating Docker network: backend-network..."
sudo docker network create backend-network || echo "⚠️ Network already exists or Docker not restarted yet"

echo "📝 Writing current shell env variables to /Backend/.env..."
# Pick only your relevant env variables and dump them
env | grep -E '^(MONGO_URL|JWT_SECRET|SESSION_SECRET|EMAIL_USER|EMAIL_PASS|CLOUDINARY_CLOUD_NAME|CLOUDINARY_API_KEY|CLOUDINARY_API_SECRET|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|WEAVIATE_HOST|TRANSFORMER_API|NODE_ENV|BACKEND_URL|FRONTEND_URL|WEB_URL|CREATE_ADMIN_PASS)=' > /Backend/.env

echo "✅ /Backend/.env created from shell environment variables."

echo "🚀 Done. You may need to log out and back in for group changes to take effect."
