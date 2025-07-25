import Link from 'next/link';
import { Noticia } from '../../lib/types';
import { getOptimizedImage } from '../../lib/cloudinary';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoticiaCardProps {
  noticia: Noticia;
  size?: 'small' | 'medium' | 'large';
  hideCategory?: boolean;
}

export default function NoticiaCard({ 
  noticia, 
  size = 'medium',
  hideCategory = false
}: NoticiaCardProps) {
  const sizes = {
    small: { imageWidth: 300, classes: '' },
    medium: { imageWidth: 500, classes: 'h-64' },
    large: { imageWidth: 800, classes: 'md:h-96' }
  };
  
  const { imageWidth, classes } = sizes[size];
  const imagenUrl = getOptimizedImage(noticia.imagen_url, imageWidth);
  
  return (
    <article className={`border rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${classes}`}>
      <Link href={`/noticias/${noticia.slug}`} className="block h-full flex flex-col">
        <div className="relative aspect-video">
          <img 
            src={imagenUrl} 
            alt={noticia.titulo} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          {!hideCategory && (
            <span className="text-xs font-semibold text-blue-600 uppercase mb-1">
              {noticia.categoria}
            </span>
          )}
          
          <h3 className={`font-bold ${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-xl' : 'text-lg'} mb-2 line-clamp-2`}>
            {noticia.titulo}
          </h3>
          
          {size !== 'small' && (
            <p className="text-gray-600 mb-3 flex-grow line-clamp-3">
              {noticia.resumen}
            </p>
          )}
          
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <time className="text-gray-500">
                {format(new Date(noticia.fecha_publicacion), 'd MMMM yyyy', { locale: es })}
              </time>
              <span className="text-gray-500">
                {noticia.autor || 'Redacción'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}