import { NextResponse } from 'next/server';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const apiKey = request.headers.get('x-api-key');
    if (process.env.API_SECRET && apiKey !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = body.client || 'default';
    const dataToStore = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await kvSet(`budget:${client}`, JSON.stringify(dataToStore));

    // Update list of clients
    const clientsRaw = await kvGet('budget:clients');
    const clients = clientsRaw || [];
    if (!clients.includes(client)) {
      clients.push(client);
      await kvSet('budget:clients', JSON.stringify(clients));
    }

    return NextResponse.json({ ok: true, client });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const clientsRaw = await kvGet('budget:clients');
    const clients = clientsRaw || [];

    if (clients.length === 0) {
      return NextResponse.json({ empty: true });
    }

    const result = {};
    for (const client of clients) {
      const data = await kvGet(`budget:${client}`);
      if (data) result[client] = data;
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ empty: true });
  }
}
