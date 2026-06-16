
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Si ya hay un token, redirigir al admin
    if (localStorage.getItem('adminToken')) {
      window.location.replace('/admin');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Almacenamiento exclusivo en localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userSession', JSON.stringify(data.user));

        toast({ title: 'Bienvenido', description: 'Accediendo...' });
        window.location.replace('/admin');
      } else {
        toast({ 
          title: 'Error', 
          description: data.message || 'Credenciales inválidas', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error de Red', 
        description: 'No se pudo conectar con el servidor.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleAuth}>
      <CardContent className="space-y-5 px-8">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Email</label>
          <Input
            type="email"
            placeholder="admin@sortealo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-slate-50 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500">Contraseña</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-slate-50 rounded-xl"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-5 p-8">
        <Button type="submit" className="w-full h-14 font-bold rounded-xl" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
          {loading ? 'Entrando...' : 'Acceder al Panel'}
        </Button>
        <div className="text-sm text-center">
          <Link href="/auth/register" className="text-primary font-bold">Solicitar registro</Link>
        </div>
      </CardFooter>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold font-headline">Panel Admin</CardTitle>
          <p className="text-slate-500">Ingresa para gestionar Sortealo</p>
        </CardHeader>
        <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
