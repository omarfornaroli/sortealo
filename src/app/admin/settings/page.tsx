
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save, Loader2, Upload, ImageIcon, Layout, Users, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function SiteSettingsPage() {
  const [heroImage, setHeroImage] = useState('');
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSponsor, setUploadingSponsor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setHeroImage(data.heroBackgroundImageUrl);
        setSponsors(data.sponsors || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: 'Error', description: 'No se pudieron cargar los ajustes.', variant: 'destructive' });
        setLoading(false);
      });
  }, [toast]);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setHeroImage(data.url);
        toast({ title: 'Imagen cargada', description: 'El fondo del sitio ha sido actualizado temporalmente.' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: 'Error de carga', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSponsorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSponsor(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSponsors(prev => [...prev, data.url]);
        toast({ title: 'Sponsor añadido', description: 'El logo se ha cargado correctamente.' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: 'Error de carga', description: 'No se pudo subir el logo.', variant: 'destructive' });
    } finally {
      setUploadingSponsor(false);
    }
  };

  const removeSponsor = (index: number) => {
    setSponsors(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          heroBackgroundImageUrl: heroImage,
          sponsors: sponsors
        }),
      });

      if (res.ok) {
        toast({ title: 'Ajustes guardados', description: 'La configuración del sitio se actualizó correctamente.' });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-6 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary mb-10 uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-5xl font-headline font-bold text-slate-900">Ajustes del Sitio</h1>
        <p className="text-slate-500 text-lg mt-2">Configura la apariencia global y patrocinadores de la plataforma.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Layout className="w-6 h-6 text-primary" /> Estética del Home
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Imagen de Fondo Principal (Hero)</label>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 bg-slate-50 transition-colors hover:bg-slate-100 relative group">
                {heroImage ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
                    <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />} 
                        Cambiar Imagen
                        <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4 py-10">
                    <div className="p-6 bg-primary/10 rounded-full text-primary">
                      {uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <ImageIcon className="w-10 h-10" />}
                    </div>
                    <p className="font-bold text-slate-700">Subir Imagen de Fondo</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" /> Sponsors y Patrocinadores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {sponsors.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-center overflow-hidden">
                  <img src={url} alt={`Sponsor ${i}`} className="max-w-full max-h-full object-contain" />
                  <button 
                    type="button"
                    onClick={() => removeSponsor(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                {uploadingSponsor ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">Nuevo Logo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleSponsorUpload} disabled={uploadingSponsor} />
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95" disabled={saving || uploading || uploadingSponsor}>
          {saving ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Save className="w-6 h-6 mr-2" />}
          {saving ? 'Guardando Ajustes...' : 'Guardar Configuración Global'}
        </Button>
      </form>
    </div>
  );
}
