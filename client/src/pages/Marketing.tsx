import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Target, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Share2, 
  Users, 
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Eye,
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
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";

export default function Marketing() {
  const { language, isRTL } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("tab") || "campaigns";
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock Data
  const campaigns = [
    { id: 1, name: language === 'ar' ? "حملة الصيف 2025" : "Summer Campaign 2025", status: "active", budget: "50,000", spent: "12,500", roi: "+150%", leads: 340 },
    { id: 2, name: language === 'ar' ? "إطلاق المنتج الجديد" : "New Product Launch", status: "planned", budget: "120,000", spent: "0", roi: "-", leads: 0 },
    { id: 3, name: language === 'ar' ? "عروض العودة للمدارس" : "Back to School Offers", status: "completed", budget: "30,000", spent: "29,800", roi: "+210%", leads: 520 },
  ];

  const performanceData = [
    { name: language === 'ar' ? "يناير" : "Jan", leads: 400, sales: 240 },
    { name: language === 'ar' ? "فبراير" : "Feb", leads: 300, sales: 139 },
    { name: language === 'ar' ? "مارس" : "Mar", leads: 200, sales: 980 },
    { name: language === 'ar' ? "أبريل" : "Apr", leads: 278, sales: 390 },
    { name: language === 'ar' ? "مايو" : "May", leads: 189, sales: 480 },
    { name: language === 'ar' ? "يونيو" : "Jun", leads: 239, sales: 380 },
  ];

  const channelData = [
    { name: "Social Media", value: 400 },
    { name: "Email", value: 300 },
    { name: "Direct", value: 300 },
    { name: "Ads", value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/departments">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-primary" />
              {language === 'ar' ? "إدارة التسويق" : "Marketing Management"}
            </h1>
          </div>
          <p className="text-muted-foreground md:mr-10 md:ml-10">
            {language === 'ar' 
              ? "تخطيط الحملات، إدارة المحتوى، وتحليل الأداء التسويقي الشامل." 
              : "Plan campaigns, manage content, and analyze comprehensive marketing performance."}
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? "حملة جديدة" : "New Campaign"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50 w-full justify-start">
          <TabsTrigger value="campaigns" className="flex items-center gap-2 flex-1 md:flex-none">
            <Target className="h-4 w-4" />
            {language === 'ar' ? "الحملات" : "Campaigns"}
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2 flex-1 md:flex-none">
            <CalendarIcon className="h-4 w-4" />
            {language === 'ar' ? "جدول المحتوى" : "Content Calendar"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 flex-1 md:flex-none">
            <BarChart3 className="h-4 w-4" />
            {language === 'ar' ? "التحليلات" : "Analytics"}
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 flex-1 md:flex-none">
            <Share2 className="h-4 w-4" />
            {language === 'ar' ? "إدارة التواصل" : "Social Media"}
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "إجمالي الحملات النشطة" : "Active Campaigns"}
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+1 منذ الشهر الماضي" : "+1 from last month"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "الميزانية المستهلكة" : "Budget Spent"}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,500 {language === 'ar' ? "ر.س" : "SAR"}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "من أصل 50,000 ر.س" : "of 50,000 SAR"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "العملاء المحتملين (Leads)" : "Total Leads"}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+201 من الشهر الماضي" : "+201 from last month"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "معدل التحويل" : "Conversion Rate"}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+1.1% تحسن" : "+1.1% improvement"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{language === 'ar' ? "قائمة الحملات" : "Campaigns List"}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? "إدارة وتتبع حالة جميع الحملات التسويقية." : "Manage and track all marketing campaigns status."}
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? 'right-2.5' : 'left-2.5'}`} />
                    <Input 
                      placeholder={language === 'ar' ? "بحث..." : "Search..."} 
                      className={`w-full md:w-64 ${isRTL ? 'pr-8' : 'pl-8'}`} 
                    />
                  </div>
                  <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{campaign.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status === 'active' 
                              ? (language === 'ar' ? 'نشطة' : 'Active') 
                              : campaign.status === 'completed' 
                                ? (language === 'ar' ? 'مكتملة' : 'Completed') 
                                : (language === 'ar' ? 'مخطط لها' : 'Planned')}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            {language === 'ar' ? `الميزانية: ${campaign.budget} ر.س` : `Budget: ${campaign.budget} SAR`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 text-sm w-full md:w-auto justify-between md:justify-end">
                      <div className="text-center">
                        <p className="text-muted-foreground">{language === 'ar' ? "المصروف" : "Spent"}</p>
                        <p className="font-semibold">{campaign.spent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">{language === 'ar' ? "العائد ROI" : "ROI"}</p>
                        <p className={`font-semibold ${campaign.roi.includes('+') ? 'text-green-600' : ''}`}>{campaign.roi}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">{language === 'ar' ? "العملاء" : "Leads"}</p>
                        <p className="font-semibold">{campaign.leads}</p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{language === 'ar' ? "جدول المحتوى" : "Content Calendar"}</CardTitle>
                  <CardDescription>
                    {language === 'ar' ? "المنشورات المجدولة والقادمة." : "Scheduled and upcoming posts."}
                  </CardDescription>
                </div>
                <Button variant="outline">
                  {language === 'ar' ? "إضافة محتوى" : "Add Content"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg items-center">
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                      <Share2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">
                          {language === 'ar' ? "إعلان تشويقي للمنتج الجديد" : "New Product Teaser"}
                        </h4>
                        <Badge variant="outline">{language === 'ar' ? "مجدول" : "Scheduled"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Platforms: Twitter, Instagram, LinkedIn</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> 25 Feb 2025
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {language === 'ar' ? "الفريق التسويقي" : "Marketing Team"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? "أداء المبيعات والعملاء" : "Sales & Leads Performance"}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" name={language === 'ar' ? "العملاء المحتملين" : "Leads"} fill="#8884d8" />
                    <Bar dataKey="sales" name={language === 'ar' ? "المبيعات" : "Sales"} fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? "توزيع القنوات" : "Channels Distribution"}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {['Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
              <Card key={platform}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{platform}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-3xl font-bold">12.5k</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">+5.2%</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {language === 'ar' ? "التفاعل" : "Engagement"}</span>
                      <span>1.2k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {language === 'ar' ? "التعليقات" : "Comments"}</span>
                      <span>340</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {language === 'ar' ? "الوصول" : "Reach"}</span>
                      <span>45k</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}