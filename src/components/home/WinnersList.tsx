
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { WINNERS } from '@/lib/data-mock';
import { Trophy, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function WinnersList() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
              <Trophy className="w-4 h-4" />
              Historias de éxito
            </div>
            <h2 className="text-4xl lg:text-5xl font-headline font-bold">Nuestros Ganadores</h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
            Cada semana un nuevo sueño se hace realidad. Transparencia total y entrega garantizada de premios a lo largo de todo el país.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {WINNERS.map((winner) => (
            <Card key={winner.id} className="bg-background border-white/5 overflow-hidden group">
              <div className="relative aspect-video">
                <Image 
                  src={winner.image} 
                  alt={winner.winnerName} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                <div className="absolute top-4 right-4">
                  <div className="bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full p-2">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-headline text-lg font-bold">{winner.raffleTitle}</h4>
                  <p className="text-primary font-medium text-sm">Ganador: {winner.winnerName}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-muted-foreground">
                  <span>Número: {winner.ticketNumber}</span>
                  <span>{new Date(winner.date).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
