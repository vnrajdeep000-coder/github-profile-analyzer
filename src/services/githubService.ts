import axios from "axios";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = process.env["GITHUB_TOKEN"];

const githubClient = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    Accept: "application/vnd.github.v3+json",
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  },
  timeout: 10_000,
});

export interface GitHubUser {
  login: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  company: string | null;
  location: string | null;
  bio: string | null;
  html_url: string;
  created_at: string;
}

export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = "GitHubUserNotFoundError";
  }
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  try {
    const { data } = await githubClient.get<GitHubUser>(`/users/${username}`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new GitHubUserNotFoundError(username);
      }
      throw new GitHubApiError(
        err.response?.data?.message ?? "GitHub API request failed",
        err.response?.status,
      );
    }
    throw new GitHubApiError("Failed to reach GitHub API");
  }
}

export function computeAccountAgeYears(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}
