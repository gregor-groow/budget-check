'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/budget')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    // Auto-refresh every 60s
    const interval = setInterval(() => {
      fetch('/api/budget').then(r => r.json()).then(setData);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const pct = data?.percentoPlnenia ?? 0;
  const capped = Math.min(pct, 100);

  const barColor = pct >= 100 ? '#e53935' : pct >= 80 ? '#f59e0b' : '#7c3aed';
  const statusBg = pct >= 100 ? '#fde8e8' : pct >= 80 ? '#fef3c7' : '#ede9f6';

  return (
    <div style={{ minHeight: '100vh', background: '#0d0618', fontFamily: "'Inter', 'Arial', sans-serif", color: '#fff' }}>

      {/* Header */}
      <div style={{ background: '#1a0533', borderBottom: '1px solid #2d1155', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#3d0f7e', borderRadius: 10, padding: '8px 20px' }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>groo<span style={{ color: '#a78bda' }}>w</span></span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#a78bda', letterSpacing: 2, textTransform: 'uppercase' }}>Google Ads</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Budget Monitor</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6b4fa0', textAlign: 'right' }}>
          {data?.updatedAt ? (
            <>Posledná aktualizácia<br /><span style={{ color: '#a78bda' }}>{new Date(data.updatedAt).toLocaleString('sk-SK')}</span></>
          ) : null}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {loading && (
          <div style={{ textAlign: 'center', color: '#6b4fa0', padding: 80, fontSize: 16 }}>Načítavam dáta...</div>
        )}

        {!loading && (!data || data.empty) && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#6b4fa0', fontSize: 16 }}>Zatiaľ žiadne dáta. Spusti workflow v n8n.</div>
          </div>
        )}

        {!loading && data && !data.empty && (
          <>
            {/* Period badge */}
            <div style={{ background: '#1a0533', border: '1px solid #2d1155', borderRadius: 8, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32, fontSize: 13, color: '#a78bda' }}>
              📅 <span>Obdobie: <strong style={{ color: '#fff' }}>{ data.datum?.substring(0, 7) }-01 → {data.datum}</strong></span>
            </div>

            {/* Top cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <Card label="Mesačný budget" value={`€${data.budget}`} />
              <Card label="Spend MTD" value={`€${data.totalSpend}`} accent />
              <div style={{ background: statusBg, border: `1px solid ${barColor}33`, borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#9b8bb8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Stav</div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{data.status}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#1a0533', border: '1px solid #2d1155', borderRadius: 12, padding: '28px 32px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontSize: 14, color: '#a78bda', fontWeight: 600 }}>Plnenie budgetu</span>
                <span style={{ fontSize: 32, fontWeight: 900, color: barColor }}>{pct}%</span>
              </div>
              <div style={{ background: '#2d1155', borderRadius: 50, height: 20, overflow: 'hidden' }}>
                <div style={{
                  width: `${capped}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
                  borderRadius: 50,
                  transition: 'width 1s ease',
                  boxShadow: `0 0 12px ${barColor}66`
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#4a2d7a' }}>
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>

            {/* Detail table */}
            <div style={{ background: '#1a0533', border: '1px solid #2d1155', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '18px 28px', borderBottom: '1px solid #2d1155' }}>
                <span style={{ fontSize: 12, color: '#6b4fa0', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Detail</span>
              </div>
              {[
                ['Dni v mesiaci', data.daysInMonth],
                ['Ubehnuté dni', data.daysPassed],
                ['Odporúčaná útrata ku dňu', `€${data.odporucanaUtrataKuDnu}`],
                ['Reálna útrata (MTD)', `€${data.totalSpend}`],
                ['Momentálny denný rate', `€${data.realnyDR}`],
                ['Odporúčaný denný rate', `€${data.odporucanyDR}`],
              ].map(([label, val], i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 28px',
                  background: i % 2 === 0 ? '#160428' : 'transparent',
                  borderBottom: '1px solid #1e0840'
                }}>
                  <span style={{ color: '#9b8bb8', fontSize: 14 }}>{label}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#e0d4f7' }}>{val}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', color: '#2d1155', fontSize: 12, borderTop: '1px solid #1a0533' }}>
        groow digital agency · Google Ads Budget Monitor · Auto-refresh každých 60s
      </div>
    </div>
  );
}

function Card({ label, value, accent }) {
  return (
    <div style={{
      background: accent ? 'linear-gradient(135deg, #3d0f7e, #6d28d9)' : '#1a0533',
      border: '1px solid #2d1155',
      borderRadius: 12,
      padding: '24px 20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 11, color: accent ? '#c4b5fd' : '#6b4fa0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>{value}</div>
    </div>
  );
}
