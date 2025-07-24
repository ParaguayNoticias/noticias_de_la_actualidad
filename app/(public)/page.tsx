import { Categoria } from '../lib/types';
import NoticiaCard from '../components/noticias/NoticiaCard';
import { supabase } from '../lib/supabase';

export default async function Home() {
  // Obtener noticias destacadas
  const { data: destacadas } = await supabase
    .from('noticias')
    .select('*')
    .eq('destacada', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(3);

  // Obtener noticias por categoría
  const categorias: Categoria[] = ['Destacadas','Política' , 'Deportes' , 'Tecnología' , 'Cultura' , 'Nacionales' , 'Internacionales'];
  const secciones = await Promise.all(
    categorias.map(async (categoria) => {
      const { data: noticias } = await supabase
        .from('noticias')
        .select('*')
        .eq('categoria', categoria)
        .order('fecha_publicacion', { ascending: false })
        .limit(5);
      return { categoria, noticias: noticias || [] };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Noticias Destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destacadas?.map(noticia => (
            <NoticiaCard key={noticia.id} noticia={noticia} destacada />
          ))}
        </div>
      </section>

      {secciones.map(({ categoria, noticias }) => (
        <section key={categoria} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 capitalize">{categoria}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {noticias.map(noticia => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <a 
              href={`/seccion/${categoria}`} 
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Ver más noticias de {categoria}
            </a>
          </div>
        </section>
      ))}
    </div>
  );
}