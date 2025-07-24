import Link from 'next/link';
import { Paginacion as PaginacionType } from '../../lib/types';

export default function Paginacion({ paginacion }: { paginacion: PaginacionType }) {
  const { paginaActual, totalPaginas, baseUrl } = paginacion;
  
  return (
    <div className="flex justify-center mt-8 space-x-2">
      {paginaActual > 1 && (
        <Link 
          href={`${baseUrl}?pagina=${paginaActual - 1}`}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Anterior
        </Link>
      )}
      
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
        <Link
          key={page}
          href={`${baseUrl}?pagina=${page}`}
          className={`px-4 py-2 border rounded ${
            page === paginaActual 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}
      
      {paginaActual < totalPaginas && (
        <Link 
          href={`${baseUrl}?pagina=${paginaActual + 1}`}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Siguiente
        </Link>
      )}
    </div>
  );
}