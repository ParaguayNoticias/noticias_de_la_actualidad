import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { getOptimizedImage } from '../../../lib/cloudinary';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import type { Metadata } from 'next';
import Image from 'next/image';


type NoticiaPageParams = {
  slug: string;
};

type Noticia = {
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: string;
  imagen_url: string;
  destacada: boolean;
  slug: string;
  autor: string;
  fecha_publicacion: string;
};

// Página principal

export default async function NoticiaPage({
  params,
}: {
  params: Promise<NoticiaPageParams>; 
}) {
  const { slug } = await params;

  const { data: noticias, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('slug', slug)
    .limit(1);

  if (error || !noticias || noticias.length === 0) return notFound();

  const noticia = noticias[0] as Noticia;
  const imagenUrl = getOptimizedImage(noticia.imagen_url, 1200);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{noticia.titulo}</h1>
        <div className="flex items-center mb-6 text-gray-600">
          <span className="capitalize bg-gray-200 px-3 py-1 rounded-full text-sm">
            {noticia.categoria}
          </span>
          <span className="mx-4">|</span>
          <time dateTime={noticia.fecha_publicacion}>
            {format(new Date(noticia.fecha_publicacion), 'd MMMM yyyy', { locale: es })}
          </time>
        </div>
        <p className="text-xl font-light mb-8">{noticia.resumen}</p>
        {imagenUrl && (
          <div className="mb-8">
            <Image
              src={imagenUrl}
              alt={noticia.titulo}
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{noticia.contenido}</ReactMarkdown>
        </div>
      </article>
      <div className="Autor">
        <p>
          <b>Escrito por: {noticia.autor}</b>
        </p>
      </div>
    </div>
  );
}

// generateStaticParams

export async function generateStaticParams() {
  const { data: noticias } = await supabase.from('noticias').select('slug');
  if (!noticias) return [];

  return noticias.map((n) => ({
    slug: n.slug,
  }));
}


// generateMetadata

export async function generateMetadata({
  params,
}: {
  params: Promise<NoticiaPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: noticias } = await supabase
    .from('noticias')
    .select('titulo, resumen')
    .eq('slug', slug)
    .limit(1);

  const noticia = noticias?.[0];
  if (!noticia) {
    return { title: 'Noticia no encontrada' };
  }

  return {
    title: noticia.titulo,
    description: noticia.resumen,
  };
}
