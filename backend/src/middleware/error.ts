import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors';
import { logger } from '../logger';

export { HttpError as ApiError } from '../errors';
export { HttpError } from '../errors';

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  logger.error({ err, path: req.path }, 'unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}