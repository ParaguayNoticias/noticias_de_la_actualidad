import { NextRequest, NextResponse } from 'next/server';
import { GET as runSync } from '../../sync/route';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'decap-secret';

// Solo permitimos POST
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (WEBHOOK_SECRET && authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));
  console.log('[webhook/decap] Payload recibido:', payload);

  // Ejecutamos la sincronización de noticias
  const syncResponse = await runSync(req);

  return syncResponse;
}

// Si alguien hace GET devolvemos error
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
