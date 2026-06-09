-- GitHub Profile Analyzer — MySQL Schema
-- Run once to initialise the database.

CREATE DATABASE IF NOT EXISTS github_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE github_analyzer;

CREATE TABLE IF NOT EXISTS profiles (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  username            VARCHAR(255)     NOT NULL,
  name                VARCHAR(255)         NULL,
  followers           INT UNSIGNED     NOT NULL DEFAULT 0,
  following           INT UNSIGNED     NOT NULL DEFAULT 0,
  public_repos        INT UNSIGNED     NOT NULL DEFAULT 0,
  company             VARCHAR(255)         NULL,
  location            VARCHAR(255)         NULL,
  bio                 TEXT                 NULL,
  profile_url         VARCHAR(512)     NOT NULL,
  account_created_at  DATETIME         NOT NULL,
  account_age_years   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  analyzed_at         DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username),
  KEY idx_analyzed_at (analyzed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
