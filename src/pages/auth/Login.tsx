import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login Form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = loginForm;

  const loginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signIn(values.email, values.password);
      navigate('/');
      toast({
        title: t('loginSuccess'),
        description: t('welcomeBack'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('loginFailed'),
        description: t('incorrectEmailOrPassword'),
      });
    }
  };

  // Registration Form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = registerForm;

  const registerSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await signUp(values.name, values.email, values.password);
      navigate('/');
      toast({
        title: t('registrationSuccess'),
        description: t('accountCreated'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('registrationFailed'),
        description: t('emailAlreadyInUse'),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('authentication')}</CardTitle>
          <CardDescription className="text-center">{t('loginOrRegister')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList>
              <TabsTrigger value="login">{t('login')}</TabsTrigger>
              <TabsTrigger value="register">{t('register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={handleLoginSubmit(loginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input placeholder="example@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage>{loginErrors?.email?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('password')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-8"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <FormMessage>{loginErrors?.password?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">{t('login')}</Button>
                </form>
              </Form>
              <Separator />
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="register" className="space-y-4">
              <Form {...registerForm}>
                <form onSubmit={handleRegisterSubmit(registerSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage>{registerErrors?.name?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input placeholder="example@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage>{registerErrors?.email?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('password')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2 top-8"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <FormMessage>{registerErrors?.password?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">{t('register')}</Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center">
          {t('byContinuing')}
          <Link to="/terms" className="text-sm hover:underline">
            {t('termsOfService')}
          </Link>
          {t('and')}
          <Link to="/privacy" className="text-sm hover:underline">
            {t('privacyPolicy')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
