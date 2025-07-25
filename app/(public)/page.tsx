import { Categoria } from '../lib/types';
import DestacadasSection from '../components/noticias/DestacadasSection';
import { supabase } from '../lib/supabase';
import NoticiaCard from '../components/noticias/NoticiaCard';

// Definir las categorías
const CATEGORIAS: Categoria[] = ['Política', 'Deportes', 'Tecnología', 'Cultura', 'Nacionales', 'Internacionales'];

export default async function Home() {
  // Obtener 9 noticias destacadas (3 para el bloque especial + 6 para el grid)
  const { data: destacadas } = await supabase
    .from('noticias')
    .select('*')
    .eq('destacada', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(9);

  // Obtener las noticias destacadas de cada categoría (para secciones inferiores)
  const secciones = await Promise.all(
    CATEGORIAS.map(async (categoria) => {
      const { data: noticias } = await supabase
        .from('noticias')
        .select('*')
        .eq('categoria', categoria)
        .order('fecha_publicacion', { ascending: false })
        .limit(3);
      return { categoria, noticias: noticias || [] };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sección de noticias destacadas con formato especial */}
      <DestacadasSection destacadas={destacadas || []} />
      
      {/* Secciones por categoría */}
      {secciones.map(({ categoria, noticias }) => (
        noticias.length > 0 && (
          <section key={categoria} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold capitalize">{categoria}</h2>
              <a 
                href={`/seccion/${categoria}`} 
                className="text-blue-600 hover:underline"
              >
                Ver todas
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {noticias.map(noticia => (
                <NoticiaCard key={noticia.id} noticia={noticia} />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  );
}