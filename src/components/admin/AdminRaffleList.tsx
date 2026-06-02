
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Ticket as TicketIcon, Loader2, ExternalLink, Calendar } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {raffles.map((raffle) => (
        <Card key={raffle._id} className="overflow-hidden border-slate-200 bg-white group rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="relative h-56 overflow-hidden bg-slate-100">
            {raffle.imageUrl ? (
              <img 
                src={raffle.imageUrl} 
                alt={raffle.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <TicketIcon className="w-16 h-16" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={`text-[10px] px-4 py-1.5 rounded-full font-bold shadow-lg backdrop-blur-md border ${raffle.isFinished ? 'bg-slate-100/80 text-slate-500 border-slate-200' : 'bg-green-500/90 text-white border-green-400'}`}>
                {raffle.isFinished ? 'FINALIZADO' : 'ACTIVO'}
              </span>
            </div>
          </div>
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold line-clamp-1 text-slate-900 mb-1">{raffle.name}</CardTitle>
            <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] leading-relaxed">
              {raffle.description}
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Users className="w-3 h-3" /> Participantes
                </div>
                <p className="text-lg font-bold text-slate-900">{raffle.participants?.length || 0}</p>
              </div>
              <div className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Calendar className="w-3 h-3" /> Estado
                </div>
                <p className="text-sm font-bold text-slate-900">{raffle.isFinished ? 'Cerrado' : 'Abierto'}</p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1 gap-2 border-slate-200 rounded-xl hover:bg-slate-50 font-bold transition-colors">
                <Link href={`/admin/raffles/edit/${raffle._id}`}>
                  <Edit className="w-4 h-4" /> Editar
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                className="px-4 rounded-xl shadow-lg shadow-red-500/10 transition-transform active:scale-95"
                onClick={() => handleDelete(raffle._id)}
                disabled={deletingId === raffle._id}
              >
                {deletingId === raffle._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
