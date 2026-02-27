import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage, translations } from "@/lib/i18n";
import { 
  Check, 
  CreditCard, 
  Smartphone, 
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Zap,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  Calendar,
  Briefcase,
  Monitor,
  Mail,
  Video,
  Bell,
  Globe,
  Headphones,
  Lock,
  Palette,
  Wallet,
  Megaphone
} from "lucide-react";
import { PaymentForm } from "@/components/subscription/PaymentForm";
import type { Subscription } from "@shared/schema";

const ADD_ON_SERVICES = [
  { key: "advanced_analytics", nameKey: "advancedAnalytics", icon: BarChart3, descKey: "advancedAnalyticsDesc" },
  { key: "priority_support", nameKey: "prioritySupport", icon: Zap, descKey: "prioritySupportDesc" },
  { key: "team_collaboration", nameKey: "teamCollaboration", icon: Users, descKey: "teamCollaborationDesc" },
  { key: "document_management", nameKey: "documentManagement", icon: FileText, descKey: "documentManagementDesc" },
  { key: "video_conferencing", nameKey: "videoConferencing", icon: MessageSquare, descKey: "videoConferencingDesc" },
  { key: "calendar_sync", nameKey: "calendarIntegration", icon: Calendar, descKey: "calendarIntegrationDesc" },
  { key: "hr_tools", nameKey: "hrManagement", icon: Briefcase, descKey: "hrManagementDesc" },
];

