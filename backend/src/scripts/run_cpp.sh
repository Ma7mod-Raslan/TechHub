#!/bin/bash
DIR=$(mktemp -d)
echo "$SOURCE_B64" | base64 -d > "$DIR/main.cpp"
g++ "$DIR/main.cpp" -o "$DIR/main_cpp" 2>&1
if [ $? -eq 0 ]; then
    "$DIR/main_cpp"
fi
rm -rf "$DIR"