
"use client";

import { useState, useEffect, use } from 'react';
import { apiFetch } from '@/lib/api';
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
  Store,
  DollarSign,
  Ticket,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [raffle, setRaffle] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTicket, setFilterTicket] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sellerTableData, setSellerTableData] = useState<{ seller: string; count: unknown }[]>([]);
  const { toast } = useToast();

  const loadParticipants = async () => {
    setRefreshing(true);
    try {
      const res = await apiFetch(`/api/raffles/${id}`);
      if (!res.ok) throw new Error('No se pudo cargar el sorteo');
      const data = await res.json();
      setRaffle(data);

      if (sellers && sellers.length > 0) {
        // Compute ticket counts per seller for the table
        const sellerStats = data?.participants?.reduce((acc: any, p: any) => {
          const key = sellers.find(s => s.code === p.sellerCode)?.name || 'General';
          acc[key] = (acc[key] || 0) + (p.tickets?.length || 0);
          return acc;
        }, {} as Record<string, number>) || {};

        const sellerTableData = Object.entries(sellerStats)
          .filter(([seller]) => !filterSeller || seller === filterSeller)
          .map(([seller, count]) => ({ seller, count }))
          .sort((a, b) => sortOrder === 'asc' ? Number(a.count) - Number(b.count) : Number(b.count) - Number(a.count));
        setSellerTableData(sellerTableData);
      } else {
        setSellerTableData([]);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Error al actualizar lista.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [id, sellers]);

  useEffect(() => {
    const loadSellers = async () => {
      try {
        const res = await apiFetch('/api/sellers');
        if (res.ok) {
          const data = await res.json();
          setSellers(data);
        }
      } catch (e) {
        console.error('Error loading sellers', e);
      }
    };
    loadSellers();
  }, []);

  const filteredParticipants = raffle?.participants?.filter((p: any) => {
    let matches = true;
    if (search) {
      matches = matches && (
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sellerCode && p.sellerCode.toLowerCase().includes(search.toLowerCase())) ||
        (p.dni && p.dni.toString().includes(search))
      );
    }
    if (filterDate) {
      const dateStr = new Date(p.purchaseDate).toISOString().split('T')[0];
      matches = matches && dateStr === filterDate;
    }
    if (filterTicket) {
      matches = matches && p.tickets?.some((t: string) => t.includes(filterTicket));
    }
    if (filterSeller) {
      matches = matches && p.sellerCode === filterSeller;
    }
    return matches;
  }) || [];

  const handleExportCSV = () => {
    if (!raffle?.participants?.length) return;
    const headers = ["Nombre", "Email", "DNI", "Telefono", "Tickets", "Vendedor", "Fecha"];
    const rows = raffle.participants.map((p: any) => [
      `"${p.name}"`, `"${p.email}"`, `"${p.dni}"`, `"${p.phone}"`, `"${p.tickets?.join('|')}"`, `"${p.sellerCode || 'General'}"`, `"${new Date(p.purchaseDate).toLocaleDateString()}"`
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `participantes_${raffle.name}.csv`;
    link.click();
  };

  const optionsStats = (() => {
    if (!raffle) return { optionBreakdown: [], totalRevenue: 0 };

    const participants = raffle.participants || [];
    const options = raffle.ticketOptions && raffle.ticketOptions.length > 0
      ? raffle.ticketOptions
      : null;

    if (options) {
      const breakdown = options.map((opt: any) => ({
        quantity: Number(opt.quantity),
        price: Number(opt.price),
        description: opt.description,
        salesCount: 0,
        ticketsSold: 0,
        revenue: 0,
      }));

      let unmappedSales = 0;
      let unmappedTickets = 0;
      let unmappedRevenue = 0;

      participants.forEach((p: any) => {
        const pQty = p.tickets?.length || 0;
        const matchedIdx = breakdown.findIndex((b: any) => b.quantity === pQty);

        if (matchedIdx !== -1) {
          breakdown[matchedIdx].salesCount += 1;
          breakdown[matchedIdx].ticketsSold += pQty;
          breakdown[matchedIdx].revenue += breakdown[matchedIdx].price;
        } else {
          unmappedSales += 1;
          unmappedTickets += pQty;
          unmappedRevenue += pQty * (Number(raffle.ticketPrice) || 0);
        }
      });

      const totalRevenue = breakdown.reduce((acc: number, item: any) => acc + item.revenue, 0) + unmappedRevenue;

      if (unmappedSales > 0) {
        breakdown.push({
          quantity: 0,
          price: Number(raffle.ticketPrice) || 0,
          description: 'Otros / Precio Base',
          salesCount: unmappedSales,
          ticketsSold: unmappedTickets,
          revenue: unmappedRevenue,
        });
      }

      return { optionBreakdown: breakdown, totalRevenue };
    } else {
      const unitPrice = Number(raffle.ticketPrice) || 0;
      const totalTickets = Number(raffle.soldTickets) || 0;
      const totalRevenue = totalTickets * unitPrice;

      return {
        optionBreakdown: [
          {
            quantity: 1,
            price: unitPrice,
            description: 'Ticket Individual',
            salesCount: participants.length,
            ticketsSold: totalTickets,
            revenue: totalRevenue,
          }
        ],
        totalRevenue
      };
    }
  })();

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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ventas Totales</p>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="font-black text-slate-900 text-4xl">{raffle.soldTickets}</p>
              <p className="text-xs text-slate-400 font-bold mt-2">Tickets asignados</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compradores</p>
                <div className="w-8 h-8 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="font-black text-slate-900 text-4xl">{raffle.participants?.length || 0}</p>
              <p className="text-xs text-slate-400 font-bold mt-2">Registros de compra</p>
            </div>

            <div className="bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Ganancia Total</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="font-black text-emerald-950 text-4xl">
                ${optionsStats.totalRevenue.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-emerald-700 font-bold mt-2">Recaudación estimada</p>
            </div>
          </div>

          {/* Desglose de tickets vendidos por precio configurado */}
          {optionsStats.optionBreakdown.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Ventas por Precios Configurados
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {optionsStats.optionBreakdown.map((opt: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-block bg-primary/10 text-primary font-black text-xs px-3 py-1 rounded-xl uppercase tracking-wider mb-1">
                          {opt.quantity > 0 ? `${opt.quantity} ${opt.quantity === 1 ? 'Ticket' : 'Tickets'}` : 'Personalizado'}
                        </span>
                        {opt.description && (
                          <p className="text-xs text-slate-500 font-bold truncate max-w-[150px]" title={opt.description}>
                            {opt.description}
                          </p>
                        )}
                      </div>
                      <span className="font-black text-slate-900 text-lg">
                        ${opt.price.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-200/60 text-xs">
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Paquetes vendidos:</span>
                        <span className="font-black text-slate-900">{opt.salesCount}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Tickets entregados:</span>
                        <span className="font-black text-primary">{opt.ticketsSold}</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-200/40">
                        <span>Subtotal recaudado:</span>
                        <span className="font-black text-emerald-700">${opt.revenue.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de tickets por vendedor */}
          {sellerTableData.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
                Ventas por Vendedor
              </h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 font-bold text-slate-600 text-xs uppercase">Vendedor</th>
                    <th className="px-4 py-2 flex items-center justify-between font-bold text-slate-600 text-xs uppercase">
                      <span>Tickets Vendidos</span>
                      <button
                        onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                        className="text-xs text-slate-500 font-bold"
                      >
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sellerTableData.map(({ seller, count }) => (
                    <tr key={seller} className="border-t border-slate-200 text-sm">
                      <td className="px-4 py-2 font-semibold text-slate-800">{seller}</td>
                      <td className="px-4 py-2 font-black text-slate-900">{String(count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
      <div className="flex flex-wrap gap-4 mb-8">
        <Input type="date" placeholder="Fecha de compra" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="h-16 rounded-[1.5rem] border-slate-200 text-lg" />
        <Input placeholder="Número de ticket" value={filterTicket} onChange={e => setFilterTicket(e.target.value)} className="h-16 rounded-[1.5rem] border-slate-200 text-lg" />
        <select
          value={filterSeller}
          onChange={e => setFilterSeller(e.target.value)}
          className="h-16 rounded-[1.5rem] border-slate-200 text-lg w-full"
        >
          <option value="">Todos</option>
          {sellers.map((s: any) => (
            <option key={s._id} value={s.name}>{s.name}</option>
          ))}
        </select>
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
                        <Badge variant={p.sellerCode === undefined ? 'outline' : 'default'} className="rounded-lg px-3 py-1 font-bold">
                          <Store className="w-3 h-3 mr-1.5" />
                          {sellers.find((s) => s.code === p.sellerCode)?.name || 'Venta General'}
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
