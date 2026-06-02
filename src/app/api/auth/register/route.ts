
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'El email es requerido' }, { status: 400 });
    }

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
    
    // El error "next is not a function" ocurría aquí por el hook pre-save
    await newUser.save();

    const masterEmail = 'omarfornaroli@gmail.com';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    const emailSent = await sendEmail({
      to: masterEmail,
      subject: 'Nueva solicitud de registro administrativo - Sortealo',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #1e293b; text-align: center;">Solicitud de Acceso</h1>
          <p style="font-size: 16px; color: #475569;">El usuario <strong>${email}</strong> desea registrarse como administrador en Sortealo.</p>
          <p style="font-size: 16px; color: #475569;">Haz clic en el botón de abajo para habilitar su registro y permitirle configurar su contraseña:</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/api/auth/approve?token=${approvalToken}" 
               style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               Aprobar Registro
            </a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center;">Si no reconoces esta solicitud, puedes ignorar este mensaje.</p>
        </div>
      `
    });

    return NextResponse.json({ 
      message: 'Solicitud enviada con éxito. El administrador maestro revisará tu petición.' 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ 
      message: 'Error al procesar el registro', 
      error: error.message 
    }, { status: 500 });
  }
}
