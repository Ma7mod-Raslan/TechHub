# ─────────────────────────────────────────────
#  Backend — Node.js API server
#  Language runtimes removed — code now runs
#  in the separate techhub-sandbox container.
# ─────────────────────────────────────────────
FROM node:18

# ✅ Only needs:
#  - build-essential → node-pty native build
#  - docker-cli      → to spawn sandbox containers
RUN apt-get update && apt-get install -y \
    build-essential \
    docker.io \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/app.js"]