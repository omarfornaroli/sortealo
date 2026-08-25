import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    // Durante el build de Next.js, es posible que la URI no esté definida.
    // Solo lanzamos el error si realmente necesitamos conectar en tiempo de ejecución.
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      console.warn('Advertencia: MONGODB_URI no está definida.');
    }
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
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
