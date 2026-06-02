
import RaffleCard from '@/components/RaffleCard';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';

export default async function HomePage() {
  try {
    await dbConnect();
    // Obtenemos los sorteos directamente de la base de datos
    const raffles = await Raffle.find({ isFinished: false }).lean();
    
    // Serializamos para evitar problemas con objetos de MongoDB (como _id) en componentes de cliente
    const serializedRaffles = JSON.parse(JSON.stringify(raffles));

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <Hero />
        
        <main id="raffles" className="flex-1 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-headline font-bold text-slate-900">
                Sorteos <span className="text-primary italic">Activos</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Participá ahora y sé nuestro próximo gran ganador.
              </p>
            </div>

            {serializedRaffles.length === 0 ? (
              <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-muted-foreground text-lg italic">No hay sorteos activos en este momento. ¡Vuelve pronto!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {serializedRaffles.map((raffle: any) => (
                  <RaffleCard key={raffle._id} raffle={raffle} />
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Database connection error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error de Conexión</h1>
          <p className="text-slate-600">No se pudo conectar con la base de datos. Por favor, revisa la configuración de MongoDB.</p>
        </div>
      </div>
    );
  }
}
