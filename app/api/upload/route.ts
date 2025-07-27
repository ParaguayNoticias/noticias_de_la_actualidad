import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResponse = await cloudinary.uploader.upload_stream(
    { folder: 'noticias' },
    (error, result) => {
      if (error) return NextResponse.json({ error }, { status: 500 });
      return NextResponse.json({ url: result?.secure_url });
    }
  );

  uploadResponse.end(buffer);
}
