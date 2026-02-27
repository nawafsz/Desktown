import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage, translations } from "@/lib/i18n";
import { 
  Check, 
  CreditCard, 
  Calendar, 
  Shield, 
  Zap,
  Clock,
  Download,
  AlertCircle,
  Star
} from "lucide-react";
import { Link } from "wouter";
import type { Subscription } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function MySubscriptions() {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ['/api/subscriptions/active'],
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'canceled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'expired': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { ar: string, en: string }> = {
      active: { ar: "نشط", en: "Active" },
      canceled: { ar: "ملغى", en: "Canceled" },
      expired: { ar: "منتهي", en: "Expired" },
      pending: { ar: "قيد الانتظار", en: "Pending" }
    };
    return statusMap[status]?.[language] || status;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {language === 'ar' ? "اشتراكاتي" : "My Subscriptions"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? "إدارة خطة اشتراكك وفواتيرك" 
              : "Manage your subscription plan and billing"}
          </p>
        </div>
        {!subscription && (
          <Link href="/subscription">
            <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 hover:from-yellow-600 hover:to-amber-700 shadow-lg shadow-amber-500/20">
              <Star className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              {language === 'ar' ? "ترقية إلى VIP" : "Upgrade to VIP"}
            </Button>
          </Link>
        )}
      </div>

      {subscription ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Current Plan Card */}
          <Card className="md:col-span-2 border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Star className="w-32 h-32 text-primary" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {subscription.plan === 'vip' ? 'VIP Plan' : 'Standard Plan'}
                    <Badge variant="outline" className={getStatusColor(subscription.status)}>
                      {getStatusText(subscription.status)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {language === 'ar' 
                      ? "تمتع بجميع ميزات المكتب المتقدمة" 
                      : "Enjoy full access to advanced office features"}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {subscription.amount} SAR
                  </div>
                  <div className="text-sm text-muted-foreground">
                    /{subscription.interval === 'year' ? (language === 'ar' ? 'سنة' : 'year') : (language === 'ar' ? 'شهر' : 'month')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {language === 'ar' ? "تاريخ البدء" : "Start Date"}
                  </div>
                  <div className="font-semibold">{formatDate(subscription.startDate)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {language === 'ar' ? "تاريخ التجديد" : "Renewal Date"}
                  </div>
                  <div className="font-semibold">{formatDate(subscription.endDate)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {language === 'ar' ? "طريقة الدفع" : "Payment Method"}
                  </div>
                  <div className="font-semibold flex items-center gap-2">
                    •••• 4242
                    <Badge variant="secondary" className="text-xs">Visa</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">
                  {language === 'ar' ? "الميزات النشطة" : "Active Features"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { ar: "أقسام غير محدودة", en: "Unlimited Departments" },
                    { ar: "المساعد الذكي (AI)", en: "AI Assistant" },
                    { ar: "أتمتة المهام", en: "Task Automation" },
                    { ar: "دعم فني ذو أولوية", en: "Priority Support" }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{language === 'ar' ? feature.ar : feature.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex gap-2 justify-end">
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                {language === 'ar' ? "إلغاء الاشتراك" : "Cancel Subscription"}
              </Button>
              <Link href="/subscription">
                <Button variant="outline">
                  {language === 'ar' ? "تغيير الخطة" : "Change Plan"}
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'ar' ? "سجل الفواتير" : "Billing History"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: subscription.startDate, amount: subscription.amount, status: 'Paid' },
                ].map((invoice, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{formatDate(invoice.date)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500" />
                        {language === 'ar' ? "مدفوع" : "Paid"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{invoice.amount} SAR</div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 mt-1">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-muted-foreground">
                {language === 'ar' ? "عرض كل الفواتير" : "View All Invoices"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed border-2 text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {language === 'ar' ? "لا يوجد اشتراك نشط" : "No Active Subscription"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {language === 'ar'
                  ? "أنت حالياً تستخدم الخطة المجانية المحدودة. قم بالترقية للحصول على ميزات إضافية."
                  : "You are currently on the limited free plan. Upgrade to unlock more features."}
              </p>
            </div>
            <Link href="/subscription">
              <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                {language === 'ar' ? "تصفح الخطط" : "View Plans"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
