import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ id: string; email: string; username: string } | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    if (response.success && response.data) {
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', response.data.token)
      return true
    }
    return false
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const fetchUser = async () => {
    if (token.value) {
      try {
        const response = await authApi.getMe()
        if (response.success && response.data) {
          user.value = response.data
        }
      } catch {
        logout()
      }
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  }
})
