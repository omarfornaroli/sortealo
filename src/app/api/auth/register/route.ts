
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Este email ya está registrado o en proceso.' }, { status: 400 });
    }

    const approvalToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = new User({
      email,
      status: 'pending_approval',
      approvalToken
    });
    await newUser.save();

    // Notificar al Master Admin
    const masterEmail = 'omarfornaroli@gmail.com';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    await sendEmail({
      to: masterEmail,
      subject: 'Nueva solicitud de registro administrativo - Sortealo',
      html: `
        <h1>Solicitud de Acceso</h1>
        <p>El usuario <strong>${email}</strong> desea registrarse como administrador.</p>
        <p>Haz clic en el botón de abajo para habilitar su registro:</p>
        <a href="${baseUrl}/api/auth/approve?token=${approvalToken}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
           Aprobar Registro
        </a>
      `
    });

    return NextResponse.json({ message: 'Solicitud enviada. Pendiente de aprobación del administrador maestro.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error al procesar el registro', error }, { status: 500 });
  }
}
