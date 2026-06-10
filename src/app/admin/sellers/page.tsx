
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ChevronLeft, 
  Loader2, 
  Trash2, 
  Search,
  ExternalLink,
  Select as SelectIcon
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [raffles, setRaffles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [selectedRaffle, setSelectedRaffle] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [sellersRes, rafflesRes] = await Promise.all([
        fetch('/api/sellers'),
        fetch('/api/raffles')
      ]);
      const sellersData = await sellersRes.json();
      const rafflesData = await rafflesRes.json();
      setSellers(sellersData);
      setRaffles(rafflesData.filter((r: any) => !r.isFinished));
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudieron cargar los datos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setName('');
        loadData();
        toast({ title: 'Vendedor creado', description: 'Se ha registrado el nuevo vendedor.' });
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (sellerCode: string) => {
    if (!selectedRaffle) {
      toast({ title: 'Atención', description: 'Primero selecciona un sorteo para generar el link.', variant: 'destructive' });
      return;
    }
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/raffles/${selectedRaffle}?ref=${sellerCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(sellerCode);
    toast({ title: 'Link Copiado', description: 'El enlace de referido está listo.' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando red de ventas...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-6 max-w-6xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary mb-10 uppercase tracking-widest transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Volver al Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-headline font-bold text-slate-900">Gestión de Vendedores</h1>
          <p className="text-slate-500 text-lg mt-2">Crea accesos exclusivos y trackea el rendimiento de tus referidos.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Plus className="w-6 h-6 text-primary" /> Nuevo Vendedor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleCreateSeller} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Nombre del Vendedor</label>
                  <Input 
                    placeholder="Ej: Marcos Pérez" 
                    className="h-14 rounded-2xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full h-14 rounded-2xl font-bold text-lg" disabled={creating}>
                  {creating ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5" />}
                  Registrar Vendedor
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-amber-100 bg-amber-50 p-8 space-y-4">
            <h4 className="font-bold text-amber-900 flex items-center gap-2 uppercase tracking-widest text-xs">
              <SelectIcon className="w-4 h-4" /> Configuración de Link
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              Selecciona un sorteo para generar los enlaces de referido automáticamente para cada vendedor.
            </p>
            <Select onValueChange={setSelectedRaffle} value={selectedRaffle}>
              <SelectTrigger className="w-full h-14 bg-white rounded-xl border-amber-200 text-amber-900 font-bold">
                <SelectValue placeholder="Seleccionar Sorteo Activo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {raffles.map((r: any) => (
                  <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6">
            {sellers.length === 0 ? (
              <div className="py-24 text-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50">
                <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No hay vendedores registrados aún.</p>
              </div>
            ) : (
              sellers.map((seller: any) => (
                <Card key={seller._id} className="rounded-[2rem] border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:bg-primary transition-colors group-hover:text-white">
                        <Users className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 leading-none mb-2">{seller.name}</h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                          Cod: {seller.code}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        onClick={() => copyLink(seller.code)}
                        className={`flex-1 sm:flex-none h-12 rounded-xl border-slate-200 font-bold gap-2 ${copiedId === seller.code ? 'text-green-600 bg-green-50 border-green-200' : 'text-slate-600'}`}
                      >
                        {copiedId === seller.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copiar Enlace
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-red-500 rounded-xl">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
