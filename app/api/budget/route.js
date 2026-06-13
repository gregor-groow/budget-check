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

    // SET budget:client JSON string
    await redisCmd('SET', `budget:${client}`, JSON.stringify(dataToStore));

    // Add to clients set
    await redisCmd('SADD', 'budget:clients', client);

    return NextResponse.json({ ok: true, client });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get all clients
    const clients = await redisCmd('SMEMBERS', 'budget:clients');

    if (!clients || clients.length === 0) {
      return NextResponse.json({ empty: true });
    }

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
