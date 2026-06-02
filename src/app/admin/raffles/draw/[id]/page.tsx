
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

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setRaffle(data);
        if (data.isFinished && data.winnerEmail) {
          setWinner({ email: data.winnerEmail, ticket: data.winnerTicket });
        }
        setLoading(false);
      });
  }, [id]);

  const handleDraw = async () => {
    setDrawing(true);
    // Simulamos una animación de sorteo
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const res = await fetch(`/api/raffles/${id}/draw`, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setWinner({ email: data.winnerEmail, ticket: data.winnerTicket });
        toast({ title: '¡Sorteo finalizado!', description: `El ganador es ${data.winnerEmail}` });
        router.refresh();
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Ocurrió un error al ejecutar el sorteo.', variant: 'destructive' });
    } finally {
      setDrawing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al panel administrativo
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-slate-900 mb-4">Ejecutar Sorteo</h1>
        <p className="text-slate-500 text-lg">Selección transparente del ganador para {raffle.name}.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Raffle Info */}
        <Card className="rounded-[2rem] border-slate-200 overflow-hidden">
          <div className="aspect-video relative">
            <img src={raffle.imageUrl} alt={raffle.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold">{raffle.name}</h3>
              <p className="text-sm opacity-80">{raffle.participants.length} participantes registrados</p>
            </div>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-sm font-bold text-slate-500 uppercase">Estado</span>
              <span className={`px-4 py-1 rounded-full text-xs font-bold ${raffle.isFinished ? 'bg-slate-200 text-slate-600' : 'bg-green-500 text-white'}`}>
                {raffle.isFinished ? 'FINALIZADO' : 'ACTIVO'}
              </span>
            </div>
            {winner && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Ganador del Sorteo</h4>
                  <p className="text-primary font-black text-xl mt-1">{winner.email}</p>
                  <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Ticket: {winner.ticket}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Panel */}
        <Card className="rounded-[2rem] border-slate-200 p-8 flex flex-col justify-center items-center text-center">
          {!winner ? (
            <div className="space-y-8 w-full">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">¿Todo listo?</h3>
                <p className="text-slate-500">Al presionar el botón se elegirá un participante al azar de los {raffle.participants.length} inscritos.</p>
              </div>

              <Button 
                onClick={handleDraw} 
                disabled={drawing || raffle.participants.length === 0}
                className="w-full h-20 text-2xl font-bold rounded-2xl shadow-2xl shadow-primary/20 gap-3"
              >
                {drawing ? <Loader2 className="animate-spin w-8 h-8" /> : <Trophy className="w-8 h-8" />}
                {drawing ? 'SORTEANDO...' : '¡ELEGIR GANADOR!'}
              </Button>
              
              {raffle.participants.length === 0 && (
                <p className="text-red-500 text-sm font-bold">Necesitas al menos un participante para sortear.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-headline font-bold text-slate-900">Sorteo Realizado</h3>
              <p className="text-slate-500">El sorteo ha concluido exitosamente. El ganador ha sido notificado automáticamente.</p>
              <Button asChild variant="outline" className="w-full h-14 rounded-xl border-slate-200">
                <Link href="/admin">Volver al Panel</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
