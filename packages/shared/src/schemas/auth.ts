import { z } from 'zod'

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

export const registerSchema = z.object({
  username: z.string().trim().min(2, 'Username must be at least 2 characters'),
  email: z.email('Invalid email address').trim(),
  password: passwordSchema,
})

export const loginSchema = z.object({
  identifier: z.union([
    z.email().trim(),
    z.string().trim().min(2),
  ]),
  password: z.string().min(1, 'Password is required'),
})

export type RegisterPayload = z.infer<typeof registerSchema>
export type LoginPayload = z.infer<typeof loginSchema>
