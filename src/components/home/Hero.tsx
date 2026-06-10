
"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  featuredRaffle?: any;
  siteSettings?: any;
}

export function Hero({ featuredRaffle, siteSettings }: HeroProps) {
  const bgImage = siteSettings?.heroBackgroundImageUrl || "https://images.unsplash.com/photo-1568605117036-5fe5e790b738?q=80&w=2070&auto=format&fit=crop";

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Fondo Principal de Sortealo" 
          fill 
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md shadow-xl">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            Sorteos de Élite en Argentina
          </div>
          
          <h1 
            className="text-6xl lg:text-8xl font-headline font-bold leading-none tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          >
            Tu <span className="text-primary italic">destino</span> de lujo hoy.
          </h1>
          
          <p 
            className="text-xl max-w-lg leading-relaxed font-bold text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
          >
            Participa por autos deportivos, motos de alta cilindrada y la última tecnología. 
            Transparencia total y seguridad garantizada en cada sorteo.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Button asChild className="h-16 px-10 text-lg font-black rounded-2xl group shadow-2xl shadow-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none">
              <Link href="#raffles" className="flex items-center gap-2">
                EMPEZAR A GANAR
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 text-lg font-bold border-white/40 text-white bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md transition-all shadow-2xl">
              <Link href="/winners">
                Ver Ganadores
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-10 border-t border-white/20">
            <div className="flex items-center gap-3 text-white drop-shadow-md">
              <ShieldCheck className="text-primary w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-widest">Pagos 100% Seguros</span>
            </div>
            <div className="flex items-center gap-3 text-white drop-shadow-md">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/${i}/32/32`} alt="user" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-bold text-white">+10k Participantes</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[650px] w-full animate-fade-in-up delay-150">
          <div className="absolute -inset-10 bg-primary/30 blur-[100px] rounded-full opacity-20 animate-pulse" />
          <Link 
            href={featuredRaffle ? `/raffles/${featuredRaffle._id}` : '#raffles'} 
            className="block relative h-full w-full rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] group"
          >
            {featuredRaffle ? (
              <>
                <Image 
                  src={featuredRaffle.imageUrl} 
                  alt={featuredRaffle.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute bottom-0 inset-x-0 p-12 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2 text-left">
                      <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border-none">
                        SORTEO DESTACADO
                      </Badge>
                      <h3 className="text-4xl font-headline font-bold text-white group-hover:text-primary transition-colors">
                        {featuredRaffle.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Chance</span>
                      <span className="text-5xl font-black text-primary">${featuredRaffle.ticketPrice}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Cargando premios increíbles...</p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
