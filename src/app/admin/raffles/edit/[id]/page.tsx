
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, Save, Loader2, Calendar, DollarSign, Ticket, Upload, Star, Image as ImageIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditRafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isFinished: false,
    isFeatured: false,
    ticketPrice: 0,
    maxTickets: 0,
    drawDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.replace('/auth/login');
      return;
    }

    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          isFinished: data.isFinished,
          isFeatured: data.isFeatured || false,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast({ title: 'Imagen actualizada', description: 'La imagen del premio se subió correctamente.' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: 'Error de carga', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/raffles/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
          <p className="text-slate-500">Edita la información específica del sorteo y su premio.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 uppercase tracking-tighter text-sm">Información Básica</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Sorteo</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Precio Ticket ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      className="pl-9 h-12 rounded-xl"
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
                      className="pl-9 h-12 rounded-xl"
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
                    className="pl-9 h-12 rounded-xl"
                    value={formData.drawDate}
                    onChange={(e) => setFormData({...formData, drawDate: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 uppercase tracking-tighter text-sm">Imagen del Premio</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 transition-colors hover:bg-slate-100 relative group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
                        Cambiar Imagen Principal
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h3 className="font-bold text-primary uppercase tracking-tighter text-sm">Estado Destacado</h3>
                </div>
                <Checkbox 
                  id="isFeatured" 
                  checked={formData.isFeatured} 
                  onCheckedChange={(checked) => setFormData({...formData, isFeatured: !!checked})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción Detallada</label>
              <Textarea
                className="min-h-[120px] rounded-xl"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <Checkbox 
                id="isFinished" 
                checked={formData.isFinished} 
                onCheckedChange={(checked) => setFormData({...formData, isFinished: !!checked})}
              />
              <label htmlFor="isFinished" className="text-sm font-bold text-slate-700">Cerrar sorteo manualmente</label>
            </div>

            <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95" disabled={saving || uploading}>
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
