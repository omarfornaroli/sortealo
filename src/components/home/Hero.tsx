
"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  featuredRaffle?: any;
}

export function Hero({ featuredRaffle }: HeroProps) {
  // Use the custom background if available, otherwise fallback to a default luxury image
  const bgImage = featuredRaffle?.featuredBackgroundImageUrl || "https://picsum.photos/seed/luxury-prizes-montage/1920/1080";

  return (
    <section className="relative min-h-[95vh] flex items-center pt-20 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0">
        <Image 
          src={bgImage} 
          alt="Fondo de Premios" 
          fill 
          className="object-cover opacity-60 brightness-50"
          priority
        />
        {/* Gradients to ensure text readability - Enhanced for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-black/20" /> {/* Extra darkening layer */}
      </div>

      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
            <Star className="w-4 h-4 fill-primary" />
            Sorteos de Élite en Argentina
          </div>
          
          <h1 
            className="text-6xl lg:text-8xl font-headline font-bold leading-none tracking-tighter"
            style={{ 
              color: featuredRaffle?.featuredTitleColor || '#ffffff',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            Tu <span className="text-primary italic">destino</span> de lujo hoy.
          </h1>
          
          <p 
            className="text-xl max-w-lg leading-relaxed font-medium drop-shadow-md"
            style={{ color: featuredRaffle?.featuredSubtitleColor || '#cbd5e1' }}
          >
            Participa por autos deportivos, motos de alta cilindrada y la última tecnología. 
            Transparencia total y seguridad garantizada.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Button asChild className="h-16 px-10 text-lg font-black rounded-2xl group shadow-2xl shadow-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 transition-all border-none">
              <Link href="#raffles" className="flex items-center gap-2">
                EMPEZAR A GANAR
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 text-lg font-bold border-white/40 text-white bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-md transition-all shadow-xl">
              <Link href="/winners">
                Ver Ganadores
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-8 pt-10 border-t border-white/10">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="text-primary w-6 h-6" />
              <span className="text-sm font-black uppercase tracking-widest opacity-80">Pagos 100% Seguros</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800" />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-400">+10k Participantes</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[650px] w-full animate-fade-in-up delay-150">
          <div className="absolute -inset-10 bg-primary/30 blur-[100px] rounded-full opacity-20 animate-pulse" />
          <Link 
            href={featuredRaffle ? `/raffles/${featuredRaffle._id}` : '#raffles'} 
            className="block relative h-full w-full rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] group"
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
                    <div className="space-y-2">
                      <Badge className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border-none">
                        DESTACADO
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
                <p className="text-slate-500 font-bold uppercase tracking-widest">Descubriendo premios...</p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
