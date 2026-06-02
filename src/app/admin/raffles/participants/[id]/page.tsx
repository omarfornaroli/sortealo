
'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mail, User, Trash2, Search, Loader2 } from 'lucide-react';
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

  const filteredParticipants = raffle?.participants.filter((p: string) => 
    p.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Link href="/admin" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-slate-900">{raffle.name}</h1>
          <p className="text-slate-500">Listado completo de participantes registrados.</p>
        </div>
        <div className="bg-primary/10 px-6 py-2 rounded-full border border-primary/20">
          <span className="font-bold text-primary">{raffle.participants.length}</span>
          <span className="text-primary/70 ml-2 text-sm uppercase font-bold tracking-wider">Participantes</span>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input 
          className="pl-12 h-12 bg-white rounded-xl" 
          placeholder="Buscar participante por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Participante (Email)</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado Pago</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.map((email: string, index: number) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-700">{email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">COMPLETADO</span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium">
                    No se encontraron participantes con ese criterio.
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
