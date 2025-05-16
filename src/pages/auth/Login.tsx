
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { getUserByEmail, getAllUsers } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Menu, Sun, Moon } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = getUserByEmail(email);
    if (!user) {
      setError('User not found. Please check your email.');
      return;
    }

    if (user.password !== password) {
      setError('Invalid password. Please try again.');
      return;
    }

    login(user);
  };

  const handleQuickLogin = (role: string) => {
    const users = getAllUsers();
    const user = users.find(u => u.role === role);
    
    if (user) {
      login(user);
    } else {
      toast.error(`No ${role} user found`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="text-3xl font-bold text-primary">Sai Balaji</span>
            <span className="ml-2 text-lg text-muted-foreground">Progress Tracker</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              For demo purposes, you can sign in as:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('admin')}>
                Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('leader')}>
                Leader
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('checker')}>
                Checker
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('owner')}>
                Owner
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
