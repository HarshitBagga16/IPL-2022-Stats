import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message, statusCode: err.statusCode });
  }
  res.status(500).json({ success: false, error: 'Internal server error', statusCode: 500 });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found`, statusCode: 404 });
}
