
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/session';

export async function POST(req: NextRequest) {
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

    // Convertimos el ID a string para evitar problemas de encriptación con objetos complejos
    const sessionToken = await encrypt({ id: user._id.toString(), email: user.email });
    
    // Creamos la respuesta y establecemos la cookie explícitamente en el objeto de respuesta
    const response = NextResponse.json({ success: true }, { status: 200 });
    
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
