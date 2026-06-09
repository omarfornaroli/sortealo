
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Ticket as TicketIcon, Loader2, Trophy, ArrowRight, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Participant {
  email: string;
  name: string;
  tickets: string[];
}

interface Raffle {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  participants: Participant[];
  isFinished: boolean;
  ticketPrice: number;
  soldTickets: number;
  maxTickets: number;
  winnerEmail?: string;
  winnerTicket?: string;
}

export function AdminRaffleList({ initialRaffles }: { initialRaffles: Raffle[] }) {
  const [raffles, setRaffles] = useState(initialRaffles);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este sorteo? Se perderán todos los datos de participantes.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/raffles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRaffles(prev => prev.filter(r => r._id !== id));
        toast({ title: 'Sorteo eliminado', description: 'Los datos se han borrado del sistema.' });
      } else {
        throw new Error('No se pudo eliminar');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error al intentar conectar con el servidor.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {raffles.map((raffle) => (
        <Card key={raffle._id} className="overflow-hidden border-slate-100 bg-white group rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
          <div className="relative h-60 overflow-hidden bg-slate-100">
            <img 
              src={raffle.imageUrl} 
              alt={raffle.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute top-4 left-4">
              <span className={`text-[10px] px-5 py-2 rounded-full font-black shadow-xl border-2 uppercase tracking-widest ${raffle.isFinished ? 'bg-slate-900 text-white border-slate-700' : 'bg-green-500 text-white border-white/30'}`}>
                {raffle.isFinished ? 'Finalizado' : 'Abierto'}
              </span>
            </div>
            {raffle.isFinished && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <span className="font-black text-slate-900 uppercase text-sm tracking-tighter">Sorteo Ejecutado</span>
                </div>
              </div>
            )}
          </div>
          
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-headline font-bold line-clamp-1 text-slate-900 group-hover:text-primary transition-colors">{raffle.name}</CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-black text-primary bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                ${raffle.ticketPrice} / ticket
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-8 pt-0 space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <Link href={`/admin/raffles/participants/${raffle._id}`} className="block group/stat">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-primary/40 hover:bg-white transition-all h-full">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Participantes
                  </div>
                  <p className="text-xl font-black text-slate-900 flex items-center justify-between">
                    {raffle.participants?.length || 0}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover/stat:opacity-100 group-hover/stat:translate-x-1 transition-all" />
                  </p>
                </div>
              </Link>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  <TicketIcon className="w-3.5 h-3.5 text-primary" /> Vendidos
                </div>
                <p className="text-xl font-black text-slate-900">{raffle.soldTickets || 0}</p>
              </div>
            </div>

            {raffle.isFinished && raffle.winnerEmail && (
              <div className="p-5 bg-amber-50 rounded-[1.5rem] border border-amber-200 animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Ganador</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">{raffle.winnerEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase">Ticket:</span>
                   <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-200 text-amber-700 font-mono font-black text-xs">{raffle.winnerTicket}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
              <Button asChild className="w-full h-14 gap-3 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                {raffle.isFinished ? (
                   <Link href={`/admin/raffles/draw/${raffle._id}`}>
                    <Trophy className="w-5 h-5" /> VER RESULTADO
                  </Link>
                ) : (
                  <Link href={`/admin/raffles/draw/${raffle._id}`}>
                    <Trophy className="w-5 h-5" /> EJECUTAR SORTEO
                  </Link>
                )}
              </Button>

              <Button asChild variant="outline" className="w-full h-12 gap-3 rounded-xl font-bold border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50">
                <Link href={`/admin/raffles/participants/${raffle._id}`}>
                  <Search className="w-4 h-4" /> VER REGISTRO DE COMPRADORES
                </Link>
              </Button>
              
              <div className="flex gap-3">
                <Button asChild variant="ghost" className="flex-1 h-12 gap-2 border border-slate-100 rounded-xl hover:bg-slate-50 font-black uppercase text-xs tracking-widest text-slate-500 hover:text-primary">
                  <Link href={`/admin/raffles/edit/${raffle._id}`}>
                    <Edit className="w-4 h-4" /> EDITAR
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="px-5 h-12 rounded-xl border border-slate-100 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={() => handleDelete(raffle._id)}
                  disabled={deletingId === raffle._id}
                >
                  {deletingId === raffle._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
