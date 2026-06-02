
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });

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

    // Importante: Convertir el ID a string para la carga útil del JWT
    await createSession({ id: user._id.toString(), email: user.email });

    return NextResponse.json({ message: 'Sesión iniciada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en login API:', error);
    return NextResponse.json({ message: 'Error al iniciar sesión', error: error.message }, { status: 500 });
  }
}
