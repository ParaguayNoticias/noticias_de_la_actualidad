// app/(public)/buscar/page.tsx
import { redirect } from 'next/navigation';
import NoticiaCard from '../../components/noticias/NoticiaCard';
import { supabase } from '../../lib/supabase';

// Tipo para searchParams (ahora puede ser un Promise)
interface BuscarPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const { q: query } = await searchParams; // Esperamos el Promise

  // Si no hay consulta, redirigir a la página principal
  if (!query) {
    redirect('/');
  }

  // Realizar la búsqueda
  const { data: resultados } = await supabase
    .from('noticias')
    .select('*')
    .textSearch('busqueda_tsv', query, {
      config: 'spanish',
      type: 'websearch',
    })
    .limit(20);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Resultados de búsqueda para: <span className="text-blue-600"> &quot;{query}&quot;</span>
      </h1>

      {resultados && resultados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultados.map((noticia) => (
            <NoticiaCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">No se encontraron noticias</p>
          <p>Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}
