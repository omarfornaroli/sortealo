
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Ticket as TicketIcon, Loader2, Trophy, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Raffle {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  participants: string[];
  isFinished: boolean;
  ticketPrice: number;
  winnerEmail?: string;
  winnerTicket?: string;
}

export function AdminRaffleList({ initialRaffles }: { initialRaffles: Raffle[] }) {
  const [raffles, setRaffles] = useState(initialRaffles);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {raffles.map((raffle) => (
        <Card key={raffle._id} className="overflow-hidden border-slate-200 bg-white group rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="relative h-48 overflow-hidden bg-slate-100">
            <img 
              src={raffle.imageUrl} 
              alt={raffle.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-3 left-3">
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold shadow-md border ${raffle.isFinished ? 'bg-slate-900 text-white border-slate-700' : 'bg-green-500 text-white border-green-400'}`}>
                {raffle.isFinished ? 'FINALIZADO' : 'ACTIVO'}
              </span>
            </div>
            {raffle.isFinished && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Sorteo Realizado</span>
                </div>
              </div>
            )}
          </div>
          
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-lg font-bold line-clamp-1 text-slate-900">{raffle.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                ${raffle.ticketPrice} por número
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-5 space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-2">
              <Link href={`/admin/raffles/participants/${raffle._id}`} className="block group/stat">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    <Users className="w-3 h-3" /> Participantes
                  </div>
                  <p className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    {raffle.participants?.length || 0}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                  </p>
                </div>
              </Link>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  <Calendar className="w-3 h-3" /> Estado
                </div>
                <p className="text-sm font-bold text-slate-900">{raffle.isFinished ? 'Cerrado' : 'Abierto'}</p>
              </div>
            </div>

            {raffle.isFinished && raffle.winnerEmail && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Ganador</span>
                </div>
                <p className="text-xs font-bold text-slate-800 truncate">{raffle.winnerEmail}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Ticket: {raffle.winnerTicket}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 pt-2">
              {!raffle.isFinished ? (
                <Button asChild className="w-full gap-2 rounded-xl font-bold h-10 bg-primary shadow-md">
                  <Link href={`/admin/raffles/draw/${raffle._id}`}>
                    <Trophy className="w-4 h-4" /> Ejecutar Sorteo
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full gap-2 rounded-xl font-bold h-10 border-slate-200">
                  <Link href={`/admin/raffles/draw/${raffle._id}`}>
                    <Trophy className="w-4 h-4" /> Ver Detalles Ganador
                  </Link>
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button asChild variant="ghost" className="flex-1 gap-2 border border-slate-100 rounded-xl hover:bg-slate-50 font-bold h-10">
                  <Link href={`/admin/raffles/edit/${raffle._id}`}>
                    <Edit className="w-4 h-4" /> Editar
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="px-3 rounded-xl border border-slate-100 text-red-500 hover:bg-red-50 hover:text-red-600 h-10"
                  onClick={() => handleDelete(raffle._id)}
                  disabled={deletingId === raffle._id}
                >
                  {deletingId === raffle._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
