export default function Footer() {
    return (
      <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
          {/* Logo o nombre */}
          <div className="text-lg font-semibold">© 2025 Noticias de la actualidad</div>
          
          {/* Enlaces */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="/about" className="hover:text-white">Acerca</a>
            <a href="/contact" className="hover:text-white">Contacto</a>
            <a href="/privacy" className="hover:text-white">Privacidad</a>
          </div>
        </div>
      </footer>
    );
  }
  