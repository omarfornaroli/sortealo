
'use client';

import { useState, useEffect } from 'react';
import RaffleCard from '@/components/RaffleCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Sponsors } from '@/components/home/Sponsors';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [raffles, setRaffles] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      try {
        const [rafflesRes, settingsRes] = await Promise.all([
          fetch('/api/raffles'),
          fetch('/api/settings')
        ]);

        if (!rafflesRes.ok || !settingsRes.ok) {
          throw new Error('Error al cargar datos desde el backend');
        }

        const rafflesData = await rafflesRes.json();
        const settingsData = await settingsRes.json();

        // Filtrar sorteos activos y ordenarlos por destacados
        const activeRaffles = rafflesData
          .filter((r: any) => !r.isFinished)
          .sort((a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

        setRaffles(activeRaffles);
        setSettings(settingsData);
      } catch (err: any) {
        console.error('Error loading home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando experiencia premium...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-red-600">Servicio no disponible</h1>
          <p className="text-slate-600">No pudimos conectar con el servidor de datos. Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  const featuredRaffle = raffles.find((r: any) => r.isFeatured) || raffles[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Hero featuredRaffle={featuredRaffle} siteSettings={settings} />
      
      <Sponsors 
        sponsors={settings?.sponsors} 
        title={settings?.sponsorsTitle} 
      />
      
      <main id="raffles" className="flex-1 pt-12 pb-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 space-y-6">
            <div className="inline-block px-6 py-2 bg-primary/10 rounded-full text-primary font-black text-xs uppercase tracking-widest border border-primary/20">
              {settings?.siteName || 'Sortealo'}
            </div>
            <h2 className="text-5xl lg:text-7xl font-headline font-bold text-slate-900 leading-none">
              {settings?.activeRafflesTitle || 'Sorteos Activos'}
            </h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
              {settings?.activeRafflesSubtitle || 'Seleccioná tu premio, elegí tus chances y participá.'}
            </p>
          </div>

          {raffles.length === 0 ? (
            <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-slate-400 text-2xl font-headline font-bold italic">No hay sorteos activos en este momento.</p>
                <p className="text-slate-400 font-medium">¡Vuelve pronto para ver nuestros próximos lanzamientos!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {raffles.map((raffle: any) => (
                <RaffleCard key={raffle._id} raffle={raffle} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
