
"use client";

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Ticket, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RaffleCardProps {
  raffle: {
    id: string;
    title: string;
    prize: string;
    images: string[];
    drawDate: string;
    ticketPrice: number;
    maxTickets: number;
    soldTickets: number;
  }
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const progress = (raffle.soldTickets / raffle.maxTickets) * 100;
  
  return (
    <Card className="group overflow-hidden border-white/5 bg-card hover:border-primary/50 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
          src={raffle.images[0]} 
          alt={raffle.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1">ACTIVO</Badge>
        </div>
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-xl">
          <span className="text-primary font-bold text-lg">${raffle.ticketPrice}</span>
          <span className="text-[10px] text-muted-foreground uppercase ml-1">p/número</span>
        </div>
      </div>
      
      <CardHeader className="p-6 pb-2">
        <h3 className="text-xl font-headline font-bold line-clamp-1">{raffle.title}</h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Sortea: {new Date(raffle.drawDate).toLocaleDateString()}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Progreso de venta</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {raffle.soldTickets.toLocaleString()} vendidos
            </span>
            <span className="flex items-center gap-1">
              <Ticket className="w-3 h-3" /> {(raffle.maxTickets - raffle.soldTickets).toLocaleString()} disponibles
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Link href={`/raffles/${raffle.id}`} className="w-full">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12">
            Participar Ahora
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
