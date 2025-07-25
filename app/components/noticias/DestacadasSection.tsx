import { Noticia } from '../../lib/types';
import NoticiaCard from './NoticiaCard';

interface DestacadasSectionProps {
  destacadas: Noticia[];
}

export default function DestacadasSection({ destacadas }: DestacadasSectionProps) {
  if (!destacadas || destacadas.length === 0) return null;
  
  const [primera, segunda, tercera, ...resto] = destacadas;

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Noticias Destacadas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Noticia principal (grande) */}
        <div className="md:col-span-2">
          <NoticiaCard noticia={primera} size="large" />
        </div>
        
        {/* Dos noticias secundarias */}
        <div className="flex flex-col gap-6">
          {segunda && <NoticiaCard noticia={segunda} size="medium" hideCategory />}
          {tercera && <NoticiaCard noticia={tercera} size="medium" hideCategory />}
        </div>
      </div>
      
      {/* Resto de noticias en filas de tres */}
      {resto.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resto.map(noticia => (
            <NoticiaCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}