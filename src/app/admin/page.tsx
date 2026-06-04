
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Trophy, History, Settings, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
          localStorage.removeItem('userSession');
          setAuthError(true);
          return;
        }
        throw new Error('Error al cargar datos');
      }

      const data = await res.json();
      setRaffles(data);

      // Calculamos estadísticas detalladas
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
      console.error('Admin init error:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-bold">Iniciando Panel...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center space-y-8 border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Sesión Expirada</h2>
            <p className="text-slate-500 mt-2">Tu acceso ha caducado por seguridad. Por favor reingresa.</p>
          </div>
          <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold">
            <Link href="/auth/login">Volver al Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeRaffles = raffles.filter((r: any) => !r.isFinished);
  const finishedRaffles = raffles.filter((r: any) => r.isFinished);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="bg-white border-b border-slate-200 h-20 flex items-center sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900 font-headline tracking-tight">Panel Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => loadData(false)} 
              disabled={refreshing}
              className="text-slate-400 hover:text-primary rounded-xl"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block" />
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conectado como</span>
              <span className="text-sm font-black text-slate-900">{session?.email}</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold">
              <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 leading-tight">Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Control centralizado de premios y participantes.</p>
          </div>
          <Button asChild className="gap-3 h-16 px-10 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
            <Link href="/admin/raffles/new">
              <Plus className="w-6 h-6" /> NUEVO SORTEO
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Sorteos Totales', value: stats.totalRaffles, icon: TicketIcon, color: 'text-primary bg-primary/5' },
            { label: 'Sorteos Activos', value: stats.activeRaffles, icon: Settings, color: 'text-green-600 bg-green-50' },
            { label: 'Compradores', value: stats.totalParticipants, icon: Users, color: 'text-amber-600 bg-amber-50' },
            { label: 'Total Ventas', value: stats.totalTicketsSold, icon: History, color: 'text-indigo-600 bg-indigo-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="active" className="space-y-10">
          <TabsList className="bg-white border-2 border-slate-100 p-2 rounded-[2rem] h-20 inline-flex shadow-sm">
            <TabsTrigger value="active" className="rounded-[1.5rem] px-12 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              Sorteos Activos
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-[1.5rem] px-12 font-black text-sm uppercase tracking-tighter data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl transition-all">
              Historial de Cierre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeRaffles.length === 0 ? (
              <div className="py-32 text-center border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/50">
                <TicketIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 text-xl font-bold">No tienes sorteos activos en este momento.</p>
                <Button asChild variant="link" className="mt-4 font-black text-primary">
                  <Link href="/admin/raffles/new">Crear el primero ahora</Link>
                </Button>
              </div>
            ) : (
              <AdminRaffleList initialRaffles={activeRaffles} />
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {finishedRaffles.length === 0 ? (
              <div className="py-32 text-center border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/50">
                <History className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 text-xl font-bold">El historial está vacío por ahora.</p>
              </div>
            ) : (
              <AdminRaffleList initialRaffles={finishedRaffles} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
