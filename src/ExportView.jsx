import { useState } from 'react'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500

function formatDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`
}
function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function ExportView({ trips, profile, targetMonth, onBack, onUpdateProfile, readOnly }) {
  const [name, setName] = useState(profile?.display_name || '')
  const [printMode, setPrintMode] = useState(false)

  const monthLabel = targetMonth
    ? `${targetMonth.split('-')[0]}年${parseInt(targetMonth.split('-')[1])}月`
    : ''

  const totalTransport = trips.reduce((s, t) => s + t.transport_cost, 0)
  const totalAllowance = trips.reduce((s, t) => s + t.allowance, 0)
  const grandTotal = totalTransport + totalAllowance

  const handlePrint = async () => {
    if (!readOnly && name !== profile?.display_name) {
      await onUpdateProfile(name)
    }
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintMode(false), 500)
    }, 300)
  }

  if (printMode) {
    return (
      <>
        <style>{`@media print { @page { size: A4; margin: 18mm 15mm; } }`}</style>
        <div style={ps.sheet}>
          <h1 style={ps.title}>出張経費申請書</h1>
          <div style={ps.meta}>
            <div style={ps.mi}><span style={ps.ml}>申請者</span><span style={ps.mv}>{name || '\u3000'}</span></div>
            <div style={ps.mi}><span style={ps.ml}>対象月</span><span style={ps.mv}>{monthLabel || '\u3000'}</span></div>
            <div style={ps.mi}><span style={ps.ml}>申請日</span><span style={ps.mv}>{formatDate(new Date().toISOString().split('T')[0])}</span></div>
          </div>
          <table style={ps.table}>
            <thead><tr>
              <th style={{ ...ps.th, width: '28px', textAlign: 'center' }}>No.</th>
              <th style={ps.th}>出張先</th>
              <th style={{ ...ps.th, textAlign: 'center' }}>行き</th>
              <th style={{ ...ps.th, textAlign: 'center' }}>帰り</th>
              <th style={{ ...ps.th, textAlign: 'center' }}>区分</th>
              <th style={{ ...ps.th, textAlign: 'right' }}>交通費</th>
              <th style={{ ...ps.th, textAlign: 'right' }}>出張手当</th>
              <th style={{ ...ps.th, textAlign: 'right' }}>合計</th>
            </tr></thead>
            <tbody>
              {trips.map((t, i) => (
                <tr key={t.id} style={i % 2 === 0 ? { background: '#f6f6fa' } : {}}>
                  <td style={{ ...ps.td, textAlign: 'center' }}>{i + 1}</td>
                  <td style={ps.td}>{t.destination}</td>
                  <td style={{ ...ps.td, textAlign: 'center' }}>{formatDate(t.date_from)}</td>
                  <td style={{ ...ps.td, textAlign: 'center' }}>{formatDate(t.date_to)}</td>
                  <td style={{ ...ps.td, textAlign: 'center' }}>{t.trip_type}</td>
                  <td style={{ ...ps.td, textAlign: 'right' }}>{formatCurrency(t.transport_cost)}</td>
                  <td style={{ ...ps.td, textAlign: 'right' }}>{formatCurrency(t.allowance)}</td>
                  <td style={{ ...ps.td, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.total_cost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr>
              <td colSpan={5} style={{ ...ps.td, fontWeight: 700, textAlign: 'right', borderTop: '2px solid #1a1a2e' }}>合計</td>
              <td style={{ ...ps.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalTransport)}</td>
              <td style={{ ...ps.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalAllowance)}</td>
              <td style={{ ...ps.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e', color: '#c0392b', fontSize: '13px' }}>{formatCurrency(grandTotal)}</td>
            </tr></tfoot>
          </table>
          <div style={ps.stamps}>
            <div style={ps.stamp}>申請者</div><div style={ps.stamp}>上長</div><div style={ps.stamp}>経理</div>
          </div>
          <p style={ps.note}>※ 出張手当: 日帰り {formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 {formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={s.sheet}>
        <div style={s.sheetHeader}>
          <h1 style={s.sheetTitle}>出張経費申請書</h1>
          <div style={s.metaGrid}>
            <div style={s.metaRow}>
              <span style={s.ml}>申請者</span>
              {readOnly
                ? <span style={s.metaVal}>{name}</span>
                : <input style={s.metaInput} value={name} onChange={(e) => setName(e.target.value)} placeholder="氏名" />
              }
            </div>
            <div style={s.metaRow}><span style={s.ml}>対象月</span><span style={s.metaVal}>{monthLabel}</span></div>
            <div style={s.metaRow}><span style={s.ml}>申請日</span><span style={s.metaVal}>{formatDate(new Date().toISOString().split('T')[0])}</span></div>
          </div>
        </div>

        <table style={s.table}>
          <thead><tr>
            <th style={{ ...s.th, width: '32px', textAlign: 'center' }}>No.</th>
            <th style={s.th}>出張先</th>
            <th style={{ ...s.th, textAlign: 'center' }}>行き</th>
            <th style={{ ...s.th, textAlign: 'center' }}>帰り</th>
            <th style={{ ...s.th, textAlign: 'center' }}>区分</th>
            <th style={{ ...s.th, textAlign: 'right' }}>交通費</th>
            <th style={{ ...s.th, textAlign: 'right' }}>出張手当</th>
            <th style={{ ...s.th, textAlign: 'right' }}>合計</th>
          </tr></thead>
          <tbody>
            {trips.map((t, i) => (
              <tr key={t.id} style={i % 2 === 0 ? { background: '#f8f8fc' } : {}}>
                <td style={{ ...s.td, textAlign: 'center' }}>{i + 1}</td>
                <td style={s.td}>{t.destination}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{formatDate(t.date_from)}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{formatDate(t.date_to)}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>{t.trip_type}</td>
                <td style={{ ...s.td, textAlign: 'right' }}>{formatCurrency(t.transport_cost)}</td>
                <td style={{ ...s.td, textAlign: 'right' }}>{formatCurrency(t.allowance)}</td>
                <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.total_cost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr>
            <td colSpan={5} style={{ ...s.td, fontWeight: 700, textAlign: 'right', borderTop: '2px solid #1a1a2e' }}>合計</td>
            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalTransport)}</td>
            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalAllowance)}</td>
            <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e', color: '#c0392b', fontSize: '15px' }}>{formatCurrency(grandTotal)}</td>
          </tr></tfoot>
        </table>

        <div style={s.stampBoxes}>
          <div style={s.stampBox}>申請者</div><div style={s.stampBox}>上長</div><div style={s.stampBox}>経理</div>
        </div>
        <p style={s.note}>※ 出張手当: 日帰り {formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 {formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
      </div>

      <div style={s.actions}>
        <button style={s.pdfBtn} onClick={handlePrint}>📄 PDF保存（印刷）</button>
        <button style={s.backBtn} onClick={onBack}>← 戻る</button>
      </div>
      <p style={s.hint}>印刷ダイアログの「送信先」を<strong>「PDFに保存」</strong>にしてください</p>
    </>
  )
}

const ps = {
  sheet: { maxWidth: '720px', margin: '0 auto', padding: '10px 0', fontFamily: "'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif", color: '#1a1a2e', fontSize: '11px', lineHeight: 1.6, background: '#fff' },
  title: { textAlign: 'center', fontSize: '20px', fontWeight: 900, letterSpacing: '8px', marginBottom: '22px', paddingBottom: '10px', borderBottom: '3px double #1a1a2e' },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '6px 32px', marginBottom: '20px' },
  mi: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' },
  ml: { fontWeight: 700, color: '#555', minWidth: '52px' },
  mv: { borderBottom: '1px solid #999', minWidth: '120px', padding: '0 4px 1px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
  th: { background: '#1a1a2e', color: '#fff', padding: '8px 6px', fontSize: '10.5px', fontWeight: 600, textAlign: 'left' },
  td: { padding: '7px 6px', borderBottom: '1px solid #ddd', fontSize: '11px' },
  stamps: { display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '28px' },
  stamp: { width: '68px', height: '68px', border: '1px solid #999', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '5px', fontSize: '9px', color: '#888', fontWeight: 600 },
  note: { textAlign: 'right', fontSize: '10px', color: '#999', marginTop: '16px' },
}

const s = {
  sheet: { maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#1a1a2e', borderRadius: '8px', padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' },
  sheetHeader: { marginBottom: '28px', borderBottom: '3px double #1a1a2e', paddingBottom: '20px' },
  sheetTitle: { fontSize: '22px', fontWeight: 900, textAlign: 'center', margin: '0 0 20px', letterSpacing: '4px', color: '#1a1a2e' },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  ml: { fontSize: '13px', fontWeight: 700, color: '#555', minWidth: '56px' },
  metaInput: { flex: 1, padding: '6px 10px', border: 'none', borderBottom: '1px solid #ccc', fontSize: '14px', outline: 'none', background: 'transparent', color: '#1a1a2e' },
  metaVal: { fontSize: '14px', color: '#1a1a2e' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '24px' },
  th: { background: '#1a1a2e', color: '#fff', padding: '10px 8px', fontWeight: 600, fontSize: '12px', textAlign: 'left' },
  td: { padding: '9px 8px', borderBottom: '1px solid #e0e0e0', fontSize: '13px' },
  stampBoxes: { display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px', marginBottom: '20px' },
  stampBox: { width: '72px', height: '72px', border: '1px solid #aaa', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '6px', fontSize: '10px', color: '#888', fontWeight: 600 },
  note: { fontSize: '11px', color: '#999', textAlign: 'right', margin: 0 },
  actions: { maxWidth: '800px', margin: '20px auto 0', display: 'flex', gap: '12px', justifyContent: 'center' },
  pdfBtn: { padding: '14px 36px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(231,76,60,0.4)' },
  backBtn: { padding: '14px 24px', background: 'transparent', color: '#8888aa', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  hint: { maxWidth: '800px', margin: '12px auto 0', textAlign: 'center', fontSize: '13px', color: '#8888aa', lineHeight: 1.6 },
}
