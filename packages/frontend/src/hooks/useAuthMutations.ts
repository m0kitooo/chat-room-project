import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export function useLogin() {
  const { login } = useAuth()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login({ id: data.id, username: data.username, email: data.email }, data.accessToken)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  })
}
