import { Request, Response, NextFunction } from 'express';

const SLOW_REQUEST_MS = 30_000; // log a warning if a request exceeds this

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`${color}[${method}] ${url} ${status} - ${duration}ms\x1b[0m`);

    if (duration > SLOW_REQUEST_MS) {
      console.warn(
        `[WARN] Slow request: [${method}] ${url} took ${duration}ms. ` +
        `If this is /api/resume/upload it may be the embedding model loading/downloading.`
      );
    }
  });

  next();
};
