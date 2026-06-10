
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Loader2, Upload, Star, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function NewRafflePage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    ticketPrice: 500,
    maxTickets: 1000,
    drawDate: '',
    isFeatured: false,
    featuredTitleColor: '#ffffff',
    featuredSubtitleColor: '#cbd5e1',
    featuredBackgroundImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.replace('/auth/login');
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'featuredBackgroundImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [field]: data.url }));
        toast({ title: 'Imagen cargada', description: 'La imagen se subió correctamente.' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: 'Error de carga', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast({ title: 'Atención', description: 'Debes cargar una imagen del premio.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* SECCIÓN 1: DATOS BÁSICOS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 uppercase tracking-tighter text-sm">Información Básica</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre del Sorteo</label>
                <Input
                  placeholder="Ej: Tesla Model 3"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Precio por Chance ($)</label>
                  <Input
                    type="number"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({...formData, ticketPrice: Number(e.target.value)})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Máximo de Tickets</label>
                  <Input
                    type="number"
                    value={formData.maxTickets}
                    onChange={(e) => setFormData({...formData, maxTickets: Number(e.target.value)})}
                    required
                    className="h-12 rounded-xl"
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
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            {/* SECCIÓN 2: IMÁGENES */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800 uppercase tracking-tighter text-sm">Contenido Visual</h3>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagen Principal del Premio</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 transition-colors hover:bg-slate-100 relative group">
                  {formData.imageUrl ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Cambiar Imagen
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="p-4 bg-primary/10 rounded-full text-primary">
                        {uploading === 'imageUrl' ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">Subir Imagen del Premio</p>
                        <p className="text-xs text-slate-500">Aparecerá en las tarjetas y detalles.</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'imageUrl')} disabled={!!uploading} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CONFIGURACIÓN HERO / DESTACADO */}
            <div className="space-y-6 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-amber-900 uppercase tracking-tighter text-sm">Configuración de Hero</h3>
                </div>
                <Checkbox 
                  id="isFeatured" 
                  checked={formData.isFeatured} 
                  onCheckedChange={(checked) => setFormData({...formData, isFeatured: !!checked})}
                />
              </div>
              
              <p className="text-xs text-amber-700 font-medium">Habilita esta opción para que el sorteo aparezca en la parte superior de la página principal.</p>

              {formData.isFeatured && (
                <div className="space-y-6 pt-4 border-t border-amber-200 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Color Título
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={formData.featuredTitleColor}
                          onChange={(e) => setFormData({...formData, featuredTitleColor: e.target.value})}
                          className="w-10 h-10 rounded-lg cursor-pointer border-none"
                        />
                        <span className="text-xs font-mono font-bold text-amber-900/60">{formData.featuredTitleColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Color Subtítulo
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={formData.featuredSubtitleColor}
                          onChange={(e) => setFormData({...formData, featuredSubtitleColor: e.target.value})}
                          className="w-10 h-10 rounded-lg cursor-pointer border-none"
                        />
                        <span className="text-xs font-mono font-bold text-amber-900/60">{formData.featuredSubtitleColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Imagen de Fondo del Hero
                    </label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-amber-200 rounded-xl p-4 bg-white transition-colors hover:bg-amber-50 relative group">
                      {formData.featuredBackgroundImageUrl ? (
                        <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden shadow-sm">
                          <img src={formData.featuredBackgroundImageUrl} alt="Hero BG Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                              <Upload className="w-3 h-3" /> Cambiar Fondo
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'featuredBackgroundImageUrl')} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                          <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                            {uploading === 'featuredBackgroundImageUrl' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          </div>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest text-center">Subir Fondo Especial para Hero</p>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'featuredBackgroundImageUrl')} disabled={!!uploading} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Descripción del Sorteo</label>
              <Textarea
                placeholder="Escribe los detalles y beneficios del premio..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>

            <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95" disabled={loading || !!uploading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {loading ? 'Publicando...' : 'Publicar Sorteo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
