
"use client";

import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background elements */}
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
          
          <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-tight">
            Tu próxima <span className="text-primary italic">experiencia</span> de lujo comienza aquí.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Participa por autos de alta gama, motos de competición y tecnología de punta. 
            Seguridad garantizada y transparencia total en cada sorteo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-base group">
              Ver Sorteos Activos
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/10 hover:bg-white/5">
              Cómo funciona
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary w-5 h-5" />
              <span className="text-sm font-medium">Pagos Seguros</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Más de 10,000 ganadores felices</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] w-full animate-fade-in-up delay-150">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-30 animate-pulse" />
          <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image 
              src="https://picsum.photos/seed/elite-car/1200/800" 
              alt="Featured Prize" 
              fill 
              className="object-cover"
              data-ai-hint="luxury car"
            />
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase">Premio Destacado</span>
                  <h3 className="text-2xl font-headline font-bold text-white">Porsche 911 Carrera GTS</h3>
                </div>
                <div className="text-right">
                  <span className="block text-white/60 text-xs uppercase mb-1">Desde</span>
                  <span className="text-3xl font-bold text-primary">$2.500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
