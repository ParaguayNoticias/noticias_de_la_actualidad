import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

export const getOptimizedImage = (url: string | null, width: number = 1200): string => {
  if (!url) return '/placeholder.jpg';
  
  // Si ya es una URL de Cloudinary
  if (url.includes('res.cloudinary.com')) {
    return cloudinary.url(url, {
      quality: 'auto',
      format: 'webp',
      width: width,
      crop: 'scale'
    });
  }
  
  // Para otras URLs, devolver la original
  return url;
};