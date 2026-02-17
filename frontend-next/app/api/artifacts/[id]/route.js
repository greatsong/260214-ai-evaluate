import { NextResponse } from 'next/server';
import { ensureDB } from '@/lib/dbInit';

export async function GET(request, { params }) {
  const { id } = await params;
  const db = await ensureDB();

  if (!db) {
    const { demoArtifacts } = await import('@/lib/demoData');
    const artifact = demoArtifacts.find(a => a.id === Number(id));
    if (!artifact) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '산출물을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: artifact });
  }

  const result = await db.execute({ sql: 'SELECT * FROM artifacts WHERE id = ?', args: [Number(id)] });
  if (result.rows.length === 0) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: '산출물을 찾을 수 없습니다.' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: result.rows[0] });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const db = await ensureDB();

  if (!db) {
    const { demoArtifacts } = await import('@/lib/demoData');
    const idx = demoArtifacts.findIndex(a => a.id === Number(id));
    if (idx !== -1) demoArtifacts.splice(idx, 1);
    return NextResponse.json({ success: true, data: { deleted: true } });
  }

  await db.execute({ sql: 'DELETE FROM artifacts WHERE id = ?', args: [Number(id)] });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
