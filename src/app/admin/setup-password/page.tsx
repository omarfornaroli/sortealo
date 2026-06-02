
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { KeyRound, CheckCircle } from 'lucide-react';

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
        toast({ title: 'Éxito', description: 'Contraseña configurada correctamente.' });
        router.push('/admin/login');
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
    return <div className="text-center p-10">Token de configuración inválido.</div>;
  }

  return (
    <form onSubmit={handleSetup}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Nueva Contraseña</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Confirmar Contraseña</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full h-11 font-bold gap-2" disabled={loading}>
          <CheckCircle className="w-4 h-4" />
          {loading ? 'Configurando...' : 'Finalizar Registro'}
        </Button>
      </CardFooter>
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Configurar Contraseña</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Establece tu contraseña para acceder al sistema.
          </p>
        </CardHeader>
        <Suspense fallback={<CardContent><p className="text-center">Cargando...</p></CardContent>}>
          <SetupForm />
        </Suspense>
      </Card>
    </div>
  );
}
