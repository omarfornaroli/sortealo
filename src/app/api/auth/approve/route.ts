
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('--- PROCESANDO APROBACIÓN ---');
    console.log('Token de aprobación recibido:', token);

    if (!token) {
      return new NextResponse('<h1>Error</h1><p>Token no proporcionado.</p>', { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    const user = await User.findOne({ approvalToken: token, status: 'pending_approval' });
    
    if (!user) {
      console.warn('Aprobación fallida: Usuario no encontrado con ese token o ya procesado.');
      return new NextResponse('<h1>Error</h1><p>La solicitud no fue encontrada o ya ha sido aprobada previamente.</p>', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    
    user.status = 'pending_setup';
    user.approvalToken = undefined;
    user.setupToken = setupToken;
    await user.save();

    console.log('Usuario aprobado. Generando email de configuración para:', user.email);

    // Detección robusta de la URL base
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    const setupLink = `${baseUrl}/admin/setup-password?token=${setupToken}`;
    console.log('Link de configuración generado:', setupLink);
    
    await sendEmail({
      to: user.email,
      subject: '¡Registro Aprobado! - Configura tu cuenta en Sortealo',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #059669; text-align: center;">¡Bienvenido a bordo!</h1>
          <p style="font-size: 16px; color: #475569;">Tu solicitud de acceso como administrador ha sido <strong>aprobada</strong>.</p>
          <p style="font-size: 16px; color: #475569;">Ahora solo falta que establezcas tu contraseña para comenzar a gestionar los sorteos:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${setupLink}" 
               style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               Configurar mi Contraseña
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">Si el botón no funciona, copia y pega este link: ${setupLink}</p>
        </div>
      `
    });

    return new NextResponse(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; min-height: 100vh;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: inline-block; max-width: 500px;">
          <h1 style="color: #059669; margin-bottom: 20px;">Registro Aprobado</h1>
          <p style="color: #475569; font-size: 18px;">
            Se ha enviado un email a <strong>${user.email}</strong> con el link para configurar su contraseña.
          </p>
          <p style="color: #94a3b8; margin-top: 30px; font-size: 14px;">Ya puedes cerrar esta ventana.</p>
        </div>
      </div>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error: any) {
    console.error('Error crítico en la aprobación:', error);
    return new NextResponse(`<h1>Error del Servidor</h1><p>${error.message}</p>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
