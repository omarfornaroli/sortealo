
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore, useDoc, useUser } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  const adminSettingsRef = useMemo(() => (db ? doc(db, 'settings', 'admin') : null), [db]);
  const { data: adminSettings, loading: settingsLoading } = useDoc(adminSettingsRef);

  useEffect(() => {
    if (!userLoading && user && user.email === adminEmail) {
      router.push('/admin');
    }
  }, [user, userLoading, router, adminEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setLoading(true);
    setError(null);

    try {
      if (email !== adminEmail) {
        throw new Error('Este email no tiene permisos de administrador.');
      }

      if (!adminSettings?.isInitialized) {
        // First time setup: Generate/Set the password
        await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'settings', 'admin'), {
          isInitialized: true,
          setupDate: serverTimestamp()
        });
      } else {
        // Standard Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isFirstTime = !adminSettings?.isInitialized;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-none shadow-2xl">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Lock className="text-primary w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-headline font-bold">
                  {isFirstTime ? 'Configuración Inicial' : 'Acceso Administrativo'}
                </CardTitle>
                <CardDescription>
                  {isFirstTime 
                    ? 'Establece tu contraseña de administrador por primera vez.' 
                    : 'Ingresa tus credenciales para gestionar el sitio.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Administrador</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder={adminEmail || 'admin@example.com'} 
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white h-12 font-bold"
                >
                  {loading ? 'Cargando...' : isFirstTime ? 'Generar Acceso' : 'Ingresar al Panel'}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest text-center mt-6">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Solo personal autorizado
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { useMemo } from 'react';
