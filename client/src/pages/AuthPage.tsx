import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  // Check for admin query param
  const searchParams = new URLSearchParams(window.location.search);
  const isAdminLogin = searchParams.get('admin') === 'true';

  const { loginMutation, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  if (user && (user.role === 'admin' || user.role === 'super_admin') && isAdminLogin) {
    setLocation("/admin/platform");
    return null;
  }

  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      const data = await loginMutation.mutateAsync({ username: loginUsername, password: loginPassword });
      
      // Redirect based on role
      if (data.user?.role === 'admin' || data.user?.role === 'super_admin') {
        setLocation("/admin/platform");
      } else if (data.user?.role === 'visitor') {
        setLocation("/welcome");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      // Error handling is done in the mutation
    }
  };

  const handleAdminDirectLogin = async () => {
    setLoginUsername("admin@desktown.app");
    setLoginPassword("201667");
    
    // Auto-submit after setting
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isAdminLogin ? "دخول الإدارة" : "مرحباً بك في DeskTown"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isAdminLogin ? "دخول مباشر وآمن للمشرفين" : "قم بتسجيل الدخول إلى حسابك"}
          </p>
        </div>

        <Card className="w-full border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>{isAdminLogin ? "الإدارة" : "تسجيل الدخول"}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {isAdminLogin && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4 text-center">
                  <p className="text-sm font-semibold text-primary mb-2">Admin Credentials</p>
                  <p className="text-xs text-muted-foreground">Email: admin@desktown.app</p>
                  <p className="text-xs text-muted-foreground">Password: 201667</p>
                  <Button 
                    type="button"
                    variant="link" 
                    className="text-xs mt-2 h-auto p-0"
                    onClick={handleAdminDirectLogin}
                  >
                    Click to auto-fill and login
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">{language === 'ar' ? 'اسم المستخدم أو البريد' : 'Username or Email'}</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder={language === 'ar' ? 'أدخل اسم المستخدم أو البريد' : 'Enter your username or email'}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ar' ? 'جاري الدخول...' : 'Logging in...'}
                  </>
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </Button>
              {isAdminLogin && (
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation("/")}
                >
                  {language === 'ar' ? 'العودة للموقع' : 'Back to Website'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
