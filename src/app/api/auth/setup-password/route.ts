
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { token, password } = await req.json();

    console.log('--- INTENTO DE CONFIGURACIÓN DE CONTRASEÑA ---');
    console.log('Token recibido:', token ? 'Presente' : 'Ausente');

    if (!token || !password) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    const user = await User.findOne({ setupToken: token, status: 'pending_setup' });

    if (!user) {
      console.warn('Token de configuración no encontrado o inválido:', token);
      return NextResponse.json({ message: 'El enlace ha expirado o es inválido.' }, { status: 404 });
    }

    user.password = password;
    user.status = 'active';
    user.isVerified = true;
    user.setupToken = undefined; // Limpiamos el token tras el uso
    await user.save();

    console.log('Contraseña configurada con éxito para:', user.email);

    return NextResponse.json({ message: 'Contraseña configurada con éxito. Ya puedes iniciar sesión.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en setup-password API:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}
