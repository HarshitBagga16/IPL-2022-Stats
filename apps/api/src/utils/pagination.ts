export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(opts: PaginationOptions): PaginationResult {
  const page = Math.max(1, Number(opts.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(opts.limit) || 20));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function buildMeta(total: number, page: number, limit: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

export function successResponse<T>(data: T, message?: string) {
  return { success: true, data, ...(message ? { message } : {}) };
}

export function errorResponse(error: string, statusCode: number) {
  return { success: false, error, statusCode };
}
