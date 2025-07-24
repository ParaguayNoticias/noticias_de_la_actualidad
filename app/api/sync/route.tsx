import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';

export async function POST() {
  try {
    const contentDir = path.join(process.cwd(), 'content/noticias');
    const files = fs.readdirSync(contentDir);
    
    let count = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      const slug = file.replace('.md', '');
      
      const noticiaData = {
        titulo: data.titulo,
        resumen: data.resumen,
        contenido: content,
        categoria: data.categoria,
        imagen_url: data.imagen,
        destacada: data.destacada || false,
        slug: slug,
        fecha_publicacion: data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString()
      };
      
      // Insertar o actualizar en Supabase
      const { error } = await supabase
        .from('noticias')
        .upsert(noticiaData, { onConflict: 'slug' });
        
      if (error) {
        console.error(`Error sincronizando ${slug}:`, error);
      } else {
        count++;
      }
    }
    
    return NextResponse.json({ success: true, message: `${count}/${files.length} noticias sincronizadas` });
  } catch (error) {
    console.error('Error en sincronización:', error);
    return NextResponse.json({ success: false, message: 'Error en sincronización' }, { status: 500 });
  }
}