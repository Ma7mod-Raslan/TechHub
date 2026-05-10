#!/bin/bash
DIR=$(mktemp -d)
echo "$SOURCE_B64" | base64 -d > "$DIR/main.py"
python3 "$DIR/main.py"
rm -rf "$DIR"