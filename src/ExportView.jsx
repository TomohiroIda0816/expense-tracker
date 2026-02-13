import { useState, useCallback } from 'react'

const DAILY_ALLOWANCE = 1500
const OVERNIGHT_ALLOWANCE = 3500
function formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}` }
function formatCurrency(n) { return '¥' + n.toLocaleString() }

function buildPrintHTML(trips, name, ml, totalT, totalA, grand) {
  const rows = trips.map((t, i) => `
    <tr style="background:${i % 2 === 0 ? '#f6f6fa' : '#fff'}">
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:center">${i+1}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px">${t.destination}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:center">${formatDate(t.date_from)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:center">${formatDate(t.date_to)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:center">${t.trip_type}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px">${t.outbound_method || ''} ${formatCurrency(t.outbound_fare || 0)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px">${t.return_method || ''} ${formatCurrency(t.return_fare || 0)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:right">${formatCurrency(t.transport_cost)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:right">${formatCurrency(t.allowance)}</td>
      <td style="padding:6px 5px;border-bottom:1px solid #ddd;font-size:10px;text-align:right;font-weight:600">${formatCurrency(t.total_cost)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<style>
  @page { size: A4 landscape; margin: 12mm 10mm; }
  body { font-family: 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Noto Sans JP', sans-serif; color: #1a1a2e; font-size: 10px; line-height: 1.5; margin: 0; padding: 0; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a2e; color: #fff; padding: 6px 5px; font-size: 9px; font-weight: 600; }
</style></head><body>
<h1 style="text-align:center;font-size:18px;font-weight:900;letter-spacing:8px;margin:0 0 18px;padding-bottom:8px;border-bottom:3px double #1a1a2e">出張経費申請書</h1>
<div style="display:flex;flex-wrap:wrap;gap:4px 28px;margin-bottom:16px">
  <div style="display:flex;align-items:center;gap:6px;font-size:11px"><span style="font-weight:700;color:#555;min-width:48px">申請者</span><span style="border-bottom:1px solid #999;min-width:100px;padding:0 4px 1px">${name || '\u3000'}</span></div>
  <div style="display:flex;align-items:center;gap:6px;font-size:11px"><span style="font-weight:700;color:#555;min-width:48px">対象月</span><span style="border-bottom:1px solid #999;min-width:100px;padding:0 4px 1px">${ml || '\u3000'}</span></div>
  <div style="display:flex;align-items:center;gap:6px;font-size:11px"><span style="font-weight:700;color:#555;min-width:48px">申請日</span><span style="border-bottom:1px solid #999;min-width:100px;padding:0 4px 1px">${formatDate(new Date().toISOString().split('T')[0])}</span></div>
</div>
<table>
  <thead><tr>
    <th style="text-align:center;width:28px">No.</th><th style="text-align:left">出張先</th><th style="text-align:center">行き</th><th style="text-align:center">帰り</th><th style="text-align:center">区分</th><th style="text-align:left">往路</th><th style="text-align:left">復路</th><th style="text-align:right">交通費</th><th style="text-align:right">手当</th><th style="text-align:right">合計</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr>
    <td colspan="7" style="padding:6px 5px;font-weight:700;text-align:right;border-top:2px solid #1a1a2e">合計</td>
    <td style="padding:6px 5px;text-align:right;font-weight:700;border-top:2px solid #1a1a2e">${formatCurrency(totalT)}</td>
    <td style="padding:6px 5px;text-align:right;font-weight:700;border-top:2px solid #1a1a2e">${formatCurrency(totalA)}</td>
    <td style="padding:6px 5px;text-align:right;font-weight:700;border-top:2px solid #1a1a2e;color:#c0392b;font-size:12px">${formatCurrency(grand)}</td>
  </tr></tfoot>
</table>
<p style="text-align:right;font-size:9px;color:#999;margin-top:16px">※ 出張手当: 日帰り ${formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 ${formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
</body></html>`
}

export default function ExportView({ trips, profile, targetMonth, onBack, readOnly }) {
  const [printing, setPrinting] = useState(false)

  const name = profile?.display_name || ''
  const ml = targetMonth ? `${targetMonth.split('-')[0]}年${parseInt(targetMonth.split('-')[1])}月` : ''
  const totalT = trips.reduce((s, t) => s + t.transport_cost, 0)
  const totalA = trips.reduce((s, t) => s + t.allowance, 0)
  const grand = totalT + totalA

  const handlePrint = useCallback(() => {
    setPrinting(true)
    const html = buildPrintHTML(trips, name, ml, totalT, totalA, grand)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(html)
    doc.close()
    iframe.contentWindow.onafterprint = () => { document.body.removeChild(iframe); setPrinting(false) }
    setTimeout(() => { iframe.contentWindow.print() }, 300)
    // Fallback cleanup
    setTimeout(() => { if (document.body.contains(iframe)) { document.body.removeChild(iframe); setPrinting(false) } }, 30000)
  }, [trips, name, ml, totalT, totalA, grand])

  const headers = ['No.','出張先','行き','帰り','区分','往路','復路','交通費','手当','合計']
  const thAlign = ['center','left','center','center','center','left','left','right','right','right']
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
              <span style={{ fontSize: '13px' }}>{name || <span style={{ color: '#ccc' }}>（設定画面で登録してください）</span>}</span>
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
        <p style={{ fontSize: '10px', color: '#999', textAlign: 'right', margin: 0 }}>※ 出張手当: 日帰り {formatCurrency(DAILY_ALLOWANCE)}/回、宿泊 {formatCurrency(OVERNIGHT_ALLOWANCE)}/泊</p>
      </div>
      <div style={{ maxWidth: '960px', margin: '20px auto 0', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(231,76,60,0.4)', opacity: printing ? 0.6 : 1 }} onClick={handlePrint} disabled={printing}>{printing ? '準備中...' : '📄 PDF保存（印刷）'}</button>
        <button style={{ padding: '14px 24px', background: 'transparent', color: '#8888aa', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }} onClick={onBack}>← 戻る</button>
      </div>
      <p style={{ maxWidth: '960px', margin: '12px auto 0', textAlign: 'center', fontSize: '13px', color: '#8888aa' }}>印刷ダイアログの「送信先」を<strong>「PDFに保存」</strong>にしてください</p>
      {!name && <p style={{ maxWidth: '960px', margin: '8px auto 0', textAlign: 'center', fontSize: '12px', color: '#ff9800' }}>⚠ 申請者名が未設定です。ヘッダーの「⚙ 設定」から登録してください。</p>}
    </>
  )
}
