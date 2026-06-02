
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si ya hay sesión al cargar la página
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          window.location.href = '/admin';
        }
      })
      .catch(() => {});
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Bienvenido', description: 'Sesión iniciada correctamente.' });
        // Usar href en lugar de replace para asegurar que se procesen las cookies
        window.location.href = '/admin';
      } else {
        toast({ 
          title: 'Error de acceso', 
          description: data.message || 'Credenciales inválidas', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Ocurrió un error al conectar con el servidor', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="space-y-1 pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-slate-900 font-headline">Panel Administrativo</CardTitle>
          <p className="text-sm text-center text-slate-500 font-medium">Ingresa tus credenciales para continuar</p>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sortealo.com.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="password">Contraseña</label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-5 p-8 pt-6">
            <Button type="submit" className="w-full h-14 font-bold gap-2 text-base rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Validando...' : 'Entrar al Panel'}
            </Button>
            <div className="text-sm text-center text-slate-500 font-medium">
              ¿No tienes acceso? <Link href="/admin/register" className="text-primary font-bold hover:underline">Solicitar registro</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
