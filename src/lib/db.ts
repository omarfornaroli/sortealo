
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.warn('>>> [DATABASE] MONGODB_URI no está definida. Las operaciones a la BD fallarán.');
}

// Deshabilitar el buffering globalmente para evitar el error "buffering timed out"
// Esto hace que las operaciones fallen inmediatamente si no hay conexión, en lugar de esperar 10s.
mongoose.set('bufferCommands', false);

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    return null as any;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('>>> [DATABASE] Iniciando conexión con MongoDB...');
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('>>> [DATABASE] MongoDB Conectado Exitosamente');
      return mongoose;
    }).catch((err) => {
      console.error('>>> [DATABASE] Error al conectar con MongoDB:', err.message);
      cached.promise = null; // Resetear la promesa para permitir reintentos
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
