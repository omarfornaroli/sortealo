'use client';

import { IRaffle } from '@/models/Raffle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Ticket, Mail } from 'lucide-react';

interface RaffleCardProps {
  raffle: IRaffle;
}

export default function RaffleCard({ raffle }: RaffleCardProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParticipate = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Por favor, ingresá tu email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/raffles/${raffle._id}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: '¡Éxito!', description: 'Ya estás participando en el sorteo.' });
        setEmail('');
      } else {
        toast({ title: 'Atención', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Hubo un problema al procesar tu participación.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={raffle.imageUrl} 
          alt={raffle.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ACTIVO
        </div>
      </div>
      <CardHeader className="p-6">
        <CardTitle className="text-2xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors">
          {raffle.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-6">
          {raffle.description}
        </p>
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="email"
              placeholder="Ingresá tu email para participar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={handleParticipate} 
          disabled={loading}
          className="w-full h-12 font-bold gap-2 shadow-lg shadow-primary/20"
        >
          <Ticket className="w-4 h-4" />
          {loading ? 'Procesando...' : 'Participar Gratis'}
        </Button>
      </CardFooter>
    </Card>
  );
}
