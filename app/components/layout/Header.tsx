import Link from 'next/link';
import Image from 'next/image';
import Buscador from '../ui/Buscador';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        
        {/* Logo + Título */}
        <Link href="/" className="flex items-center space-x-3 mb-4 md:mb-0">
          <Image
            src="/Noticias-de-la-actualidad.svg"
            alt="Noticias de la Actualidad Logo"
            width={40}
            height={40}
            priority
          />
          <span className="text-2xl font-bold text-blue-600">
            Noticias de la Actualidad
          </span>
        </Link>
        
        {/* Menú de navegación */}
        <nav className="flex space-x-6 mb-4 md:mb-0">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <Link href="/seccion/politica" className="hover:text-blue-600">Política</Link>
          <Link href="/seccion/deportes" className="hover:text-blue-600">Deportes</Link>
          <Link href="/seccion/tecnologia" className="hover:text-blue-600">Tecnología</Link>
          <Link href="/seccion/cultura" className="hover:text-blue-600">Cultura</Link>
          <Link href="/seccion/nacionales" className="hover:text-blue-600">Nacionales</Link>
          <Link href="/seccion/internacionales" className="hover:text-blue-600">Internacionales</Link>
        </nav>
        
        {/* Buscador */}
        <div className="w-full md:w-auto">
          <Buscador />
        </div>
      </div>
    </header>
  );
}
