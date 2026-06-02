
import 'server-only';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Usamos una clave de respaldo estática para asegurar consistencia si la variable de entorno falta
const SESSION_SECRET = process.env.SESSION_SECRET || 'secure-fallback-key-sortealo-static-v3-2024';

function getEncodedKey() {
  return new TextEncoder().encode(SESSION_SECRET);
}

export async function encrypt(payload: JWTPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = '') {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // Log para depuración en desarrollo
    console.error('Error al desencriptar sesión (JWT):', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
  } catch (e) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
