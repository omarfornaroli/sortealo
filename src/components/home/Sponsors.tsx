
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
    <section className="pt-20 pb-4 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <p className="text-center text-[14px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Nuestros Sponsors
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        {/* Contenedor del Marquee */}
        <div className="flex animate-marquee whitespace-nowrap items-center py-8">
          {marqueeItems.map((url, index) => {
            if (!url) return null;
            return (
              <div key={index} className="mx-16 md:mx-24 flex items-center justify-center shrink-0">
                <div className="relative h-[144px] w-[384px] md:h-[168px] md:w-[528px] group transition-all duration-500">
                  <Image 
                    src={url} 
                    alt={`Sponsor ${index}`} 
                    fill 
                    className="object-contain"
                    sizes="(max-width: 768px) 384px, 528px"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Segunda capa idéntica para el efecto de loop sin cortes */}
        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap items-center py-8 h-full">
          {marqueeItems.map((url, index) => {
            if (!url) return null;
            return (
              <div key={`dup-${index}`} className="mx-16 md:mx-24 flex items-center justify-center shrink-0">
                <div className="relative h-[144px] w-[384px] md:h-[168px] md:w-[528px] group transition-all duration-500">
                  <Image 
                    src={url} 
                    alt={`Sponsor Duplicate ${index}`} 
                    fill 
                    className="object-contain"
                    sizes="(max-width: 768px) 384px, 528px"
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
