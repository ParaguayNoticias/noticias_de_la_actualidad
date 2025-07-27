export type Categoria = 'Política' | 'Deportes' | 'Tecnología' | 'Cultura' | 'Nacionales' | 'Internacionales';

export interface Noticia {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  categoria: Categoria;
  fecha_publicacion: string;
  imagen_url: string;
  destacada: boolean;
  slug: string;
  autor?: string; 
}
export interface Paginacion {
  paginaActual: number;
  totalPaginas: number;
  baseUrl: string;
}
