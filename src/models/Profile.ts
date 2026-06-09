export interface Profile {
  id: number;
  username: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  company: string | null;
  location: string | null;
  bio: string | null;
  profile_url: string;
  account_created_at: string;
  account_age_years: number;
  analyzed_at: string;
}

export interface CreateProfileInput {
  username: string;
  name: string | null;
  followers: number;
  following: number;
  public_repos: number;
  company: string | null;
  location: string | null;
  bio: string | null;
  profile_url: string;
  account_created_at: string;
  account_age_years: number;
}
