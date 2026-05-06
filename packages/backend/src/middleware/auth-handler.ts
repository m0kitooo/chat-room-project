import { type Request, type Response, type NextFunction } from 'express';
import { extractBearerToken, verifyAccessToken } from '../utils/token.js';
import { ProgrammerError } from '../errors/ProgrammerError.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { ErrorResponseDTO } from '@chat-room/shared';

const handleAuthentication = async (req: Request, res: Response<ErrorResponseDTO>, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({
    errorType: 'NOT_AUTHORIZED',
    message: 'Authorization header not provided',
    additionalData: {
      expectedHeaderFormat: 'Bearer <bearer_token>'
    }
  });
  const extractedToken = extractBearerToken(authHeader);
  if (!extractedToken) return res.status(401).json({
    errorType: 'NOT_AUTHORIZED',
    message: 'Authorization header invalid format',
    additionalData: {
      expectedHeaderFormat: 'Bearer <bearer_token>'
    }
  });

  try {
    const { payload } = await verifyAccessToken(extractedToken);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

const handleAuthorization = (allowedRoles: UserRole[]) => {
  if (allowedRoles.length === 0) throw new ProgrammerError('handleAuthorization() called with empty allowedRoles array. Pass at least one role.');

  return (req: Request, res: Response<ErrorResponseDTO>, next: NextFunction) => {
    if (!req.user) throw new ProgrammerError('Invalid middleware usage. Should always be used after authentication handler');
    if (!req.user.roles.some(role => allowedRoles.includes(role))) return res
      .status(403)
      .json({
        errorType: 'AUTHORIZATION_ERROR',
        message: 'Lack of permission to get this resource'
      });
    next();
  };
};

/**
 * 
 * @param allowedRoles AllowedRoles define permissions af a user if not provided it will not check them. Emtpy array will throw an error
 */
export const guard = (allowedRoles?: UserRole[]) => [
  handleAuthentication,
  ...(allowedRoles ? [handleAuthorization(allowedRoles)] : [])
];
