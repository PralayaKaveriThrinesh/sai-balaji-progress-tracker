
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { toast } from '@/components/ui/sonner';
import { AuthLogo } from '@/components/auth/AuthLogo';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error(t("app.auth.allFieldsRequired"));
      return;
    }

    setLoading(true);
    
    try {
      // Pass email and password to login
      await login(email, password);
      toast.success(t("app.auth.loginSuccess"));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t("app.auth.loginError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <AuthLogo />
          <CardTitle className="text-2xl">{t("app.auth.login")}</CardTitle>
          <CardDescription>
            {t("app.auth.enterCredentials")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("app.auth.email")}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t("app.auth.emailPlaceholder")} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("app.auth.password")}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t("app.auth.forgotPassword")}
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder={t("app.auth.passwordPlaceholder")} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("app.auth.login")}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {t("app.auth.noAccount")}{' '}
              <Link to="/signup" className="text-primary hover:underline">
                {t("app.auth.signup")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
