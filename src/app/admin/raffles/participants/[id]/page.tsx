
"use client";

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, User, Phone, Ticket, Search, Loader2, Calendar, Fingerprint, RefreshCcw, Download } from 'lucide-react';
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
    (p.dni && p.dni.toString().includes(search)) ||
    (p.phone && p.phone.toString().includes(search))
  ) || [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Participantes...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
          <ChevronLeft className="w-5 h-5 mr-1" /> Panel Admin
        </Link>
        <div className="flex gap-3">
           <Button variant="outline" size="sm" onClick={loadParticipants} disabled={refreshing} className="rounded-xl border-slate-200">
             <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar
           </Button>
           <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
             <Download className="w-4 h-4 mr-2" /> Exportar CSV
           </Button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Users className="w-40 h-40 text-slate-900" />
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-headline font-bold text-slate-900 mb-4">{raffle.name}</h1>
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="bg-primary/5 px-8 py-4 rounded-3xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Chances Vendidas</p>
              <p className="font-black text-slate-900 text-3xl">{raffle.soldTickets}</p>
            </div>
            <div className="bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Compradores</p>
              <p className="font-black text-slate-900 text-3xl">{raffle.participants?.length || 0}</p>
            </div>
            <div className="bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Disponibles</p>
              <p className="font-black text-slate-900 text-3xl">{Math.max(0, raffle.maxTickets - raffle.soldTickets)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <Input 
          className="pl-16 h-16 bg-white rounded-[1.5rem] border-slate-200 text-lg shadow-sm focus:shadow-xl transition-all" 
          placeholder="Buscar por Nombre, Email, DNI o WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Participante</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identificación</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contacto</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Qty</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Números Asignados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold italic">
                    No se encontraron participantes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mt-1">
                            <Mail className="w-3.5 h-3.5 text-primary" /> {p.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3 text-slate-700 font-black font-mono">
                        <Fingerprint className="w-5 h-5 text-primary/40" />
                        {p.dni || '---'}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Phone className="w-4 h-4 text-green-500" />
                          {p.phone}
                        </div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                          {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'Fecha N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-sm font-black border border-primary/10">
                        {p.tickets?.length || 0}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                        {p.tickets?.map((t: string, ti: number) => (
                          <span key={ti} className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-md font-black font-mono shadow-sm hover:scale-110 transition-transform">
                            {t}
                          </span>
                        )) || 'Sin números'}
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
