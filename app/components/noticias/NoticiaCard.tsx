import Link from 'next/link';
import { Noticia } from '../../lib/types';
import { getOptimizedImage } from '../../lib/cloudinary';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoticiaCardProps {
  noticia: Noticia;
  destacada?: boolean;
}

export default function NoticiaCard({ noticia, destacada = false }: NoticiaCardProps) {
  const imagenUrl = getOptimizedImage(noticia.imagen_url, destacada ? 800 : 400);
  
  return (
    <article className={`border rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${destacada ? 'col-span-2' : ''}`}>
      <Link href={`/noticias/${noticia.slug}`} className="block">
        <div className="relative aspect-video">
          <img 
            src={imagenUrl} 
            alt={noticia.titulo} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <h3 className={`font-bold ${destacada ? 'text-xl' : 'text-lg'}`}>
            {noticia.titulo}
          </h3>
          
          <p className="mt-2 text-gray-600 line-clamp-2">
            {noticia.resumen}
          </p>
          
          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {format(new Date(noticia.fecha_publicacion), 'd MMMM yyyy', { locale: es })}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
              {noticia.categoria}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}