function formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}` }
function formatCurrency(n) { return '¥' + n.toLocaleString() }

export default function TripList({ trips, onEdit, onDelete, onExport }) {
  if (trips.length === 0) return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🗂</div>
      <p style={{ fontSize: '15px', color: '#8888aa', margin: '0 0 6px' }}>出張情報を追加してください</p>
      <p style={{ fontSize: '12px', color: '#666688', margin: 0 }}>日帰り: 手当 ¥1,500 / 宿泊: ¥3,500/泊</p>
    </div>
  )

  const totalT = trips.reduce((s, t) => s + t.transport_cost, 0)
  const totalA = trips.reduce((s, t) => s + t.allowance, 0)
  const grand = totalT + totalA

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px', color: '#d0d0e8' }}>📋 出張一覧（{trips.length}件）</h2>
        <button style={s.exportBtn} onClick={onExport}>申請書を表示 →</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {trips.map((t) => (
          <div key={t.id} style={s.item}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#eee' }}>{t.destination}</span>
                <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, background: t.nights === 0 ? '#e8f5e9' : '#e3f2fd', color: t.nights === 0 ? '#2e7d32' : '#1565c0' }}>{t.trip_type}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#8888aa', marginBottom: '6px' }}>{formatDate(t.date_from)}{t.date_from !== t.date_to ? ` 〜 ${formatDate(t.date_to)}` : ''}</div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>
                🔵 往路: {t.outbound_method || '-'} {formatCurrency(t.outbound_fare || 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                🟠 復路: {t.return_method || '-'} {formatCurrency(t.return_fare || 0)}
              </div>
              <div style={{ fontSize: '13px', color: '#a0a0c0' }}>
                交通費 {formatCurrency(t.transport_cost)} <span style={{ margin: '0 6px', color: '#555' }}>|</span> 手当 {formatCurrency(t.allowance)} <span style={{ margin: '0 6px', color: '#555' }}>|</span> <span style={{ fontWeight: 700, color: '#d0d0e8' }}>計 {formatCurrency(t.total_cost)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button style={s.editBtn} onClick={() => onEdit(t)}>編集</button>
              <button style={s.deleteBtn} onClick={() => onDelete(t.id)}>削除</button>
            </div>
          </div>
        ))}
      </div>
      <div style={s.summary}>
        <div style={s.row}><span>交通費 合計</span><span style={{ fontWeight: 600, color: '#d0d0e8' }}>{formatCurrency(totalT)}</span></div>
        <div style={s.row}><span>出張手当 合計</span><span style={{ fontWeight: 600, color: '#d0d0e8' }}>{formatCurrency(totalA)}</span></div>
        <div style={s.total}><span>総合計</span><span style={{ color: '#f5576c', fontSize: '20px' }}>{formatCurrency(grand)}</span></div>
      </div>
    </div>
  )
}

const s = {
  card: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' },
  exportBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', gap: '12px' },
  editBtn: { padding: '6px 12px', background: 'rgba(102,126,234,0.15)', color: '#8899ee', border: '1px solid rgba(102,126,234,0.2)', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.15)', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' },
  summary: { marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#a0a0c0', padding: '6px 0' },
  total: { display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#fff', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.12)' },
}
