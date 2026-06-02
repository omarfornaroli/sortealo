'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewRafflePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
        body: JSON.stringify({ name, description, imageUrl }),
      });

      if (res.ok) {
        toast({
          title: 'Sorteo Creado',
          description: 'El nuevo sorteo ha sido publicado con éxito.',
        });
        router.push('/admin');
        router.refresh();
      } else {
        throw new Error('Error al crear el sorteo');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el sorteo. Intentá nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 group">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Volver al panel
      </Link>
      
      <Card className="border-slate-200 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-headline font-bold">Crear Nuevo Sorteo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold">Nombre del Sorteo</label>
              <Input
                id="name"
                placeholder="Ej: iPhone 15 Pro Max"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold">Descripción</label>
              <Textarea
                id="description"
                placeholder="Detalles del premio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-semibold">URL de la Imagen</label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="bg-slate-50 border-slate-200"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar Sorteo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
