'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, Save, Loader2, Upload, ImageIcon, Layout, Users, Trash2, Plus, Type, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SiteSettingsPage() {
  const [formData, setFormData] = useState({
    siteName: '',
    heroBackgroundImageUrl: '',
    heroBadgeText: '',
    heroTitle: '',
    heroDescription: '',
    heroButtonText: '',
    sponsorsTitle: '',
    sponsors: [] as string[],
    activeRafflesTitle: '',
    activeRafflesSubtitle: '',
    footerDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSponsor, setUploadingSponsor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setFormData({
          siteName: data.siteName || '',
          heroBackgroundImageUrl: data.heroBackgroundImageUrl || '',
          heroBadgeText: data.heroBadgeText || '',
          heroTitle: data.heroTitle || '',
          heroDescription: data.heroDescription || '',
          heroButtonText: data.heroButtonText || '',
          sponsorsTitle: data.sponsorsTitle || '',
          sponsors: data.sponsors || [],
          activeRafflesTitle: data.activeRafflesTitle || '',
          activeRafflesSubtitle: data.activeRafflesSubtitle || '',
          footerDescription: data.footerDescription || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          contactAddress: data.contactAddress || '',
        });
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
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, heroBackgroundImageUrl: data.url }));
        toast({ title: 'Imagen cargada', description: 'Recuerda guardar para aplicar los cambios.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Fallo al subir imagen', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSponsorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSponsor(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, sponsors: [...prev.sponsors, data.url] }));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Fallo al subir logo', variant: 'destructive' });
    } finally {
      setUploadingSponsor(false);
    }
  };

  const removeSponsor = (index: number) => {
    setFormData(prev => ({ ...prev, sponsors: prev.sponsors.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ title: 'Éxito', description: 'Configuración actualizada correctamente.' });
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
    <div className="container mx-auto py-12 px-6 max-w-5xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary mb-10 uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="text-5xl font-headline font-bold text-slate-900">Ajustes del Sitio</h1>
        <p className="text-slate-500 text-lg mt-2">Personaliza todos los textos e imágenes globales de tu plataforma.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* HERO SECTION */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Layout className="w-6 h-6 text-primary" /> Sección Hero (Principal)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Fondo de Pantalla Principal</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50 relative group">
                {formData.heroBackgroundImageUrl ? (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                    <img src={formData.heroBackgroundImageUrl} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Cambiar Imagen
                        <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-4 py-8">
                    <ImageIcon className="w-10 h-10 text-slate-300" />
                    <p className="font-bold text-slate-700">Subir Fondo</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Texto del Badge (Badge Text)</label>
                <Input value={formData.heroBadgeText} onChange={e => setFormData({...formData, heroBadgeText: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Texto del Botón</label>
                <Input value={formData.heroButtonText} onChange={e => setFormData({...formData, heroButtonText: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Título Principal (H1)</label>
              <Input value={formData.heroTitle} onChange={e => setFormData({...formData, heroTitle: e.target.value})} className="h-14 text-xl font-bold rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Descripción del Hero</label>
              <Textarea value={formData.heroDescription} onChange={e => setFormData({...formData, heroDescription: e.target.value})} className="min-h-[100px] rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* SORTEOS SECTION */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Type className="w-6 h-6 text-primary" /> Sección Sorteos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Título de la Sección</label>
              <Input value={formData.activeRafflesTitle} onChange={e => setFormData({...formData, activeRafflesTitle: e.target.value})} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Subtítulo explicativo</label>
              <Textarea value={formData.activeRafflesSubtitle} onChange={e => setFormData({...formData, activeRafflesSubtitle: e.target.value})} className="min-h-[80px] rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* SPONSORS SECTION */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" /> Patrocinadores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Título de Sponsors</label>
              <Input value={formData.sponsorsTitle} onChange={e => setFormData({...formData, sponsorsTitle: e.target.value})} className="h-12 rounded-xl" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {formData.sponsors.map((url, i) => (
                <div key={i} className="relative group aspect-square rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-center">
                  <img src={url} alt="Sponsor" className="max-w-full max-h-full object-contain" />
                  <button type="button" onClick={() => removeSponsor(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                {uploadingSponsor ? <Loader2 className="animate-spin text-primary" /> : <Plus className="text-slate-400" />}
                <span className="text-[10px] font-black text-slate-400 uppercase">Añadir Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleSponsorUpload} />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* FOOTER & CONTACT */}
        <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Phone className="w-6 h-6 text-primary" /> Footer y Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Descripción del Footer</label>
              <Textarea value={formData.footerDescription} onChange={e => setFormData({...formData, footerDescription: e.target.value})} className="min-h-[100px] rounded-xl" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                <Input value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Teléfono</label>
                <Input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Dirección</label>
                <Input value={formData.contactAddress} onChange={e => setFormData({...formData, contactAddress: e.target.value})} className="h-12 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-8 z-50">
          <Button type="submit" className="w-full h-20 text-xl font-black rounded-2xl shadow-2xl bg-primary hover:bg-primary/90" disabled={saving}>
            {saving ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
            {saving ? 'GUARDANDO AJUSTES...' : 'GUARDAR TODA LA CONFIGURACIÓN'}
          </Button>
        </div>
      </form>
    </div>
  );
}
