import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech");

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false
});

export default db;
