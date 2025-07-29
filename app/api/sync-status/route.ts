import { NextResponse } from 'next/server';

let lastSync: { time: Date; result: any } | null = null;

export async function GET() {
  return NextResponse.json({
    status: lastSync ? 'active' : 'never',
    last_sync: lastSync?.time || null,
    details: lastSync?.result || null
  });
}

// Función para actualizar el estado (llamar desde route.ts)
export function updateSyncStatus(result: any) {
  lastSync = {
    time: new Date(),
    result: {
      success: result.success,
      updated: result.updated,
      errors: result.errors
    }
  };
}