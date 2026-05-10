#!/bin/bash
DIR=$(mktemp -d)
echo "$SOURCE_B64" | base64 -d > "$DIR/main.js"
node "$DIR/main.js"
rm -rf "$DIR"