import type {
  RegisterPayload,
  LoginPayload,
  AuthResponse,
  RegisterResponse,
  ErrorResponseDTO,
} from '@chat-room/shared'

export type { RegisterPayload, LoginPayload, AuthResponse, RegisterResponse }
export type ApiError = ErrorResponseDTO & {
  additionalData?: {
    alreadyTakenFields?: Record<string, string>
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  const body = await res.json()
  if (!res.ok) throw body as ApiError
  return body as T
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<RegisterResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginPayload) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
}
