import { NextResponse } from 'next/server';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function redisCmd(...args) {
  const res = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  return data.result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = body.client || 'default';
    const dataToStore = { ...body, updatedAt: new Date().toISOString() };

    // Store client data as string
    await redisCmd('SET', `budget:${client}`, JSON.stringify(dataToStore));

    // Update clients list as JSON array string
    const existingRaw = await redisCmd('GET', 'budget:clients');
    const clients = existingRaw ? JSON.parse(existingRaw) : [];
    if (!clients.includes(client)) {
      clients.push(client);
      await redisCmd('SET', 'budget:clients', JSON.stringify(clients));
    }

    return NextResponse.json({ ok: true, client });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clientsRaw = await redisCmd('GET', 'budget:clients');
    const clients = clientsRaw ? JSON.parse(clientsRaw) : [];

    if (clients.length === 0) return NextResponse.json({ empty: true });

    const result = {};
    for (const client of clients) {
      const raw = await redisCmd('GET', `budget:${client}`);
      if (raw) result[client] = JSON.parse(raw);
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ empty: true });
  }
}
