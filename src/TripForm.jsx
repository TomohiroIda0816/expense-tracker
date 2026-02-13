import { useState, useEffect } from 'react'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500

function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function TripForm({ onAdd, onUpdate, editTrip, onCancelEdit }) {
  const [destination, setDestination] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [transportCost, setTransportCost] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editTrip) {
      setDestination(editTrip.destination)
      setDateFrom(editTrip.date_from)
      setDateTo(editTrip.date_to)
      setTransportCost(String(editTrip.transport_cost))
    }
  }, [editTrip])

  const preview = dateFrom && dateTo && new Date(dateTo) >= new Date(dateFrom)
    ? (() => {
        const nights = Math.round((new Date(dateTo) - new Date(dateFrom)) / 86400000)
        const allowance = nights === 0 ? DAILY_ALLOWANCE : nights * OVERNIGHT_ALLOWANCE
        return { type: nights === 0 ? '日帰り' : `${nights}泊`, allowance }
      })()
    : null

  const handleSubmit = () => {
    if (!destination || !dateFrom || !dateTo || !transportCost) { setError('すべての項目を入力してください'); return }
    if (new Date(dateTo) < new Date(dateFrom)) { setError('帰りの日付は行きの日付以降にしてください'); return }
    const tc = parseInt(transportCost, 10)
    if (isNaN(tc) || tc < 0) { setError('交通費は0以上の数値を入力してください'); return }

    const data = { destination, dateFrom, dateTo, transportCost: tc }
    if (editTrip) {
      onUpdate(editTrip.id, data)
    } else {
      onAdd(data)
    }
    setDestination(''); setDateFrom(''); setDateTo(''); setTransportCost(''); setError('')
  }

  const handleCancel = () => {
    setDestination(''); setDateFrom(''); setDateTo(''); setTransportCost(''); setError('')
    onCancelEdit()
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>{editTrip ? '✏️ 出張情報を編集' : '＋ 出張情報を追加'}</h2>
      <div style={styles.formGrid}>
        <div style={styles.fieldFull}>
          <label style={styles.label}>出張先</label>
          <input style={styles.input} value={destination} onChange={(e) => { setDestination(e.target.value); setError('') }} placeholder="例: 大阪本社" />
        </div>
        <div>
          <label style={styles.label}>行き（出発日）</label>
          <input style={styles.input} type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setError('') }} />
        </div>
        <div>
          <label style={styles.label}>帰り（帰着日）</label>
          <input style={styles.input} type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setError('') }} />
        </div>
        <div style={styles.fieldFull}>
          <label style={styles.label}>交通費（円）</label>
          <input style={styles.input} type="number" value={transportCost} onChange={(e) => { setTransportCost(e.target.value); setError('') }} placeholder="例: 28000" min="0" />
        </div>
      </div>

      {preview && (
        <div style={styles.preview}>
          <span style={styles.previewBadge}>{preview.type}</span>
          <span style={styles.previewText}>出張手当: {formatCurrency(preview.allowance)}</span>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.actions}>
        <button style={styles.addBtn} onClick={handleSubmit}>{editTrip ? '更新する' : '追加する'}</button>
        {editTrip && <button style={styles.cancelBtn} onClick={handleCancel}>キャンセル</button>}
      </div>
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, margin: '0 0 20px', color: '#d0d0e8' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  fieldFull: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9999bb', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  preview: { marginTop: '16px', padding: '10px 14px', background: 'rgba(102,126,234,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(102,126,234,0.2)' },
  previewBadge: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 },
  previewText: { fontSize: '14px', color: '#b8b8d0' },
  error: { color: '#ff6b6b', fontSize: '13px', marginTop: '12px', padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px' },
  actions: { display: 'flex', gap: '10px', marginTop: '20px' },
  addBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(102,126,234,0.3)' },
  cancelBtn: { padding: '12px 20px', background: 'rgba(255,255,255,0.08)', color: '#aaa', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
}
