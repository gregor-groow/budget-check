import { NextResponse } from 'next/server';

// In-memory store per client
let budgetData = {};

export async function POST(request) {
  try {
    const body = await request.json();

    const apiKey = request.headers.get('x-api-key');
    if (process.env.API_SECRET && apiKey !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = body.client || 'default';
    budgetData[client] = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, client });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  if (Object.keys(budgetData).length === 0) {
    return NextResponse.json({ empty: true });
  }
  return NextResponse.json(budgetData);
}
