FROM node:18

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    make \
    openjdk-17-jdk-headless \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY src/scripts/run_python.sh     /usr/local/bin/run_python.sh
COPY src/scripts/run_javascript.sh /usr/local/bin/run_javascript.sh
COPY src/scripts/run_cpp.sh        /usr/local/bin/run_cpp.sh
COPY src/scripts/run_java.sh       /usr/local/bin/run_java.sh

RUN chmod +x \
    /usr/local/bin/run_python.sh \
    /usr/local/bin/run_javascript.sh \
    /usr/local/bin/run_cpp.sh \
    /usr/local/bin/run_java.sh

EXPOSE 5000

CMD ["node", "src/app.js"]