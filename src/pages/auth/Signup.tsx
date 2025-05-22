
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { AuthLogo } from '@/components/auth/AuthLogo';

export default function Signup() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("app.auth.passwordMismatch"));
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error(t("app.auth.passwordTooShort"));
      return;
    }
    
    setLoading(true);
    
    try {
      await signup(formData.email, formData.password, formData.name, formData.phone);
      toast.success(t("app.auth.signupSuccess"));
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(t("app.auth.signupError"));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <AuthLogo />
          <CardTitle className="text-2xl">{t("app.auth.createAccount")}</CardTitle>
          <CardDescription>
            {t("app.auth.enterDetails")}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("app.auth.fullName")}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t("app.auth.fullNamePlaceholder")}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t("app.auth.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("app.auth.emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t("app.auth.phone")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder={t("app.auth.phonePlaceholder")}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("app.auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("app.auth.passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("app.auth.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t("app.auth.confirmPasswordPlaceholder")}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("common.loading") : t("app.auth.signup")}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {t("app.auth.alreadyHaveAccount")}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t("app.auth.login")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
