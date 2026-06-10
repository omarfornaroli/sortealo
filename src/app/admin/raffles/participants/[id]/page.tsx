
"use client";

import { useState, useEffect, use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Mail, 
  User, 
  Phone, 
  Search, 
  Loader2, 
  Calendar, 
  Fingerprint, 
  RefreshCcw, 
  Download,
  Users,
  Store
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const loadParticipants = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/raffles/${id}`);
      if (!res.ok) throw new Error('No se pudo cargar el sorteo');
      const data = await res.json();
      setRaffle(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Error al actualizar lista.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [id]);

  const filteredParticipants = raffle?.participants?.filter((p: any) => 
    p.email.toLowerCase().includes(search.toLowerCase()) || 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sellerName && p.sellerName.toLowerCase().includes(search.toLowerCase())) ||
    (p.dni && p.dni.toString().includes(search))
  ) || [];

  const handleExportCSV = () => {
    if (!raffle?.participants?.length) return;
    const headers = ["Nombre", "Email", "DNI", "Telefono", "Tickets", "Vendedor", "Fecha"];
    const rows = raffle.participants.map((p: any) => [
      `"${p.name}"`, `"${p.email}"`, `"${p.dni}"`, `"${p.phone}"`, `"${p.tickets?.join('|')}"`, `"${p.sellerName || 'General'}"`, `"${new Date(p.purchaseDate).toLocaleDateString()}"`
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participantes_${raffle.name}.csv`;
    link.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-10">
        <Link href="/admin" className="text-sm font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" /> Panel Admin
        </Link>
        <div className="flex gap-3">
           <Button variant="outline" onClick={loadParticipants} disabled={refreshing} className="rounded-xl font-bold">
             <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar
           </Button>
           <Button onClick={handleExportCSV} className="rounded-xl font-bold shadow-lg shadow-primary/10">
             <Download className="w-4 h-4 mr-2" /> Exportar CSV
           </Button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-10 relative overflow-hidden">
        <div className="relative z-10">
          <Badge className="bg-primary/10 text-primary mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase">
            Registro de Ventas
          </Badge>
          <h1 className="text-5xl font-headline font-bold text-slate-900 mb-2">{raffle.name}</h1>
          <p className="text-slate-500 text-lg">Control de tickets y asignación de vendedores.</p>
          
          <div className="flex flex-wrap gap-6 mt-10">
            <div className="bg-primary/5 px-8 py-5 rounded-[2rem] border border-primary/10 min-w-[200px]">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Ventas Totales</p>
              <p className="font-black text-slate-900 text-4xl">{raffle.soldTickets}</p>
            </div>
            <div className="bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 min-w-[200px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compradores</p>
              <p className="font-black text-slate-900 text-4xl">{raffle.participants?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <Input 
          className="pl-16 h-16 bg-white rounded-[1.5rem] border-slate-200 text-lg shadow-sm" 
          placeholder="Buscar por Nombre, DNI, Email o Vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Participante</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Identificación</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tickets</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest text-slate-400">Números</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr><td colSpan={5} className="px-10 py-24 text-center text-slate-400 italic font-bold">No hay registros para mostrar.</td></tr>
              ) : (
                filteredParticipants.map((p: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-none mb-1">{p.name}</p>
                          <p className="text-xs text-slate-400 font-bold">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-700 font-bold font-mono">DNI: {p.dni}</span>
                        <span className="text-xs text-slate-400">WSP: {p.phone}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2">
                        <Badge variant={p.sellerName === 'Venta General' ? 'outline' : 'default'} className="rounded-lg px-3 py-1 font-bold">
                          <Store className="w-3 h-3 mr-1.5" />
                          {p.sellerName || 'Venta General'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-sm font-black">
                        {p.tickets?.length || 0}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {p.tickets?.map((t: string, ti: number) => (
                          <span key={ti} className="text-[10px] bg-white border border-primary/20 text-primary px-2 py-1 rounded-lg font-black font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
