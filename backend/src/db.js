import pkg from "pg";
const { Pool } = pkg;

export const db = new Pool({
  user: "techhub_user",
  host: "localhost",
  database: "techhub",
  password: "12345",
  port: 5432
});

