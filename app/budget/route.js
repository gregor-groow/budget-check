import { NextResponse } from 'next/server';

let budgetData = null;

export async function POST(request) {
  try {
    const body = await request.json();

    const apiKey = request.headers.get('x-api-key');
    if (process.env.API_SECRET && apiKey !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    budgetData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(budgetData || { empty: true });
}
