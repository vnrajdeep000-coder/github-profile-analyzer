import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  pagination?: PaginationMeta,
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  error?: string,
): void {
  const body: ApiResponse = { success: false, message };
  if (error) body.error = error;
  res.status(statusCode).json(body);
}
