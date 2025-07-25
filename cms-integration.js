require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const matter = require('gray-matter');
const { createClient } = require('@supabase/supabase-js');

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY, 
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CMS_DIR = path.join(process.cwd(), 'cms-content/noticias');

if (!fs.existsSync(CMS_DIR)) {
  console.warn(`El directorio ${CMS_DIR} no existe. Créalo o actualiza CMS_DIR en este script.`);
}

// ---------- Utils ----------
function buildSlug(raw, fallback) {
  const base = (raw || fallback || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/^-|-$/g, '');
  return base || 'sin-slug';
}

function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');

  if (ext === '.md' || ext === '.markdown') {
    const parsed = matter(raw);
    return {
      data: parsed.data || {},
      content: parsed.content || '',
    };
  }

  if (ext === '.json') {
    try {
      const json = JSON.parse(raw);
      return {
        data: json.data ?? json,
        content: json.content ?? json.contenido ?? '',
      };
    } catch (e) {
      console.error(`JSON inválido: ${filePath}`, e);
      return null;
    }
  }

  // No soportado
  return null;
}

async function upsertNoticia(data, content) {
  const slug = buildSlug(
    data.slug,
    data.titulo ? data.titulo : undefined
  );

  const noticiaData = {
    titulo: data.titulo ?? '(Sin título)',
    resumen: data.resumen ?? '',
    contenido: content ?? '',
    categoria: data.categoria ?? 'Nacionales',
    imagen_url: data.imagen_url ?? data.imagen ?? '',
    destacada: !!data.destacada,
    slug,
    autor: data.autor || 'Redacción',
    fecha_publicacion: data.fecha
      ? new Date(data.fecha).toISOString()
      : new Date().toISOString(),
  };

  const { error } = await supabase
    .from('noticias')
    .upsert(noticiaData, { onConflict: 'slug' });

  if (error) throw error;

  console.log(`Upsert OK → ${slug}`);
  return slug;
}

async function deleteBySlug(slug) {
  const cleanSlug = buildSlug(slug);
  const { error } = await supabase
    .from('noticias')
    .delete()
    .eq('slug', cleanSlug);

  if (error) throw error;

  console.log(`Eliminada en Supabase → ${cleanSlug}`);
}

// ---------- Workers ----------
async function handleCreateOrUpdate(filePath, action) {
  try {
    const parsed = parseFile(filePath);
    if (!parsed) return;

    const { data, content } = parsed;

    // Validaciones mínimas
    if (!data.titulo) {
      console.warn(`Falta "titulo" en ${filePath}. Omitiendo.`);
      return;
    }

    const slug = await upsertNoticia(data, content);

    // Borro el archivo para no versionarlo ni almacenarlo localmente
    // Comenta esta línea si prefieres dejar el archivo
    fs.unlinkSync(filePath);

    console.log(`${action.toUpperCase()} sincronizado y archivo eliminado: ${slug}`);
  } catch (err) {
    console.error(`Error procesando ${filePath}:`, err);
  }
}

async function handleDelete(filename) {
  // Intentamos deducir el slug del nombre del archivo
  const basename = path.basename(filename, path.extname(filename));
  try {
    await deleteBySlug(basename);
  } catch (err) {
    console.error(`Error eliminando por slug (${basename}):`, err);
  }
}

async function syncAllOnce() {
  if (!fs.existsSync(CMS_DIR)) return;

  const files = fs
    .readdirSync(CMS_DIR)
    .filter((f) => ['.md', '.markdown', '.json'].includes(path.extname(f)));

  console.log(`Sincronizando ${files.length} archivo(s) (modo --once)...`);

  for (const file of files) {
    const filePath = path.join(CMS_DIR, file);
    await handleCreateOrUpdate(filePath, 'create/update');
  }

  console.log('Sync --once completado.');
}

// ---------- Entradas ----------
function watch() {
  console.log(`Monitoreando cambios en: ${CMS_DIR}`);

  const watcher = chokidar.watch(['**/*.md', '**/*.markdown', '**/*.json'], {
    cwd: CMS_DIR,
    ignoreInitial: false,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on('add', (filename) => {
      const filePath = path.join(CMS_DIR, filename);
      console.log('[ADD]', filename);
      handleCreateOrUpdate(filePath, 'create');
    })
    .on('change', (filename) => {
      const filePath = path.join(CMS_DIR, filename);
      console.log('[CHANGE]', filename);
      handleCreateOrUpdate(filePath, 'update');
    })
    .on('unlink', (filename) => {
      console.log('[DELETE]', filename);
      handleDelete(filename);
    })
    .on('error', (error) => console.error('Watcher error:', error));
}

// CLI
if (process.argv.includes('--once')) {
  syncAllOnce().then(() => process.exit(0));
} else {
  watch();
}
