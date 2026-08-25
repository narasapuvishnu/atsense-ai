import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers were already sent, we can't change the response — hand off to
  // Express's default handler to close the request cleanly.
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = err.message || 'Internal server error';

  console.error(`[ERROR:${statusCode}] ${message}`, isProduction ? '' : err.stack);

  // Always respond with JSON so the client can read the real error. Never let a
  // bare/non-JSON 500 reach the browser (which would surface as the unhelpful
  // axios "Request failed with status code 500").
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
