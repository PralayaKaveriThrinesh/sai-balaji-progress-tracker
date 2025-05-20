
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('leader');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoginLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      // Redirect is handled in the auth context
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsLoginLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsRegisterLoading(true);
    
    try {
      const success = await register(registerName, registerEmail, registerPassword, registerRole);
      
      if (success) {
        // Reset form
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsRegisterLoading(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">SaiBalaji Progress Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Sign in or create an account to continue
        </p>
      </div>
      
      <Tabs defaultValue="login">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials to sign in
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Fill in the details to register
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={registerRole}
                    onValueChange={(value) => setRegisterRole(value as UserRole)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="checker">Checker</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegisterLoading}
                >
                  {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
