
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    // Búsqueda insensible a mayúsculas para mayor robustez
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
        'pending_approval': 'Tu cuenta está esperando aprobación del administrador maestro.',
        'pending_setup': 'Debes configurar tu contraseña primero mediante el link enviado a tu email.'
      };
      return NextResponse.json({ 
        message: statusMessages[user.status as keyof typeof statusMessages] || 'Tu cuenta aún no está activa' 
      }, { status: 403 });
    }

    // Crear sesión guardando solo el ID como string
    await createSession({ id: user._id.toString(), email: user.email });

    return NextResponse.json({ message: 'Sesión iniciada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en login API:', error);
    return NextResponse.json({ message: 'Error interno al iniciar sesión' }, { status: 500 });
  }
}
