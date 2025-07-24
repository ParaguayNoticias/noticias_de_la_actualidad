import { notFound } from 'next/navigation';
import { Categoria } from '../../../lib/types';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import Paginacion from '../../../components/ui/Paginacion';
import { supabase } from '../../../lib/supabase';

interface PageProps {
  params: { categoria: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SeccionPage({ params, searchParams }: PageProps) {
  const categoria = params.categoria as Categoria;
  const pagina = searchParams.pagina ? parseInt(searchParams.pagina as string) : 1;
  const porPagina = 10;
  
  // Validar categoría
  const categoriasValidas: Categoria[] = ['Destacadas','Política' , 'Deportes' , 'Tecnología' , 'Cultura' , 'Nacionales' , 'Internacionales'];
  if (!categoriasValidas.includes(categoria)) {
    return notFound();
  }
  
  // Obtener noticias
  const start = (pagina - 1) * porPagina;
  const { data: noticias, count } = await supabase
    .from('noticias')
    .select('*', { count: 'exact' })
    .eq('categoria', categoria)
    .order('fecha_publicacion', { ascending: false })
    .range(start, start + porPagina - 1);
  
  if (!noticias || !count) {
    return notFound();
  }
  
  const totalPaginas = Math.ceil(count / porPagina);
  
  const paginacion = {
    paginaActual: pagina,
    totalPaginas,
    baseUrl: `/seccion/${categoria}`
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">{categoria}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {noticias.map(noticia => (
          <NoticiaCard key={noticia.id} noticia={noticia} />
        ))}
      </div>
      
      <Paginacion paginacion={paginacion} />
    </div>
  );
}