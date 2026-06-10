
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { decrypt } from '@/lib/session';

async function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;
  return await decrypt(token);
}

export async function GET() {
  await dbConnect();
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await checkAuth(req);
  if (!session) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  await dbConnect();
  try {
    const data = await req.json();
    
    // Buscamos el documento de configuración único
    let settings = await Settings.findOne({});
    
    if (!settings) {
      // Si no existe (caso raro porque GET lo crea), lo creamos
      settings = new Settings(data);
    } else {
      // Actualizamos los campos recibidos de forma explícita
      if (data.heroBackgroundImageUrl !== undefined) {
        settings.heroBackgroundImageUrl = data.heroBackgroundImageUrl;
      }
      
      if (data.sponsors !== undefined) {
        settings.sponsors = data.sponsors;
        // Obligamos a Mongoose a detectar el cambio en el array
        settings.markModified('sponsors');
      }
      
      if (data.siteName !== undefined) {
        settings.siteName = data.siteName;
      }
    }

    const savedSettings = await settings.save();
    
    return NextResponse.json(savedSettings);
  } catch (error: any) {
    console.error('Error al guardar ajustes:', error);
    return NextResponse.json({ 
      message: 'Error al actualizar la configuración', 
      error: error.message 
    }, { status: 500 });
  }
}
