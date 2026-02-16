import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '2.0.0',
    mode: 'vercel',
    timestamp: new Date().toISOString()
  });
}
