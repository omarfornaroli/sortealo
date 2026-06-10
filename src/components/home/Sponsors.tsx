
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface SponsorsProps {
  sponsors?: string[];
}

export function Sponsors({ sponsors = [] }: SponsorsProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        // Comparamos el ancho del contenido real con el ancho disponible del contenedor
        const contentWidth = contentRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        
        // Solo animamos si el contenido es más ancho que la pantalla
        setShouldAnimate(contentWidth > containerWidth);
      }
    };

    // Pequeño delay para asegurar que el layout inicial se haya calculado
    const timer = setTimeout(checkOverflow, 100);
    
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timer);
    };
  }, [sponsors]);

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="pt-20 pb-4 bg-white border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <p className="text-center text-[14px] font-black text-slate-400 uppercase tracking-[0.4em]">
          Nuestros Sponsors
        </p>
      </div>

      <div ref={containerRef} className="relative flex overflow-x-hidden min-h-[200px]">
        {/* Capa Principal */}
        <div 
          ref={contentRef}
          className={`flex gap-8 items-center py-8 ${shouldAnimate ? 'animate-marquee whitespace-nowrap pr-8' : 'mx-auto flex-wrap justify-center'}`}
        >
          {sponsors.map((url, index) => {
            if (!url) return null;
            return (
              <div key={index} className="flex items-center justify-center shrink-0">
                <div className="relative h-[144px] w-[384px] md:h-[168px] md:w-[528px]">
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

        {/* Capa de Duplicado para Loop Infinito (Solo si hay desbordamiento) */}
        {shouldAnimate && (
          <div className="absolute top-0 flex gap-8 animate-marquee2 whitespace-nowrap items-center py-8 h-full pr-8">
            {sponsors.map((url, index) => {
              if (!url) return null;
              return (
                <div key={`dup-${index}`} className="flex items-center justify-center shrink-0">
                  <div className="relative h-[144px] w-[384px] md:h-[168px] md:w-[528px]">
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
        )}
      </div>
    </section>
  );
}
