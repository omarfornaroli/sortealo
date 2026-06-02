
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon, Users, Settings } from 'lucide-react';
import { deleteSession, getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStats() {
  try {
    await dbConnect();
    const raffles = await Raffle.find({});
    const totalParticipants = raffles.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);
    const activeRaffles = raffles.filter(r => !r.isFinished).length;
    
    return {
      totalRaffles: raffles.length,
      activeRaffles,
      totalParticipants
    };
  } catch (error) {
    return { totalRaffles: 0, activeRaffles: 0, totalParticipants: 0 };
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

  const raffles = await getRaffles();
  const stats = await getStats();

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
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestiona y supervisa todos tus sorteos activos.</p>
          </div>
          <Button asChild className="gap-2 shadow-xl shadow-primary/20 h-12 px-6 rounded-xl font-bold">
            <Link href="/admin/raffles/new">
              <Plus className="w-5 h-5" /> Crear Nuevo Sorteo
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <TicketIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Sorteos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalRaffles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Sorteos Activos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.activeRaffles}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Participantes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        {raffles.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin sorteos publicados</h3>
            <p className="text-slate-500 font-medium mb-8">Empieza creando el primer sorteo de la plataforma.</p>
            <Button asChild variant="outline" className="rounded-xl px-8 border-slate-200 font-bold">
              <Link href="/admin/raffles/new">Crear mi primer sorteo</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Listado de Sorteos</h2>
            </div>
            <AdminRaffleList initialRaffles={raffles} />
          </div>
        )}
      </div>
    </div>
  );
}
