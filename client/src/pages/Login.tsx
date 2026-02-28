import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, Building2, User, Users, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "member";
  const type = params.get("type") || "visitor";

  const { toast } = useToast();
  const { language, isRTL } = useLanguage();
  const { loginMutation } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regInterests, setRegInterests] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى ملء جميع الحقول" : "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const user = await loginMutation.mutateAsync({
        username,
        password,
        role,
        type
      });

      // Role Validation
      if (type === 'employee' && user.role !== 'manager' && user.role !== 'admin' && user.role !== 'member') {
        // Maybe 'member' is employee? Usually 'member' is default. 
        // If visitor tries to login as employee
        if (user.role === 'visitor') {
          throw new Error(language === 'ar' ? "ليس لديك صلاحية دخول الموظفين" : "Access Denied: You are a visitor");
        }
      }

      if (type === 'office' && user.role !== 'office_renter' && user.role !== 'admin') {
        if (user.role === 'visitor') {
          throw new Error(language === 'ar' ? "ليس لديك صلاحية دخول المكتب" : "Access Denied: You are a visitor");
        }
      }

      localStorage.setItem('loggedInAs', type);

      toast({
        title: language === 'ar' ? "تم تسجيل الدخول" : "Login Successful",
        description: language === 'ar' ? `مرحباً بك ${user.firstName}` : `Welcome back ${user.firstName}`,
      });

      // Redirect based on role first, then type
      if (user.role === 'admin') {
        setLocation('/admin-dashboard');
      } else if (user.role === 'support') {
        setLocation('/tech-dashboard');
      } else if (type === 'office') {
        setLocation('/dashboard');
      } else if (type === 'visitor') {
        setLocation('/profile/visitor');
      } else if (type === 'employee') {
        // Redirect employees to their personal profile as requested
        setLocation('/profile/employee');
      } else {
        setLocation('/');
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // Logout if role check failed but login succeeded
      if (error.message.includes("Access Denied") || error.message.includes("صلاحية")) {
        await apiRequest("POST", "/api/logout");
      }

      toast({
        title: language === 'ar' ? "فشل الدخول" : "Login Failed",
        description: error.message || (language === 'ar' ? "تأكد من اسم المستخدم وكلمة المرور" : "Check your username and password"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFirstName || !regLastName || !regUsername || !regPassword || !regEmail) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "كلمة المرور غير متطابقة" : "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await apiRequest("POST", "/api/register", {
        firstName: regFirstName,
        lastName: regLastName,
        username: regUsername,
        password: regPassword,
        email: regEmail,
        interests: regInterests,
        role: "visitor" // Enforce visitor role for this form
      });

      // Auto login after register
      const user = await loginMutation.mutateAsync({
        username: regUsername,
        password: regPassword,
        role: "visitor",
        type: "visitor"
      });

      localStorage.setItem('loggedInAs', 'visitor');

      toast({
        title: language === 'ar' ? "تم التسجيل بنجاح" : "Registration Successful",
        description: language === 'ar' ? "تم إنشاء حساب الزائر الخاص بك" : "Your visitor account has been created",
      });

      setLocation('/profile/visitor');

    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: language === 'ar' ? "فشل التسجيل" : "Registration Failed",
        description: error.message || (language === 'ar' ? "حدث خطأ أثناء التسجيل" : "An error occurred during registration"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    if (role === 'office_renter') return <Building2 className="h-8 w-8 text-amber-500" />;
    if (type === 'employee') return <Users className="h-8 w-8 text-emerald-500" />;
    return <User className="h-8 w-8 text-blue-500" />;
  };

  const getTitle = () => {
    if (isRegistering) {
      return language === 'ar' ? 'تسجيل زائر جديد' : 'New Visitor Registration';
    }
    if (language === 'ar') {
      if (role === 'office_renter') return 'دخول المكتب';
      if (type === 'employee') return 'دخول الموظفين';
      return 'تسجيل الدخول';
    } else {
      if (role === 'office_renter') return 'Office Login';
      if (type === 'employee') return 'Employee Login';
      return 'Login';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => {
                if (isRegistering) setIsRegistering(false);
                else setLocation('/');
              }}
            >
              {isRegistering ? (isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />) : (isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />)}
            </Button>
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
              {getRoleIcon()}
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl text-white font-bold">{getTitle()}</CardTitle>
            <CardDescription className="text-gray-400">
              {isRegistering
                ? (language === 'ar' ? 'أنشئ حسابك للوصول إلى الخدمات' : 'Create your account to access services')
                : (language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your credentials to continue')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">{language === 'ar' ? 'الاسم الأول' : 'First Name'}</Label>
                  <Input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">{language === 'ar' ? 'الاسم الأخير' : 'Last Name'}</Label>
                  <Input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</Label>
                <Input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                <Input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                <Input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="bg-[#0B0F19] border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">{language === 'ar' ? 'الاهتمامات' : 'Interests'}</Label>
                <Textarea
                  value={regInterests}
                  onChange={(e) => setRegInterests(e.target.value)}
                  className="bg-[#0B0F19] border-white/10 text-white resize-none"
                  placeholder={language === 'ar' ? 'مثال: تقنية، تسويق، قانون...' : 'e.g. Tech, Marketing, Law...'}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold" disabled={loading}>
                {loading ? (language === 'ar' ? 'جاري التسجيل...' : 'Registering...') : (language === 'ar' ? 'تسجيل' : 'Register')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label className="text-gray-300">
                  {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </Label>
                <Input
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                  className="bg-[#0B0F19] border-white/10 text-white h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
                <Input
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#0B0F19] border-white/10 text-white h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-lg"
                disabled={loading}
              >
                {loading ? (language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (language === 'ar' ? 'دخول' : 'Login')}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1a1f2e] px-2 text-gray-400">
                    {language === 'ar' ? 'أو' : 'Or'}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => {
                  // Store pending profile type so Landing/App can handle redirect
                  localStorage.setItem('pendingProfileType', type as string);
                  window.location.href = '/api/auth/google';
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {language === 'ar' ? 'الدخول عبر جوجل' : 'Login with Google'}
              </Button>

            </form>
          )}
        </CardContent>
        {!isRegistering && type === 'visitor' && (
          <CardFooter className="flex justify-center border-t border-white/5 pt-4">
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300 underline" onClick={() => setIsRegistering(true)}>
              {language === 'ar' ? 'ليس لديك حساب؟ سجل كزائر الآن' : "Don't have an account? Register as Visitor"}
            </Button>
          </CardFooter>
        )}
        {isRegistering && (
          <CardFooter className="flex justify-center border-t border-white/5 pt-4">
            <Button variant="ghost" className="text-gray-400 hover:text-gray-300 underline" onClick={() => setIsRegistering(false)}>
              {language === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : "Already have an account? Login"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
