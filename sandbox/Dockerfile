# ─────────────────────────────────────────────
#  TechHub Sandbox Image
#  Contains ONLY language runtimes + runner scripts.
#  No Node.js app, no .env, no DB credentials.
#  Every code execution gets a fresh throwaway
#  container spun from this image.
# ─────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    g++ \
    make \
    openjdk-17-jdk-headless \
    coreutils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy runner scripts
COPY scripts/run_python.sh     /usr/local/bin/run_python.sh
COPY scripts/run_javascript.sh /usr/local/bin/run_javascript.sh
COPY scripts/run_cpp.sh        /usr/local/bin/run_cpp.sh
COPY scripts/run_java.sh       /usr/local/bin/run_java.sh

RUN chmod +x \
    /usr/local/bin/run_python.sh \
    /usr/local/bin/run_javascript.sh \
    /usr/local/bin/run_cpp.sh \
    /usr/local/bin/run_java.sh

# Execution happens in /tmp — writable even with --read-only
WORKDIR /tmp