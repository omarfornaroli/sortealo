
import Link from 'next/link';
import { Trophy, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Trophy className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight">EliteDraw</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plataforma premium de sorteos online. Llevando la emoción de ganar los mejores premios a cada rincón de Argentina.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-headline text-lg font-bold mb-6">Navegación</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/#raffles" className="hover:text-primary transition-colors">Sorteos Activos</Link></li>
              <li><Link href="/winners" className="hover:text-primary transition-colors">Ganadores</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-lg font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Bases del Sorteo</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Defensa al Consumidor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-lg font-bold mb-6">Contacto</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>contacto@elitedraw.com.ar</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+54 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EliteDraw S.R.L. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
