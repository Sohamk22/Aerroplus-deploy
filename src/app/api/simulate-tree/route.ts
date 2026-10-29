import { NextRequest, NextResponse } from 'next/server';
import { calculateTreePhysics } from '@/lib/tree-physics';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = calculateTreePhysics(body);
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to simulate tree physics', details: e?.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const units = parseInt(searchParams.get('units') || '5', 10);
  const result = calculateTreePhysics({ numUnits: isNaN(units) ? 5 : units });
  return NextResponse.json({ success: true, result });
}
