'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige a la página HTML del CMS
    router.replace('/admin/index.html');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirigiendo al panel de administración...</p>
    </div>
  );
}