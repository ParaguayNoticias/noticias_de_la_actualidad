import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Página no encontrada</h1>
      <p className="text-lg text-gray-600 mb-8">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        Volver al inicio
      </Link>
    </div>
  );
}