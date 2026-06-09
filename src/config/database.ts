import mysql from "mysql2/promise";
import { logger } from "../lib/logger";

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "github_analyzer",
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testConnection(): Promise<void> {
  try {
    const conn = await pool.getConnection();
    conn.release();
    logger.info("MySQL connection established");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MySQL");
    throw err;
  }
}
