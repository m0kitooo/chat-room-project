import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import type { ErrorResponseDTO } from '../types/index.js';
import { formatZodIssues } from '../utils/zod.js';

export const parseRequestBody = (schema: ZodType) =>
  (req: Request, res: Response<ErrorResponseDTO>, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        errorType: 'BAD_REQUEST',
        message: 'Invalid request body',
        additionalData: formatZodIssues(parsed.error.issues)
      });
    }
    req.body = parsed.data;
    next();
  };

// export const parseRequestQuery = (schema: ZodType) =>