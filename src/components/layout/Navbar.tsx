
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Efecto para cambiar el fondo al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-[100] transition-all duration-300 border-b",
      scrolled || isOpen 
        ? "bg-white border-slate-100 h-20 shadow-sm" 
        : "bg-white/90 md:bg-transparent border-transparent h-24"
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group relative z-[110]">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className={cn(
            "font-headline text-2xl font-bold tracking-tight transition-colors",
            scrolled || isOpen ? "text-slate-900" : "text-white md:drop-shadow-md"
          )}>
            Sortealo
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#raffles" className={cn(
            "text-sm font-bold transition-colors",
            scrolled ? "text-slate-600 hover:text-primary" : "text-white hover:text-primary drop-shadow-sm"
          )}>Sorteos Activos</Link>
          <Link href="/winners" className={cn(
            "text-sm font-bold transition-colors",
            scrolled ? "text-slate-600 hover:text-primary" : "text-white hover:text-primary drop-shadow-sm"
          )}>Ganadores</Link>
          <Link href="/#how-it-works" className={cn(
            "text-sm font-bold transition-colors",
            scrolled ? "text-slate-600 hover:text-primary" : "text-white hover:text-primary drop-shadow-sm"
          )}>Cómo Participar</Link>
          <div className={cn(
            "flex items-center gap-3 ml-4 pl-4 border-l",
            scrolled ? "border-slate-100" : "border-white/20"
          )}>
            <Link href="/admin">
              <Button variant="ghost" size="icon" className={cn(
                "transition-colors",
                scrolled ? "text-slate-500 hover:text-primary" : "text-white hover:bg-white/10"
              )}>
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant={scrolled ? "outline" : "default"} className={cn(
              "rounded-xl px-6 font-bold",
              !scrolled && "bg-white text-primary hover:bg-slate-100 border-none"
            )}>
              Mi Compra
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden relative z-[110] p-2 text-slate-900" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className={cn("w-8 h-8", !scrolled && !isOpen ? "text-white" : "text-slate-900")} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-white z-[100] transition-all duration-500 ease-in-out flex flex-col pt-32 p-8 gap-8 md:hidden",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <Link 
          href="/#raffles" 
          onClick={() => setIsOpen(false)} 
          className="text-3xl font-headline font-bold border-b border-slate-50 pb-4 text-slate-900"
        >
          Sorteos Activos
        </Link>
        <Link 
          href="/winners" 
          onClick={() => setIsOpen(false)} 
          className="text-3xl font-headline font-bold border-b border-slate-50 pb-4 text-slate-900"
        >
          Ganadores
        </Link>
        <Link 
          href="/#how-it-works" 
          onClick={() => setIsOpen(false)} 
          className="text-3xl font-headline font-bold border-b border-slate-50 pb-4 text-slate-900"
        >
          Cómo Participar
        </Link>
        <Link 
          href="/admin" 
          onClick={() => setIsOpen(false)} 
          className="text-2xl font-headline font-bold border-b border-slate-50 pb-4 text-primary flex items-center gap-3"
        >
          <LayoutDashboard className="w-6 h-6" /> Panel Admin
        </Link>
        <div className="mt-auto">
          <Button className="w-full h-16 bg-primary text-white rounded-2xl text-xl font-bold shadow-xl shadow-primary/20">
            Mi Compra
          </Button>
        </div>
      </div>
    </nav>
  );
}
