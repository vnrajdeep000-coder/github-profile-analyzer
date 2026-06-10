import type { Request, Response } from "express";
import {
  fetchGitHubUser,
  computeAccountAgeYears,
  GitHubUserNotFoundError,
  GitHubApiError,
} from "../services/githubService";
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  DuplicateProfileError,
  ProfileNotFoundError,
} from "../services/profileService";
import { sendSuccess, sendError } from "../lib/response";

export async function analyzeProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params as { username: string };

  try {
    const ghUser = await fetchGitHubUser(username);

    const profile = await createProfile({
      username: ghUser.login,
      name: ghUser.name,
      followers: ghUser.followers,
      following: ghUser.following,
      public_repos: ghUser.public_repos,
      company: ghUser.company,
      location: ghUser.location,
      bio: ghUser.bio,
      profile_url: ghUser.html_url,
      account_created_at: ghUser.created_at.replace("T", " ").replace("Z", ""),
      account_age_years: computeAccountAgeYears(ghUser.created_at),
    });

    sendSuccess(res, profile, "Profile analyzed and stored successfully", 201);
  } catch (err) {
    if (err instanceof GitHubUserNotFoundError) {
      sendError(res, err.message, 404, "GITHUB_USER_NOT_FOUND");
    } else if (err instanceof GitHubApiError) {
      sendError(res, err.message, 502, "GITHUB_API_ERROR");
    } else if (err instanceof DuplicateProfileError) {
      sendError(res, err.message, 409, "DUPLICATE_PROFILE");
    } else {
      req.log.error({ err }, "Unexpected error in analyzeProfile");
      sendError(res, "An unexpected error occurred", 500, "INTERNAL_ERROR");
    }
  }
}

export async function listProfiles(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query["limit"] ?? "10"), 10)),
    );
    const search = req.query["search"] ? String(req.query["search"]) : undefined;

    const { profiles, pagination } = await getAllProfiles(page, limit, search);
    sendSuccess(res, profiles, "Profiles retrieved successfully", 200, pagination);
  } catch (err) {
    req.log.error({ err }, "Unexpected error in listProfiles");
    sendError(res, "Failed to retrieve profiles", 500, "DATABASE_ERROR");
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const id = parseInt(String(req.params["id"]), 10);

  if (Number.isNaN(id)) {
    sendError(res, "Invalid profile id", 400, "INVALID_ID");
    return;
  }

  try {
    const profile = await getProfileById(id);
    if (!profile) {
      throw new ProfileNotFoundError(id);
    }
    sendSuccess(res, profile, "Profile retrieved successfully");
  } catch (err) {
    if (err instanceof ProfileNotFoundError) {
      sendError(res, err.message, 404, "PROFILE_NOT_FOUND");
    } else {
      req.log.error({ err }, "Unexpected error in getProfile");
      sendError(res, "Failed to retrieve profile", 500, "DATABASE_ERROR");
    }
  }
}
