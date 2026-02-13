import { useState } from 'react'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500
function formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}` }
function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function ExportView({ trips, profile, targetMonth, onBack, onUpdateProfile, readOnly }) {
  const [name, setName] = useState(profile?.display_name || '')
  const [printMode, setPrintMode] = useState(false)

  const ml = targetMonth ? `${targetMonth.split('-')[0]}年${parseInt(targetMonth.split('-')[1])}月` : ''
  const totalT = trips.reduce((s, t) => s + t.transport_cost, 0)
  const totalA = trips.reduce((s, t) => s + t.allowance, 0)
  const grand = totalT + totalA

  const handlePrint = async () => {
    if (!readOnly && name !== profile?.display_name) await onUpdateProfile(name)
    setPrintMode(true)
    setTimeout(() => { window.print(); setTimeout(() => setPrintMode(false), 500) }, 300)
  }

  const headers = ['No.','出張先','行き','帰り','区分','往路','復路','交通費','手当','合計']
  const thAlign = ['center','left','center','center','center','left','left','right','right','right']

  if (printMode) return (
    <>
      <style>{`@media print { @page { size: A4 landscape; margin: 12mm 10mm; } }`}</style>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0', fontFamily: "'Hiragino Kaku Gothic Pro', sans-serif", color: '#1a1a2e', fontSize: '10px', lineHeight: 1.5, background: '#fff' }}>
        <h1 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 900, letterSpacing: '8px', marginBottom: '18px', paddingBottom: '8px', borderBottom: '3px double #1a1a2e' }}>出張経費申請書</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 28px', marginBottom: '16px' }}>
          {[['申請者', name], ['対象月', ml], ['申請日', formatDate(new Date().toISOString().split('T')[0])]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}><span style={{ fontWeight: 700, color: '#555', minWidth: '48px' }}>{l}</span><span style={{ borderBottom: '1px solid #999', minWidth: '100px', padding: '0 4px 1px' }}>{v || '\u3000'}</span></div>
          ))}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead><tr>{headers.map((h,i) => <th key={i} style={{ background: '#1a1a2e', color: '#fff', padding: '6px 5px', fontSize: '9px', fontWeight: 600, textAlign: thAlign[i] }}>{h}</th>)}</tr></thead>
          <tbody>{trips.map((t, i) => (
            <tr key={t.id} style={i % 2 === 0 ? { background: '#f6f6fa' } : {}}>
              <td style={{ ...ptd, textAlign: 'center' }}>{i+1}</td>
              <td style={ptd}>{t.destination}</td>
              <td style={{ ...ptd, textAlign: 'center' }}>{formatDate(t.date_from)}</td>
              <td style={{ ...ptd, textAlign: 'center' }}>{formatDate(t.date_to)}</td>
              <td style={{ ...ptd, textAlign: 'center' }}>{t.trip_type}</td>
              <td style={ptd}>{t.outbound_method} {formatCurrency(t.outbound_fare || 0)}</td>
              <td style={ptd}>{t.return_method} {formatCurrency(t.return_fare || 0)}</td>
              <td style={{ ...ptd, textAlign: 'right' }}>{formatCurrency(t.transport_cost)}</td>
              <td style={{ ...ptd, textAlign: 'right' }}>{formatCurrency(t.allowance)}</td>
              <td style={{ ...ptd, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.total_cost)}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr>
            <td colSpan={7} style={{ ...ptd, fontWeight: 700, textAlign: 'right', borderTop: '2px solid #1a1a2e' }}>合計</td>
            <td style={{ ...ptd, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalT)}</td>
            <td style={{ ...ptd, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalA)}</td>
            <td style={{ ...ptd, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e', color: '#c0392b', fontSize: '12px' }}>{formatCurrency(grand)}</td>
          </tr></tfoot>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>{['申請者','上長','経理'].map(l => <div key={l} style={{ width: '60px', height: '60px', border: '1px solid #999', borderRadius: '3px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4px', fontSize: '8px', color: '#888', fontWeight: 600 }}>{l}</div>)}</div>
        <p style={{ textAlign: 'right', fontSize: '9px', color: '#999', marginTop: '12px' }}>※ 出張手当: 日帰り {formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 {formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
      </div>
    </>
  )

  const thS = { background: '#1a1a2e', color: '#fff', padding: '8px 6px', fontWeight: 600, fontSize: '11px', textAlign: 'left', whiteSpace: 'nowrap' }
  const tdS = { padding: '8px 6px', borderBottom: '1px solid #e0e0e0', fontSize: '12px' }

  return (
    <>
      <div style={{ maxWidth: '960px', margin: '0 auto', background: '#fff', color: '#1a1a2e', borderRadius: '8px', padding: '36px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
        <div style={{ marginBottom: '24px', borderBottom: '3px double #1a1a2e', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, textAlign: 'center', margin: '0 0 16px', letterSpacing: '4px', color: '#1a1a2e' }}>出張経費申請書</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#555', minWidth: '48px' }}>申請者</span>
              {readOnly ? <span style={{ fontSize: '13px' }}>{name}</span> : <input style={{ flex: 1, padding: '5px 8px', border: 'none', borderBottom: '1px solid #ccc', fontSize: '13px', outline: 'none', background: 'transparent', color: '#1a1a2e' }} value={name} onChange={(e) => setName(e.target.value)} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '12px', fontWeight: 700, color: '#555', minWidth: '48px' }}>対象月</span><span style={{ fontSize: '13px' }}>{ml}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '12px', fontWeight: 700, color: '#555', minWidth: '48px' }}>申請日</span><span style={{ fontSize: '13px' }}>{formatDate(new Date().toISOString().split('T')[0])}</span></div>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
          <thead><tr>{headers.map((h,i) => <th key={i} style={{ ...thS, textAlign: thAlign[i] }}>{h}</th>)}</tr></thead>
          <tbody>{trips.map((t, i) => (
            <tr key={t.id} style={i % 2 === 0 ? { background: '#f8f8fc' } : {}}>
              <td style={{ ...tdS, textAlign: 'center' }}>{i+1}</td>
              <td style={tdS}>{t.destination}</td>
              <td style={{ ...tdS, textAlign: 'center' }}>{formatDate(t.date_from)}</td>
              <td style={{ ...tdS, textAlign: 'center' }}>{formatDate(t.date_to)}</td>
              <td style={{ ...tdS, textAlign: 'center' }}>{t.trip_type}</td>
              <td style={tdS}>{t.outbound_method} {formatCurrency(t.outbound_fare || 0)}</td>
              <td style={tdS}>{t.return_method} {formatCurrency(t.return_fare || 0)}</td>
              <td style={{ ...tdS, textAlign: 'right' }}>{formatCurrency(t.transport_cost)}</td>
              <td style={{ ...tdS, textAlign: 'right' }}>{formatCurrency(t.allowance)}</td>
              <td style={{ ...tdS, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.total_cost)}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr>
            <td colSpan={7} style={{ ...tdS, fontWeight: 700, textAlign: 'right', borderTop: '2px solid #1a1a2e' }}>合計</td>
            <td style={{ ...tdS, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalT)}</td>
            <td style={{ ...tdS, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e' }}>{formatCurrency(totalA)}</td>
            <td style={{ ...tdS, textAlign: 'right', fontWeight: 700, borderTop: '2px solid #1a1a2e', color: '#c0392b', fontSize: '14px' }}>{formatCurrency(grand)}</td>
          </tr></tfoot>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '20px', marginBottom: '16px' }}>{['申請者','上長','経理'].map(l => <div key={l} style={{ width: '68px', height: '68px', border: '1px solid #aaa', borderRadius: '4px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '5px', fontSize: '10px', color: '#888', fontWeight: 600 }}>{l}</div>)}</div>
        <p style={{ fontSize: '10px', color: '#999', textAlign: 'right', margin: 0 }}>※ 出張手当: 日帰り {formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 {formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
      </div>
      <div style={{ maxWidth: '960px', margin: '20px auto 0', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(231,76,60,0.4)' }} onClick={handlePrint}>📄 PDF保存（印刷）</button>
        <button style={{ padding: '14px 24px', background: 'transparent', color: '#8888aa', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }} onClick={onBack}>← 戻る</button>
      </div>
      <p style={{ maxWidth: '960px', margin: '12px auto 0', textAlign: 'center', fontSize: '13px', color: '#8888aa' }}>印刷ダイアログの「送信先」を<strong>「PDFに保存」</strong>にしてください</p>
    </>
  )
}

const ptd = { padding: '6px 5px', borderBottom: '1px solid #ddd', fontSize: '10px' }
