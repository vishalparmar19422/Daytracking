import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/auth'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import GroupView from './components/GroupView'

function Routes() {
  const { user, loading } = useAuth()
  const [groupId, setGroupId] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        Loading…
      </div>
    )
  }

  if (!user) return <AuthScreen />

  if (groupId) {
    return <GroupView groupId={groupId} onBack={() => setGroupId(null)} />
  }

  return <Dashboard onOpenGroup={setGroupId} />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}
