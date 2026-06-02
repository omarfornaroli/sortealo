
"use client";

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RAFFLES } from '@/lib/data-mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Ticket, User, Clock, ChevronLeft, CreditCard } from 'lucide-react';
import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const raffle = RAFFLES.find(r => r.id === id) || RAFFLES[0];
  const [quantity, setQuantity] = useState(1);
  const progress = (raffle.soldTickets / raffle.maxTickets) * 100;

  const bundles = [
    { qty: 1, label: "1 Chance", price: raffle.ticketPrice, badge: "" },
    { qty: 5, label: "5 Chances", price: raffle.ticketPrice * 5 * 0.9, badge: "10% OFF" },
    { qty: 10, label: "10 Chances", price: raffle.ticketPrice * 10 * 0.8, badge: "20% OFF" },
    { qty: 20, label: "20 Chances", price: raffle.ticketPrice * 20 * 0.7, badge: "30% OFF" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Prize Info */}
            <div className="space-y-8">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                <Image src={raffle.images[0]} alt={raffle.title} fill className="object-cover" />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1.5 text-sm uppercase">Sorteo Activo</Badge>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-headline font-bold mb-4">{raffle.title}</h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">{raffle.description}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-card border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Clock className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase text-muted-foreground font-bold">Fecha del Sorteo</span>
                      <span className="font-headline font-bold">{new Date(raffle.drawDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="bg-card border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Ticket className="text-primary w-6 h-6" />
                    </div>
                    <div>
                      <span className="block text-xs uppercase text-muted-foreground font-bold">Precio del Número</span>
                      <span className="font-headline font-bold text-xl text-primary">${raffle.ticketPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-accent/20 p-8 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold uppercase text-muted-foreground">Estado de Venta</span>
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-white/5" />
                  <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {raffle.soldTickets.toLocaleString()} vendidos</span>
                    <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> {(raffle.maxTickets - raffle.soldTickets).toLocaleString()} restantes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Purchase Form */}
            <div className="space-y-8">
              <Card className="border-primary/20 bg-card shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-headline font-bold">1. Seleccioná tus chances</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {bundles.map((bundle) => (
                        <button 
                          key={bundle.qty}
                          onClick={() => setQuantity(bundle.qty)}
                          className={`relative p-4 rounded-xl border text-left transition-all group ${quantity === bundle.qty ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-white/5 hover:border-white/20'}`}
                        >
                          {bundle.badge && (
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                              {bundle.badge}
                            </span>
                          )}
                          <div className="text-lg font-bold group-hover:text-primary transition-colors">{bundle.label}</div>
                          <div className="text-sm text-muted-foreground">${Math.round(bundle.price)}</div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2">
                      <Label className="text-xs uppercase text-muted-foreground mb-2 block">Cantidad personalizada</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="bg-accent/20 border-white/5"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-2xl font-headline font-bold">2. Completá tus datos</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input placeholder="Ej: Juan" className="bg-accent/20 border-white/5" />
                      </div>
                      <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input placeholder="Ej: Pérez" className="bg-accent/20 border-white/5" />
                      </div>
                      <div className="space-y-2">
                        <Label>DNI</Label>
                        <Input placeholder="Sin puntos" className="bg-accent/20 border-white/5" />
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono / WhatsApp</Label>
                        <Input placeholder="Con código de área" className="bg-accent/20 border-white/5" />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="Para recibir tus números" className="bg-accent/20 border-white/5" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button className="w-full h-16 bg-primary text-primary-foreground text-xl font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 flex items-center justify-between px-8">
                      <span>PAGAR CON MERCADO PAGO</span>
                      <CreditCard className="w-6 h-6" />
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Transacción 100% segura y auditada.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-accent/10 rounded-2xl p-6 border border-white/5 space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <ShieldCheck className="text-primary w-5 h-5" />
                  Garantía EliteDraw
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tus números se generan instantáneamente tras la confirmación del pago. 
                  Garantizamos la asignación aleatoria y única de cada boleto de 6 dígitos.
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
