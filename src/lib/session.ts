
import 'server-only';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Clave estática y robusta para asegurar consistencia entre Node.js (API) y Edge Runtime (Middleware)
const SESSION_SECRET = 'sortealo-ultra-secure-static-key-2024-v99';

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
    // Si hay un error de desencriptación, devolvemos null para forzar relogin
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
