import { notFound } from 'next/navigation';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import Paginacion from '../../../components/ui/Paginacion';
import { supabase } from '../../../lib/supabase';
import type { Categoria } from '../../../lib/types';

// Slugs -> Label
const CATEGORIAS = [
  { slug: 'politica', label: 'Política' as Categoria },
  { slug: 'deportes', label: 'Deportes' as Categoria },
  { slug: 'tecnologia', label: 'Tecnología' as Categoria },
  { slug: 'cultura', label: 'Cultura' as Categoria },
  { slug: 'nacionales', label: 'Nacionales' as Categoria },
  { slug: 'internacionales', label: 'Internacionales' as Categoria },
];

export async function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

export const revalidate = 300; // opcional: ISR cada 5 min

type Params = Promise<{ categoria: string }>;
type Search = Promise<{ pagina?: string }>;

export default async function SeccionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { categoria } = await params;
  const { pagina: paginaParam } = await searchParams;

  const catSlug = decodeURIComponent(categoria).toLowerCase();
  const cat = CATEGORIAS.find((c) => c.slug === catSlug);
  if (!cat) return notFound();

  const pagina = paginaParam ? parseInt(paginaParam, 10) || 1 : 1;
  const porPagina = 10;
  const start = (pagina - 1) * porPagina;

  const { data: noticias, count, error } = await supabase
    .from('noticias')
    .select('*', { count: 'exact' })
    .eq('categoria', cat.label)
    .order('fecha_publicacion', { ascending: false })
    .range(start, start + porPagina - 1);

  if (error) {
    console.error(error);
    return notFound();
  }

  // count puede ser 0 y es válido: no 404
  const totalPaginas = Math.max(1, Math.ceil((count ?? 0) / porPagina));

  const paginacion = {
    paginaActual: pagina,
    totalPaginas,
    baseUrl: `/seccion/${cat.slug}`,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">{cat.label}</h1>

      {noticias && noticias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <NoticiaCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No hay noticias en esta categoría.</p>
      )}

      {totalPaginas > 1 && (
        <div className="mt-12">
          <Paginacion paginacion={paginacion} />
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { categoria } = await params;
  const cat = CATEGORIAS.find((c) => c.slug === categoria.toLowerCase());
  return {
    title: cat ? `Noticias de ${cat.label}` : 'Sección',
    description: cat
      ? `Últimas noticias de ${cat.label}`
      : 'Sección de noticias',
  };
}
