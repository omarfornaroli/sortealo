
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { KeyRound, CheckCircle, Loader2 } from 'lucide-react';

function SetupForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Éxito', description: 'Contraseña configurada. Ahora puedes iniciar sesión.' });
        router.push('/auth/login');
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <CardContent className="p-8 text-center space-y-4">
        <p className="text-red-500 font-bold">Token de configuración inválido o expirado.</p>
        <Button asChild variant="link" className="text-primary"><a href="/auth/login">Ir al login</a></Button>
      </CardContent>
    );
  }

  return (
    <form onSubmit={handleSetup}>
      <CardContent className="space-y-6 px-10">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nueva Contraseña</label>
          <Input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-12 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmar Contraseña</label>
          <Input
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12 rounded-xl bg-slate-50 border-slate-200"
          />
        </div>
      </CardContent>
      <CardFooter className="p-10 pt-6">
        <Button type="submit" className="w-full h-14 font-bold gap-2 rounded-xl shadow-lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          {loading ? 'Guardando...' : 'Establecer Contraseña'}
        </Button>
      </CardFooter>
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="p-10 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Configurar Cuenta</CardTitle>
          <p className="text-slate-500 font-medium pt-2">
            Crea tu contraseña para acceder al sistema.
          </p>
        </CardHeader>
        <Suspense fallback={<CardContent className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></CardContent>}>
          <SetupForm />
        </Suspense>
      </Card>
    </div>
  );
}
