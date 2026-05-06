export type { ErrorResponseDTO, AuthJWTPayload } from '@chat-room/shared'
import type { AuthJWTPayload } from '@chat-room/shared'

declare global {
  namespace Express {
    interface Request {
      user?: AuthJWTPayload
    }
  }
}
