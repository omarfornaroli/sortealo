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
    let settings = await Settings.findOne({});
    
    if (!settings) {
      settings = new Settings(data);
    } else {
      // Actualización masiva de campos de texto y configuración
      const fields = [
        'siteName', 'heroBackgroundImageUrl', 'heroBadgeText', 'heroTitle', 
        'heroDescription', 'heroButtonText', 'sponsorsTitle', 'sponsors',
        'activeRafflesTitle', 'activeRafflesSubtitle', 'footerDescription',
        'contactEmail', 'contactPhone', 'contactAddress'
      ];
      
      fields.forEach(field => {
        if (data[field] !== undefined) {
          settings[field] = data[field];
          if (Array.isArray(data[field])) {
            settings.markModified(field);
          }
        }
      });
    }

    const savedSettings = await settings.save();
    return NextResponse.json(savedSettings);
  } catch (error: any) {
    console.error('Error al guardar ajustes:', error);
    return NextResponse.json({ message: 'Error al actualizar la configuración', error: error.message }, { status: 500 });
  }
}
