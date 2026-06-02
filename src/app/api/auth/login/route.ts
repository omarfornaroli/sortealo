
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.status !== 'active') {
      const statusMessages = {
        'pending_approval': 'Tu cuenta está esperando aprobación.',
        'pending_setup': 'Debes configurar tu contraseña primero.'
      };
      return NextResponse.json({ 
        message: statusMessages[user.status as keyof typeof statusMessages] || 'Tu cuenta aún no está activa' 
      }, { status: 403 });
    }

    // Crear el token de sesión
    const sessionToken = await encrypt({ 
      id: user._id.toString(), 
      email: user.email 
    });
    
    // Establecer la cookie usando el helper oficial de Next.js para mayor fiabilidad
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Permitir en desarrollo (Workstation)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return NextResponse.json({ 
      message: 'Sesión iniciada correctamente',
      success: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error en login API:', error);
    return NextResponse.json({ message: 'Error interno al iniciar sesión' }, { status: 500 });
  }
}
