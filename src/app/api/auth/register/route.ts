
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ message: 'Admin email not configured in environment' }, { status: 500 });
  }

  // Verificar si ya existe algún usuario
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return NextResponse.json({ message: 'Admin already exists' }, { status: 400 });
  }

  const { email, password } = await req.json();

  if (email !== adminEmail) {
    return NextResponse.json({ message: 'Este email no está autorizado para ser administrador' }, { status: 403 });
  }

  try {
    const newUser = new User({ 
      email, 
      password, 
      isVerified: true 
    });
    await newUser.save();
    return NextResponse.json({ message: 'Admin configurado exitosamente' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear el administrador', error }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  const userCount = await User.countDocuments();
  return NextResponse.json({ needsSetup: userCount === 0 });
}
