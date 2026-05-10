#!/bin/bash
DIR=$(mktemp -d)
echo "$SOURCE_B64" | base64 -d > "$DIR/Main.java"
javac "$DIR/Main.java" -d "$DIR" 2>&1
if [ $? -eq 0 ]; then
    java -cp "$DIR" Main
fi
rm -rf "$DIR"