const PAYMENT_METHODS = [
  { key: "apple_pay", nameKey: "applePay", icon: Wallet, descKey: "applePayDesc" },
  { key: "visa", nameKey: "visa", icon: CreditCard, descKey: "visaDesc" },
  { key: "credit_card", nameKey: "creditCard", icon: CreditCard, descKey: "creditCardDesc" },
];

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    cvv: "",
    expiry: ""
  });
  const [step, setStep] = useState<1 | 2>(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPricing = () => ({
    monthly: {
      base: 99,
      addOn: 0,
      label: "VIP",
      period: t.subscription?.perMonth || "/month",
      savings: null
    },
    yearly: {
      base: 999, // 99 * 10 (2 months free roughly)
      addOn: 0,
      label: "VIP Yearly",
      period: t.subscription?.perYear || "/year",
      savings: `${t.subscription?.save || "Save"} 189 SAR`
    }
  });

  const VIP_FEATURES = [
    { icon: Building2, label: { ar: "أقسام غير محدودة", en: "Unlimited Departments" } },
    { icon: MessageSquare, label: { ar: "نظام الشوت بوت (المساعد الذكي)", en: "AI Chatbot Assistant" } },
    { icon: Headphones, label: { ar: "الدعم الفني المميز", en: "Premium Support" } },
    { icon: Zap, label: { ar: "نظام الأتمته n8n", en: "n8n Automation System" } },
    { icon: Megaphone, label: { ar: "أعلاناتك بالصفحة الرئيسية", en: "Homepage Ads Placement" } },
  ];


  const getAddOnServiceName = (nameKey: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      advancedAnalytics: { en: "Advanced Analytics", ar: "تحليلات متقدمة" },
      prioritySupport: { en: "Priority Support", ar: "دعم أولوي" },
      teamCollaboration: { en: "Team Collaboration Tools", ar: "أدوات تعاون الفريق" },
      documentManagement: { en: "Document Management", ar: "إدارة المستندات" },
      videoConferencing: { en: "Video Conferencing", ar: "مؤتمرات الفيديو" },
      calendarIntegration: { en: "Calendar Integration", ar: "تكامل التقويم" },
      hrManagement: { en: "HR Management", ar: "إدارة الموارد البشرية" },
    };
    return names[nameKey]?.[language] || names[nameKey]?.en || nameKey;
  };

  const getAddOnServiceDesc = (descKey: string) => {
    const descs: Record<string, { en: string; ar: string }> = {
      advancedAnalyticsDesc: { en: "Detailed reports and insights", ar: "تقارير ورؤى تفصيلية" },
      prioritySupportDesc: { en: "24/7 dedicated support team", ar: "فريق دعم مخصص على مدار الساعة" },
      teamCollaborationDesc: { en: "Enhanced team features", ar: "ميزات فريق محسنة" },
      documentManagementDesc: { en: "Secure file storage", ar: "تخزين ملفات آمن" },
      videoConferencingDesc: { en: "HD video meetings", ar: "اجتماعات فيديو عالية الدقة" },
      calendarIntegrationDesc: { en: "Sync with external calendars", ar: "مزامنة مع التقويمات الخارجية" },
      hrManagementDesc: { en: "Employee management tools", ar: "أدوات إدارة الموظفين" },
    };
    return descs[descKey]?.[language] || descs[descKey]?.en || descKey;
  };

  const getPaymentMethodName = (nameKey: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      applePay: { en: "Apple Pay", ar: "Apple Pay" },
      visa: { en: "Visa", ar: "فيزا" },
      creditCard: { en: "Credit Card", ar: "بطاقة ائتمان" },
    };
    return names[nameKey]?.[language] || names[nameKey]?.en || nameKey;
  };

  const getPaymentMethodDesc = (descKey: string) => {
    const descs: Record<string, { en: string; ar: string }> = {
      applePayDesc: { en: "Fast and secure", ar: "سريع وآمن" },
      visaDesc: { en: "Credit/Debit card", ar: "بطاقة ائتمان/خصم" },
      creditCardDesc: { en: "Mastercard, Mada, etc.", ar: "ماستركارد، مدى، إلخ." },
    };
    return descs[descKey]?.[language] || descs[descKey]?.en || descKey;
  };

  const { data: existingSubscription, isLoading: checkingSubscription } = useQuery<Subscription | null>({
    queryKey: ['/api/subscriptions/active'],
  });

  const createSubscription = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/subscriptions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
      toast({
        title: language === 'ar' ? "تم تفعيل الاشتراك" : "Subscription Activated",
        description: language === 'ar' 
          ? "اشتراك مكتبك نشط الآن. جاري إعداد مساحة العمل..."
          : "Your office subscription is now active. Setting up your workspace...",
      });
      setTimeout(() => {
        setLocation("/departments");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "فشل الاشتراك" : "Subscription Failed",
        description: error.message || (language === 'ar' 
          ? "فشل معالجة الاشتراك. يرجى المحاولة مرة أخرى."
          : "Failed to process subscription. Please try again."),
        variant: "destructive",
      });
    },
  });

  const pricing = getPricing()[billingCycle];
  const basePrice = pricing.base;
  const addOnPrice = selectedAddOns.length * (billingCycle === "monthly" ? 50 : 200);
  const totalPrice = basePrice + addOnPrice;

  const toggleAddOn = (key: string) => {
    setSelectedAddOns(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleSubscribe = () => {
    if (step === 2 && paymentMethod === 'credit_card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.cvv || !cardDetails.expiry) {
        toast({
          title: language === 'ar' ? "خطأ" : "Error",
          description: language === 'ar' ? "يرجى تعبئة جميع بيانات البطاقة" : "Please fill in all card details",
          variant: "destructive"
        });
        return;
      }
    }

    createSubscription.mutate({
      billingCycle,
      basePrice,
      addOnCount: selectedAddOns.length,
      addOnPrice,
      totalPrice,
      currency: "SAR",
      paymentMethod,
      addOnServices: selectedAddOns,
      cardDetails: paymentMethod === 'credit_card' ? { ...cardDetails } : undefined
    });
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const iconMarginStart = isRTL ? "mr-2" : "ml-2";
  const iconMarginEnd = isRTL ? "ml-2" : "mr-2";

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (existingSubscription && existingSubscription.plan === 'vip') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>{t.subscription?.activeSubscription || "VIP Active"}</CardTitle>
            <CardDescription>
              {t.subscription?.alreadySubscribed || "You are already a VIP member. Enjoy your exclusive benefits."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => setLocation("/departments")} data-testid="button-go-to-departments">
              {language === 'ar' ? "انتقل إلى الأقسام" : "Go to Departments"}
              <ArrowIcon className={`h-4 w-4 ${iconMarginStart}`} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="font-semibold text-xl">DeskTown</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              {language === 'ar' ? "دفع آمن" : "Secure Checkout"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t.subscription?.title || "Choose Your Subscription Plan"}
          </h1>
          <p className="text-muted-foreground">
            {t.subscription?.subtitle || "Select a billing cycle and customize your office with add-on services"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-medium">1</span>
            <span className="text-sm font-medium">{t.subscription?.step1 || "Plan Selection"}</span>
          </div>
          <div className="w-8 h-0.5 bg-muted" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <span className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-medium">2</span>
            <span className="text-sm font-medium">{t.subscription?.step2 || "Payment"}</span>
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <Card className="border-2 border-yellow-500/50 shadow-2xl overflow-hidden relative transform hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 px-4 py-1 text-lg font-bold shadow-lg animate-pulse">
                    VIP
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-700">
                    {language === 'ar' ? "باقة التميز" : "VIP Package"}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-yellow-600/80">
                    {language === 'ar' ? "ارتقِ بمكتبك إلى مستوى جديد" : "Take your office to the next level"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        {language === 'ar' ? "مميزات الباقة" : "Package Features"}
                      </h3>
                      <ul className="space-y-3">
                        {VIP_FEATURES.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm md:text-base">
                            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                              <feature.icon className="h-4 w-4" />
                            </div>
                            <span>{language === 'ar' ? feature.label.ar : feature.label.en}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-6 bg-muted/30 p-6 rounded-xl border border-border/50">
                    <div className="text-center space-y-2">
                      <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                        {language === 'ar' ? "سعر الباقة" : "Package Price"}
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-primary">99</span>
                        <span className="text-xl text-muted-foreground">SAR</span>
                        <span className="text-muted-foreground">/ {language === 'ar' ? "شهر" : "mo"}</span>
                      </div>
                    </div>

                    <RadioGroup 
                      value={billingCycle} 
                      onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
                        <Label 
                          htmlFor="monthly" 
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <span className="font-semibold">{language === 'ar' ? "شهري" : "Monthly"}</span>
                          <span className="text-sm text-muted-foreground">99 SAR</span>
                        </Label>
                      </div>
                      
                      <div className="relative">
                        <RadioGroupItem value="yearly" id="yearly" className="peer sr-only" />
                        <Label 
                          htmlFor="yearly" 
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <Badge className="absolute -top-2 -right-2 bg-green-600 hover:bg-green-700 text-[10px] px-1.5 h-5">
                            -16%
                          </Badge>
                          <span className="font-semibold">{language === 'ar' ? "سنوي" : "Yearly"}</span>
                          <span className="text-sm text-muted-foreground">999 SAR</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    <Button 
                      className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-yellow-500/20"
                      onClick={() => setStep(2)}
                    >
                      {language === 'ar' ? "اشترك الآن" : "Subscribe Now"}
                      <ArrowIcon className={`h-5 w-5 ${iconMarginStart}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Keep add-ons if needed, but maybe hide for VIP focus or make them included? 
                  The prompt implies specific features are included. I'll hide the add-ons section for now to focus on the requested design.
              */}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <PaymentForm 
                cardDetails={cardDetails} 
                setCardDetails={setCardDetails} 
              />
              
              <div className="flex justify-between border-t bg-muted/20 p-6 rounded-lg">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="h-11 px-6"
                  >
                    <ArrowIcon className={`h-4 w-4 ${iconMarginEnd} rotate-180`} />
                    {language === 'ar' ? "رجوع" : "Back"}
                  </Button>
                  <Button 
                    className="h-11 px-8 bg-primary hover:bg-primary/90"
                    onClick={handleSubscribe}
                    disabled={createSubscription.isPending}
                  >
                    {createSubscription.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {language === 'ar' ? "جاري المعالجة..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        {language === 'ar' ? `ادفع ${formatCurrency(totalPrice)} ريال` : `Pay ${formatCurrency(totalPrice)} SAR`}
                        <CreditCard className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {language === 'ar' ? "ملخص الطلب" : "Order Summary"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {t.subscription?.basePlan || "Base Plan"} ({pricing.label})
                    </span>
                    <span className="font-medium">{formatCurrency(basePrice)} SAR</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{t.subscription?.totalPrice || "Total"}</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalPrice)} SAR</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Office Features Section */}
        <section className="mt-16 mb-8" data-testid="section-office-features">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2" data-testid="text-features-title">
              {t.subscription?.officeFeatures || "Your Virtual Office Features"}
            </h2>
            <p className="text-muted-foreground" data-testid="text-features-subtitle">
              {t.subscription?.officeFeaturesSubtitle || "Subscribe now and get all these features for your office"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Building2, titleKey: "featureVirtualOffice", descKey: "featureVirtualOfficeDesc" },
              { icon: Monitor, titleKey: "featureDashboard", descKey: "featureDashboardDesc" },
              { icon: Users, titleKey: "featureTeam", descKey: "featureTeamDesc" },
              { icon: FileText, titleKey: "featureTasks", descKey: "featureTasksDesc" },
              { icon: Mail, titleKey: "featureMail", descKey: "featureMailDesc" },
              { icon: MessageSquare, titleKey: "featureChat", descKey: "featureChatDesc" },
              { icon: Video, titleKey: "featureVideo", descKey: "featureVideoDesc" },
              { icon: Bell, titleKey: "featureNotifications", descKey: "featureNotificationsDesc" },
              { icon: Globe, titleKey: "featureStorefront", descKey: "featureStorefrontDesc" },
              { icon: Headphones, titleKey: "featureSupport", descKey: "featureSupportDesc" },
              { icon: Lock, titleKey: "featureAccess", descKey: "featureAccessDesc" },
              { icon: Palette, titleKey: "featureCustomize", descKey: "featureCustomizeDesc" }
            ].map((feature, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm" data-testid={`text-feature-title-${index}`}>
                        {(t.subscription as any)?.[feature.titleKey] || feature.titleKey}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-feature-desc-${index}`}>
                        {(t.subscription as any)?.[feature.descKey] || feature.descKey}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20" data-testid="card-subscribe-first">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg" data-testid="text-subscribe-first-title">
                    {t.subscription?.subscribeFirst || "Subscribe First, Then Create Your Office"}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm" data-testid="text-subscribe-first-desc">
                  {t.subscription?.subscribeFirstDesc || "After activating your subscription, you'll be able to create your virtual office, add your services, and fully manage your team."}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
