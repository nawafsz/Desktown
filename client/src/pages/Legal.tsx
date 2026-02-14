import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  FileText, 
  Shield, 
  FolderOpen, 
  Gavel, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  FileCheck,
  AlertTriangle
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

export default function Legal() {
  const { language, isRTL } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("tab") || "dashboard";
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock Data
  const caseStats = [
    { name: language === 'ar' ? "قضايا عمالية" : "Labor", value: 4 },
    { name: language === 'ar' ? "تجارية" : "Commercial", value: 3 },
    { name: language === 'ar' ? "ملكية فكرية" : "IP", value: 2 },
    { name: language === 'ar' ? "أخرى" : "Other", value: 1 },
  ];

  const contractStats = [
    { name: language === 'ar' ? "سارية" : "Active", value: 45 },
    { name: language === 'ar' ? "قيد المراجعة" : "Review", value: 12 },
    { name: language === 'ar' ? "منتهية" : "Expired", value: 8 },
    { name: language === 'ar' ? "مسودة" : "Draft", value: 5 },
  ];

  const cases = [
    { id: 1, title: "Labor Dispute #2024-001", type: "Labor", status: "active", nextHearing: "2025-03-15", lawyer: "Ahmed Al-Salem" },
    { id: 2, title: "Vendor Breach of Contract", type: "Commercial", status: "pending", nextHearing: "2025-04-02", lawyer: "Sarah Smith" },
    { id: 3, title: "Trademark Registration", type: "IP", status: "closed", nextHearing: "-", lawyer: "Legal Dept" },
  ];

  const contracts = [
    { id: 1, title: "Service Agreement - Tech Corp", type: "Service", status: "review", expiry: "2026-01-01", party: "Tech Corp" },
    { id: 2, title: "NDA - New Employee", type: "NDA", status: "active", expiry: "Indefinite", party: "John Doe" },
    { id: 3, title: "Office Lease Renewal", type: "Lease", status: "draft", expiry: "2025-12-31", party: "Real Estate Co" },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STATUS_COLORS = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    closed: "bg-gray-100 text-gray-700",
    review: "bg-blue-100 text-blue-700",
    draft: "bg-purple-100 text-purple-700",
    expired: "bg-red-100 text-red-700"
  };

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
              <Scale className="h-8 w-8 text-primary" />
              {language === 'ar' ? "الشؤون القانونية" : "Legal Affairs"}
            </h1>
          </div>
          <p className="text-muted-foreground md:mr-10 md:ml-10">
            {language === 'ar' 
              ? "إدارة العقود، القضايا، الامتثال، والوثائق القانونية." 
              : "Manage contracts, cases, compliance, and legal documents."}
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? "قضية / عقد جديد" : "New Case / Contract"}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50 w-full justify-start">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 flex-1 md:flex-none">
            <Gavel className="h-4 w-4" />
            {language === 'ar' ? "لوحة القيادة" : "Dashboard"}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2 flex-1 md:flex-none">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? "العقود" : "Contracts"}
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2 flex-1 md:flex-none">
            <Scale className="h-4 w-4" />
            {language === 'ar' ? "القضايا" : "Cases"}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2 flex-1 md:flex-none">
            <Shield className="h-4 w-4" />
            {language === 'ar' ? "الامتثال" : "Compliance"}
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 flex-1 md:flex-none">
            <FolderOpen className="h-4 w-4" />
            {language === 'ar' ? "الوثائق" : "Documents"}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "القضايا النشطة" : "Active Cases"}
                </CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "2 جلسات استماع هذا الأسبوع" : "2 hearings this week"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "العقود قيد المراجعة" : "Contracts in Review"}
                </CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "3 عقود عاجلة" : "3 urgent contracts"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "نسبة الامتثال" : "Compliance Score"}
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "متوافق مع المعايير" : "Meeting standards"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "تنبيهات المخاطر" : "Risk Alerts"}
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "تتطلب إجراء فوري" : "Require immediate action"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? "توزيع أنواع القضايا" : "Case Distribution"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={caseStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {caseStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? "حالة العقود" : "Contract Status"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contractStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {contractStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{language === 'ar' ? "سجل العقود" : "Contracts Registry"}</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder={language === 'ar' ? "بحث في العقود..." : "Search contracts..."} 
                    className="w-64"
                  />
                  <Button variant="outline"><Filter className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.party}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "النوع" : "Type"}</p>
                        <Badge variant="outline">{contract.type}</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "الحالة" : "Status"}</p>
                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS] || "bg-gray-100"}>
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="text-center hidden sm:block">
                         <p className="text-xs text-muted-foreground">{language === 'ar' ? "الانتهاء" : "Expiry"}</p>
                         <p className="text-sm">{contract.expiry}</p>
                      </div>
                      <Button variant="ghost" size="icon"><ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle>{language === 'ar' ? "إدارة القضايا" : "Case Management"}</CardTitle>
                 <Button className="gap-2">
                   <Plus className="h-4 w-4" />
                   {language === 'ar' ? "قضية جديدة" : "New Case"}
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {cases.map((caseItem) => (
                    <div key={caseItem.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                       <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                             <Gavel className="h-5 w-5" />
                          </div>
                          <div>
                             <h4 className="font-semibold">{caseItem.title}</h4>
                             <p className="text-sm text-muted-foreground">{caseItem.lawyer}</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-center mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                          <Badge variant="outline">{caseItem.type}</Badge>
                          <Badge className={STATUS_COLORS[caseItem.status as keyof typeof STATUS_COLORS]}>
                             {caseItem.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             {caseItem.nextHearing}
                          </div>
                       </div>
                    </div>
                 ))}
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Compliance & Documents placeholders */}
        <TabsContent value="compliance" className="space-y-4">
           <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                 <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>{language === 'ar' ? "قائمة التحقق من الامتثال ستظهر هنا" : "Compliance checklists will appear here"}</p>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
           <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                 <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <p>{language === 'ar' ? "مستودع الوثائق القانونية" : "Legal Document Repository"}</p>
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}