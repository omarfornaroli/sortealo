
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditRafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name);
        setDescription(data.description);
        setImageUrl(data.imageUrl);
        setIsFinished(data.isFinished);
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
        body: JSON.stringify({ name, description, imageUrl, isFinished }),
      });

      if (res.ok) {
        toast({ title: 'Sorteo Actualizado', description: 'Los cambios se han guardado con éxito.' });
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar los cambios. Intentá nuevamente.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 group transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al panel administrativo
      </Link>
      
      <Card className="border-slate-200 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-slate-900">Editar Sorteo</CardTitle>
          <p className="text-slate-500 font-medium">Modifica los detalles del premio seleccionado.</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Sorteo</label>
              <Input
                id="name"
                placeholder="Ej: iPhone 15 Pro Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción del Premio</label>
              <Textarea
                id="description"
                placeholder="Detalles del premio, especificaciones y condiciones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all min-h-[150px] font-medium leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-xs font-bold uppercase tracking-wider text-slate-500">URL de la Imagen (Resolución sugerida: 1200x800)</label>
              <Input
                id="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all font-medium"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input 
                type="checkbox" 
                id="isFinished" 
                checked={isFinished} 
                onChange={(e) => setIsFinished(e.target.checked)}
                className="w-5 h-5 rounded-md border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isFinished" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Marcar como finalizado</label>
            </div>
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
