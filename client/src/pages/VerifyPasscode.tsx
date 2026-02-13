import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { useLanguage, translations } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyPasscode() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // If user is already verified or not logged in, redirect
  useEffect(() => {
    // Note: We check user existence to avoid redirecting while loading
    // We check mfaVerified explicitly
    if (user && (user as any).mfaVerified === true) {
      const returnUrl = sessionStorage.getItem("mfa_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("mfa_return_url");
        setLocation(returnUrl);
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/mfa/verify", { code });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم التحقق بنجاح" : "Verified Successfully",
        description: language === 'ar' ? "تم تأكيد هويتك." : "Your identity has been confirmed.",
      });
      // Invalidate user query to update mfaVerified status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      const returnUrl = sessionStorage.getItem("mfa_return_url");
      if (returnUrl) {
        sessionStorage.removeItem("mfa_return_url");
        setLocation(returnUrl);
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "فشل التحقق" : "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/mfa/resend");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'ar' ? "تم إرسال الرمز" : "Code Sent",
        description: language === 'ar' ? "تم إرسال رمز جديد." : "A new code has been sent.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    verifyMutation.mutate(code);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{language === 'ar' ? "التحقق من الهوية" : "Identity Verification"}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? "يرجى إدخال الرمز الذي تم إرساله إليك للمتابعة." 
              : "Please enter the code sent to you to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={language === 'ar' ? "أدخل الرمز (6 أرقام)" : "Enter Code (6 digits)"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={verifyMutation.isPending || code.length < 6}
            >
              {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {language === 'ar' ? "تحقق" : "Verify"}
            </Button>

            <div className="text-center">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-sm text-muted-foreground"
              >
                {resendMutation.isPending 
                  ? (language === 'ar' ? "جاري الإرسال..." : "Sending...") 
                  : (language === 'ar' ? "إعادة إرسال الرمز" : "Resend Code")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
