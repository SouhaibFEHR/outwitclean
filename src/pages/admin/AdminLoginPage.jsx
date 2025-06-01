import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LogIn, AlertTriangle } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/da4e84807be20560b6128922b55295de.png";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      toast({ title: 'Login Failed', description: signInError.message, variant: 'destructive' });
    } else if (data.session) {
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      navigate('/admin/dashboard');
    } else {
      // Should not happen if no error and no session, but handle just in case
      setError('An unexpected error occurred during login. Please try again.');
      toast({ title: 'Login Failed', description: 'Unexpected error.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-background/90 p-4">
      <Card className="w-full max-w-md glassmorphism-deep shadow-2xl">
        <CardHeader className="text-center">
          <img src={logoUrl} alt="Outwit Agency Logo" className="h-16 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-gradient">Admin Access</CardTitle>
          <CardDescription className="text-muted-foreground">Enter credentials to manage Outwit Systems.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@outwit.agency"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border/50 focus:border-primary h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border/50 focus:border-primary h-12 text-lg"
              />
            </div>
            {error && (
              <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-12 button-hover-glow">
              {loading ? 'Authenticating...' : <><LogIn className="mr-2 h-5 w-5" /> Secure Login</>}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Outwit Agency. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;