import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  FileText, 
  Users, 
  DollarSign, 
  Briefcase,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sales() {
  const { language, isRTL } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("tab") || "dashboard";
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock Data
  const revenueData = [
    { name: language === 'ar' ? "يناير" : "Jan", amount: 45000 },
    { name: language === 'ar' ? "فبراير" : "Feb", amount: 52000 },
    { name: language === 'ar' ? "مارس" : "Mar", amount: 48000 },
    { name: language === 'ar' ? "أبريل" : "Apr", amount: 61000 },
    { name: language === 'ar' ? "مايو" : "May", amount: 55000 },
    { name: language === 'ar' ? "يونيو" : "Jun", amount: 75000 },
  ];

  const pipelineData = [
    { name: language === 'ar' ? "جديد" : "New", value: 12 },
    { name: language === 'ar' ? "مؤهل" : "Qualified", value: 8 },
    { name: language === 'ar' ? "عرض سعر" : "Proposal", value: 5 },
    { name: language === 'ar' ? "تفاوض" : "Negotiation", value: 3 },
  ];

  const deals = [
    { id: 1, client: "Tech Solutions Inc.", title: "Enterprise License", value: "120,000", stage: "negotiation", probability: "80%", date: "2025-02-28" },
    { id: 2, client: "Global Logistics", title: "Fleet Management System", value: "85,000", stage: "proposal", probability: "60%", date: "2025-03-15" },
    { id: 3, client: "StartUp Hub", title: "Basic Package", value: "15,000", stage: "qualified", probability: "40%", date: "2025-02-20" },
    { id: 4, client: "Alpha Retail", title: "POS Integration", value: "45,000", stage: "new", probability: "20%", date: "2025-03-01" },
  ];

  const leads = [
    { id: 1, name: "Ahmed Ali", company: "Future Vision", email: "ahmed@future.com", phone: "+966 55 123 4567", status: "new" },
    { id: 2, name: "Sarah Smith", company: "Design Co.", email: "sarah@design.com", phone: "+1 234 567 8900", status: "contacted" },
    { id: 3, name: "Mohammed Sami", company: "Tech Corp", email: "m.sami@tech.com", phone: "+966 50 987 6543", status: "qualified" },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/departments">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              {language === 'ar' ? "إدارة المبيعات" : "Sales Management"}
            </h1>
          </div>
          <p className="text-muted-foreground md:mr-10 md:ml-10">
            {language === 'ar' 
              ? "تتبع خط المبيعات، إدارة العملاء، وتحليل الإيرادات." 
              : "Track sales pipeline, manage clients, and analyze revenue."}
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? "صفقة جديدة" : "New Deal"}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50 w-full justify-start">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 flex-1 md:flex-none">
            <TrendingUp className="h-4 w-4" />
            {language === 'ar' ? "لوحة القيادة" : "Dashboard"}
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2 flex-1 md:flex-none">
            <Briefcase className="h-4 w-4" />
            {language === 'ar' ? "خط المبيعات" : "Pipeline"}
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2 flex-1 md:flex-none">
            <Target className="h-4 w-4" />
            {language === 'ar' ? "العملاء المحتملين" : "Leads"}
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 flex-1 md:flex-none">
            <Users className="h-4 w-4" />
            {language === 'ar' ? "العملاء" : "Clients"}
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2 flex-1 md:flex-none">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? "عروض الأسعار" : "Quotes"}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "إجمالي الإيرادات" : "Total Revenue"}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">336,000</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+20% عن الشهر الماضي" : "+20% from last month"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "الصفقات النشطة" : "Active Deals"}
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "8 في مرحلة التفاوض" : "8 in negotiation"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "معدل التحويل" : "Win Rate"}
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+5% تحسن" : "+5% improvement"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "متوسط حجم الصفقة" : "Avg Deal Size"}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14,000</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "ر.س" : "SAR"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>{language === 'ar' ? "نظرة عامة على الإيرادات" : "Revenue Overview"}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>{language === 'ar' ? "مراحل الصفقات" : "Deal Stages"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{language === 'ar' ? "الصفقات النشطة" : "Active Deals"}</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder={language === 'ar' ? "بحث في الصفقات..." : "Search deals..."} 
                    className="w-64"
                  />
                  <Button variant="outline"><Filter className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground">{deal.client}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "القيمة" : "Value"}</p>
                        <p className="font-semibold">{deal.value}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "المرحلة" : "Stage"}</p>
                        <Badge variant="outline" className="capitalize">
                          {deal.stage}
                        </Badge>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "الاحتمالية" : "Probability"}</p>
                        <p className="font-semibold">{deal.probability}</p>
                      </div>
                      <div className="text-center hidden sm:block">
                         <p className="text-xs text-muted-foreground">{language === 'ar' ? "تاريخ الإغلاق" : "Close Date"}</p>
                         <p className="text-sm">{deal.date}</p>
                      </div>
                      <Button variant="ghost" size="icon"><ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle>{language === 'ar' ? "العملاء المحتملين" : "Leads"}</CardTitle>
                 <Button className="gap-2">
                   <Plus className="h-4 w-4" />
                   {language === 'ar' ? "إضافة عميل محتمل" : "Add Lead"}
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                       <div className="flex items-center gap-4">
                          <Avatar>
                             <AvatarImage src={`/api/placeholder/40/40`} />
                             <AvatarFallback>{lead.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                             <h4 className="font-semibold">{lead.name}</h4>
                             <p className="text-sm text-muted-foreground">{lead.company}</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <Badge className={lead.status === 'new' ? 'bg-blue-500' : lead.status === 'contacted' ? 'bg-yellow-500' : 'bg-green-500'}>
                             {lead.status}
                          </Badge>
                          <div className="flex gap-2">
                             <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                             <Button size="icon" variant="ghost" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Clients & Quotes tabs can be placeholders for now to keep it concise but comprehensive structure */}
        <TabsContent value="clients" className="space-y-4">
           <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                 <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>{language === 'ar' ? "قائمة العملاء ستظهر هنا" : "Client list will appear here"}</p>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
           <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                 <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>{language === 'ar' ? "عروض الأسعار والفواتير" : "Quotes and Invoices"}</p>
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}