
"use client";

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Settings, Trash2, Edit2, LayoutDashboard, Ticket } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPage() {
  const db = useFirestore();
  
  const rafflesQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, 'raffles');
  }, [db]);

  const { data: raffles, loading } = useCollection(rafflesQuery);
  
  const [newRaffle, setNewRaffle] = useState({
    title: '',
    prize: '',
    ticketPrice: '',
    maxTickets: '',
    drawDate: '',
    description: '',
    imageUrl: 'https://picsum.photos/seed/raffle/800/600'
  });

  const handleAddRaffle = () => {
    if (!db) return;
    
    const data = {
      ...newRaffle,
      ticketPrice: Number(newRaffle.ticketPrice),
      maxTickets: Number(newRaffle.maxTickets),
      soldTickets: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      images: [newRaffle.imageUrl]
    };

    addDoc(collection(db, 'raffles'), data)
      .then(() => {
        setNewRaffle({
          title: '',
          prize: '',
          ticketPrice: '',
          maxTickets: '',
          drawDate: '',
          description: '',
          imageUrl: 'https://picsum.photos/seed/raffle/800/600'
        });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'raffles',
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    if (confirm('¿Estás seguro de eliminar este sorteo?')) {
      deleteDoc(doc(db, 'raffles', id))
        .catch(async () => {
          const permissionError = new FirestorePermissionError({
            path: `raffles/${id}`,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
                <LayoutDashboard className="text-primary w-8 h-8" />
                Panel de Administración
              </h1>
              <p className="text-muted-foreground">Gestiona tus sorteos, precios y participantes.</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white h-12 px-6 rounded-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nuevo Sorteo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle>Crear Sorteo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título del Sorteo</Label>
                    <Input 
                      id="title" 
                      placeholder="Ej: Porsche 911 Carrera" 
                      value={newRaffle.title}
                      onChange={(e) => setNewRaffle({...newRaffle, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Precio por Ticket</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        placeholder="2500" 
                        value={newRaffle.ticketPrice}
                        onChange={(e) => setNewRaffle({...newRaffle, ticketPrice: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tickets">Tickets Totales</Label>
                      <Input 
                        id="tickets" 
                        type="number" 
                        placeholder="1000" 
                        value={newRaffle.maxTickets}
                        onChange={(e) => setNewRaffle({...newRaffle, maxTickets: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Fecha del Sorteo</Label>
                    <Input 
                      id="date" 
                      type="datetime-local" 
                      value={newRaffle.drawDate}
                      onChange={(e) => setNewRaffle({...newRaffle, drawDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Descripción</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="Detalles del premio..." 
                      value={newRaffle.description}
                      onChange={(e) => setNewRaffle({...newRaffle, description: e.target.value})}
                    />
                  </div>
                  <Button onClick={handleAddRaffle} className="w-full mt-4 bg-primary text-white">Guardar Sorteo</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sorteos Activos</CardTitle>
                <Ticket className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{raffles?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recaudación Estimada</CardTitle>
                <Settings className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">
                  ${raffles?.reduce((acc: any, r: any) => acc + (r.ticketPrice * (r.soldTickets || 0)), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tickets Vendidos</CardTitle>
                <Plus className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {raffles?.reduce((acc: any, r: any) => acc + (r.soldTickets || 0), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-white border-b border-slate-100 p-6">
              <CardTitle>Listado de Sorteos</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Sorteo</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Cargando sorteos...</TableCell>
                  </TableRow>
                ) : raffles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No hay sorteos creados aún.</TableCell>
                  </TableRow>
                ) : (
                  raffles?.map((raffle: any) => (
                    <TableRow key={raffle.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{raffle.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{raffle.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>${raffle.ticketPrice}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{Math.round(((raffle.soldTickets || 0) / raffle.maxTickets) * 100)}%</span>
                          <span className="text-[10px] text-muted-foreground">({raffle.soldTickets || 0} / {raffle.maxTickets})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(raffle.drawDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(raffle.id)}
                            className="h-8 w-8 hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
