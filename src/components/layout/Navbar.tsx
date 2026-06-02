
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-slate-900">
            Sortealo
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#raffles" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Sorteos Activos</Link>
          <Link href="/winners" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Ganadores</Link>
          <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Cómo Participar</Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary">
                <LayoutDashboard className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-xl px-6">
              Mi Compra
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 top-20 bg-white z-40 transition-transform duration-300 flex flex-col p-6 gap-6 md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <Link href="/#raffles" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-slate-50 pb-4">Sorteos Activos</Link>
        <Link href="/winners" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-slate-50 pb-4">Ganadores</Link>
        <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-slate-50 pb-4">Cómo Participar</Link>
        <Link href="/admin" onClick={() => setIsOpen(false)} className="text-xl font-headline border-b border-slate-50 pb-4 text-primary flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" /> Admin
        </Link>
        <Button className="w-full h-12 bg-primary text-white rounded-xl">Mi Compra</Button>
      </div>
    </nav>
  );
}
