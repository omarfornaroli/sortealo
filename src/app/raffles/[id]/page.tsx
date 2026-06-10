
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Ticket, User, Clock, ChevronLeft, CreditCard, Loader2, CheckCircle2, Store, AlertCircle } from 'lucide-react';
import { useState, useEffect, use, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function RaffleContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const sellerCode = searchParams.get('ref');
  
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myTickets, setMyTickets] = useState<string[]>([]);
  const [formattedDrawDate, setFormattedDrawDate] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    phone: '',
    email: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setRaffle(data);
        setLoading(false);
        if (data.drawDate) {
          const dDate = new Date(data.drawDate);
          setFormattedDrawDate(dDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
          
          // Verificar si ya caducó
          if (dDate < new Date()) {
            setIsExpired(true);
          }
        }
      })
      .catch(() => {
        toast({ title: 'Error', description: 'No se pudo cargar el sorteo.', variant: 'destructive' });
        setLoading(false);
      });
  }, [id, toast]);

  const handleTestPurchase = async () => {
    if (isExpired) return;
    if (!formData.name || !formData.dni || !formData.email || !formData.phone) {
      toast({ title: 'Atención', description: 'Por favor completa tus datos.', variant: 'destructive' });
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch(`/api/raffles/${id}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, quantity, sellerCode }),
      });

      const data = await res.json();
      if (data.success) {
        setMyTickets(data.tickets);
        setSuccess(true);
        toast({ title: '¡Suerte!', description: 'Participación registrada con éxito.' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setPurchasing(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return;
    if (!formData.name || !formData.dni || !formData.email || !formData.phone) {
      toast({ title: 'Atención', description: 'Por favor completa tus datos.', variant: 'destructive' });
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: id,
          raffleName: raffle.name,
          unitPrice: raffle.ticketPrice * quantity,
          quantity: 1,
          user: { ...formData, sellerCode }
        }),
      });

      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.message || 'Error al generar el pago');
      }
    } catch (error: any) {
      toast({ title: 'Error de Pago', description: error.message, variant: 'destructive' });
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-24">
          <Card className="max-w-lg w-full rounded-[3rem] border-primary/20 shadow-2xl p-10 text-center space-y-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-headline font-bold text-slate-900">¡Confirmado!</h2>
              <p className="text-slate-500">Ya estás participando en <strong>{raffle.name}</strong>.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-wrap justify-center gap-3">
              {myTickets.map((t, i) => (
                <span key={i} className="bg-white border-2 border-primary/20 text-primary px-4 py-2 rounded-xl font-black font-mono text-xl shadow-sm">
                  {t}
                </span>
              ))}
            </div>
            <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver al inicio
          </Link>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
                {raffle.imageUrl && <Image src={raffle.imageUrl} alt={raffle.name} fill className="object-cover" priority />}
                {isExpired && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Badge className="bg-red-600 text-white text-2xl font-black px-10 py-4 rounded-2xl shadow-2xl">
                      SORTEO FINALIZADO
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-6 text-slate-900 leading-tight">{raffle.name}</h1>
                <p className="text-slate-500 text-xl font-medium">{raffle.description}</p>
                <div className="grid sm:grid-cols-2 gap-6 mt-8">
                  <div className={`p-8 rounded-[2rem] border ${isExpired ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`block text-[10px] uppercase font-black mb-1 tracking-widest ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>Sorteó el</span>
                    <span className={`font-headline font-bold text-xl ${isExpired ? 'text-red-900' : 'text-slate-900'}`}>{formattedDrawDate || 'Próximamente'}</span>
                  </div>
                  <div className="bg-slate-900 text-white p-8 rounded-[2rem]">
                    <span className="block text-[10px] uppercase text-slate-500 font-black mb-1 tracking-widest">Valor Chance</span>
                    <span className="font-headline font-bold text-3xl text-primary">${raffle.ticketPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {isExpired ? (
                <div className="bg-red-50 border-2 border-red-100 p-10 rounded-[3rem] text-center space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-red-900">Participación Cerrada</h3>
                  <p className="text-red-700 font-medium">
                    Lo sentimos, la fecha límite para adquirir tickets en este sorteo ha pasado. 
                    ¡Mira nuestros otros sorteos activos en la página principal!
                  </p>
                  <Button asChild className="w-full h-16 rounded-2xl text-lg font-bold bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200">
                    <Link href="/#raffles">Ver Sorteos Activos</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {sellerCode && (
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                      <Store className="text-primary w-5 h-5" />
                      <p className="text-sm font-bold text-primary">Compra asistida por un vendedor oficial</p>
                    </div>
                  )}

                  <Card className="rounded-[3rem] border-slate-100 bg-white shadow-2xl p-10">
                    <form onSubmit={handlePayment} className="space-y-6">
                      <h3 className="text-3xl font-headline font-bold text-slate-900 mb-6">Completa tus datos</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-slate-400">Cantidad de chances</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 5, 10, 20].map(q => (
                              <button 
                                key={q}
                                type="button"
                                onClick={() => setQuantity(q)}
                                className={`h-14 rounded-xl border-2 font-bold transition-all ${quantity === q ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-slate-400">Nombre Completo</Label>
                          <Input 
                            placeholder="Juan Pérez" 
                            className="h-14 bg-slate-50 rounded-xl" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400">DNI</Label>
                            <Input 
                              placeholder="Número de DNI" 
                              className="h-14 bg-slate-50 rounded-xl" 
                              value={formData.dni}
                              onChange={(e) => setFormData({...formData, dni: e.target.value})}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400">WhatsApp</Label>
                            <Input 
                              placeholder="Cod. Área + Número" 
                              className="h-14 bg-slate-50 rounded-xl" 
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-slate-400">Email</Label>
                          <Input 
                            type="email"
                            placeholder="tu@email.com" 
                            className="h-14 bg-slate-50 rounded-xl" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-6 space-y-4">
                        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl text-white mb-4">
                          <span className="font-bold">Total a pagar:</span>
                          <span className="text-3xl font-black text-primary">${raffle.ticketPrice * quantity}</span>
                        </div>

                        <Button 
                          type="submit"
                          disabled={purchasing}
                          className="w-full h-20 bg-[#009EE3] hover:bg-[#0081B9] text-white text-xl font-black rounded-2xl"
                        >
                          {purchasing ? <Loader2 className="animate-spin w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                          PAGAR CON MERCADO PAGO
                        </Button>

                        <Button 
                          type="button"
                          variant="outline"
                          onClick={handleTestPurchase}
                          disabled={purchasing}
                          className="w-full h-14 border-dashed border-primary text-primary rounded-xl font-bold"
                        >
                          PRUEBA: COMPRA DIRECTA
                        </Button>
                      </div>
                    </form>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>}>
      <RaffleContent id={id} />
    </Suspense>
  );
}
