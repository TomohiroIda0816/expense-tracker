import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'
import AuthPage from './AuthPage.jsx'
import Dashboard from './Dashboard.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚅</div>
        <p style={{ color: '#8888aa', fontSize: '14px' }}>読み込み中...</p>
      </div>
    )
  }

  if (!session) return <AuthPage />
  return <Dashboard session={session} />
}

const styles = {
  loadingPage: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a40 40%, #24243e 100%)',
  },
}
