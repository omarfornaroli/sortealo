
"use client";

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Mail, 
  User, 
  Phone, 
  Ticket, 
  Search, 
  Loader2, 
  Calendar, 
  Fingerprint, 
  RefreshCcw, 
  Download,
  Users,
  ExternalLink
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
      toast({ title: 'Error', description: 'Error al actualizar lista de participantes.', variant: 'destructive' });
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

  const handleExportCSV = () => {
    if (!raffle?.participants?.length) return;
    
    const headers = ["Nombre", "Email", "DNI", "Telefono", "Tickets", "Fecha Compra"];
    const rows = raffle.participants.map((p: any) => [
      p.name,
      p.email,
      p.dni,
      p.phone,
      p.tickets.join('|'),
      new Date(p.purchaseDate).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `participantes_${raffle.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "CSV Generado", description: "La lista se ha descargado correctamente." });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <Link href="/admin" className="inline-flex items-center text-sm font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest group">
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" /> Panel Administrativo
        </Link>
        <div className="flex gap-3">
           <Button variant="outline" size="sm" onClick={loadParticipants} disabled={refreshing} className="rounded-xl border-slate-200 h-10 px-5 font-bold">
             <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Sincronizar
           </Button>
           <Button variant="default" size="sm" onClick={handleExportCSV} className="rounded-xl h-10 px-5 font-bold shadow-lg shadow-primary/10">
             <Download className="w-4 h-4 mr-2" /> Exportar CSV
           </Button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Users className="w-48 h-48 text-slate-900" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            Detalle de Participación
          </Badge>
          <h1 className="text-5xl font-headline font-bold text-slate-900 mb-2">{raffle.name}</h1>
          <p className="text-slate-500 font-medium text-lg">Control de asignación y verificación de números.</p>
          
          <div className="flex flex-wrap gap-6 mt-10">
            <div className="bg-primary/5 px-8 py-5 rounded-[2rem] border border-primary/10 shadow-sm min-w-[200px]">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Chances Vendidas</p>
              <p className="font-black text-slate-900 text-4xl">{raffle.soldTickets}</p>
            </div>
            <div className="bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm min-w-[200px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Compradores Únicos</p>
              <p className="font-black text-slate-900 text-4xl">{raffle.participants?.length || 0}</p>
            </div>
            <div className="bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm min-w-[200px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Disponibilidad</p>
              <p className="font-black text-slate-900 text-4xl">{Math.max(0, raffle.maxTickets - raffle.soldTickets)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
        <Input 
          className="pl-16 h-16 bg-white rounded-[1.5rem] border-slate-200 text-lg shadow-sm focus:shadow-xl focus:ring-primary/20 transition-all" 
          placeholder="Buscar por Nombre, Email, DNI o WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-2xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Participante</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identificación</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contacto</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Qty</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Números Asignados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <Search className="w-12 h-12 text-slate-200 mx-auto" />
                      <p className="text-slate-400 font-bold italic">No se encontraron participantes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/5 rounded-[1.25rem] flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <User className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl leading-none mb-1.5">{p.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <Mail className="w-3.5 h-3.5 text-primary" /> {p.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3 text-slate-700 font-black font-mono text-lg">
                        <Fingerprint className="w-6 h-6 text-primary/30" />
                        {p.dni || '---'}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-lg border border-green-100 w-fit">
                          <Phone className="w-4 h-4 text-green-500" />
                          {p.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-base font-black border-2 border-slate-800 shadow-lg">
                        {p.tickets?.length || 0}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-wrap gap-2 max-w-[320px]">
                        {p.tickets?.map((t: string, ti: number) => (
                          <span key={ti} className="text-[11px] bg-white border-2 border-primary/10 text-primary px-3 py-1.5 rounded-xl font-black font-mono shadow-sm hover:scale-110 hover:border-primary transition-all cursor-default">
                            {t}
                          </span>
                        )) || '---'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-center space-y-4">
        <h4 className="text-white font-headline text-2xl font-bold">Auditoría y Transparencia</h4>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Esta lista contiene todos los registros inmutables de participación. Cada número asignado es único y está vinculado permanentemente a la identidad del comprador.
        </p>
      </div>
    </div>
  );
}
