
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { LayoutDashboard, LogOut, Plus, Ticket as TicketIcon } from 'lucide-react';
import { deleteSession, getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminRaffleList } from '@/components/admin/AdminRaffleList';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
              <span className="text-xs font-bold text-slate-900">{session.email}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Administrador</span>
            </div>
            <form action={handleLogout}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500 mt-1 font-medium">Gestiona todos los sorteos de la plataforma.</p>
          </div>
          <Button asChild className="gap-2 shadow-xl shadow-primary/20 h-12 px-6 rounded-xl font-bold">
            <Link href="/admin/raffles/new">
              <Plus className="w-5 h-5" /> Nuevo Sorteo
            </Link>
          </Button>
        </div>

        {raffles.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No hay sorteos</h3>
            <p className="text-slate-500 font-medium mb-8">Comienza creando tu primer sorteo para que aparezca aquí.</p>
            <Button asChild variant="outline" className="rounded-xl px-8 border-slate-200 font-bold">
              <Link href="/admin/raffles/new">Crear mi primer sorteo</Link>
            </Button>
          </div>
        ) : (
          <AdminRaffleList initialRaffles={raffles} />
        )}
      </div>
    </div>
  );
}
