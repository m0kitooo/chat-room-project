export type UserRole = 'USER' | 'ADMIN';

export type AuthJWTPayload = {
  userId: string
  username: string
  email: string
  roles: UserRole[]
}

export type ErrorResponseDTO = {
  errorType: string
  message: string
  additionalData?: Record<string, unknown>
}

export type AuthResponse = {
  id: string
  username: string
  email: string
  accessToken: string
}

export type RegisterResponse = {
  id: string
  username: string
  email: string
}
