import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, Building2, User, Users } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const role = params.get("role") || "member";
  const type = params.get("type") || "visitor";
  
  const { toast } = useToast();
  const { language, isRTL } = useLanguage();
  const { loginMutation } = useAuth(); // Use loginMutation from useAuth
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // loading state comes from mutation
  const loading = loginMutation.isPending; 

  useEffect(() => {
    // Pre-fill username based on role for convenience
    if (role === "office_renter") setUsername("office_admin");
    else if (role === "admin") setUsername("admin");
    else if (role === "manager") setUsername("manager");
    // Removed employee auto-fill as requested
  }, [role, type]);

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
      // Use useAuth mutation to ensure query cache is updated
      const user = await loginMutation.mutateAsync({ 
        username, 
        password,
        role,
        type 
      });
      
      localStorage.setItem('loggedInAs', type);
      
      toast({
        title: language === 'ar' ? "تم تسجيل الدخول" : "Login Successful",
        description: language === 'ar' ? `مرحباً بك ${user.firstName}` : `Welcome back ${user.firstName}`,
      });

      // Redirect based on type
      if (type === 'office') {
        // Explicitly redirect to Dashboard for office users as requested
        setLocation('/dashboard');
      } else if (type === 'visitor') {
        setLocation('/profile/visitor');
      } else if (type === 'employee') {
        // Redirect employees to dashboard as "Control Panel"
        setLocation('/dashboard');
      } else {
        setLocation('/');
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Toast is handled by useAuth onError usually, but we can keep this for safety or remove if redundant
    }
  };

  const getRoleIcon = () => {
    if (role === 'office_renter') return <Building2 className="h-8 w-8 text-amber-500" />;
    if (type === 'employee') return <Users className="h-8 w-8 text-emerald-500" />;
    return <User className="h-8 w-8 text-blue-500" />;
  };

  const getTitle = () => {
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
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-3 rounded-full bg-white/5 border border-white/10">
              {getRoleIcon()}
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl text-white font-bold">{getTitle()}</CardTitle>
            <CardDescription className="text-gray-400">
              {language === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your credentials to continue'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
            
            <div className="text-center text-xs text-gray-500 mt-4">
              <p>{language === 'ar' ? 'للتجربة: استخدم أي كلمة مرور' : 'For demo: use any password'}</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
