
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Trophy, History, Settings, Loader2, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalRaffles: 0, activeRaffles: 0, completedRaffles: 0, totalParticipants: 0, totalTicketsSold: 0 });
  const [raffles, setRaffles] = useState<any[]>([]);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();

  const loadData = async (showLoading = true) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.replace('/auth/login');
      return;
    }

    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/raffles?admin=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          setAuthError(true);
          return;
        }
        throw new Error('Error al cargar datos');
      }

      const data = await res.json();
      setRaffles(data);

      const totalParticipants = data.reduce((acc: number, curr: any) => acc + (curr.participants?.length || 0), 0);
      const totalTicketsSold = data.reduce((acc: number, curr: any) => acc + (curr.soldTickets || 0), 0);
      
      setStats({
        totalRaffles: data.length,
        activeRaffles: data.filter((r: any) => !r.isFinished).length,
        completedRaffles: data.filter((r: any) => r.isFinished).length,
        totalParticipants,
        totalTicketsSold
      });
      
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron sincronizar los datos.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const savedSessionStr = localStorage.getItem('userSession');
    if (savedSessionStr) setSession(JSON.parse(savedSessionStr));
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userSession');
    window.location.replace('/auth/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="bg-white border-b border-slate-200 h-20 flex items-center sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900 font-headline">Panel Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-slate-500 hover:text-primary rounded-xl font-bold gap-2">
              <Link href="/admin/sellers"><LinkIcon className="w-5 h-5" /> Vendedores</Link>
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="gap-2 text-slate-500 hover:text-red-600 rounded-xl font-bold">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 leading-tight">Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg">Resumen administrativo de ventas y sorteos.</p>
          </div>
          <Button asChild className="gap-3 h-16 px-10 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105">
            <Link href="/admin/raffles/new">
              <Plus className="w-6 h-6" /> NUEVO SORTEO
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Sorteos Totales', value: stats.totalRaffles, icon: TicketIcon, color: 'text-primary bg-primary/5' },
            { label: 'Activos', value: stats.activeRaffles, icon: Settings, color: 'text-green-600 bg-green-50' },
            { label: 'Compradores', value: stats.totalParticipants, icon: Users, color: 'text-amber-600 bg-amber-50' },
            { label: 'Tickets Vendidos', value: stats.totalTicketsSold, icon: History, color: 'text-indigo-600 bg-indigo-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="active" className="space-y-10">
          <TabsList className="bg-white border border-slate-200 p-2 rounded-3xl h-16 inline-flex shadow-sm">
            <TabsTrigger value="active" className="rounded-2xl px-10 font-bold">Sorteos Activos</TabsTrigger>
            <TabsTrigger value="history" className="rounded-2xl px-10 font-bold">Cerrados</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <AdminRaffleList initialRaffles={raffles.filter(r => !r.isFinished)} />
          </TabsContent>

          <TabsContent value="history">
            <AdminRaffleList initialRaffles={raffles.filter(r => r.isFinished)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
