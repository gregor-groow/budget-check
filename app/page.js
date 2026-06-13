'use client';

import { useEffect, useState } from 'react';

const CLIENT_NAMES = {
  zahradnicka: 'Immocap – Záhradnícka',
  kvarter: 'Kvarter',
  istropolis: 'Istropolis',
  millhaus: 'Millhaus',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/budget')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    const interval = setInterval(() => {
      fetch('/api/budget').then(r => r.json()).then(setData);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const clients = data && !data.empty ? Object.keys(data) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0618', fontFamily: "'Inter', 'Arial', sans-serif", color: '#fff' }}>

      {/* Header */}
      <div style={{ background: '#1a0533', borderBottom: '1px solid #2d1155', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#3d0f7e', borderRadius: 10, padding: '8px 20px' }}>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', color: '#fff' }}>groo<span style={{ color: '#a78bda' }}>w</span></span>
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#a78bda', letterSpacing: 2, textTransform: 'uppercase' }}>Digital Agency</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Budget Monitor</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6b4fa0', textAlign: 'right' }}>
          Auto-refresh každých 60s
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {loading && (
          <div style={{ textAlign: 'center', color: '#6b4fa0', padding: 80, fontSize: 16 }}>Načítavam dáta...</div>
        )}

        {!loading && (!data || data.empty) && (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <div style={{ color: '#6b4fa0', fontSize: 16 }}>Zatiaľ žiadne dáta. Spusti workflow v n8n.</div>
          </div>
        )}

        {!loading && clients.map(clientKey => (
          <div key={clientKey} style={{ marginBottom: 48 }}>
            {/* Client header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 4, height: 28, background: '#7c3aed', borderRadius: 2 }} />
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#e0d4f7' }}>
                {CLIENT_NAMES[clientKey] || clientKey}
              </h2>
              <span style={{ fontSize: 11, color: '#6b4fa0', marginLeft: 8 }}>
                Aktualizované: {data[clientKey]?.updatedAt ? new Date(data[clientKey].updatedAt).toLocaleString('sk-SK') : '–'}
              </span>
            </div>

            {/* Google + Meta cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <PlatformCard title="Google Ads" icon="🔵" color="#4285F4" data={data[clientKey]?.google} />
              <PlatformCard title="Meta Ads" icon="🟣" color="#1877F2" data={data[clientKey]?.meta} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '24px', color: '#2d1155', fontSize: 12, borderTop: '1px solid #1a0533' }}>
        groow digital agency · Budget Monitor · Auto-refresh každých 60s
      </div>
    </div>
  );
}

function PlatformCard({ title, icon, color, data }) {
  const pct = data?.percentoPlnenia ?? 0;
  const capped = Math.min(pct, 100);
  const barColor = pct >= 100 ? '#e53935' : pct >= 80 ? '#f59e0b' : color;
  const statusBg = pct >= 100 ? '#fde8e8' : pct >= 80 ? '#fef3c7' : '#ede9f6';

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ background: '#1a0533', border: '1px solid #2d1155', borderRadius: 16, padding: 32, textAlign: 'center', color: '#6b4fa0' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13 }}>Žiadne dáta</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1a0533', border: '1px solid #2d1155', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ background: `${color}22`, borderBottom: '1px solid #2d1155', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{title}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b4fa0' }}>{data.datum?.substring(0,7)}-01 → {data.datum}</span>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <MiniCard label="Budget" value={`€${data.budget}`} />
          <MiniCard label="Spend MTD" value={`€${data.totalSpend}`} accent color={color} />
          <div style={{ background: statusBg, border: `1px solid ${barColor}44`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#9b8bb8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Stav</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{data.status}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#a78bda' }}>Plnenie budgetu</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: barColor }}>{pct}%</span>
          </div>
          <div style={{ background: '#2d1155', borderRadius: 50, height: 14, overflow: 'hidden' }}>
            <div style={{
              width: `${capped}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${barColor}99, ${barColor})`,
              borderRadius: 50,
              boxShadow: `0 0 8px ${barColor}66`
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#4a2d7a' }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {[
          ['Dni v mesiaci', data.daysInMonth],
          ['Ubehnuté dni', data.daysPassed],
          ['Odporúčaná útrata ku dňu', `€${data.odporucanaUtrataKuDnu}`],
          ['Momentálny DR', `€${data.realnyDR}`],
          ['Odporúčaný DR', `€${data.odporucanyDR}`],
        ].map(([label, val], i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid #1e0840',
            fontSize: 13
          }}>
            <span style={{ color: '#9b8bb8' }}>{label}</span>
            <span style={{ fontWeight: 700, color: '#e0d4f7' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ label, value, accent, color }) {
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${color}44, ${color}22)` : '#160428',
      border: `1px solid ${accent ? color + '44' : '#2d1155'}`,
      borderRadius: 10,
      padding: '12px 8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 10, color: '#6b4fa0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{value}</div>
    </div>
  );
}
