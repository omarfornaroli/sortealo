
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

    const userData = { 
      id: user._id.toString(), 
      email: user.email,
      role: 'admin'
    };

    const sessionToken = await encrypt(userData);

    // No establecemos cookies. Solo devolvemos el token para localStorage.
    return NextResponse.json({ 
      success: true, 
      token: sessionToken,
      user: userData
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
