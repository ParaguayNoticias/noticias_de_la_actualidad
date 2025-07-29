// app/api/sync-status/route.ts
import { NextResponse } from 'next/server';
import { getSyncStatus } from '../../lib/syncStatus';

export async function GET() {
  return NextResponse.json(getSyncStatus());
}