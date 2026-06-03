
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Trophy, History, Settings, Loader2 } from 'lucide-react';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRaffles: 0, activeRaffles: 0, completedRaffles: 0, totalParticipants: 0 });
  const [raffles, setRaffles] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('--- ADMIN: Verificando sesión en localStorage ---');
      const token = localStorage.getItem('adminToken');
      const savedSession = localStorage.getItem('userSession');
      
      if (!token || !savedSession) {
        console.warn('--- ADMIN: No se encontró token o sesión en localStorage. Redirigiendo... ---');
        // Marcar error para evitar bucle en login
        sessionStorage.setItem('authError', 'true');
        window.location.replace('/auth/login');
        return;
      }

      try {
        const parsedSession = JSON.parse(savedSession);
        setSession(parsedSession);
        
        // Obtener datos del backend usando el token de localStorage en el header
        const res = await fetch('/api/raffles?admin=true', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error('--- ADMIN: Token rechazado por el servidor (401) ---');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userSession');
            sessionStorage.setItem('authError', 'true');
            window.location.replace('/auth/login');
            return;
          }
          throw new Error('Error al cargar sorteos');
        }

        const data = await res.json();
        setRaffles(data);

        // Calcular estadísticas
        const totalParticipants = data.reduce((acc: number, curr: any) => acc + (curr.participants?.length || 0), 0);
        setStats({
          totalRaffles: data.length,
          activeRaffles: data.filter((r: any) => !r.isFinished).length,
          completedRaffles: data.filter((r: any) => r.isFinished).length,
          totalParticipants
        });
      } catch (error) {
        console.error('--- ADMIN: Error crítico al cargar datos ---', error);
        toast({ 
          title: 'Error de conexión', 
          description: 'No se pudieron cargar los datos del servidor.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userSession');
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      window.location.replace('/auth/login');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Validando acceso administrativo...</p>
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
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight font-headline">Panel Sortealo</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{session?.email}</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">Administrador</span>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all rounded-xl">
              <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tight">Gestión General</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Control total sobre premios, participantes y sorteos.</p>
          </div>
          <Button asChild className="gap-2 shadow-2xl shadow-primary/30 h-14 px-8 rounded-2xl font-bold text-lg">
            <Link href="/admin/raffles/new">
              <Plus className="w-6 h-6" /> Nuevo Sorteo
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Sorteos Totales', value: stats.totalRaffles, icon: TicketIcon },
            { label: 'Sorteos Activos', value: stats.activeRaffles, icon: Settings },
            { label: 'Finalizados', value: stats.completedRaffles, icon: History },
            { label: 'Participantes', value: stats.totalParticipants, icon: Users },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-5">
                <div className={`p-4 bg-slate-50 rounded-2xl text-primary`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="active" className="space-y-8">
          <TabsList className="bg-white border border-slate-200 p-1.5 rounded-2xl h-16 shadow-sm">
            <TabsTrigger value="active" className="rounded-xl px-10 font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Sorteos Activos
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-10 font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Historial de Premios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0 outline-none">
            {activeRaffles.length === 0 ? (
              <div className="py-24 text-center border-3 border-dashed rounded-[3rem] border-slate-200 bg-white">
                <TicketIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900">No hay sorteos vigentes</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Comienza publicando un nuevo premio para tus usuarios.</p>
                <Button asChild variant="outline" className="rounded-xl h-12 px-8 font-bold">
                  <Link href="/admin/raffles/new">Crear Primer Sorteo</Link>
                </Button>
              </div>
            ) : (
              <AdminRaffleList initialRaffles={activeRaffles} />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0 outline-none">
            {finishedRaffles.length === 0 ? (
              <div className="py-24 text-center border-3 border-dashed rounded-[3rem] border-slate-200 bg-white">
                <Trophy className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900">Sin registros históricos</h3>
                <p className="text-slate-500">Aquí verás los detalles de los ganadores de sorteos pasados.</p>
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
