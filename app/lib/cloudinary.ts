import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_KEY!,
  api_secret: process.env.CLOUDINARY_SECRET!,
  secure: true,
});

export const getOptimizedImage = (publicId: string | null, width = 1200): string => {
  if (!publicId) return '/placeholder.jpg';

  return cloudinary.url(publicId, {
    width,
    crop: 'scale',
    quality: 'auto',
    fetch_format: 'auto', 
  });
};
