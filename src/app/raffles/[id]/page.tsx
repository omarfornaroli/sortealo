
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Ticket, User, Clock, ChevronLeft, CreditCard, Loader2, CheckCircle2, AlertCircle, FlaskConical } from 'lucide-react';
import { useState, useEffect, use, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function RaffleContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myTickets, setMyTickets] = useState<string[]>([]);
  const [formattedDrawDate, setFormattedDrawDate] = useState<string | null>(null);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
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
          setFormattedDrawDate(new Date(data.drawDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }));
        }
      })
      .catch(() => {
        toast({ title: 'Error', description: 'No se pudo cargar el sorteo.', variant: 'destructive' });
        setLoading(false);
      });
  }, [id, toast]);

  // Manejar retorno de Mercado Pago
  useEffect(() => {
    const status = searchParams.get('status');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const qty = searchParams.get('qty');

    if (status === 'success' && name && email && !success && !isProcessingReturn) {
      setIsProcessingReturn(true);
      setFormData({ name, email, phone: phone || '' });
      
      // Registrar la participación después del pago exitoso
      fetch(`/api/raffles/${id}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || '', quantity: parseInt(qty || '1') }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMyTickets(data.tickets);
          setSuccess(true);
          toast({ title: '¡Pago Confirmado!', description: 'Tus números han sido asignados correctamente.' });
        } else {
          toast({ title: 'Error en registro', description: data.message, variant: 'destructive' });
        }
      })
      .catch(() => {
        toast({ title: 'Error crítico', description: 'El pago se realizó pero hubo un error al registrar tus números. Por favor contáctanos.', variant: 'destructive' });
      })
      .finally(() => {
        setIsProcessingReturn(false);
      });
    } else if (status === 'failure') {
      toast({ title: 'Pago Fallido', description: 'No se pudo procesar el pago. Intenta nuevamente.', variant: 'destructive' });
      router.replace(`/raffles/${id}`);
    }
  }, [searchParams, id, success, toast, router, isProcessingReturn]);

  const soldTickets = raffle?.soldTickets || 0;
  const maxTickets = raffle?.maxTickets || 1;
  const progress = (soldTickets / maxTickets) * 100;
  const ticketPrice = raffle?.ticketPrice || 0;

  const getBundlePrice = (qty: number) => {
    if (qty >= 20) return Math.round(ticketPrice * qty * 0.7);
    if (qty >= 10) return Math.round(ticketPrice * qty * 0.8);
    if (qty >= 5) return Math.round(ticketPrice * qty * 0.9);
    return ticketPrice * qty;
  };

  const bundles = [
    { qty: 1, label: "1 Chance", badge: "" },
    { qty: 5, label: "5 Chances", badge: "10% OFF" },
    { qty: 10, label: "10 Chances", badge: "20% OFF" },
    { qty: 20, label: "20 Chances", badge: "30% OFF" },
  ];

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast({ title: 'Atención', description: 'Por favor completa todos tus datos de contacto.', variant: 'destructive' });
      return;
    }

    setPurchasing(true);
    try {
      const totalPrice = getBundlePrice(quantity);
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId: id,
          raffleName: raffle.name,
          unitPrice: totalPrice,
          quantity: 1, // Enviamos como un solo item bundle
          user: formData
        }),
      });

      const data = await res.json();
      if (res.ok && data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error(data.message || 'Error al generar el pago');
      }
    } catch (error: any) {
      toast({ title: 'Error de Pago', description: error.message, variant: 'destructive' });
      setPurchasing(false);
    }
  };

  const handleTestPurchase = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({ title: 'Atención', description: 'Por favor completa tus datos para la prueba.', variant: 'destructive' });
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch(`/api/raffles/${id}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, quantity }),
      });

      const data = await res.json();
      if (data.success) {
        setMyTickets(data.tickets);
        setSuccess(true);
        toast({ title: 'Prueba Exitosa', description: 'Has "comprado" chances en modo test.' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({ title: 'Error Test', description: error.message, variant: 'destructive' });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || isProcessingReturn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
        <p className="text-slate-500 font-bold">{isProcessingReturn ? 'Validando tu pago...' : 'Cargando sorteo...'}</p>
      </div>
    );
  }

  if (!raffle) return <div className="min-h-screen flex items-center justify-center text-slate-500">Sorteo no encontrado</div>;

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
              <h2 className="text-4xl font-headline font-bold">¡Suerte, {formData.name}!</h2>
              <p className="text-slate-500">Tus {myTickets.length} números para <strong>{raffle.name}</strong> han sido registrados.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-wrap justify-center gap-3">
              {myTickets.map((t, i) => (
                <span key={i} className="bg-white border-2 border-primary/20 text-primary px-4 py-2 rounded-xl font-bold font-mono text-xl shadow-sm">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-400">Te enviamos una copia de tus números a {formData.email}.</p>
            <div className="flex flex-col gap-4">
              <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
                <Link href="/">Volver al Inicio</Link>
              </Button>
              <Button variant="ghost" onClick={() => setSuccess(false)} className="text-slate-400">
                Seguir participando
              </Button>
            </div>
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
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary mb-8 group transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
                {raffle.imageUrl && <Image src={raffle.imageUrl} alt={raffle.name} fill className="object-cover" priority />}
                <div className="absolute top-8 left-8">
                  <Badge className="bg-primary text-white font-black px-6 py-2 text-sm uppercase rounded-full shadow-lg border-2 border-white/20">
                    Sorteo en Curso
                  </Badge>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-6xl font-headline font-bold mb-6 text-slate-900 leading-tight">{raffle.name}</h1>
                  <p className="text-slate-500 text-xl leading-relaxed font-medium">{raffle.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Clock className="text-primary w-7 h-7" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Fecha Sorteo</span>
                      <span className="font-headline font-bold text-lg">{formattedDrawDate || '...'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Ticket className="text-primary w-7 h-7" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400 font-black tracking-widest mb-1">Precio Chance</span>
                      <span className="font-headline font-bold text-2xl text-primary">${ticketPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Vendido</span>
                    <span className="text-3xl font-black text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-4 bg-slate-800" />
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 pt-2">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> 
                      {(soldTickets).toLocaleString()} vendidos
                    </span>
                    <span className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" /> 
                      {Math.max(0, (raffle.maxTickets || 0) - soldTickets).toLocaleString()} restantes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <Card className="rounded-[3.5rem] border-slate-100 bg-white shadow-2xl overflow-hidden">
                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-headline font-bold text-slate-900">1. Seleccioná tus chances</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {bundles.map((bundle) => (
                        <button 
                          key={bundle.qty}
                          type="button"
                          onClick={() => setQuantity(bundle.qty)}
                          className={`relative p-6 rounded-3xl border-2 text-left transition-all group ${quantity === bundle.qty ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                        >
                          {bundle.badge && (
                            <span className="absolute -top-3 -right-3 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                              {bundle.badge}
                            </span>
                          )}
                          <div className={`text-xl font-black mb-1 ${quantity === bundle.qty ? 'text-primary' : 'text-slate-900'}`}>{bundle.label}</div>
                          <div className="text-sm font-bold text-slate-400">${getBundlePrice(bundle.qty).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2">
                      <Label className="text-[10px] uppercase font-black text-slate-400 mb-3 block tracking-widest">Cantidad personalizada</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="h-14 bg-slate-50 rounded-2xl border-slate-200 text-lg font-bold text-center"
                      />
                    </div>
                  </div>

                  <form onSubmit={handlePayment} className="space-y-6 pt-10 border-t border-slate-100">
                    <h3 className="text-3xl font-headline font-bold text-slate-900">2. Tus datos de contacto</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500">Nombre Completo</Label>
                        <Input 
                          placeholder="Ej: Juan Pérez" 
                          className="h-14 bg-slate-50 rounded-2xl border-slate-200 font-medium" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500">Teléfono / WhatsApp</Label>
                          <Input 
                            placeholder="Con código de área" 
                            className="h-14 bg-slate-50 rounded-2xl border-slate-200 font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-500">Email</Label>
                          <Input 
                            type="email" 
                            placeholder="Para tus números" 
                            className="h-14 bg-slate-50 rounded-2xl border-slate-200 font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 space-y-4">
                      <Button 
                        type="submit"
                        disabled={purchasing}
                        className="w-full h-20 bg-[#009EE3] text-white text-2xl font-black rounded-3xl hover:bg-[#008AC9] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 transition-all hover:scale-[1.02]"
                      >
                        {purchasing ? <Loader2 className="animate-spin w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
                        {purchasing ? 'GENERANDO PAGO...' : 'PAGAR CON MERCADO PAGO'}
                      </Button>

                      {/* Botón de Test Temporal */}
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleTestPurchase}
                        disabled={purchasing}
                        className="w-full h-14 border-dashed border-primary text-primary hover:bg-primary/5 rounded-2xl font-bold gap-2"
                      >
                        {purchasing ? <Loader2 className="animate-spin w-4 h-4" /> : <FlaskConical className="w-5 h-5" />}
                        TEST: COMPRA DIRECTA (OMITIR PAGO)
                      </Button>

                      <div className="flex items-center justify-center gap-3 mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        Transacción Segura via Mercado Pago
                      </div>
                    </div>
                  </form>
                </div>
              </Card>

              <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-primary w-5 h-5" />
                  </div>
                  Compromiso de Transparencia
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Al completar el pago, nuestro sistema te asignará instantáneamente {quantity} números aleatorios de 6 dígitos. 
                  Garantizamos que cada número es único y no puede ser duplicado por otro participante.
                </p>
              </div>
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
