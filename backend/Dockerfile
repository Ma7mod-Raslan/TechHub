# ─────────────────────────────────────────────
#  Backend — Node.js API server
# ─────────────────────────────────────────────
FROM node:18

# ── System dependencies ───────────────────────────────────────────────────────
#  - Puppeteer/Chrome deps  → certificate generation
#  - build-essential        → node-pty native compilation
#  - curl                   → used to download Docker CLI binary
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    build-essential \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ── Docker CLI (static binary) ────────────────────────────────────────────────
#  Downloads only the docker CLI binary — not the daemon.
#  The backend uses it to spawn sandbox containers via the mounted Docker socket.
RUN curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz \
    | tar -xz --strip-components=1 -C /usr/local/bin docker/docker \
    && chmod +x /usr/local/bin/docker \
    && docker --version

# ── Puppeteer config ──────────────────────────────────────────────────────────
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
    PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/app.js"]