
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const errorReason = searchParams.get('reason');

  useEffect(() => {
    // Si hay un error de sesión, mostrar un toast informativo
    if (errorReason === 'session_expired') {
      toast({ title: 'Sesión expirada', description: 'Por favor, vuelve a ingresar tus datos.', variant: 'destructive' });
    }
    
    // Auto-redirección solo si existe el token y NO venimos de un error de sesión
    const token = localStorage.getItem('adminToken');
    if (token && !errorReason) {
      console.log('--- [LOGIN] Token detectado. Intentando entrada automática a /admin ---');
      window.location.replace('/admin');
    }
  }, [errorReason, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    console.log('--- [LOGIN] Iniciando petición de autenticación ---');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('--- [LOGIN] Éxito. Guardando sesión en localStorage ---');
        
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userSession', JSON.stringify({
          email: data.user.email,
          loginTime: new Date().toISOString()
        }));

        toast({ title: 'Bienvenido', description: 'Accediendo al panel administrativo...' });
        
        // Dar tiempo a que la cookie se asiente
        setTimeout(() => {
          window.location.replace('/admin');
        }, 500);
      } else {
        toast({ 
          title: 'Acceso Denegado', 
          description: data.message || 'Credenciales incorrectas', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('--- [LOGIN] Error de conexión ---', error);
      toast({ 
        title: 'Error de Red', 
        description: 'No se pudo conectar con el servidor de autenticación.', 
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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="email">Email Administrativo</label>
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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="password">Contraseña</label>
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
          {loading ? 'Validando...' : 'Acceder al Panel'}
        </Button>
        <div className="text-sm text-center text-slate-500 font-medium">
          ¿No tienes acceso? <Link href="/auth/register" className="text-primary font-bold hover:underline">Solicitar registro</Link>
        </div>
      </CardFooter>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="space-y-1 pb-8 pt-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <ShieldAlert className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 font-headline">Panel Administrativo</CardTitle>
          <p className="text-sm text-slate-500 font-medium">Ingresa para gestionar la plataforma</p>
        </CardHeader>
        <Suspense fallback={<CardContent className="p-20 flex justify-center"><Loader2 className="animate-spin" /></CardContent>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
