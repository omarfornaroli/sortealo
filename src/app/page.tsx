
import RaffleCard from '@/components/RaffleCard';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';

export default async function HomePage() {
  try {
    await dbConnect();
    // Obtenemos los sorteos activos
    const raffles = await Raffle.find({ isFinished: false }).sort({ isFeatured: -1, createdAt: -1 }).lean();
    
    // Serializamos para evitar problemas con objetos de MongoDB
    const serializedRaffles = JSON.parse(JSON.stringify(raffles));

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <Hero />
        
        <main id="raffles" className="flex-1 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 space-y-6">
              <div className="inline-block px-6 py-2 bg-primary/10 rounded-full text-primary font-black text-xs uppercase tracking-widest border border-primary/20">
                Experiencias de Élite
              </div>
              <h2 className="text-5xl lg:text-7xl font-headline font-bold text-slate-900 leading-none">
                Sorteos <span className="text-primary italic">Activos</span>
              </h2>
              <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
                Seleccioná tu premio, elegí tus chances y participá por el estilo de vida que merecés.
              </p>
            </div>

            {serializedRaffles.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                <div className="max-w-md mx-auto space-y-4">
                  <p className="text-slate-400 text-2xl font-headline font-bold italic">No hay sorteos activos en este momento.</p>
                  <p className="text-slate-400 font-medium">¡Vuelve pronto para ver nuestros próximos lanzamientos exclusivos!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
          <p className="text-slate-600">No se pudo conectar con la base de datos.</p>
        </div>
      </div>
    );
  }
}
