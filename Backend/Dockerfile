FROM node:current-alpine

WORKDIR /app

RUN apk add --no-cache \
  python3 \
  make \
  g++

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
