
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Plus, LogOut, LayoutDashboard } from 'lucide-react';
import { deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getRaffles() {
  await dbConnect();
  return Raffle.find({}).lean();
}

async function handleLogout() {
  'use server';
  deleteSession();
  redirect('/admin/login');
}

export default async function AdminPage() {
  const raffles = await getRaffles();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 h-16 flex items-center shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Sortealo Admin</span>
          </div>
          <form action={handleLogout}>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-red-600">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </Button>
          </form>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-500">Gestiona tus sorteos activos y finalizados.</p>
          </div>
          <Button asChild className="gap-2 shadow-lg shadow-primary/20 h-11">
            <Link href="/admin/raffles/new">
              <Plus className="w-4 h-4" /> Nuevo Sorteo
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-slate-200 bg-white">
              <p className="text-slate-400 italic">No hay sorteos creados todavía.</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/admin/raffles/new">Crea tu primer sorteo aquí</Link>
              </Button>
            </div>
          ) : (
            raffles.map((raffle: any) => (
              <Card key={raffle._id.toString()} className="overflow-hidden hover:shadow-xl transition-all border-slate-200 bg-white group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={raffle.imageUrl} 
                    alt={raffle.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold shadow-sm ${raffle.isFinished ? 'bg-slate-100 text-slate-500' : 'bg-green-500 text-white'}`}>
                      {raffle.isFinished ? 'FINALIZADO' : 'ACTIVO'}
                    </span>
                  </div>
                </div>
                <CardHeader className="p-5">
                  <CardTitle className="text-xl font-bold line-clamp-1">{raffle.name}</CardTitle>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">
                      {raffle.participants?.length || 0} Participantes
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 border-slate-200">
                    <Edit className="w-3 h-3" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" className="px-3">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
