import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CMS_DIR = path.join(process.cwd(), 'cms-content/noticias');

// Función para generar un slug válido
function buildSlug(raw) {
  return (raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'sin-slug';
}

// Sincronizar un archivo con Supabase
async function syncWithSupabase(filePath, action) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent); 

    const frontmatter = parsed.data;
    const contenido = parsed.content;

    // Generar slug si no existe
    if (!frontmatter.slug) {
      frontmatter.slug = buildSlug(frontmatter.titulo);
    }

    if (action === 'delete') {
      await supabase.from('noticias').delete().eq('slug', frontmatter.slug);
      console.log(`Noticia eliminada: ${frontmatter.slug}`);
      return;
    }

    const noticiaData = {
      titulo: frontmatter.titulo || '(Sin título)',
      resumen: frontmatter.resumen || '',
      contenido: contenido,  
      categoria: frontmatter.categoria || 'Nacionales',
      imagen_url: frontmatter.imagen_url || '',
      destacada: Boolean(frontmatter.destacada) || false,
      slug: frontmatter.slug,
      autor: frontmatter.autor || 'Redacción',
      fecha_publicacion: frontmatter.fecha 
        ? new Date(frontmatter.fecha).toISOString()
        : new Date().toISOString()
    };

    const { error } = await supabase
      .from('noticias')
      .upsert(noticiaData, { onConflict: 'slug' });

    if (error) throw error;

    console.log(`Noticia sincronizada: ${frontmatter.slug}`);
  } catch (error) {
    console.error(`Error sincronizando ${filePath}:`, error.message);
  }
}

// Monitorear cambios en el directorio del CMS
function watchForChanges() {
  console.log(`Monitoreando cambios en: ${CMS_DIR}`);
  
  fs.watch(CMS_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename || !/\.md$/.test(filename)) return;
    
    const filePath = path.join(CMS_DIR, filename);
    
    console.log(`Evento detectado: ${eventType} en ${filename}`);
    
    if (eventType === 'rename' && !fs.existsSync(filePath)) {
      // Archivo eliminado
      syncWithSupabase(filePath, 'delete');
    } else if (eventType === 'change' && fs.existsSync(filePath)) {
      // Archivo modificado
      syncWithSupabase(filePath, 'update');
    } else if (eventType === 'rename' && fs.existsSync(filePath)) {
      // Archivo creado o renombrado
      syncWithSupabase(filePath, 'update');
    }
  });
}

// Iniciar la sincronización
watchForChanges();
console.log('CMS Integration iniciado');