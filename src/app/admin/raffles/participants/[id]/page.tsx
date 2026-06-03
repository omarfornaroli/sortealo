
'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, User, Phone, Ticket, Search, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/raffles/${id}`)
      .then(res => res.json())
      .then(data => {
        setRaffle(data);
        setLoading(false);
      });
  }, [id]);

  const filteredParticipants = raffle?.participants.filter((p: any) => 
    p.email.toLowerCase().includes(search.toLowerCase()) || 
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">{raffle.name}</h1>
          <p className="text-slate-500">Gestión de compradores y números asignados.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recaudado</p>
            <p className="font-bold text-primary text-xl">${raffle.soldTickets * raffle.ticketPrice}</p>
          </div>
          <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 text-center">
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Chances</p>
            <p className="font-bold text-primary text-xl">{raffle.soldTickets}</p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input 
          className="pl-12 h-14 bg-white rounded-2xl border-slate-200" 
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-xl bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Participante</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Contacto</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Cant.</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Números / Tickets</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((p: any, index: number) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Mail className="w-3 h-3" /> {p.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {p.phone}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-bold">
                      {p.tickets.length}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {p.tickets.map((t: string, ti: number) => (
                        <span key={ti} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold">No se encontraron registros de ventas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
