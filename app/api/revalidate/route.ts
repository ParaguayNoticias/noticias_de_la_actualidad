import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  
  if (!path) {
    return Response.json({ error: 'Path is required' }, { status: 400 });
  }
  
  try {
    revalidatePath(path);
    return Response.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}