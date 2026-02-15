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

      // Redirect based on type
      if (type === 'office') {
        setLocation('/dashboard');
      } else if (type === 'visitor') {
        setLocation('/profile/visitor');
      } else if (type === 'employee') {
        // Redirect employees to their personal profile as requested
        setLocation('/profile');
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">
                  {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </Label>
                <Input 
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
              
            </form>
          )}
        </CardContent>
        {!isRegistering && type === 'visitor' && (
            <CardFooter className="flex justify-center border-t border-white/5 pt-4">
                <Button variant="link" className="text-blue-400 hover:text-blue-300" onClick={() => setIsRegistering(true)}>
                    {language === 'ar' ? 'ليس لديك حساب؟ سجل كزائر الآن' : "Don't have an account? Register as Visitor"}
                </Button>
            </CardFooter>
        )}
        {isRegistering && (
             <CardFooter className="flex justify-center border-t border-white/5 pt-4">
                <Button variant="link" className="text-gray-400 hover:text-gray-300" onClick={() => setIsRegistering(false)}>
                    {language === 'ar' ? 'لديك حساب بالفعل؟ تسجيل الدخول' : "Already have an account? Login"}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
