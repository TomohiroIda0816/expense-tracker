import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient.js'

function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function PastReports({ userId, onViewReport }) {
  const [reports, setReports] = useState([])
  const [reportSummaries, setReportSummaries] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('user_id', userId)
        .order('target_month', { ascending: false })

      const reportList = data || []
      setReports(reportList)

      // Get trip summaries for each report
      const summaries = {}
      for (const report of reportList) {
        const { data: trips } = await supabase
          .from('trips')
          .select('transport_cost, allowance, total_cost')
          .eq('report_id', report.id)

        const tripData = trips || []
        summaries[report.id] = {
          count: tripData.length,
          totalTransport: tripData.reduce((s, t) => s + t.transport_cost, 0),
          totalAllowance: tripData.reduce((s, t) => s + t.allowance, 0),
          grandTotal: tripData.reduce((s, t) => s + t.total_cost, 0),
        }
      }
      setReportSummaries(summaries)
      setLoading(false)
    })()
  }, [userId])

  if (loading) {
    return (
      <div style={styles.card}>
        <p style={{ color: '#8888aa', textAlign: 'center', padding: '32px' }}>読み込み中...</p>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📂</div>
        <p style={{ fontSize: '15px', color: '#8888aa', margin: '0 0 6px' }}>過去の申請はありません</p>
        <p style={{ fontSize: '12px', color: '#666688', margin: 0 }}>「当月の入力」タブで出張を追加してください</p>
      </div>
    )
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>📂 過去の申請一覧</h2>
      <div style={styles.list}>
        {reports.map((report) => {
          const summary = reportSummaries[report.id] || {}
          const [y, m] = report.target_month.split('-')
          const label = `${y}年${parseInt(m)}月`

          return (
            <div key={report.id} style={styles.item} onClick={() => onViewReport(report)}>
              <div style={styles.itemMain}>
                <div style={styles.month}>{label}</div>
                <div style={styles.stats}>
                  {summary.count || 0}件の出張
                </div>
              </div>
              <div style={styles.itemRight}>
                <div style={styles.amount}>{formatCurrency(summary.grandTotal || 0)}</div>
                <div style={styles.breakdown}>
                  交通費 {formatCurrency(summary.totalTransport || 0)} / 手当 {formatCurrency(summary.totalAllowance || 0)}
                </div>
              </div>
              <div style={styles.arrow}>›</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: 700, margin: '0 0 20px', color: '#d0d0e8' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  item: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 18px', background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  itemMain: { flex: 1 },
  month: { fontSize: '16px', fontWeight: 700, color: '#eee', marginBottom: '2px' },
  stats: { fontSize: '12px', color: '#8888aa' },
  itemRight: { textAlign: 'right' },
  amount: { fontSize: '16px', fontWeight: 700, color: '#f5576c', marginBottom: '2px' },
  breakdown: { fontSize: '11px', color: '#8888aa' },
  arrow: { fontSize: '24px', color: '#555', fontWeight: 300 },
  empty: { textAlign: 'center', padding: '48px 20px' },
}
