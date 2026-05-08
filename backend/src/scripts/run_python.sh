#!/bin/bash
# Decode source code from env var and run it with python3
echo "$SOURCE_B64" | base64 -d > /tmp/main.py
python3 /tmp/main.py