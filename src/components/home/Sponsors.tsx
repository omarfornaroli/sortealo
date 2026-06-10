
"use client";

import Image from 'next/image';

interface SponsorsProps {
  sponsors?: string[];
}

export function Sponsors({ sponsors = [] }: SponsorsProps) {
  // Solo renderizar si hay sponsors cargados
  if (!sponsors || sponsors.length === 0) return null;

  // Duplicamos los sponsors para el efecto de loop infinito suave
  const marqueeItems = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Empresas que confían en nosotros
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Contenedor del Marquee */}
        <div className="flex animate-marquee whitespace-nowrap items-center py-4">
          {marqueeItems.map((url, index) => {
            if (!url) return null;
            return (
              <div key={index} className="mx-10 md:mx-16 flex items-center justify-center shrink-0">
                <div className="relative h-12 w-32 md:h-14 md:w-44 group grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100">
                  <Image 
                    src={url} 
                    alt={`Sponsor ${index}`} 
                    fill 
                    className="object-contain filter"
                    sizes="(max-width: 768px) 128px, 176px"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Segunda capa idéntica para el efecto de loop sin cortes */}
        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap items-center py-4 h-full">
          {marqueeItems.map((url, index) => {
            if (!url) return null;
            return (
              <div key={`dup-${index}`} className="mx-10 md:mx-16 flex items-center justify-center shrink-0">
                <div className="relative h-12 w-32 md:h-14 md:w-44 group grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100">
                  <Image 
                    src={url} 
                    alt={`Sponsor Duplicate ${index}`} 
                    fill 
                    className="object-contain filter"
                    sizes="(max-width: 768px) 128px, 176px"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
