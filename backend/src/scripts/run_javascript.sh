#!/bin/bash
# Decode source code from env var and run it with Node.js
echo "$SOURCE_B64" | base64 -d > /tmp/main.js
node /tmp/main.js