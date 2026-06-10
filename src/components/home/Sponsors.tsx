
"use client";

import Image from 'next/image';

interface SponsorsProps {
  sponsors?: string[];
}

export function Sponsors({ sponsors = [] }: SponsorsProps) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
          Confían en nosotros
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {sponsors.map((url, index) => (
            <div key={index} className="relative h-12 w-32 md:h-16 md:w-40">
              <Image 
                src={url} 
                alt={`Sponsor ${index}`} 
                fill 
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
