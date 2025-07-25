import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';

export async function POST() {
  try {
    const contentDir = path.join(process.cwd(), 'content/noticias');
    const files = fs.readdirSync(contentDir);
    
    console.log(`Iniciando sincronización con ${files.length} archivos encontrados`);
    
    let count = 0;
    let errorCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.md')) {
        console.log(`Saltando archivo no markdown: ${file}`);
        continue;
      }
      
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      const slug = file.replace('.md', '');
      
      console.log(`Procesando: ${slug}`);
      console.log('Datos:', {
        titulo: data.titulo,
        categoria: data.categoria,
        imagen: data.imagen,
        destacada: data.destacada
      });
      
      // Validar datos esenciales
      if (!data.titulo || !data.categoria || !data.imagen) {
        console.error(`Datos incompletos para: ${slug}`);
        errorCount++;
        continue;
      }
      
      const noticiaData = {
        titulo: data.titulo,
        resumen: data.resumen,
        contenido: content,
        categoria: data.categoria,
        imagen_url: data.imagen,
        destacada: data.destacada || false,
        slug: slug,
        autor: data.autor || 'Redacción',
        fecha_publicacion: data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString()
      };
      
      // Insertar o actualizar en Supabase
      const { error } = await supabase
        .from('noticias')
        .upsert(noticiaData, { onConflict: 'slug' });
        
      if (error) {
        console.error(`Error sincronizando ${slug}:`, error);
        errorCount++;
      } else {
        console.log(`Sincronizado con éxito: ${slug}`);
        count++;
      }
    }
    
    const message = `Sincronización completa: ${count} noticias actualizadas, ${errorCount} errores`;
    console.log(message);
    
    return NextResponse.json({ 
      success: errorCount === 0,
      message,
      updated: count,
      errors: errorCount
    });
  } catch (error) {
    const errorMessage = 'Error en sincronización: ' + (error instanceof Error ? error.message : 'Error desconocido');
    console.error(errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage
    }, { status: 500 });
  }
}