import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    // Si estamos en build de Next.js, evitamos lanzar error aquí para permitir la compilación
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return null as any;
    }
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('>>> [DATABASE] Iniciando conexión con MongoDB...');
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('>>> [DATABASE] MongoDB Conectado Exitosamente');
      return mongoose;
    }).catch((err) => {
      console.error('>>> [DATABASE] Error al conectar con MongoDB:', err.message);
      cached.promise = null;
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
