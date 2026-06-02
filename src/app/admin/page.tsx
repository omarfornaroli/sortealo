import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Raffle from '@/models/Raffle';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, Edit, Plus } from 'lucide-react';

async function getRaffles() {
  await dbConnect();
  return Raffle.find({}).lean();
}

export default async function AdminPage() {
  const raffles = await getRaffles();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-headline font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona tus sorteos activos y finalizados.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/raffles/new">
            <Plus className="w-4 h-4" /> Nuevo Sorteo
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {raffles.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl border-gray-200">
            <p className="text-muted-foreground">No hay sorteos creados todavía.</p>
          </div>
        ) : (
          raffles.map((raffle: any) => (
            <Card key={raffle._id.toString()} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
              <img src={raffle.imageUrl} alt={raffle.name} className="w-full h-40 object-cover" />
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{raffle.name}</CardTitle>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${raffle.isFinished ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {raffle.isFinished ? 'FINALIZADO' : 'ACTIVO'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {raffle.participants?.length || 0} Participantes
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Edit className="w-3 h-3" /> Editar
                </Button>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}