
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { UserPlus, ArrowLeft, MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Error al conectar con el servidor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-slate-200 p-8 rounded-[2rem]">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-2xl">
                <MailCheck className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Solicitud Enviada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-slate-500 font-medium">
              Se ha enviado una notificación al administrador para aprobar tu acceso. 
              Recibirás un email una vez aprobado.
            </p>
          </CardContent>
          <CardFooter className="pt-8">
            <Button asChild variant="outline" className="w-full h-12 rounded-xl">
              <Link href="/auth/login">Volver al Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-1 p-10 pb-6 text-center">
          <CardTitle className="text-3xl font-bold font-headline">Solicitar Acceso</CardTitle>
          <p className="text-slate-500 font-medium pt-2">
            Regístrate para gestionar sorteos en Sortealo.
          </p>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-6 px-10">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="email">Tu Email</label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 p-10 pt-6">
            <Button type="submit" className="w-full h-14 font-bold gap-2 text-base rounded-xl shadow-lg" disabled={loading}>
              <UserPlus className="w-5 h-5" />
              {loading ? 'Procesando...' : 'Solicitar Registro'}
            </Button>
            <Link href="/auth/login" className="text-sm text-primary font-bold hover:underline flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Ya tengo una cuenta
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
