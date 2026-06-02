
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WINNERS } from '@/lib/data-mock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2, Search, Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function WinnersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm mb-2">
              <Trophy className="w-5 h-5" />
              Historias que cambian vidas
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-tight">Nuestra Galería de <span className="text-primary italic">Ganadores</span></h1>
            <p className="text-lg text-muted-foreground">
              Transparencia total. Aquí puedes ver a todos los afortunados que ya están disfrutando de sus premios.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input placeholder="Buscar por sorteo o nombre..." className="pl-12 h-14 bg-card border-white/10" />
            </div>
            <div className="flex gap-4">
              <select className="bg-card border-white/10 rounded-lg px-6 h-14 text-sm font-medium outline-none">
                <option>Todos los años</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WINNERS.map((winner) => (
              <Card key={winner.id} className="group bg-card border-white/5 overflow-hidden transition-all hover:border-primary/40">
                <div className="relative aspect-square">
                  <Image 
                    src={winner.image} 
                    alt={winner.winnerName} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1">PREMIO ENTREGADO</Badge>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 space-y-1">
                    <h3 className="text-2xl font-headline font-bold text-white">{winner.raffleTitle}</h3>
                    <div className="flex items-center gap-2 text-primary text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{winner.winnerName}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-primary" /> Fecha
                      </div>
                      <div className="text-foreground text-sm font-bold font-headline">{new Date(winner.date).toLocaleDateString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3 h-3 text-primary" /> Nro Ganador
                      </div>
                      <div className="text-foreground text-sm font-bold font-headline">{winner.ticketNumber}</div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      Argentina
                    </div>
                    <button className="text-xs text-primary font-bold hover:underline">VER AUDITORÍA</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-20 text-center p-12 bg-primary/5 rounded-3xl border border-primary/10">
            <h3 className="text-2xl font-headline font-bold mb-4">Certificación de Transparencia</h3>
            <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed mb-8">
              Todos nuestros sorteos se realizan utilizando un motor de números aleatorios certificado y auditado externamente. 
              Cada sorteo genera un registro inmutable en nuestra base de datos.
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              <div className="font-black text-xl tracking-tighter italic">AUDIT SECURE</div>
              <div className="font-black text-xl tracking-tighter italic">CRYPTO VERIFIED</div>
              <div className="font-black text-xl tracking-tighter italic">BLOCK-TIME 256</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
