import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  // Check for admin query param
  const searchParams = new URLSearchParams(window.location.search);
  const isAdminLogin = searchParams.get('admin') === 'true';

  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/admin-direct-login", {});
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Welcome back, Admin",
        });
        setLocation("/admin/platform");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Admin login failed",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isAdminLogin ? "Admin Login" : "Welcome to DeskTown"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isAdminLogin ? "Secure access for administrators" : "Sign in to your account"}
          </p>
        </div>

        <Card className="w-full border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>{isAdminLogin ? "Administration" : "Login"}</CardTitle>
          </CardHeader>
          
          <CardContent>
            {isAdminLogin ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Click the button below to access the administration panel directly.
                </p>
                <Button 
                  onClick={handleAdminDirectLogin} 
                  className="w-full h-12 text-lg font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Enter Admin Panel"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation("/")}
                  disabled={isLoading}
                >
                  Back to Website
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter your username or email"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
