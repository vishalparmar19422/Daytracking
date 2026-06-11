import { createContext, useContext } from 'react'

// The context object + hook live here (not in the .jsx) so that AuthContext.jsx
// can export only its component — keeps react-refresh / Fast Refresh happy.
export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
