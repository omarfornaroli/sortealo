
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ setupToken: token, status: 'pending_setup' });

    if (!user) {
      return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 404 });
    }

    user.password = password;
    user.status = 'active';
    user.isVerified = true;
    user.setupToken = undefined;
    await user.save();

    return NextResponse.json({ message: 'Contraseña configurada con éxito. Ya puedes iniciar sesión.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al configurar contraseña', error }, { status: 500 });
  }
}
