#!/bin/bash
# Decode source code from env var, compile with javac, then run.
# Java requires the filename to match the public class name.
# We extract the class name from the source to name the file correctly.

echo "$SOURCE_B64" | base64 -d > /tmp/Main.java

# Compile — send compiler errors to stdout so Xterm.js shows them
javac /tmp/Main.java -d /tmp 2>&1

# Only run if compilation succeeded
if [ $? -eq 0 ]; then
    java -cp /tmp Main
fi