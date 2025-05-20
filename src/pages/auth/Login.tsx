
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';
import { getUserByEmail } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/30 p-4">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1545193544-312983719627?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <motion.span 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
            >
              Sai Balaji
            </motion.span>
            <span className="ml-2 text-lg text-muted-foreground">Progress Tracker</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-card/80 backdrop-blur-sm border-primary/20 hover:bg-primary/20"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        <Card className="w-full border border-primary/20 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="pl-10 bg-background/50 border-primary/20 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 pr-10 bg-background/50 border-primary/20 focus-visible:ring-primary"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-destructive text-sm"
                >
                  {error}
                </motion.p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t border-primary/10 pt-4">
            <div className="text-sm text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
