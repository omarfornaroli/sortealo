
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
    console.log('Token recibido:', token);

    if (!token) {
      return new NextResponse('<h1>Error</h1><p>Token no proporcionado.</p>', { status: 400, headers: { 'Content-Type': 'text/html' } });
    }

    const user = await User.findOne({ approvalToken: token, status: 'pending_approval' });
    
    if (!user) {
      console.warn('Aprobación fallida: Usuario no encontrado con ese token o ya procesado.');
      return new NextResponse('<h1>Error</h1><p>La solicitud no fue encontrada, el token es inválido o ya ha sido aprobada previamente.</p>', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    
    user.status = 'pending_setup';
    user.approvalToken = undefined;
    user.setupToken = setupToken;
    await user.save();

    console.log('Usuario aprobado correctamente:', user.email);

    // Generar URL base dinámica para el email del usuario
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
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
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; min-height: 100vh;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: inline-block; max-width: 500px;">
          <h1 style="color: #059669; margin-bottom: 20px;">Registro Aprobado con Éxito</h1>
          <p style="color: #475569; font-size: 18px; line-height: 1.6;">
            Se ha enviado un email a <strong>${user.email}</strong> con las instrucciones para configurar su contraseña.
          </p>
          <p style="color: #94a3b8; margin-top: 30px;">Puedes cerrar esta pestaña de forma segura.</p>
        </div>
      </div>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error: any) {
    console.error('Error crítico en el proceso de aprobación:', error);
    return new NextResponse(`<h1>Error del Servidor</h1><p>${error.message}</p>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
