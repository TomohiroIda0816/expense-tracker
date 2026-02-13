import { useState } from 'react'
import { supabase } from './supabaseClient.js'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message === 'Invalid login credentials' ? 'メールアドレスまたはパスワードが正しくありません' : error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // Update profile with name and department
        if (data.user) {
          await supabase.from('profiles').update({
            display_name: displayName,
            department: department,
          }).eq('id', data.user.id)
        }
        setMessage('確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。')
      }
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>✈</div>
          <h1 style={styles.title}>出張経費管理</h1>
          <p style={styles.subtitle}>Business Trip Expense Tracker</p>
        </div>

        <div style={styles.tabs}>
          <button style={isLogin ? styles.tabActive : styles.tab} onClick={() => { setIsLogin(true); setError(''); setMessage(''); }}>
            ログイン
          </button>
          <button style={!isLogin ? styles.tabActive : styles.tab} onClick={() => { setIsLogin(false); setError(''); setMessage(''); }}>
            アカウント作成
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={styles.field}>
                <label style={styles.label}>氏名</label>
                <input style={styles.input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="山田 太郎" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>部署</label>
                <input style={styles.input} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="営業部" required />
              </div>
            </>
          )}
          <div style={styles.field}>
            <label style={styles.label}>メールアドレス</label>
            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="taro@example.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>パスワード</label>
            <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6文字以上" minLength={6} required />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? '処理中...' : isLogin ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a40 40%, #24243e 100%)', padding: '20px',
  },
  card: {
    width: '100%', maxWidth: '420px',
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
    borderRadius: '20px', padding: '36px 32px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  icon: {
    fontSize: '40px', width: '64px', height: '64px', margin: '0 auto 12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '18px', boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
  },
  title: { fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' },
  subtitle: { fontSize: '11px', color: '#8888aa', letterSpacing: '1.5px', textTransform: 'uppercase' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' },
  tab: {
    flex: 1, padding: '10px', background: 'transparent', color: '#8888aa',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
  tabActive: {
    flex: 1, padding: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9999bb', marginBottom: '6px' },
  input: {
    width: '100%', padding: '11px 14px', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
  },
  error: { color: '#ff6b6b', fontSize: '13px', padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px', marginBottom: '12px' },
  success: { color: '#66bb6a', fontSize: '13px', padding: '8px 12px', background: 'rgba(102,187,106,0.1)', borderRadius: '8px', marginBottom: '12px' },
  submitBtn: {
    width: '100%', padding: '13px', marginTop: '4px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
  },
}
