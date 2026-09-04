
'use client';

import { useState, useEffect, use } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ChevronLeft, Loader2, Sparkles, User, Ticket, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import SponsorCards from '@/components/admin/SponsorCards';
import { useRouter } from 'next/navigation';


export default function DrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [raffle, setRaffle] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  // Holds winners for each prize (multiple prizes support)
  const [prizeWinners, setPrizeWinners] = useState<Array<{ email: string; name: string; ticket: string; phone?: string; ticketCount?: number; tickets?: string[] }>>([]);
  const [showContact, setShowContact] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const router = useRouter();

  // Simple carousel for prize images
  function PrizeCarousel({ prizes }: { prizes: Array<{ imageUrl?: string; title?: string }> }) {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
      if (!prizes || prizes.length === 0) return;
      const interval = setInterval(() => {
        setCurrent(prev => (prev + 1) % prizes.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [prizes]);

    if (!prizes || prizes.length === 0) return null;
    const prize = prizes[current];
    return (
      <img
        src={prize.imageUrl ?? '/images/placeholder.png'}
        alt={prize.title ?? `Premio ${current + 1}`}
        className="w-full h-full object-cover"
      />
    );
  }

  const fetchRaffle = async () => {
    try {
      const res = await apiFetch(`/api/raffles/${id}`);
      const data = await res.json();
      setRaffle(data);
      if (data.isFinished && data.prizeWinners && data.prizeWinners.length > 0) {
        setPrizeWinners(data.prizeWinners);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo cargar la información del sorteo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async (formData?: any) => {
    try {
      if (formData) {
        const token = localStorage.getItem('adminToken');
        await apiFetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData),
        });
      }
      const res = await apiFetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo cargar la configuración.', variant: 'destructive' });
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffle();
    fetchSettings();
  }, [id]);

  const handleDraw = async () => {
    setDrawing(true);
    // Animación dramática
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const res = await apiFetch(`/api/raffles/${id}/draw`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setPrizeWinners(data.prizeWinners || []);
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
    <div className="mx-auto py-10 px-2">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al panel administrativo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8">
        {/* Left Sponsor Panel */}
        <section className="hidden md:block">
          {settings && settings.sponsors && settings.sponsors.length > 0 && (
            <SponsorCards sponsors={settings.sponsors} interval={settings.sponsorRotationInterval} position="left" />
          )}
        </section>

        {/* Center Main Raffle Card */}
        <section className="col-span-1 md:col-span-1">
          <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-lg">
            {prizeWinners && prizeWinners.length > 0 ? null : (
              <div className="p-6 bg-slate-100 rounded-2xl">
                <h3 className="text-2xl font-bold">{raffle.name}</h3>
                <p className="text-sm opacity-80 flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" /> {participantCount} participantes registrados
                </p>
              </div>
            )}
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Estado</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black ${raffle.isFinished ? 'bg-slate-200 text-slate-600' : 'bg-green-500 text-white shadow-md shadow-green-200'}`}>
                  {raffle.isFinished ? 'SORTEO FINALIZADO' : 'ACEPTANDO PARTICIPACIONES'}
                </span>
              </div>
              {/* Winners list for multiple prizes */}
              {prizeWinners && prizeWinners.length > 0 ? (
                <div className="space-y-6">
                  {prizeWinners.map((w, idx) => (
                    <div key={idx} className="p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl text-center animate-in zoom-in-95 duration-300">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-1">
                        {raffle.prizes && raffle.prizes[idx] ? raffle.prizes[idx].title : `Premio ${idx + 1}`}
                      </h4>
                      <p className="text-primary font-black text-lg truncate px-2">{w.name}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Ticket:</span>
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg font-mono font-black text-sm">{w.ticket}</span>
                      </div>
                      {(() => {
                        const participant = raffle.participants?.find((p: any) => p.email === w.email);
                        const tickets = participant?.tickets || [];
                        return (
                          <>
                            <div className="mt-1 text-sm text-slate-600">Compró <span className="font-bold">{tickets.length}</span> tickets</div>
                            {tickets.length > 0 && (
                              <div className="mt-1 text-sm text-slate-600">Tickets: {tickets.join(', ')}</div>
                            )}
                          </>
                        );
                      })()}
                      <Button variant="link" className="mt-2" onClick={() => setShowContact(prev => ({ ...prev, [idx]: !prev[idx] }))}>
                        {showContact[idx] ? 'Ocultar contacto' : 'Ver contacto'}
                      </Button>
                      {showContact[idx] && (
                        <div className="mt-2 text-sm text-slate-700">
                          <p>Email: {w.email}</p>
                          {w.phone && <p>WhatsApp: {w.phone}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
              {/* Draw controls */}
              {!raffle.isFinished ? (
                <div className="space-y-6">
                  <p className="text-slate-500 text-sm leading-relaxed px-4">
                    Se seleccionará un ganador al azar de forma irreversible. Asegúrate de tener todos los participantes cargados.
                  </p>
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
            </CardContent>
          </Card>
        </section>

        {/* Right Sponsor Panel */}
        <section className="hidden md:block">
          {settings && settings.sponsors && settings.sponsors.length > 0 && (
            <SponsorCards sponsors={settings.sponsors} interval={settings.sponsorRotationInterval} position="right" />
          )}
        </section>
      </div>

      {/* Bottom Sponsor Panel */}
      <div className="mt-12 hidden md:block">
        {settings && settings.sponsors && settings.sponsors.length > 0 && (
          <SponsorCards sponsors={settings.sponsors} interval={settings.sponsorRotationInterval} position="bottom" />
        )}
      </div>

      <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none -z-10">
        <Trophy className="w-60 h-60 text-slate-900" />
      </div>
    </div>
  );
}
