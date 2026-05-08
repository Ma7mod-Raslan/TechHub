#!/bin/bash
# Decode source code from env var, compile with g++, then run
echo "$SOURCE_B64" | base64 -d > /tmp/main.cpp

# Compile — send compiler errors to stdout so Xterm.js shows them
g++ /tmp/main.cpp -o /tmp/main_cpp 2>&1

# Only run if compilation succeeded
if [ $? -eq 0 ]; then
    /tmp/main_cpp
fi