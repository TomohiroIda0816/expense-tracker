import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient.js'
import TripForm from './TripForm.jsx'
import TripList from './TripList.jsx'
import ExportView from './ExportView.jsx'
import PastReports from './PastReports.jsx'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500
function getCurrentMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

export default function Dashboard({ session }) {
  const [view, setView] = useState('current')
  const [profile, setProfile] = useState(null)
  const [currentReport, setCurrentReport] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTrip, setEditTrip] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [pastReport, setPastReport] = useState(null)
  const [pastTrips, setPastTrips] = useState([])
  const userId = session.user.id

  useEffect(() => { (async () => { const { data } = await supabase.from('profiles').select('*').eq('id', userId).single(); if (data) setProfile(data) })() }, [userId])

  const loadCurrentReport = useCallback(async (month) => {
    setLoading(true)
    let { data: report } = await supabase.from('monthly_reports').select('*').eq('user_id', userId).eq('target_month', month).single()
    if (!report) { const { data: nr } = await supabase.from('monthly_reports').insert({ user_id: userId, target_month: month }).select().single(); report = nr }
    setCurrentReport(report)
    if (report) { const { data: td } = await supabase.from('trips').select('*').eq('report_id', report.id).order('date_from', { ascending: true }); setTrips(td || []) }
    setLoading(false)
  }, [userId])

  useEffect(() => { loadCurrentReport(selectedMonth) }, [selectedMonth, loadCurrentReport])

  const addTrip = async (d) => {
    const nights = Math.round((new Date(d.dateTo) - new Date(d.dateFrom)) / 86400000)
    const allowance = nights === 0 ? DAILY_ALLOWANCE : nights * OVERNIGHT_ALLOWANCE
    const { data, error } = await supabase.from('trips').insert({
      report_id: currentReport.id, user_id: userId, destination: d.destination,
      date_from: d.dateFrom, date_to: d.dateTo, transport_cost: d.transportCost,
      nights, allowance, trip_type: nights === 0 ? '日帰り' : `${nights}泊`, total_cost: d.transportCost + allowance,
      outbound_method: d.outboundMethod, outbound_fare: d.outboundFare,
      return_method: d.returnMethod, return_fare: d.returnFare,
    }).select().single()
    if (!error && data) setTrips([...trips, data])
  }

  const updateTrip = async (tripId, d) => {
    const nights = Math.round((new Date(d.dateTo) - new Date(d.dateFrom)) / 86400000)
    const allowance = nights === 0 ? DAILY_ALLOWANCE : nights * OVERNIGHT_ALLOWANCE
    const { data, error } = await supabase.from('trips').update({
      destination: d.destination, date_from: d.dateFrom, date_to: d.dateTo, transport_cost: d.transportCost,
      nights, allowance, trip_type: nights === 0 ? '日帰り' : `${nights}泊`, total_cost: d.transportCost + allowance,
      outbound_method: d.outboundMethod, outbound_fare: d.outboundFare,
      return_method: d.returnMethod, return_fare: d.returnFare,
    }).eq('id', tripId).select().single()
    if (!error && data) { setTrips(trips.map(t => t.id === tripId ? data : t)); setEditTrip(null) }
  }

  const deleteTrip = async (tripId) => { await supabase.from('trips').delete().eq('id', tripId); setTrips(trips.filter(t => t.id !== tripId)) }

  const updateProfile = async (name) => {
    await supabase.from('profiles').update({ display_name: name }).eq('id', userId)
    setProfile({ ...profile, display_name: name })
  }

  const viewPastReport = async (report) => {
    const { data } = await supabase.from('trips').select('*').eq('report_id', report.id).order('date_from')
    setPastReport(report); setPastTrips(data || []); setView('pastDetail')
  }

  const st = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a40 40%, #24243e 100%)', padding: '24px 16px', color: '#e0e0e0' },
    container: { maxWidth: '720px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    headerIcon: { fontSize: '30px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '14px', boxShadow: '0 4px 16px rgba(102,126,234,0.4)' },
    title: { fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff' },
    userInfo: { fontSize: '12px', color: '#8888aa', margin: 0 },
    logoutBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.06)', color: '#8888aa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' },
    nav: { display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px' },
    navBtn: { flex: 1, padding: '11px', background: 'transparent', color: '#8888aa', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
    navActive: { flex: 1, padding: '11px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
    monthSelector: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' },
    monthInput: { padding: '8px 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#f0f0f0', fontSize: '15px', outline: 'none' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0f0c29 0%, #1a1a40 40%, #24243e 100%)' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚅</div>
      <p style={{ color: '#8888aa', fontSize: '14px' }}>データを読み込み中...</p>
    </div>
  )

  return (
    <div style={st.page}><div style={st.container}>
      <div style={st.header}>
        <div style={st.headerLeft}>
          <div style={st.headerIcon}>🚅</div>
          <div><h1 style={st.title}>出張経費管理</h1><p style={st.userInfo}>{profile?.display_name || session.user.email}</p></div>
        </div>
        <button style={st.logoutBtn} onClick={() => supabase.auth.signOut()}>ログアウト</button>
      </div>
      <div style={st.nav}>
        <button style={view === 'current' || view === 'export' ? st.navActive : st.navBtn} onClick={() => setView('current')}>📝 当月の入力</button>
        <button style={view === 'past' || view === 'pastDetail' ? st.navActive : st.navBtn} onClick={() => setView('past')}>📂 過去の申請一覧</button>
      </div>
      {view === 'current' && (
        <div style={st.monthSelector}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#9999bb' }}>対象月:</span>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={st.monthInput} />
        </div>
      )}
      {view === 'current' && <>
        <TripForm onAdd={addTrip} onUpdate={updateTrip} editTrip={editTrip} onCancelEdit={() => setEditTrip(null)} userId={userId} />
        <TripList trips={trips} onEdit={setEditTrip} onDelete={deleteTrip} onExport={() => setView('export')} />
      </>}
      {view === 'export' && <ExportView trips={trips} profile={profile} targetMonth={selectedMonth} onBack={() => setView('current')} onUpdateProfile={updateProfile} />}
      {view === 'past' && <PastReports userId={userId} onViewReport={viewPastReport} />}
      {view === 'pastDetail' && pastReport && <ExportView trips={pastTrips} profile={profile} targetMonth={pastReport.target_month} onBack={() => setView('past')} onUpdateProfile={updateProfile} readOnly />}
    </div></div>
  )
}
