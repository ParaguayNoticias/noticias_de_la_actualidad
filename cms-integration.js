import 'dotenv/config';
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); 
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CMS_DIR = path.join(process.cwd(), 'cms-content/noticias');

async function syncWithSupabase(filePath, action) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent); 

    const frontmatter = parsed.data;
    const contenido = parsed.content;

    if (action === 'delete') {
      await supabase.from('noticias').delete().eq('slug', frontmatter.slug);
      console.log(`Noticia eliminada: ${frontmatter.slug}`);
      return;
    }

    const noticiaData = {
      titulo: frontmatter.titulo,
      resumen: frontmatter.resumen,
      contenido: contenido,  
      categoria: frontmatter.categoria,
      imagen_url: frontmatter.imagen_url,
      destacada: frontmatter.destacada || false,
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

    console.log(`Noticia sincronizada con Supabase: ${frontmatter.slug}`);
  } catch (error) {
    console.error(`Error sincronizando ${filePath}:`, error);
  }
}

function watchForChanges() {
  console.log(`Monitoreando cambios en: ${CMS_DIR}`);
  fs.watch(CMS_DIR, (eventType, filename) => {
    if (!filename || !filename.endsWith('.md')) return;

    const filePath = path.join(CMS_DIR, filename);
    if (eventType === 'rename' && !fs.existsSync(filePath)) {
      syncWithSupabase(filePath, 'delete');
    } else {
      syncWithSupabase(filePath, 'update');
    }
  });
}

watchForChanges();
