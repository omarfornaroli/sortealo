
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('/api/auth/register');
        const data = await res.json();
        if (data.needsSetup) {
          setIsFirstRun(true);
        }
      } catch (err) {
        console.error('Error checking setup status');
      }
    };
    checkSetup();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isFirstRun ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: isFirstRun ? 'Configuración Completa' : 'Bienvenido',
          description: isFirstRun ? 'Administrador registrado con éxito.' : 'Sesión iniciada correctamente.',
        });
        router.push('/admin');
        router.refresh();
      } else {
        toast({ 
          title: 'Error', 
          description: data.message || 'Credenciales inválidas', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Ocurrió un error inesperado al conectar con el servidor', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isFirstRun ? 'Configurar Master' : 'Panel Administrativo'}
          </CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            {isFirstRun ? 'Crea la contraseña para el email autorizado' : 'Ingresa tus credenciales para continuar'}
          </p>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {isFirstRun && (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertDescription>
                  Se requiere la configuración inicial. Utiliza el email configurado en el sistema.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tu-sitio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="password">Contraseña</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base font-bold gap-2" disabled={loading}>
              {loading ? (
                'Procesando...'
              ) : isFirstRun ? (
                <><UserPlus className="w-4 h-4" /> Registrar y Entrar</>
              ) : (
                <><LogIn className="w-4 h-4" /> Iniciar Sesión</>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
