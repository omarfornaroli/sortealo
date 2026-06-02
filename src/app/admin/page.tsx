
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
export const revalidate = 0;

async function getStats() {
  try {
    await dbConnect();
    const raffles = await Raffle.find({});
    const totalParticipants = raffles.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);
    const activeRaffles = raffles.filter(r => !r.isFinished).length;
    const completedRaffles = raffles.filter(r => r.isFinished).length;
    
    return {
      totalRaffles: raffles.length,
      activeRaffles,
      completedRaffles,
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
    console.error('Error fetching raffles in admin:', error);
    return [];
  }
}

async function handleLogout() {
  'use server';
  await deleteSession();
  redirect('/admin/login');
}

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/admin/login');
  }

  const allRaffles = await getRaffles();
  const stats = await getStats();
  
  const activeRaffles = allRaffles.filter((r: any) => !r.isFinished);
  const finishedRaffles = allRaffles.filter((r: any) => r.isFinished);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="bg-white border-b border-slate-200 h-16 flex items-center shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Sortealo Admin</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{session.email as string}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Panel de Control</span>
            </div>
            <form action={handleLogout}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg font-bold">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">Administración</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestiona sorteos, participantes y ganadores históricos.</p>
          </div>
          <Button asChild className="gap-2 shadow-xl shadow-primary/20 h-12 px-6 rounded-xl font-bold">
            <Link href="/admin/raffles/new">
              <Plus className="w-5 h-5" /> Crear Nuevo Sorteo
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <TicketIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sorteos</p>
                <p className="text-xl font-bold text-slate-900">{stats.totalRaffles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Activos</p>
                <p className="text-xl font-bold text-slate-900">{stats.activeRaffles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Finalizados</p>
                <p className="text-xl font-bold text-slate-900">{stats.completedRaffles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Participantes</p>
                <p className="text-xl font-bold text-slate-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-12">
              <TabsTrigger value="active" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                Sorteos Activos
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                Historial (Finalizados)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active">
            {activeRaffles.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white">
                <TicketIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No hay sorteos activos</h3>
                <p className="text-slate-500 mb-6">Comienza publicando un nuevo premio.</p>
                <Button asChild variant="outline" className="rounded-xl font-bold">
                  <Link href="/admin/raffles/new">Crear Sorteo</Link>
                </Button>
              </div>
            ) : (
              <AdminRaffleList initialRaffles={activeRaffles} />
            )}
          </TabsContent>

          <TabsContent value="history">
            {finishedRaffles.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white">
                <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Historial vacío</h3>
                <p className="text-slate-500">Aquí aparecerán los sorteos cuando elijas un ganador.</p>
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
