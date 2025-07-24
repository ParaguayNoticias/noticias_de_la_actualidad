import { redirect } from 'next/navigation';
import NoticiaCard from '../../components/noticias/NoticiaCard';
import { supabase } from '../../lib/supabase';

export default async function BuscarPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = searchParams?.q as string | undefined;
  
  if (!query) {
    redirect('/');
  }
  
  const { data: resultados } = await supabase
    .from('noticias')
    .select('*')
    .textSearch('busqueda_tsv', query, {
      config: 'spanish',
      type: 'websearch'
    })
    .limit(20);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Resultados de búsqueda para: <span className="text-blue-600">"{query}"</span>
      </h1>
      
      {resultados && resultados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultados.map(noticia => (
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