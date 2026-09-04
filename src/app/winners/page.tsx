
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WinnersList } from '@/components/home/WinnersList';
import { Trophy } from 'lucide-react';

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

          <WinnersList />

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
