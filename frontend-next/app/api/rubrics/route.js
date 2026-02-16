import { NextResponse } from 'next/server';
import rubrics from '@/lib/rubrics';

export async function GET() {
  return NextResponse.json(rubrics);
}
