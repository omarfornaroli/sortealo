
import RaffleCard from '@/components/RaffleCard';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import Settings from '@/models/Settings';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Sponsors } from '@/components/home/Sponsors';

export default async function HomePage() {
  try {
    await dbConnect();
    
    // Obtenemos los sorteos activos y los ajustes globales en paralelo
    const [raffles, siteSettings] = await Promise.all([
      Raffle.find({ isFinished: false }).sort({ isFeatured: -1, createdAt: -1 }).lean(),
      Settings.findOne({}).lean()
    ]);
    
    const serializedRaffles = JSON.parse(JSON.stringify(raffles));
    
    // Aseguramos que serializedSettings tenga una estructura válida siempre
    const serializedSettings = siteSettings 
      ? JSON.parse(JSON.stringify(siteSettings)) 
      : { sponsors: [], heroBackgroundImageUrl: "" };
    
    // Garantizamos que sponsors sea un array aunque el documento exista pero no tenga el campo
    if (!serializedSettings.sponsors) {
      serializedSettings.sponsors = [];
    }

    const featuredRaffle = serializedRaffles.find((r: any) => r.isFeatured) || serializedRaffles[0];

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <Hero featuredRaffle={featuredRaffle} siteSettings={serializedSettings} />
        
        {/* Sección de sponsors con datos garantizados */}
        <Sponsors sponsors={serializedSettings.sponsors} />
        
        <main id="raffles" className="flex-1 pt-12 pb-24">
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
