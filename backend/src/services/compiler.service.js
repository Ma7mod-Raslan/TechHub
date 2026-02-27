import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

const TEMP_DIR = "./temp";

export const runCode = async (language, code) => {
  const id = uuid();
  const dirPath = path.join(TEMP_DIR, id);

  await fs.mkdir(dirPath, { recursive: true });

  let fileName;
  let dockerCommand;

  const fullPath = path.resolve(dirPath).replace(/\\/g, "/");

  switch (language) {
  case "python":
    fileName = "main.py";
    dockerCommand = `docker run --rm --memory=100m --cpus=0.5 --network=none -v "${fullPath}:/app" python:3.10 python /app/main.py`;
    break;

  case "javascript":
    fileName = "main.js";
    dockerCommand = `docker run --rm --memory=100m --cpus=0.5 --network=none -v "${fullPath}:/app" node:18 node /app/main.js`;
    break;

  case "cpp":
    fileName = "main.cpp";
    dockerCommand = `docker run --rm --memory=100m --cpus=0.5 --network=none -v "${fullPath}:/app" gcc:latest bash -c "g++ /app/main.cpp -o /app/a.out && /app/a.out"`;
    break;

  default:
    throw new Error("Unsupported language");
}

  const filePath = path.join(dirPath, fileName);
  await fs.writeFile(filePath, code);

  return new Promise((resolve) => {
    exec(dockerCommand, { timeout: 5000 }, async (error, stdout, stderr) => {
      await fs.rm(dirPath, { recursive: true, force: true });

      resolve({
        output: stdout || null,
        error: stderr || error?.message || null,
      });
    });
  });
};