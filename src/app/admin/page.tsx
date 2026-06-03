
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Trophy, History, Settings, Loader2, AlertCircle } from 'lucide-react';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRaffles: 0, activeRaffles: 0, completedRaffles: 0, totalParticipants: 0 });
  const [raffles, setRaffles] = useState<any[]>([]);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initAdmin = async () => {
      console.log('--- [ADMIN] Iniciando verificación de seguridad ---');
      const token = localStorage.getItem('adminToken');
      const savedSessionStr = localStorage.getItem('userSession');
      
      if (!token) {
        console.warn('--- [ADMIN] No se encontró token en localStorage. Redirigiendo... ---');
        window.location.replace('/auth/login?error=no_token');
        return;
      }

      try {
        if (savedSessionStr) {
          setSession(JSON.parse(savedSessionStr));
        }
        
        // Intentar obtener datos para validar el token contra el servidor
        const res = await fetch('/api/raffles?admin=true', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error('--- [ADMIN] El servidor rechazó el token (401). ---');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('userSession');
            setAuthError(true);
            window.location.replace('/auth/login?error=session_expired');
            return;
          }
          throw new Error('Error de servidor al cargar sorteos');
        }

        const data = await res.json();
        setRaffles(data);

        const totalParticipants = data.reduce((acc: number, curr: any) => acc + (curr.participants?.length || 0), 0);
        setStats({
          totalRaffles: data.length,
          activeRaffles: data.filter((r: any) => !r.isFinished).length,
          completedRaffles: data.filter((r: any) => r.isFinished).length,
          totalParticipants
        });
        
        console.log('--- [ADMIN] Dashboard cargado exitosamente ---');
      } catch (error) {
        console.error('--- [ADMIN] Error crítico al cargar datos ---', error);
        toast({ 
          title: 'Error de conexión', 
          description: 'No pudimos validar tu sesión con el servidor.', 
          variant: 'destructive' 
        });
      } finally {
        setLoading(false);
      }
    };

    initAdmin();
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
          <p className="text-slate-500 font-bold">Validando credenciales administrativas...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Sesión Inválida</h2>
          <p className="text-slate-500">Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión.</p>
          <Button asChild className="w-full h-12 rounded-xl">
            <Link href="/auth/login">Ir al Login</Link>
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
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight font-headline">Panel Administrativo</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{session?.email || 'Admin'}</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">Sortealo Pro</span>
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
            <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tight">Gestión de Sorteos</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Administra premios, participantes y realiza sorteos en vivo.</p>
          </div>
          <Button asChild className="gap-2 shadow-2xl shadow-primary/30 h-14 px-8 rounded-2xl font-bold text-lg">
            <Link href="/admin/raffles/new">
              <Plus className="w-6 h-6" /> Nuevo Premio
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Sorteos Totales', value: stats.totalRaffles, icon: TicketIcon },
            { label: 'En Curso', value: stats.activeRaffles, icon: Settings },
            { label: 'Finalizados', value: stats.completedRaffles, icon: History },
            { label: 'Total Participantes', value: stats.totalParticipants, icon: Users },
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
              Historial de Ganadores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0 outline-none">
            {activeRaffles.length === 0 ? (
              <div className="py-24 text-center border-3 border-dashed rounded-[3rem] border-slate-200 bg-white">
                <TicketIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900">No hay sorteos activos</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Crea un nuevo sorteo para empezar a recibir participaciones.</p>
                <Button asChild variant="outline" className="rounded-xl h-12 px-8 font-bold">
                  <Link href="/admin/raffles/new">Crear Sorteo</Link>
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
                <h3 className="text-2xl font-bold text-slate-900">Historial vacío</h3>
                <p className="text-slate-500">Aquí aparecerán los sorteos que ya tengan un ganador asignado.</p>
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
