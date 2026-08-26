/**
 * Next.js Instrumentation Hook
 * Este archivo permite ejecutar código en el momento que el servidor de Next.js se inicia.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('>>> [SERVER] Servidor iniciado. Inicializando conexión persistente...');
    try {
      const dbConnect = (await import('@/lib/db')).default;
      await dbConnect();
    } catch (error) {
      console.error('>>> [SERVER] Fallo crítico en la inicialización temprana:', error);
    }
  }
}
