import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500
function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function TripForm({ onAdd, onUpdate, editTrip, onCancelEdit, userId }) {
  const [destination, setDestination] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [outMethod, setOutMethod] = useState('')
  const [outFare, setOutFare] = useState('')
  const [retMethod, setRetMethod] = useState('')
  const [retFare, setRetFare] = useState('')
  const [error, setError] = useState('')
  const [routes, setRoutes] = useState([])
  const [showRouteManager, setShowRouteManager] = useState(false)
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteMethod, setNewRouteMethod] = useState('')
  const [newRouteFare, setNewRouteFare] = useState('')

  useEffect(() => { if (userId) loadRoutes() }, [userId])

  const loadRoutes = async () => {
    const { data } = await supabase.from('transport_routes').select('*').eq('user_id', userId).order('route_name')
    setRoutes(data || [])
  }

  useEffect(() => {
    if (editTrip) {
      setDestination(editTrip.destination); setDateFrom(editTrip.date_from); setDateTo(editTrip.date_to)
      setOutMethod(editTrip.outbound_method || ''); setOutFare(String(editTrip.outbound_fare || 0))
      setRetMethod(editTrip.return_method || ''); setRetFare(String(editTrip.return_fare || 0))
    }
  }, [editTrip])

  const totalFare = (parseInt(outFare, 10) || 0) + (parseInt(retFare, 10) || 0)
  const preview = dateFrom && dateTo && new Date(dateTo) >= new Date(dateFrom)
    ? (() => { const n = Math.round((new Date(dateTo) - new Date(dateFrom)) / 86400000); return { type: n === 0 ? '日帰り' : `${n}泊`, allowance: n === 0 ? DAILY_ALLOWANCE : n * OVERNIGHT_ALLOWANCE } })() : null

  const handleSubmit = () => {
    if (!destination || !dateFrom || !dateTo) { setError('出張先と日付を入力してください'); return }
    if (new Date(dateTo) < new Date(dateFrom)) { setError('帰りの日付は行きの日付以降にしてください'); return }
    const of = parseInt(outFare, 10) || 0, rf = parseInt(retFare, 10) || 0
    if (of < 0 || rf < 0) { setError('運賃は0以上で入力してください'); return }
    const data = { destination, dateFrom, dateTo, transportCost: of + rf, outboundMethod: outMethod, outboundFare: of, returnMethod: retMethod, returnFare: rf }
    editTrip ? onUpdate(editTrip.id, data) : onAdd(data)
    resetForm()
  }
  const resetForm = () => { setDestination(''); setDateFrom(''); setDateTo(''); setOutMethod(''); setOutFare(''); setRetMethod(''); setRetFare(''); setError('') }
  const handleCancel = () => { resetForm(); onCancelEdit() }
  const applyRoute = (route, target) => {
    if (target === 'out') { setOutMethod(route.transport_method); setOutFare(String(route.fare)) }
    else { setRetMethod(route.transport_method); setRetFare(String(route.fare)) }
  }
  const addRoute = async () => {
    if (!newRouteName || !newRouteFare) return
    const { data, error } = await supabase.from('transport_routes').insert({ user_id: userId, route_name: newRouteName, transport_method: newRouteMethod, fare: parseInt(newRouteFare, 10) || 0 }).select().single()
    if (!error && data) { setRoutes([...routes, data]); setNewRouteName(''); setNewRouteMethod(''); setNewRouteFare('') }
  }
  const deleteRoute = async (id) => { await supabase.from('transport_routes').delete().eq('id', id); setRoutes(routes.filter(r => r.id !== id)) }

  return (
    <div style={st.card}>
      <h2 style={st.cardTitle}>{editTrip ? '✏️ 出張情報を編集' : '＋ 出張情報を追加'}</h2>
      <div style={st.grid}>
        <div style={st.full}><label style={st.label}>出張先</label><input style={st.input} value={destination} onChange={(e) => { setDestination(e.target.value); setError('') }} placeholder="例: 大阪本社" /></div>
        <div><label style={st.label}>行き（出発日）</label><input style={st.input} type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setError('') }} /></div>
        <div><label style={st.label}>帰り（帰着日）</label><input style={st.input} type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setError('') }} /></div>
      </div>

      {/* Outbound */}
      <div style={st.fareSection}>
        <div style={st.fareHeader}><span style={st.fareLabel}>🔵 往路</span>
          {routes.length > 0 && <select style={st.routeSel} onChange={(e) => { if (e.target.value) applyRoute(routes.find(r => r.id === e.target.value), 'out'); e.target.value = '' }}><option value="">マイルートから選択...</option>{routes.map(r => <option key={r.id} value={r.id}>{r.route_name}（{r.transport_method} {formatCurrency(r.fare)}）</option>)}</select>}
        </div>
        <div style={st.fareRow}>
          <div><label style={st.labelSm}>交通手段</label><input style={st.input} value={outMethod} onChange={(e) => setOutMethod(e.target.value)} placeholder="例: 新幹線" /></div>
          <div><label style={st.labelSm}>運賃（円）</label><input style={st.input} type="number" value={outFare} onChange={(e) => setOutFare(e.target.value)} placeholder="0" min="0" /></div>
        </div>
      </div>

      {/* Return */}
      <div style={st.fareSection}>
        <div style={st.fareHeader}><span style={st.fareLabel}>🟠 復路</span>
          {routes.length > 0 && <select style={st.routeSel} onChange={(e) => { if (e.target.value) applyRoute(routes.find(r => r.id === e.target.value), 'ret'); e.target.value = '' }}><option value="">マイルートから選択...</option>{routes.map(r => <option key={r.id} value={r.id}>{r.route_name}（{r.transport_method} {formatCurrency(r.fare)}）</option>)}</select>}
        </div>
        <div style={st.fareRow}>
          <div><label style={st.labelSm}>交通手段</label><input style={st.input} value={retMethod} onChange={(e) => setRetMethod(e.target.value)} placeholder="例: 新幹線" /></div>
          <div><label style={st.labelSm}>運賃（円）</label><input style={st.input} type="number" value={retFare} onChange={(e) => setRetFare(e.target.value)} placeholder="0" min="0" /></div>
        </div>
      </div>

      <div style={st.totalFare}>交通費合計: <strong>{formatCurrency(totalFare)}</strong></div>

      <button style={st.routeToggle} onClick={() => setShowRouteManager(!showRouteManager)}>{showRouteManager ? '▲ マイルートを閉じる' : '⚙ マイルートを管理'}</button>
      {showRouteManager && (
        <div style={st.routeMgr}>
          <div style={st.routeAddRow}>
            <input style={st.rInput} value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} placeholder="区間名（例: 東京→大阪）" />
            <input style={st.rInputSm} value={newRouteMethod} onChange={(e) => setNewRouteMethod(e.target.value)} placeholder="手段" />
            <input style={st.rInputSm} type="number" value={newRouteFare} onChange={(e) => setNewRouteFare(e.target.value)} placeholder="運賃" min="0" />
            <button style={st.rAddBtn} onClick={addRoute}>追加</button>
          </div>
          {routes.length === 0 && <p style={{ fontSize: '12px', color: '#666688', textAlign: 'center', padding: '8px 0', margin: 0 }}>登録されたルートはありません</p>}
          {routes.map(r => (
            <div key={r.id} style={st.rItem}>
              <div><div style={{ fontSize: '13px', fontWeight: 600, color: '#d0d0e8' }}>{r.route_name}</div><div style={{ fontSize: '11px', color: '#8888aa' }}>{r.transport_method} / {formatCurrency(r.fare)}</div></div>
              <button style={st.rDelBtn} onClick={() => deleteRoute(r.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {preview && <div style={st.preview}><span style={st.badge}>{preview.type}</span><span style={{ fontSize: '14px', color: '#b8b8d0' }}>出張手当: {formatCurrency(preview.allowance)}</span></div>}
      {error && <p style={st.error}>{error}</p>}
      <div style={st.actions}>
        <button style={st.addBtn} onClick={handleSubmit}>{editTrip ? '更新する' : '追加する'}</button>
        {editTrip && <button style={st.cancelBtn} onClick={handleCancel}>キャンセル</button>}
      </div>
    </div>
  )
}

const st = {
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, margin: '0 0 20px', color: '#d0d0e8' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  full: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9999bb', marginBottom: '6px' },
  labelSm: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#8888aa', marginBottom: '4px' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  fareSection: { marginTop: '16px', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' },
  fareHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' },
  fareLabel: { fontSize: '14px', fontWeight: 700, color: '#d0d0e8' },
  fareRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  totalFare: { marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', fontSize: '14px', color: '#b8b8d0', textAlign: 'right' },
  routeSel: { padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#d0d0e8', fontSize: '12px', outline: 'none', maxWidth: '280px' },
  routeToggle: { width: '100%', marginTop: '12px', padding: '8px', background: 'transparent', color: '#8888aa', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', textAlign: 'center' },
  routeMgr: { marginTop: '10px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' },
  routeAddRow: { display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  rInput: { flex: '2 1 140px', padding: '8px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  rInputSm: { flex: '1 1 80px', padding: '8px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  rAddBtn: { padding: '8px 14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  rItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  rDelBtn: { padding: '4px 8px', background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.15)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' },
  preview: { marginTop: '16px', padding: '10px 14px', background: 'rgba(102,126,234,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(102,126,234,0.2)' },
  badge: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 },
  error: { color: '#ff6b6b', fontSize: '13px', marginTop: '12px', padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px' },
  actions: { display: 'flex', gap: '10px', marginTop: '20px' },
  addBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(102,126,234,0.3)' },
  cancelBtn: { padding: '12px 20px', background: 'rgba(255,255,255,0.08)', color: '#aaa', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
}
