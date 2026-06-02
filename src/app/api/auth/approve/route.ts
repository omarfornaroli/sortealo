
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token no proporcionado' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ approvalToken: token, status: 'pending_approval' });
    
    if (!user) {
      return NextResponse.json({ message: 'Solicitud no encontrada o ya procesada' }, { status: 404 });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    
    user.status = 'pending_setup';
    user.approvalToken = undefined;
    user.setupToken = setupToken;
    await user.save();

    // Notificar al usuario para configurar contraseña
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    await sendEmail({
      to: user.email,
      subject: 'Registro Aprobado - Configura tu contraseña en Sortealo',
      html: `
        <h1>¡Registro Aprobado!</h1>
        <p>Tu solicitud ha sido aprobada. Ahora puedes configurar tu contraseña para acceder al panel administrativo:</p>
        <a href="${baseUrl}/admin/setup-password?token=${setupToken}" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
           Configurar Contraseña
        </a>
      `
    });

    return new NextResponse('<h1>Registro Aprobado</h1><p>Se ha enviado un email al usuario para que configure su contraseña.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al aprobar', error }, { status: 500 });
  }
}
