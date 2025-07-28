import React from 'react';
import { Noticia } from '../../lib/types';
import { getOptimizedImage } from '../../lib/cloudinary';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface NoticiaDetalleProps {
  noticia: Noticia;
}

export default function NoticiaDetalle({ noticia }: NoticiaDetalleProps) {
  const imagenUrl = getOptimizedImage(noticia.imagen_url, 1200);
  
  return (
    <div className="max-w-4xl mx-auto">
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
      
      {imagenUrl && (
        <div className="mb-8">
          <img 
            src={imagenUrl} 
            alt={noticia.titulo} 
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="prose prose-lg max-w-none">
        <p className="text-xl font-light mb-8">{noticia.resumen}</p>
        
        <ReactMarkdown>
          {noticia.contenido}
        </ReactMarkdown>
      </div>
    </div>
  );
}