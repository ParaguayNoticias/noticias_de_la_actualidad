import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { promises as fs } from 'fs';
import matter from 'gray-matter';

export const runtime = 'nodejs';

// ====== ENV ======
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const SYNC_TOKEN = process.env.SYNC_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '[sync] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

const CONTENT_DIRS = ['content/noticias', 'cms-content/noticias'];

// ====== Helpers ======

function buildSlug(raw?: string) {
  const base = (raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/^-|-$/g, '');
  return base || 'sin-slug';
}

type ParsedFile =
  | {
      data: any;
    }
  | null;

async function parseFile(filePath: string): Promise<ParsedFile> {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, 'utf8');

  if (ext === '.md' || ext === '.markdown') {
    const parsed = matter(raw);
    return { data: parsed.data || {} };
  }

  if (ext === '.json') {
    try {
      const json = JSON.parse(raw);
      return { data: json.data ?? json };
    } catch (e) {
      console.error(`[sync] JSON inválido: ${filePath}`, e);
      return null;
    }
  }

  // extensiones no soportadas
  return null;
}

async function walkDir(dir: string): Promise<string[]> {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const d of dirents) {
      const res = path.resolve(dir, d.name);
      if (d.isDirectory()) {
        files.push(...(await walkDir(res)));
      } else {
        const ext = path.extname(res).toLowerCase();
        if (['.md', '.markdown', '.json'].includes(ext)) {
          files.push(res);
        }
      }
    }
    return files;
  } catch (e: any) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function upsertNoticia(data: any) {
  const slug = buildSlug(data.slug || data.titulo);

  const noticiaData = {
    titulo: data.titulo ?? '(Sin título)',
    resumen: data.resumen ?? '',
    contenido: data.contenido ?? '',
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
  return slug;
}

// ====== Handler principal ======
async function runSync() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      success: false,
      message:
        'Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY',
      updated: 0,
      errors: 0,
      processed: 0,
    };
  }

  let processed = 0;
  let updated = 0;
  let errors = 0;
  const details: Array<{ file: string; slug?: string; error?: string }> = [];

  for (const baseDir of CONTENT_DIRS) {
    const absDir = path.join(process.cwd(), baseDir);
    const files = await walkDir(absDir);

    if (!files.length) continue;

    for (const file of files) {
      processed++;
      try {
        const parsed = await parseFile(file);
        if (!parsed) {
          errors++;
          details.push({ file, error: 'Formato no soportado / JSON inválido' });
          continue;
        }

        const { data } = parsed;

        if (!data.titulo) {
          errors++;
          details.push({ file, error: 'Falta "titulo" en frontmatter/JSON' });
          continue;
        }

        const slug = await upsertNoticia(data);
        updated++;
        details.push({ file, slug });
      } catch (e: any) {
        errors++;
        details.push({ file, error: e?.message ?? 'Error desconocido' });
        console.error('[sync] Error procesando archivo:', file, e);
      }
    }
    if (files.length) break;
  }

  const message = `Sync completo: ${updated} noticias actualizadas, ${errors} errores, ${processed} procesadas.`;
  return { success: errors === 0, message, updated, errors, processed, details };
}

// ====== Rutas ======
export async function GET(req: NextRequest) {
  if (SYNC_TOKEN) {
    const token =
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (token !== SYNC_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await runSync();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
