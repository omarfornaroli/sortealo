
"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  featuredRaffle?: any;
}

export function Hero({ featuredRaffle }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://picsum.photos/seed/elite-bg/1920/1080" 
          alt="Luxury background" 
          fill 
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Star className="w-3 h-3 fill-primary" />
            La plataforma de sorteos más confiable
          </div>
          
          <h1 
            className="text-5xl lg:text-7xl font-headline font-bold leading-tight"
            style={{ color: featuredRaffle?.featuredTitleColor || 'inherit' }}
          >
            Tu próxima <span className="text-primary italic">experiencia</span> de lujo comienza aquí.
          </h1>
          
          <p 
            className="text-lg max-w-lg leading-relaxed font-medium"
            style={{ color: featuredRaffle?.featuredSubtitleColor || '#64748b' }}
          >
            Participa por autos de alta gama, motos de competición y tecnología de punta. 
            Seguridad garantizada y transparencia total en cada sorteo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-base group">
              <Link href="#raffles">
                Ver Sorteos Activos
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base border-slate-200 hover:bg-slate-50">
              Cómo funciona
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary w-5 h-5" />
              <span className="text-sm font-medium text-slate-700">Pagos Seguros</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Más de 10,000 ganadores felices</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] w-full animate-fade-in-up delay-150">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30 animate-pulse" />
          <Link 
            href={featuredRaffle ? `/raffles/${featuredRaffle._id}` : '#raffles'} 
            className="block relative h-full w-full rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl group cursor-pointer"
          >
            {featuredRaffle ? (
              <>
                <Image 
                  src={featuredRaffle.imageUrl} 
                  alt={featuredRaffle.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-primary font-bold text-xs tracking-widest uppercase mb-2 block">
                        {featuredRaffle.isFeatured ? 'Premio Destacado' : 'Última oportunidad'}
                      </span>
                      <h3 className="text-3xl font-headline font-bold text-white group-hover:text-primary transition-colors">
                        {featuredRaffle.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Desde</span>
                      <span className="text-4xl font-black text-primary">${featuredRaffle.ticketPrice}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <p className="text-slate-400 font-bold">Cargando premio destacado...</p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </section>
  );
}
