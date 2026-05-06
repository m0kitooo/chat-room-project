import type { Request, Response, NextFunction } from 'express';
import { ErrorResponseDTO } from '../types/index.js';
import log from '../lib/winston.js'
import { ProgrammerError } from '../errors/ProgrammerError.js';

export const handleError = (err: any, req: Request, res: Response<ErrorResponseDTO>, _: NextFunction) => {
  if (err instanceof ProgrammerError) {
    log.error('Programming contract violated:', err);
    process.exit(1);
  }
  log.error('An unexpected error occured:', err);
  return res.status(500).json({
    errorType: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
}