
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/home/Hero';
import { RaffleCard } from '@/components/raffles/RaffleCard';
import { WinnersList } from '@/components/home/WinnersList';
import { Footer } from '@/components/layout/Footer';
import { RAFFLES, FAQ } from '@/lib/data-mock';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Search, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  Gift, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />

        {/* Steps Section */}
        <section id="how-it-works" className="py-24 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-headline font-bold uppercase tracking-tight">¿Cómo Participar?</h2>
              <p className="text-muted-foreground">Sigue estos sencillos pasos para tener la oportunidad de ganar tu premio soñado.</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Search, title: "1. Elegir Premio", desc: "Explora nuestros sorteos activos y selecciona el que más te guste." },
                { icon: CreditCard, title: "2. Comprar", desc: "Elige tus números y completa el pago de forma segura." },
                { icon: Send, title: "3. Recibir", desc: "Recibe tus números asignados al instante vía email." },
                { icon: CheckCircle2, title: "4. Sorteo", desc: "Cruza los dedos y espera al día del sorteo oficial." },
              ].map((step, idx) => (
                <div key={idx} className="relative group p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/50 transition-all text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <step.icon className="text-primary w-8 h-8" />
                  </div>
                  <h4 className="font-headline text-lg font-bold mb-2">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Raffles Grid */}
        <section id="raffles" className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="space-y-2">
                <span className="text-primary font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Oportunidades ahora
                </span>
                <h2 className="text-4xl lg:text-5xl font-headline font-bold">Sorteos Activos</h2>
              </div>
              <p className="text-muted-foreground max-w-sm text-sm">
                Nuestra selección actual de premios exclusivos. ¡Elige el tuyo antes de que se agoten los números!
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {RAFFLES.map((raffle) => (
                <RaffleCard key={raffle.id} raffle={raffle} />
              ))}
            </div>
          </div>
        </section>

        <WinnersList />

        {/* Stats / Proof of Trust Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center bg-card border border-white/5 rounded-3xl p-12">
              {[
                { label: "Sorteos Realizados", value: "1,200+" },
                { label: "Entregas Garantizadas", value: "100%" },
                { label: "Participantes", value: "500k+" },
                { label: "Premios Entregados", value: "$450M+" },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-accent/20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl font-headline font-bold">Preguntas Frecuentes</h2>
              <p className="text-muted-foreground">Todo lo que necesitas saber sobre EliteDraw.</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQ.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="bg-card border border-white/5 rounded-xl px-6">
                  <AccordionTrigger className="hover:no-underline font-medium py-6 text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 -z-10 blur-[120px]" />
          <div className="container mx-auto px-4 text-center space-y-8">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 rotate-12">
              <Gift className="text-primary-foreground w-10 h-10" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-headline font-bold max-w-3xl mx-auto leading-tight">
              ¿Listo para ser nuestro <span className="text-primary italic">próximo</span> ganador?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              No dejes pasar la oportunidad. Cada número es una posibilidad de cambiar tu vida.
            </p>
            <div className="pt-4">
              <button className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-3 mx-auto shadow-xl shadow-primary/20">
                Ver Premios Disponibles
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
