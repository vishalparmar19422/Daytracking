import { useEffect, useState } from 'react'
import * as store from '../lib/store'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore an existing session on first load.
  useEffect(() => {
    store.getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const value = {
    user,
    loading,
    async login(username, password) {
      const u = await store.login(username, password)
      setUser(u)
      return u
    },
    async register(username, password) {
      const u = await store.register(username, password)
      setUser(u)
      return u
    },
    async logout() {
      await store.logout()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
