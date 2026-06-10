
"use client";

import Image from 'next/image';

interface SponsorsProps {
  sponsors?: string[];
}

export function Sponsors({ sponsors = [] }: SponsorsProps) {
  // Verificación de seguridad para evitar renderizar sección vacía
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">
          Empresas que nos acompañan
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-80 hover:opacity-100 transition-opacity duration-500">
          {sponsors.map((url, index) => {
            if (!url) return null;
            return (
              <div key={index} className="relative h-12 w-36 md:h-16 md:w-48 group">
                <Image 
                  src={url} 
                  alt={`Sponsor Logo ${index + 1}`} 
                  fill 
                  className="object-contain filter transition-all duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 144px, 192px"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
