
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

    if (!token) {
      return new NextResponse('Error: Token no proporcionado', { status: 400 });
    }

    const user = await User.findOne({ approvalToken: token, status: 'pending_approval' });
    
    if (!user) {
      return new NextResponse('Error: Solicitud no encontrada o ya procesada.', { status: 404 });
    }

    const setupToken = crypto.randomBytes(32).toString('hex');
    user.status = 'pending_setup';
    user.approvalToken = undefined;
    user.setupToken = setupToken;
    await user.save();

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const setupLink = `${baseUrl}/auth/setup-password?token=${setupToken}`;
    
    await sendEmail({
      to: user.email,
      subject: '¡Registro Aprobado! - Configura tu cuenta',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #2563eb; text-align: center;">¡Acceso Autorizado!</h1>
          <p style="font-size: 16px; color: #475569;">Tu solicitud para Sortealo ha sido aprobada.</p>
          <p style="font-size: 16px; color: #475569;">Haz clic abajo para crear tu contraseña:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${setupLink}" 
               style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
               Configurar mi Contraseña
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">Si el botón no funciona: ${setupLink}</p>
        </div>
      `
    });

    return new NextResponse(`
      <div style="font-family: sans-serif; text-align: center; padding: 100px; background-color: #f8fafc; min-height: 100vh;">
        <div style="background: white; padding: 60px; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); display: inline-block; max-width: 500px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Aprobación Exitosa</h1>
          <p style="color: #475569; font-size: 18px;">
            Se ha enviado un email a <strong>${user.email}</strong> para completar el registro.
          </p>
        </div>
      </div>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
