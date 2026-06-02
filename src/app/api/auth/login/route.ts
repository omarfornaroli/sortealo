
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';

export async function POST(req: NextRequest) {
  console.log('--- API LOGIN: INICIO ---');
  try {
    await dbConnect();
    const { email, password } = await req.json();

    console.log('Intento de login para:', email);

    if (!email || !password) {
      console.warn('Login fallido: Datos incompletos');
      return NextResponse.json({ message: 'Credenciales incompletas' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.password) {
      console.warn('Login fallido: Usuario no encontrado o sin contraseña');
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('Login fallido: Contraseña incorrecta');
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.status !== 'active') {
      console.warn('Login fallido: Cuenta inactiva status:', user.status);
      return NextResponse.json({ message: 'Tu cuenta aún no está activa' }, { status: 403 });
    }

    const userData = { 
      id: user._id.toString(), 
      email: user.email,
      role: 'admin'
    };

    const sessionToken = await encrypt(userData);
    console.log('Sesión encriptada exitosamente para:', user.email);
    
    const response = NextResponse.json({ 
      success: true, 
      user: userData,
      message: 'Autenticación exitosa' 
    }, { status: 200 });
    
    // Configuramos la cookie con opciones más laxas para desarrollo si es necesario
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    console.log('Cookie de sesión establecida en la respuesta');
    console.log('--- API LOGIN: FIN (EXITOSO) ---');
    return response;

  } catch (error: any) {
    console.error('Error crítico en API Login:', error);
    return NextResponse.json({ message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}
