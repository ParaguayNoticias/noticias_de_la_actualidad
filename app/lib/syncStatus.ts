let lastSync: { time: Date; result: any } | null = null;

export function updateSyncStatus(result: any) {
  lastSync = {
    time: new Date(),
    result: {
      success: result.success,
      updated: result.updated,
      errors: result.errors,
    },
  };
}

export function getSyncStatus() {
  return {
    status: lastSync ? 'active' : 'never',
    last_sync: lastSync?.time || null,
    details: lastSync?.result || null,
  };
}