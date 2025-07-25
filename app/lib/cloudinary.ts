import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

export const getOptimizedImage = (url: string | null | undefined, width: number = 1200): string => {
  // Si no hay URL, devolver un placeholder
  if (!url) return '/placeholder.jpg';
  
  try {
    // Si es una URL de Cloudinary
    if (url.includes('res.cloudinary.com')) {
      return cloudinary.url(url, {
        quality: 'auto',
        format: 'webp',
        width: width,
        crop: 'scale'
      });
    }
    
    // Si es una imagen local
    if (url.startsWith('/uploads/')) {
      const publicId = url.split('/').pop()?.split('.')[0];
      if (publicId) {
        return cloudinary.url(publicId, {
          quality: 'auto',
          format: 'webp',
          width: width,
          crop: 'scale'
        });
      }
    }
    
    // Para otros casos, devolver la URL original
    return url;
  } catch (error) {
    console.error('Error al optimizar imagen:', error);
    return url;
  }
};