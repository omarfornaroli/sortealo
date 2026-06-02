
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Loader2, Calendar, DollarSign, Ticket } from 'lucide-react';
import Link from 'next/link';

export default function EditRafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFinished: false,
    ticketPrice: 0,
    maxTickets: 0,
    drawDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          isFinished: data.isFinished,
          ticketPrice: data.ticketPrice || 0,
          maxTickets: data.maxTickets || 0,
          drawDate: data.drawDate ? new Date(data.drawDate).toISOString().slice(0, 16) : '',
        });
        setLoading(false);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'No se pudo cargar el sorteo.', variant: 'destructive' });
        router.push('/admin');
      });
  }, [id, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/raffles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({ title: 'Actualizado', description: 'Los cambios se guardaron con éxito.' });
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Volver al Dashboard
      </Link>
      
      <Card className="border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
          <CardTitle className="text-3xl font-headline font-bold">Configurar Sorteo</CardTitle>
          <p className="text-slate-500">Edita los parámetros de participación y premio.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Sorteo</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Precio Ticket ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    className="pl-9"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Límite de Tickets</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    className="pl-9"
                    value={formData.maxTickets}
                    onChange={(e) => setFormData({...formData, maxTickets: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha y Hora de Cierre</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="datetime-local"
                  className="pl-9"
                  value={formData.drawDate}
                  onChange={(e) => setFormData({...formData, drawDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción Detallada</label>
              <Textarea
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagen del Premio (URL)</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                required
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input 
                type="checkbox" 
                id="isFinished" 
                checked={formData.isFinished} 
                onChange={(e) => setFormData({...formData, isFinished: e.target.checked})}
                className="w-5 h-5"
              />
              <label htmlFor="isFinished" className="text-sm font-bold text-slate-700">Cerrar sorteo manualmente</label>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg" disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
