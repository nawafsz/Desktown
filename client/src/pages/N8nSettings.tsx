import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, Lock, User, ArrowRight, Activity, ShieldCheck, PlayCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function N8nServicePage() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Local state for "Service Login"
  const [isServiceLoggedIn, setIsServiceLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard states
  const [activeWorkflows, setActiveWorkflows] = useState(24);
  const [showEditor, setShowEditor] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login verification
    setTimeout(() => {
      setIsLoading(false);
      if (username && password) {
        setIsServiceLoggedIn(true);
        toast({
          title: language === 'ar' ? "تم تسجيل الدخول" : "Logged In",
          description: language === 'ar' ? "مرحباً بك في خدمة n8n" : "Welcome to n8n Service",
        });
      } else {
        toast({
          title: language === 'ar' ? "خطأ" : "Error",
          description: language === 'ar' ? "يرجى إدخال اسم المستخدم وكلمة المرور" : "Please enter username and password",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  const handleLogout = () => {
    setIsServiceLoggedIn(false);
    setShowEditor(false);
    setUsername("");
    setPassword("");
    toast({
      title: language === 'ar' ? "تم تسجيل الخروج" : "Logged Out",
      description: language === 'ar' ? "تم تسجيل الخروج بنجاح" : "Successfully logged out",
    });
  };

  const handleCreateWorkflow = () => {
    toast({
      title: language === 'ar' ? "جاري الإنشاء" : "Creating...",
      description: language === 'ar' ? "يتم إعداد مساحة عمل جديدة" : "Setting up new workspace",
    });
    setTimeout(() => {
        setActiveWorkflows(prev => prev + 1);
        setShowEditor(true);
        toast({
            title: language === 'ar' ? "تم الإنشاء" : "Created",
            description: language === 'ar' ? "تم إنشاء سير عمل جديد بنجاح" : "New workflow created successfully",
            variant: "default" // "success" if available, else default
        });
    }, 800);
  };

  const handleLaunchEditor = () => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setShowEditor(true);
          toast({
              title: language === 'ar' ? "المحرر جاهز" : "Editor Ready",
              description: language === 'ar' ? "تم تشغيل بيئة العمل بنجاح" : "Workspace launched successfully",
          });
      }, 500);
  };

  const isRTL = language === 'ar';

  if (!isServiceLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="w-full max-w-md bg-[#1a1f2e] border-white/10 text-white shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {language === 'ar' ? "خدمة n8n للأتمتة" : "n8n Automation Service"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {language === 'ar' ? "تسجيل دخول الموظفين" : "Employee Login Portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{language === 'ar' ? "اسم المستخدم" : "Username"}</Label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500`} />
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`bg-[#0B0F19] border-white/10 ${isRTL ? 'pr-9' : 'pl-9'}`}
                    placeholder={language === 'ar' ? "أدخل اسم المستخدم" : "Enter username"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{language === 'ar' ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500`} />
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-[#0B0F19] border-white/10 ${isRTL ? 'pr-9' : 'pl-9'}`}
                    placeholder={language === 'ar' ? "أدخل كلمة المرور" : "Enter password"}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold h-11" disabled={isLoading}>
                {isLoading ? (language === 'ar' ? "جاري الدخول..." : "Logging in...") : (language === 'ar' ? "دخول" : "Login")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-white/5 pt-6">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck className="h-3 w-3" />
              {language === 'ar' ? "نسخة مجانية مفعلة بالكامل" : "Fully Activated Free Version"}
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Zap className="h-6 w-6 text-white" />
            </span>
            {language === 'ar' ? "لوحة تحكم n8n" : "n8n Dashboard"}
          </h1>
          <p className="text-gray-400 mt-2">
            {language === 'ar' ? "إدارة سير العمل والأتمتة الذكية - نسخة المؤسسات" : "Workflow Automation Management - Enterprise Edition"}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             {language === 'ar' ? "النظام يعمل" : "System Operational"}
           </div>
           <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={handleLogout}>
             {language === 'ar' ? "تسجيل خروج" : "Logout"}
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1f2e] border-white/10">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-gray-400 font-medium">{language === 'ar' ? "سير العمل النشط" : "Active Workflows"}</h3>
               <Activity className="h-5 w-5 text-pink-500" />
             </div>
             <p className="text-3xl font-bold text-white">{activeWorkflows}</p>
             <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
               <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
               +12% {language === 'ar' ? "هذا الأسبوع" : "this week"}
             </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1f2e] border-white/10">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-gray-400 font-medium">{language === 'ar' ? "التنفيذات" : "Executions"}</h3>
               <Zap className="h-5 w-5 text-yellow-500" />
             </div>
             <p className="text-3xl font-bold text-white">1,842</p>
             <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
               <ArrowRight className="h-3 w-3 rotate-[-45deg]" />
               +5% {language === 'ar' ? "معدل نجاح" : "success rate"}
             </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1f2e] border-white/10">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-gray-400 font-medium">{language === 'ar' ? "حالة الرخصة" : "License Status"}</h3>
               <ShieldCheck className="h-5 w-5 text-blue-500" />
             </div>
             <p className="text-xl font-bold text-white">{language === 'ar' ? "مفعلة بالكامل" : "Fully Activated"}</p>
             <p className="text-xs text-blue-400 mt-2">
               {language === 'ar' ? "نسخة مجانية غير محدودة" : "Free Unlimited Version"}
             </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content / Editor */}
      <Card className="bg-[#1a1f2e] border-white/10 flex-1 min-h-[500px] flex flex-col">
        <CardHeader>
           <div className="flex items-center justify-between">
             <CardTitle className="text-white">{language === 'ar' ? "محرر سير العمل" : "Workflow Editor"}</CardTitle>
             <Button 
                className="bg-pink-600 hover:bg-pink-700 text-white gap-2"
                onClick={handleCreateWorkflow}
             >
               <PlayCircle className="h-4 w-4" />
               {language === 'ar' ? "إنشاء سير عمل جديد" : "Create New Workflow"}
             </Button>
           </div>
        </CardHeader>
        <CardContent className="flex-1 bg-[#0B0F19] m-6 rounded-xl border border-white/5 flex relative overflow-hidden group">
           {showEditor ? (
             <div className="w-full h-full relative bg-[#151515] flex">
                {/* Mock Sidebar */}
                <div className="w-16 border-r border-white/10 flex flex-col items-center py-4 gap-4">
                    <div className="w-8 h-8 rounded bg-pink-500/20 text-pink-500 flex items-center justify-center"><Zap className="h-4 w-4" /></div>
                    <div className="w-8 h-8 rounded hover:bg-white/5 text-gray-400 flex items-center justify-center"><User className="h-4 w-4" /></div>
                    <div className="w-8 h-8 rounded hover:bg-white/5 text-gray-400 flex items-center justify-center"><Activity className="h-4 w-4" /></div>
                </div>
                {/* Mock Canvas */}
                <div className="flex-1 relative bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="absolute top-4 left-4 right-4 h-12 bg-[#1e1e1e] rounded-lg border border-white/10 flex items-center px-4 justify-between">
                        <span className="text-white text-sm font-medium">My Workflow 1</span>
                        <div className="flex gap-2">
                             <div className="h-2 w-2 rounded-full bg-green-500"></div>
                             <span className="text-xs text-gray-400">Active</span>
                        </div>
                    </div>
                    {/* Fake Nodes */}
                    <div className="absolute top-1/3 left-1/4 w-32 h-20 bg-[#2d2d2d] border border-green-500/50 rounded-lg p-3 shadow-lg flex flex-col justify-between">
                         <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs text-white">Webhook</span></div>
                         <div className="text-[10px] text-gray-500">Waiting...</div>
                    </div>
                    <ArrowRight className="absolute top-[40%] left-[calc(25%+8rem)] text-gray-600 h-6 w-6" />
                    <div className="absolute top-1/3 left-1/2 w-32 h-20 bg-[#2d2d2d] border border-blue-500/50 rounded-lg p-3 shadow-lg flex flex-col justify-between">
                         <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full"></div><span className="text-xs text-white">Filter</span></div>
                         <div className="text-[10px] text-gray-500">Processing</div>
                    </div>
                </div>
             </div>
           ) : (
             <>
               <div className="absolute inset-0 bg-[url('https://n8n.io/_nuxt/img/workflow.5d12267.png')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"></div>
               <div className="text-center z-10 p-8 bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10">
                 <Zap className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">
                   {language === 'ar' ? "مساحة عمل n8n" : "n8n Workspace"}
                 </h3>
                 <p className="text-gray-400 mb-6 max-w-md mx-auto">
                   {language === 'ar' 
                     ? "قم بتوصيل تطبيقاتك وأتمتة سير العمل الخاص بك باستخدام محرر n8n القوي." 
                     : "Connect your apps and automate your workflows using the powerful n8n editor."}
                 </p>
                 <Button size="lg" className="bg-white text-black hover:bg-gray-200" onClick={handleLaunchEditor} disabled={isLoading}>
                   {isLoading ? (language === 'ar' ? "جاري التشغيل..." : "Launching...") : (language === 'ar' ? "تشغيل المحرر" : "Launch Editor")}
                 </Button>
               </div>
             </>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
