'use client';

import { IRaffle } from '@/models/Raffle';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Ticket, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface RaffleCardProps {
  raffle: IRaffle & { _id: string };
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // Formatear la fecha solo en el cliente para evitar errores de hidratación
    setFormattedDate(new Date(raffle.drawDate).toLocaleDateString());
  }, [raffle.drawDate]);

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-md hover:shadow-2xl transition-all duration-500 group rounded-[2rem]">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={raffle.imageUrl} 
          alt={raffle.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg border-2 border-white/20">
            ACTIVO
          </div>
          {raffle.isFeatured && (
            <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg border-2 border-white/20 uppercase">
              Destacado
            </div>
          )}
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-xl">
          <span className="text-[10px] font-black text-slate-400 uppercase block leading-none mb-1">Desde</span>
          <span className="text-xl font-black text-primary">${raffle.ticketPrice}</span>
        </div>
      </div>
      <CardHeader className="p-8">
        <CardTitle className="text-3xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
          {raffle.name}
        </CardTitle>
        <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <Calendar className="w-4 h-4 text-primary" />
          Sortea: {formattedDate || 'Cargando...'}
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-4 pt-0">
        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
          {raffle.description}
        </p>
      </CardContent>
      <CardFooter className="p-8 pt-4">
        <Button asChild className="w-full h-14 font-black gap-2 shadow-xl shadow-primary/20 rounded-xl text-lg group">
          <Link href={`/raffles/${raffle._id}`}>
            <Ticket className="w-5 h-5" />
            PARTICIPAR AHORA
            <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
