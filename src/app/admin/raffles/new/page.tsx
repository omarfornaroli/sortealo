
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewRafflePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    ticketPrice: 500,
    maxTickets: 1000,
    drawDate: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({ title: 'Sorteo Creado', description: 'El sorteo ha sido publicado con éxito.' });
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error('Error al crear');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo crear el sorteo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 group transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al panel
      </Link>
      
      <Card className="border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-8 text-center border-b border-slate-100">
          <CardTitle className="text-3xl font-headline font-bold">Crear Nuevo Sorteo</CardTitle>
          <p className="text-slate-500">Configura los detalles del próximo gran premio.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Sorteo</label>
              <Input
                placeholder="Ej: Tesla Model 3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Precio Ticket ($)</label>
                <Input
                  type="number"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Límite Tickets</label>
                <Input
                  type="number"
                  value={formData.maxTickets}
                  onChange={(e) => setFormData({...formData, maxTickets: Number(e.target.value)})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha del Sorteo</label>
              <Input
                type="datetime-local"
                value={formData.drawDate}
                onChange={(e) => setFormData({...formData, drawDate: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción</label>
              <Textarea
                placeholder="Detalles del premio..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">URL Imagen</label>
              <Input
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Publicando...' : 'Publicar Sorteo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
