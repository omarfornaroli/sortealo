
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

  // Verificar si ya está logueado al cargar
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          window.location.replace('/admin');
        }
      });
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
        // Usar replace para evitar que el usuario vuelva atrás al login
        window.location.replace('/admin');
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
      <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Panel Administrativo</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sortealo.com.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold" htmlFor="password">Contraseña</label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 font-bold gap-2 text-base" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'Validando...' : 'Entrar al Panel'}
            </Button>
            <div className="text-sm text-center text-slate-500">
              ¿No tienes acceso? <Link href="/admin/register" className="text-primary font-semibold hover:underline">Solicitar registro</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
