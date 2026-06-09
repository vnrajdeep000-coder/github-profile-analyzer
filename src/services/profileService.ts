import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import type { CreateProfileInput, Profile } from "../models/Profile";
import type { PaginationMeta } from "../lib/response";

export class DuplicateProfileError extends Error {
  constructor(username: string) {
    super(`Profile for "${username}" already exists`);
    this.name = "DuplicateProfileError";
  }
}

export class ProfileNotFoundError extends Error {
  constructor(id: number) {
    super(`Profile with id ${id} not found`);
    this.name = "ProfileNotFoundError";
  }
}

export async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM profiles WHERE username = ?",
    [input.username],
  );
  if (existing.length > 0) {
    throw new DuplicateProfileError(input.username);
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO profiles
       (username, name, followers, following, public_repos, company, location, bio, profile_url, account_created_at, account_age_years)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.username,
      input.name,
      input.followers,
      input.following,
      input.public_repos,
      input.company,
      input.location,
      input.bio,
      input.profile_url,
      input.account_created_at,
      input.account_age_years,
    ],
  );

  return getProfileById(result.insertId) as Promise<Profile>;
}

export async function getAllProfiles(
  page: number,
  limit: number,
  search?: string,
): Promise<{ profiles: Profile[]; pagination: PaginationMeta }> {
  const offset = (page - 1) * limit;
  const searchParam = search ? `%${search}%` : null;

  const whereClause = searchParam ? "WHERE username LIKE ? OR name LIKE ?" : "";
  const countParams = searchParam ? [searchParam, searchParam] : [];
  const queryParams = searchParam
    ? [searchParam, searchParam, limit, offset]
    : [limit, offset];

  const [[{ total }]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM profiles ${whereClause}`,
    countParams,
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM profiles ${whereClause} ORDER BY analyzed_at DESC LIMIT ? OFFSET ?`,
    queryParams,
  );

  return {
    profiles: rows as Profile[],
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

export async function getProfileById(id: number): Promise<Profile | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM profiles WHERE id = ?",
    [id],
  );
  return rows.length > 0 ? (rows[0] as Profile) : null;
}
