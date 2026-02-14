
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/lib/i18n";
import {
  ArrowLeft,
  Plus,
  Users,
  Mail,
  Phone,
  Briefcase,
  Trash2,
  Edit,
  User,
  Calendar,
  Star,
  Calculator,
  FileText,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  HeartHandshake,
  UserCheck,
  ClipboardList,
  GraduationCap,
  Clock,
  Award,
  Scale,
  FileSearch,
  Shield,
  BookOpen,
  Gavel,
  Megaphone,
  BarChart3,
  Target,
  Share2,
  Palette,
  Settings,
  Package,
  ListChecks,
  Gauge,
  Truck,
  PieChart,
  MessageSquare,
  FolderOpen,
  Bell,
  Wrench,
} from "lucide-react";
import type { Department as DepartmentType, RemoteEmployee } from "@shared/schema";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: typeof Calculator;
  color: string;
}

export default function Department() {
  const { id } = useParams<{ id: string }>();
  const departmentId = parseInt(id || "0");
  const { toast } = useToast();
  const { language, isRTL } = useLanguage();
  
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<RemoteEmployee | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [activeTab, setActiveTab] = useState("employees");

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");

  const { data: department, isLoading: departmentLoading } = useQuery<DepartmentType>({
    queryKey: ["/api/departments", departmentId],
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<RemoteEmployee[]>({
    queryKey: ["/api/departments", departmentId, "employees"],
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      jobTitle?: string;
      bio?: string;
      skills?: string;
    }) => {
      const res = await apiRequest("POST", `/api/departments/${departmentId}/employees`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", departmentId, "employees"] });
      resetForm();
      setNewEmployeeOpen(false);
      toast({ 
        title: language === 'ar' ? "تم إضافة الموظف" : "Employee Added", 
        description: language === 'ar' ? "تم إضافة الموظف للقسم بنجاح" : "Remote employee has been added to the department." 
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error?.message || (language === 'ar' ? "فشل إضافة الموظف. قد يكون اسم المستخدم موجوداً مسبقاً." : "Failed to add employee. Username may already exist."),
        variant: "destructive",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RemoteEmployee> }) => {
      const res = await apiRequest("PATCH", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", departmentId, "employees"] });
      setEditEmployee(null);
      resetForm();
      toast({ 
        title: language === 'ar' ? "تم تحديث الموظف" : "Employee Updated", 
        description: language === 'ar' ? "تم تحديث بيانات الموظف بنجاح" : "Employee information has been updated." 
      });
    },
    onError: () => {
      toast({ 
        title: language === 'ar' ? "خطأ" : "Error", 
        description: language === 'ar' ? "فشل تحديث البيانات" : "Failed to update employee.", 
        variant: "destructive" 
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await apiRequest("DELETE", `/api/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", departmentId, "employees"] });
      toast({ 
        title: language === 'ar' ? "تم حذف الموظف" : "Employee Removed", 
        description: language === 'ar' ? "تم إزالة الموظف من القسم" : "Employee has been removed from the department." 
      });
    },
  });

  const resetForm = () => {
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setBio("");
    setSkills("");
  };

  const openEditDialog = (employee: RemoteEmployee) => {
    setEditEmployee(employee);
    setUsername(employee.username);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setJobTitle(employee.jobTitle || "");
    setBio(employee.bio || "");
    setSkills(employee.skills || "");
  };

  const handleSubmit = () => {
    const data = {
      username,
      firstName,
      lastName,
      email: email || undefined,
      phone: phone || undefined,
      jobTitle: jobTitle || undefined,
      bio: bio || undefined,
      skills: skills || undefined,
    };

    if (editEmployee) {
      updateEmployeeMutation.mutate({ id: editEmployee.id, data });
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  const normalizeIconKey = (icon: string): string => {
    const iconMap: Record<string, string> = {
      "dollar-sign": "dollarSign",
      "dollarsign": "dollarSign",
      "heart-handshake": "hearthandshake",
    };
    return iconMap[icon.toLowerCase()] || icon;
  };

  // Tools Configuration with Translations
  const departmentTools: Record<string, Tool[]> = {
    calculator: [
      { id: "financial-accounting", name: language === 'ar' ? "النظام المالي" : "Financial System", description: language === 'ar' ? "الوصول للنظام المحاسبي" : "Access Financial Accounting Module", icon: Calculator, color: "text-blue-600" },
      { id: "budget", name: language === 'ar' ? "تخطيط الميزانية" : "Budget Planner", description: language === 'ar' ? "تخطيط وتتبع الميزانية" : "Plan and track departmental budgets", icon: Calculator, color: "text-blue-500" },
      { id: "expenses", name: language === 'ar' ? "متتبع المصروفات" : "Expense Tracker", description: language === 'ar' ? "تسجيل وتصنيف المصروفات" : "Log and categorize expenses", icon: Receipt, color: "text-green-500" },
      { id: "invoices", name: language === 'ar' ? "إدارة الفواتير" : "Invoice Manager", description: language === 'ar' ? "إنشاء وإدارة الفواتير" : "Create and manage invoices", icon: FileText, color: "text-purple-500" },
      { id: "reports", name: language === 'ar' ? "التقارير المالية" : "Financial Reports", description: language === 'ar' ? "إنشاء ملخصات مالية" : "Generate financial summaries", icon: TrendingUp, color: "text-orange-500" },
      { id: "payroll", name: language === 'ar' ? "حاسبة الرواتب" : "Payroll Calculator", description: language === 'ar' ? "حساب مدفوعات الموظفين" : "Calculate employee payments", icon: CreditCard, color: "text-pink-500" },
    ],
    hearthandshake: [
      { id: "hr-system", name: language === 'ar' ? "نظام الموارد البشرية" : "HR Management System", description: language === 'ar' ? "إدارة الموظفين والرواتب والعمليات" : "Full HR Suite", icon: Users, color: "text-rose-600" },
      { id: "leave", name: language === 'ar' ? "متتبع الإجازات" : "Leave Tracker", description: language === 'ar' ? "إدارة طلبات الإجازة" : "Manage employee leave requests", icon: Clock, color: "text-blue-500" },
      { id: "performance", name: language === 'ar' ? "تقييم الأداء" : "Performance Reviews", description: language === 'ar' ? "تتبع تقييمات الموظفين" : "Track employee evaluations", icon: Award, color: "text-yellow-500" },
      { id: "directory", name: language === 'ar' ? "دليل الموظفين" : "Employee Directory", description: language === 'ar' ? "قاعدة بيانات الموظفين" : "Searchable employee database", icon: Users, color: "text-green-500" },
      { id: "recruitment", name: language === 'ar' ? "التوظيف" : "Recruitment Pipeline", description: language === 'ar' ? "تتبع عملية التوظيف" : "Track hiring progress", icon: UserCheck, color: "text-purple-500" },
      { id: "onboarding", name: language === 'ar' ? "التهيئة" : "Onboarding Checklist", description: language === 'ar' ? "مهام الموظفين الجدد" : "New hire onboarding tasks", icon: ClipboardList, color: "text-pink-500" },
    ],
    scale: [
      { id: "contracts", name: language === 'ar' ? "نماذج العقود" : "Contract Templates", description: "Legal document templates", icon: FileText, color: "text-blue-500" },
      { id: "compliance", name: language === 'ar' ? "الامتثال" : "Compliance Checklist", description: "Regulatory requirements tracker", icon: Shield, color: "text-green-500" },
      { id: "cases", name: language === 'ar' ? "القضايا" : "Case Tracker", description: "Manage legal cases and matters", icon: FileSearch, color: "text-purple-500" },
      { id: "documents", name: language === 'ar' ? "مستودع الوثائق" : "Document Repository", description: "Secure legal document storage", icon: FolderOpen, color: "text-orange-500" },
    ],
    megaphone: [
      { id: "campaigns", name: language === 'ar' ? "الحملات" : "Campaign Tracker", description: "Monitor marketing campaigns", icon: Target, color: "text-blue-500" },
      { id: "content", name: language === 'ar' ? "جدول المحتوى" : "Content Calendar", description: "Plan content schedule", icon: Calendar, color: "text-green-500" },
      { id: "analytics", name: language === 'ar' ? "التحليلات" : "Analytics Dashboard", description: "Track marketing metrics", icon: BarChart3, color: "text-purple-500" },
      { id: "social", name: language === 'ar' ? "إدارة التواصل" : "Social Media Manager", description: "Manage social accounts", icon: Share2, color: "text-pink-500" },
    ],
    settings: [
      { id: "inventory-management", name: language === 'ar' ? "نظام المخزون" : "Inventory System", description: language === 'ar' ? "الوصول لنظام إدارة المخزون" : "Access Inventory Management Module", icon: Package, color: "text-green-600" },
      { id: "projects", name: language === 'ar' ? "تتبع المشاريع" : "Project Tracker", description: "Monitor project progress", icon: ListChecks, color: "text-blue-500" },
      { id: "inventory", name: language === 'ar' ? "مدير المخزون" : "Inventory Manager", description: "Track stock and supplies", icon: Package, color: "text-green-500" },
      { id: "processes", name: language === 'ar' ? "التوثيق" : "Process Documentation", description: "Document workflows", icon: BookOpen, color: "text-purple-500" },
    ],
    package: [
      { id: "inventory-management", name: language === 'ar' ? "نظام المخزون" : "Inventory System", description: language === 'ar' ? "الوصول لنظام إدارة المخزون" : "Access Inventory Management Module", icon: Package, color: "text-green-600" },
      { id: "logistics", name: language === 'ar' ? "اللوجستيات" : "Logistics", description: "Manage shipping and receiving", icon: Truck, color: "text-orange-500" },
    ],
    dollarSign: [
      { id: "pipeline", name: language === 'ar' ? "خط المبيعات" : "Sales Pipeline", description: "Track deals and opportunities", icon: TrendingUp, color: "text-blue-500" },
      { id: "leads", name: language === 'ar' ? "العملاء المحتملين" : "Lead Tracker", description: "Manage sales leads", icon: Target, color: "text-green-500" },
      { id: "quotes", name: language === 'ar' ? "عروض الأسعار" : "Quote Generator", description: "Create sales proposals", icon: FileText, color: "text-purple-500" },
      { id: "clients", name: language === 'ar' ? "قاعدة العملاء" : "Client Database", description: "Customer relationship manager", icon: Users, color: "text-orange-500" },
    ],
    users: [
      { id: "calendar", name: language === 'ar' ? "تقويم الفريق" : "Team Calendar", description: "Shared team schedule", icon: Calendar, color: "text-blue-500" },
      { id: "meetings", name: language === 'ar' ? "الاجتماعات" : "Meeting Scheduler", description: "Plan team meetings", icon: Clock, color: "text-purple-500" },
      { id: "board", name: language === 'ar' ? "لوحة المهام" : "Collaboration Board", description: "Team task board", icon: ListChecks, color: "text-orange-500" },
    ],
    briefcase: [
      { id: "tasks", name: language === 'ar' ? "المهام" : "Task Board", description: "Manage team tasks", icon: ListChecks, color: "text-blue-500" },
      { id: "notes", name: language === 'ar' ? "الملاحظات" : "Team Notes", description: "Shared documentation", icon: FileText, color: "text-green-500" },
      { id: "files", name: language === 'ar' ? "الملفات" : "File Manager", description: "Organize team files", icon: FolderOpen, color: "text-purple-500" },
    ],
  };

  const getDepartmentTools = () => {
    if (!department) return [];
    const normalizedIcon = normalizeIconKey(department.icon || "briefcase");
    return departmentTools[normalizedIcon] || departmentTools.briefcase;
  };

  const getSpecialtyLabel = (icon: string) => {
    const normalizedIcon = normalizeIconKey(icon);
    const labels: Record<string, string> = {
      calculator: language === 'ar' ? "المالية" : "Finance",
      hearthandshake: language === 'ar' ? "الموارد البشرية" : "Human Resources",
      scale: language === 'ar' ? "القانونية" : "Legal",
      megaphone: language === 'ar' ? "التسويق" : "Marketing",
      settings: language === 'ar' ? "العمليات" : "Operations",
      dollarSign: language === 'ar' ? "المبيعات" : "Sales",
      users: language === 'ar' ? "الفريق" : "Team",
      briefcase: language === 'ar' ? "عام" : "General",
      package: language === 'ar' ? "المستودع" : "Warehouse",
    };
    return labels[normalizedIcon] || (language === 'ar' ? "عام" : "General");
  };

  if (departmentLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{language === 'ar' ? "القسم غير موجود" : "Department not found"}</p>
          <Link href="/departments">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'ar' ? "العودة للأقسام" : "Back to Departments"}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const tools = getDepartmentTools();

  const EmployeeDialog = (
    <Dialog
      open={newEmployeeOpen || !!editEmployee}
      onOpenChange={(open) => {
        if (!open) {
          setNewEmployeeOpen(false);
          setEditEmployee(null);
          resetForm();
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{editEmployee ? (language === 'ar' ? "تعديل موظف" : "Edit Employee") : (language === 'ar' ? "إضافة موظف جديد" : "Add Remote Employee")}</DialogTitle>
          <DialogDescription>
            {editEmployee
              ? (language === 'ar' ? "تحديث بيانات الموظف." : "Update employee information.")
              : (language === 'ar' ? "إضافة موظف جديد باسم مستخدم فريد." : "Add a new remote employee with a unique username.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">{language === 'ar' ? "اسم المستخدم *" : "Username *"}</Label>
            <Input
              id="username"
              placeholder="e.g., john.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "."))}
              disabled={!!editEmployee}
              data-testid="input-employee-username"
              className="text-left"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? "معرف فريد للموظف. لا يمكن تغييره لاحقاً." : "Unique identifier for the employee. Cannot be changed after creation."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{language === 'ar' ? "الاسم الأول *" : "First Name *"}</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-testid="input-employee-firstname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{language === 'ar' ? "اسم العائلة *" : "Last Name *"}</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-testid="input-employee-lastname"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">{language === 'ar' ? "المسمى الوظيفي" : "Job Title"}</Label>
            <Input
              id="jobTitle"
              placeholder={language === 'ar' ? "مثال: محاسب أول" : "e.g., Senior Accountant"}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              data-testid="input-employee-jobtitle"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{language === 'ar' ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-employee-email"
                className="text-left"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{language === 'ar' ? "الجوال" : "Phone"}</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-employee-phone"
                className="text-left"
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{language === 'ar' ? "نبذة" : "Bio"}</Label>
            <Textarea
              id="bio"
              placeholder={language === 'ar' ? "وصف مختصر..." : "Brief description..."}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              data-testid="input-employee-bio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">{language === 'ar' ? "المهارات" : "Skills"}</Label>
            <Input
              id="skills"
              placeholder={language === 'ar' ? "مثال: اكسل، تحليل مالي" : "e.g., Excel, QuickBooks, Financial Analysis"}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              data-testid="input-employee-skills"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              !username ||
              !firstName ||
              !lastName ||
              createEmployeeMutation.isPending ||
              updateEmployeeMutation.isPending
            }
            data-testid="button-save-employee"
          >
            {createEmployeeMutation.isPending || updateEmployeeMutation.isPending
              ? (language === 'ar' ? "جاري الحفظ..." : "Saving...")
              : editEmployee
              ? (language === 'ar' ? "تحديث" : "Update Employee")
              : (language === 'ar' ? "إضافة" : "Add Employee")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const ToolDialog = (
    <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
      <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTool && <selectedTool.icon className={`h-5 w-5 ${selectedTool.color}`} />}
            {selectedTool?.name}
          </DialogTitle>
          <DialogDescription>{selectedTool?.description}</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {/* HR System Link */}
          {selectedTool?.id === "hr-system" && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى نظام الموارد البشرية الشامل لإدارة الموظفين والرواتب." : "Access the comprehensive HR Management System."}
              </p>
              <Link href="/hr">
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للنظام" : "Go to HR System"}
                </Button>
              </Link>
            </div>
          )}

          {selectedTool?.id === "financial-accounting" && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى النظام المحاسبي المالي الشامل." : "Access the comprehensive Financial Accounting module to manage your finances."}
              </p>
              <Link href="/financial-accounting">
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للنظام المالي" : "Go to Financial System"}
                </Button>
              </Link>
            </div>
          )}
          {selectedTool?.id === "inventory-management" && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى نظام إدارة المخزون." : "Access the Inventory Management module to track stock and supplies."}
              </p>
              <Link href="/inventory-management">
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب لنظام المخزون" : "Go to Inventory System"}
                </Button>
              </Link>
            </div>
          )}

          {["campaigns", "content", "analytics", "social"].includes(selectedTool?.id || "") && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى لوحة التحكم التسويقية الشاملة." : "Access the comprehensive Marketing Dashboard."}
              </p>
              <Link href={`/marketing?tab=${selectedTool?.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للتسويق" : "Go to Marketing"}
                </Button>
              </Link>
            </div>
          )}

          {["pipeline", "leads", "quotes", "clients"].includes(selectedTool?.id || "") && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى نظام إدارة المبيعات الشامل." : "Access the comprehensive Sales Management System."}
              </p>
              <Link href={`/sales?tab=${selectedTool?.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للمبيعات" : "Go to Sales"}
                </Button>
              </Link>
            </div>
          )}

          {["contracts", "compliance", "cases", "documents"].includes(selectedTool?.id || "") && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى نظام الشؤون القانونية الشامل." : "Access the comprehensive Legal Affairs System."}
              </p>
              <Link href={`/legal?tab=${selectedTool?.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للشؤون القانونية" : "Go to Legal"}
                </Button>
              </Link>
            </div>
          )}

          {["tasks", "notes", "files"].includes(selectedTool?.id || "") && (
            <div className="flex flex-col gap-4 items-center py-8">
              <p className="text-center text-muted-foreground">
                {language === 'ar' ? "الوصول إلى لوحة المهام والملفات العامة." : "Access General Tasks and Files Dashboard."}
              </p>
              <Link href={`/general-department?tab=${selectedTool?.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {language === 'ar' ? "الذهاب للقسم العام" : "Go to General Department"}
                </Button>
              </Link>
            </div>
          )}
          
          {!["financial-accounting", "inventory-management", "hr-system", "campaigns", "content", "analytics", "social", "pipeline", "leads", "quotes", "clients", "contracts", "compliance", "cases", "documents", "tasks", "notes", "files"].includes(selectedTool?.id || "") && (
            <div className="text-center py-8">
              <div className={`h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4`}>
                {selectedTool && <selectedTool.icon className={`h-8 w-8 ${selectedTool.color}`} />}
              </div>
              <p className="text-muted-foreground mb-4">
                {language === 'ar' ? "هذه الأداة جاهزة للإعداد لفريقك." : "This tool is ready to be configured for your team."}
              </p>
              <Button data-testid="button-tool-get-started">{language === 'ar' ? "ابدأ الآن" : "Get Started"}</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedTool(null)} data-testid="button-tool-close">
            {language === 'ar' ? "إغلاق" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {EmployeeDialog}
      {ToolDialog}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/departments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" data-testid="text-department-name">{department.name}</h1>
              <Badge variant="secondary">{getSpecialtyLabel(department.icon || "briefcase")}</Badge>
            </div>
            {department.description && (
              <p className="text-muted-foreground text-sm">{department.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setNewEmployeeOpen(true)} data-testid="button-add-employee">
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? "إضافة موظف" : "Add Employee"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees" className="gap-2" data-testid="tab-employees">
            <Users className="h-4 w-4" />
            {language === 'ar' ? "الموظفين" : "Employees"} ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2" data-testid="tab-tools">
            <Wrench className="h-4 w-4" />
            {language === 'ar' ? "الأدوات" : "Tools"} ({tools.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeesLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
            ) : employees.length === 0 ? (
              <Card className="col-span-full p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                <p className="text-muted-foreground">{language === 'ar' ? "لا يوجد موظفين في هذا القسم" : "No employees in this department"}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' ? "أضف موظفين لبدء بناء فريقك" : "Add remote employees to start building your team"}
                </p>
                <Button onClick={() => setNewEmployeeOpen(true)} className="mt-4" data-testid="button-add-first-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? "إضافة أول موظف" : "Add First Employee"}
                </Button>
              </Card>
            ) : (
              employees.map((employee) => (
                <Card key={employee.id} className="hover-elevate" data-testid={`employee-card-${employee.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <p className="text-xs text-muted-foreground">@{employee.username}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              employee.status === "active"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {employee.status || "active"}
                          </Badge>
                        </div>
                        {employee.jobTitle && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {employee.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {employee.bio && (
                      <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{employee.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {employee.email && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </Badge>
                      )}
                      {employee.phone && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </Badge>
                      )}
                    </div>

                    {employee.skills && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {employee.skills.split(",").slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <Link href={`/employees/${employee.username}`}>
                        <Button size="sm" variant="ghost" data-testid={`button-view-profile-${employee.id}`}>
                          <User className="h-4 w-4 mr-1" />
                          {language === 'ar' ? "عرض الملف" : "View Profile"}
                        </Button>
                      </Link>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(employee)}
                          data-testid={`button-edit-employee-${employee.id}`}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                          data-testid={`button-delete-employee-${employee.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {language === 'ar' ? `أدوات ${getSpecialtyLabel(department.icon || "briefcase")}` : `${getSpecialtyLabel(department.icon || "briefcase")} Tools`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? "أدوات متخصصة مصممة لفريقك" 
                : `Specialty tools designed for your ${getSpecialtyLabel(department.icon || "briefcase").toLowerCase()} team`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Card 
                key={tool.id} 
                className="hover-elevate cursor-pointer" 
                onClick={() => setSelectedTool(tool)}
                data-testid={`tool-card-${tool.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center`}>
                      <tool.icon className={`h-5 w-5 ${tool.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
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
