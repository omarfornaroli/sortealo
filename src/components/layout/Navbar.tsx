
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Trophy className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EliteDraw
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#raffles" className="text-sm font-medium hover:text-primary transition-colors">Sorteos Activos</Link>
          <Link href="/winners" className="text-sm font-medium hover:text-primary transition-colors">Ganadores</Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">Cómo Participar</Link>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Mi Compra
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 top-20 bg-background z-40 transition-transform duration-300 flex flex-col p-6 gap-6 md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Link href="/#raffles" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-white/5 pb-4">Sorteos Activos</Link>
        <Link href="/winners" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-white/5 pb-4">Ganadores</Link>
        <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-white/5 pb-4">Cómo Participar</Link>
        <Button className="w-full h-12 bg-primary text-primary-foreground">Mi Compra</Button>
      </div>
    </nav>
  );
}
