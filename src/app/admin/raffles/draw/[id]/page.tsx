
'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronLeft, Loader2, Sparkles, User, Ticket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [winner, setWinner] = useState<{ email: string, ticket: string } | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchRaffle = async () => {
    try {
      const res = await fetch(`/api/raffles/${id}`);
      const data = await res.json();
      setRaffle(data);
      if (data.isFinished && data.winnerEmail) {
        setWinner({ email: data.winnerEmail, ticket: data.winnerTicket });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo cargar la información del sorteo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffle();
  }, [id]);

  const handleDraw = async () => {
    setDrawing(true);
    // Animación dramática
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await fetch(`/api/raffles/${id}/draw`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setWinner({ email: data.winnerEmail, ticket: data.winnerTicket });
        toast({ title: '¡Sorteo finalizado!', description: `El ganador es ${data.winnerEmail}` });
        // Recargar datos para ver el estado final
        fetchRaffle();
      } else {
        toast({ title: 'Error', description: data.message || 'No se pudo ejecutar el sorteo.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Ocurrió un error al conectar con el servidor.', variant: 'destructive' });
    } finally {
      setDrawing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Preparando bombo...</p>
    </div>
  );

  if (!raffle) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-slate-500 font-bold">Sorteo no encontrado.</p>
      <Button asChild variant="link"><Link href="/admin">Volver al panel</Link></Button>
    </div>
  );

  const participantCount = raffle.participants?.length || 0;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al panel administrativo
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-slate-900 mb-4">Ejecutar Sorteo</h1>
        <p className="text-slate-500 text-lg">Selección transparente del ganador para <span className="text-primary font-bold">{raffle.name}</span>.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-lg">
          <div className="aspect-video relative">
            <img src={raffle.imageUrl} alt={raffle.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold">{raffle.name}</h3>
              <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
                <User className="w-4 h-4" /> {participantCount} participantes registrados
              </p>
            </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Estado</span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black ${raffle.isFinished ? 'bg-slate-200 text-slate-600' : 'bg-green-500 text-white shadow-md shadow-green-200'}`}>
                {raffle.isFinished ? 'SORTEO FINALIZADO' : 'ACEPTANDO PARTICIPACIONES'}
              </span>
            </div>
            
            {winner && (
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-3xl text-center space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">¡Habemus Ganador!</h4>
                  <p className="text-primary font-black text-2xl truncate px-2">{winner.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Ticket Ganador:</span>
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono font-black text-sm">
                      {winner.ticket}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 p-8 flex flex-col justify-center items-center text-center shadow-lg bg-white relative overflow-hidden">
          {!winner ? (
            <div className="space-y-8 w-full relative z-10">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary/40 animate-pulse" />
                </div>
                <h3 className="text-3xl font-headline font-bold text-slate-900">¿Lanzamos los dados?</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4">
                  Se seleccionará un ganador al azar de forma irreversible. Asegúrate de tener todos los participantes cargados.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                    onClick={handleDraw} 
                    disabled={drawing || participantCount === 0 || raffle.isFinished}
                    className="w-full h-24 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/30 gap-4 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {drawing ? <Loader2 className="animate-spin w-8 h-8" /> : <Trophy className="w-8 h-8" />}
                    {drawing ? 'SELECCIONANDO...' : '¡EJECUTAR SORTEO!'}
                </Button>
                
                {participantCount === 0 && (
                    <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                        No hay participantes para sortear.
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Sorteo Completado</h3>
              <p className="text-slate-500 text-sm">
                El proceso ha finalizado correctamente. Los datos del ganador están guardados permanentemente.
              </p>
              <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold">
                <Link href="/admin">Volver al Panel de Control</Link>
              </Button>
            </div>
          )}
          
          {/* Fondo decorativo */}
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
             <Trophy className="w-60 h-60 text-slate-900" />
          </div>
        </Card>
      </div>
    </div>
  );
}
