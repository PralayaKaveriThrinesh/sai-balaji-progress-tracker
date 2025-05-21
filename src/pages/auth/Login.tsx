
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Google } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Login = () => {
  const { login, register, requestOtp, verifyOtp, resetPassword, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerRole, setRegisterRole] = useState<UserRole>('leader');
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  
  // Get available roles from localStorage
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const takenRoles: string[] = ['admin', 'owner', 'checker'].filter(role => 
      users.some((u: any) => u.role === role)
    );
    
    const allRoles: UserRole[] = ['admin', 'owner', 'checker', 'leader'];
    return allRoles.filter(role => !takenRoles.includes(role) || role === 'leader');
  });
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error(t('allFieldsRequired'));
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
    
    if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
      toast.error(t('allFieldsRequired'));
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error(t('passwordMinLength'));
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
        setConfirmPassword('');
        
        // Update available roles
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const takenRoles: string[] = ['admin', 'owner', 'checker'].filter(role => 
          users.some((u: any) => u.role === role)
        );
        
        const allRoles: UserRole[] = ['admin', 'owner', 'checker', 'leader'];
        setAvailableRoles(allRoles.filter(role => !takenRoles.includes(role) || role === 'leader'));
      }
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsRegisterLoading(false);
    }
  };
  
  const handleSendOtp = async () => {
    if (!forgotPasswordEmail) {
      toast.error(t('allFieldsRequired'));
      return;
    }
    
    setIsOtpLoading(true);
    try {
      const success = await requestOtp(forgotPasswordEmail);
      if (success) {
        setOtpSent(true);
      }
    } finally {
      setIsOtpLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmNewPassword) {
      toast.error(t('allFieldsRequired'));
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }
    
    setIsResetLoading(true);
    try {
      // First verify OTP
      const otpVerified = await verifyOtp(forgotPasswordEmail, otp);
      if (!otpVerified) {
        return;
      }
      
      // Then reset password
      const success = await resetPassword(forgotPasswordEmail, newPassword);
      if (success) {
        setForgotPasswordOpen(false);
        setOtpSent(false);
        setForgotPasswordEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } finally {
      setIsResetLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // In a real app, this would redirect to Google OAuth
    toast.info('Google login would be implemented here.');
  };
  
  return (
    <div className="container max-w-md mx-auto py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">{t('appName')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('signInWith')} {t('appName')}
        </p>
      </div>
      
      <Tabs defaultValue="login">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">{t('login')}</TabsTrigger>
          <TabsTrigger value="register">{t('register')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>{t('login')}</CardTitle>
              <CardDescription>
                {t('enterYourCredentials')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      {t('forgotPassword')}?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? t('loading') : t('signIn')}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t('or')}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <Google className="mr-2 h-4 w-4" />
                  {t('signInWith')} Google
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>{t('createAccount')}</CardTitle>
              <CardDescription>
                {t('fillInDetailsToRegister')}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">{t('role')}</Label>
                  <Select
                    value={registerRole}
                    onValueChange={(value) => setRegisterRole(value as UserRole)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder={t('selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {t(role)}
                        </SelectItem>
                      ))}
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
                  {isRegisterLoading ? t('creatingAccount') : t('createAccount')}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('forgotPassword')}</DialogTitle>
            <DialogDescription>
              {otpSent 
                ? t('enterOtp') 
                : t('enterYourEmailToResetPassword')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!otpSent ? (
              <div className="space-y-2">
                <Label htmlFor="fp-email">{t('email')}</Label>
                <Input
                  id="fp-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={isOtpLoading}
                />
              </div>
            ) : (
              <>
                <div className="text-center text-sm text-muted-foreground mb-4">
                  {t('otpSentTo')} <strong>{forgotPasswordEmail}</strong>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('enterOtp')}</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="space-y-2 pt-2">
                  <Label htmlFor="new-password">{t('newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">{t('confirmPassword')}</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setForgotPasswordOpen(false);
                setOtpSent(false);
                setForgotPasswordEmail('');
                setOtp('');
              }}
            >
              {t('cancel')}
            </Button>
            {otpSent ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleSendOtp}
                  disabled={isOtpLoading}
                >
                  {isOtpLoading ? t('sending') : t('resendOtp')}
                </Button>
                <Button onClick={handleResetPassword} disabled={isResetLoading}>
                  {isResetLoading ? t('resetting') : t('resetPassword')}
                </Button>
              </div>
            ) : (
              <Button onClick={handleSendOtp} disabled={isOtpLoading}>
                {isOtpLoading ? t('sending') : t('continue')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
