
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  console.log('--- API LOGIN: Iniciando proceso de autenticación ---');
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Credenciales incompletas' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.password) {
      console.warn(`--- API LOGIN: Usuario no encontrado: ${email} ---`);
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`--- API LOGIN: Contraseña incorrecta para: ${email} ---`);
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
    
    // 1. Establecer cookie para el Middleware (HTTP-Only)
    // Usamos cookies().set() que es el estándar de Next.js 15
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: false, // Permitir en desarrollo (HTTP)
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    console.log(`--- API LOGIN: Sesión exitosa generada para ${email}. Cookie establecida. ---`);

    // 2. Devolver token para localStorage (Cliente)
    return NextResponse.json({ 
      success: true, 
      token: sessionToken,
      user: userData,
      message: 'Autenticación exitosa' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('--- API LOGIN ERROR CRITICO ---', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
