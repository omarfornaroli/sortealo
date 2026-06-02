
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  console.log('--- API LOGIN: INICIO ---');
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Credenciales incompletas' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ message: 'Tu cuenta aún no está activa' }, { status: 403 });
    }

    const userData = { 
      id: user._id.toString(), 
      email: user.email,
      role: 'admin'
    };

    const sessionToken = await encrypt(userData);
    
    // 1. Establecer cookie para el Middleware
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Permitir en desarrollo (HTTP)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    console.log('--- API LOGIN: SESIÓN GENERADA ---');

    // 2. Devolver token para localStorage y datos del usuario
    return NextResponse.json({ 
      success: true, 
      token: sessionToken,
      user: userData,
      message: 'Autenticación exitosa' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('--- ERROR CRITICO API LOGIN ---', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
