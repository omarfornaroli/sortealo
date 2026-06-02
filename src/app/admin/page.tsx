
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Trophy, History, Settings } from 'lucide-react';
import { deleteSession, getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    await dbConnect();
    const raffles = await Raffle.find({});
    const totalParticipants = raffles.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);
    return {
      totalRaffles: raffles.length,
      activeRaffles: raffles.filter(r => !r.isFinished).length,
      completedRaffles: raffles.filter(r => r.isFinished).length,
      totalParticipants
    };
  } catch (error) {
    return { totalRaffles: 0, activeRaffles: 0, completedRaffles: 0, totalParticipants: 0 };
  }
}

async function getRaffles() {
  try {
    await dbConnect();
    const raffles = await Raffle.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(raffles));
  } catch (error) {
    return [];
  }
}

async function handleLogout() {
  'use server';
  await deleteSession();
  redirect('/auth/login');
}

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const allRaffles = await getRaffles();
  const stats = await getStats();
  
  const activeRaffles = allRaffles.filter((r: any) => !r.isFinished);
  const finishedRaffles = allRaffles.filter((r: any) => r.isFinished);

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
              <span className="text-sm font-bold text-slate-900">{session.email as string}</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">Admin Master</span>
            </div>
            <form action={handleLogout}>
              <Button variant="ghost" type="submit" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 font-bold transition-all rounded-xl">
                <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-headline font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Gestiona premios, sorteos y revisa el historial de ganadores.</p>
          </div>
          <Button asChild className="gap-2 shadow-2xl shadow-primary/30 h-14 px-8 rounded-2xl font-bold text-lg">
            <Link href="/admin/raffles/new">
              <Plus className="w-6 h-6" /> Crear Sorteo
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Sorteos Totales', value: stats.totalRaffles, icon: TicketIcon, color: 'blue' },
            { label: 'Sorteos Activos', value: stats.activeRaffles, icon: Settings, color: 'green' },
            { label: 'Finalizados', value: stats.completedRaffles, icon: History, color: 'amber' },
            { label: 'Participantes', value: stats.totalParticipants, icon: Users, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-5">
                <div className={`p-4 bg-${stat.color}-50 rounded-2xl text-${stat.color}-600`}>
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
            <TabsTrigger value="active" className="rounded-xl px-10 font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-white">
              Sorteos Activos
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-10 font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-white">
              Historial (Finalizados)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            {activeRaffles.length === 0 ? (
              <div className="py-24 text-center border-3 border-dashed rounded-[3rem] border-slate-200 bg-white">
                <TicketIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900">No hay sorteos vigentes</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Publica un nuevo premio para que los participantes puedan comprar números.</p>
                <Button asChild variant="outline" className="rounded-xl h-12 px-8 font-bold">
                  <Link href="/admin/raffles/new">Empezar ahora</Link>
                </Button>
              </div>
            ) : (
              <AdminRaffleList initialRaffles={activeRaffles} />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {finishedRaffles.length === 0 ? (
              <div className="py-24 text-center border-3 border-dashed rounded-[3rem] border-slate-200 bg-white">
                <Trophy className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900">Historial vacío</h3>
                <p className="text-slate-500">Aquí verás los registros de ganadores una vez que finalices sorteos.</p>
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
