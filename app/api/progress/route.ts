import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Received progress sync:', data);
    // In a real app, save to database
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to sync progress' }, { status: 500 });
  }
}
