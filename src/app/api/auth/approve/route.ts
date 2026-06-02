
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
    return new NextResponse('<h1>Error</h1><p>Token no proporcionado.</p>', { headers: { 'Content-Type': 'text/html' } });
  }

  try {
    const user = await User.findOne({ approvalToken: token, status: 'pending_approval' });
    
    if (!user) {
      return new NextResponse('<h1>Error</h1><p>Solicitud no encontrada o ya procesada.</p>', { headers: { 'Content-Type': 'text/html' } });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    
    user.status = 'pending_setup';
    user.approvalToken = undefined;
    user.setupToken = setupToken;
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    await sendEmail({
      to: user.email,
      subject: '¡Registro Aprobado! - Configura tu cuenta en Sortealo',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #059669; text-align: center;">¡Bienvenido a bordo!</h1>
          <p style="font-size: 16px; color: #475569;">Tu solicitud de acceso como administrador ha sido <strong>aprobada</strong>.</p>
          <p style="font-size: 16px; color: #475569;">Ahora solo falta que establezcas tu contraseña para comenzar a gestionar los sorteos:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/admin/setup-password?token=${setupToken}" 
               style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               Configurar mi Contraseña
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">Este enlace es único y personal. No lo compartas con nadie.</p>
        </div>
      `
    });

    return new NextResponse(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #059669;">Registro Aprobado con Éxito</h1>
        <p style="color: #475569;">Se ha enviado un email a <strong>${user.email}</strong> para que configure su contraseña.</p>
        <p>Puedes cerrar esta ventana.</p>
      </div>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new NextResponse('<h1>Error del Servidor</h1>', { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
