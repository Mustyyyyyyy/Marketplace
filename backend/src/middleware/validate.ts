import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(new (require('../errors').HttpError)(400, 'Invalid body', parsed.error.flatten()));
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return next(new (require('../errors').HttpError)(400, 'Invalid query', parsed.error.flatten()));
    (req as any).validatedQuery = parsed.data;
    next();
  };
}