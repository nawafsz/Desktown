
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Award, 
  Plus, 
  Search, 
  Upload, 
  Download, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileCheck,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function HumanResources() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("employees");

  // --- Mock Data ---
  const [employees, setEmployees] = useState([
    { id: 1, name: "أحمد محمد", role: "محاسب", department: "المالية", branch: "الرياض", joinDate: "2023-01-15", status: "active", avatar: "" },
    { id: 2, name: "سارة علي", role: "مسؤول موارد بشرية", department: "HR", branch: "جدة", joinDate: "2023-03-10", status: "active", avatar: "" },
    { id: 3, name: "خالد عمر", role: "مطور برمجيات", department: "التقنية", branch: "الدمام", joinDate: "2023-06-20", status: "on_leave", avatar: "" },
  ]);

  const [attendance, setAttendance] = useState([
    { id: 1, employee: "أحمد محمد", date: "2024-05-20", checkIn: "08:00 AM", checkOut: "04:00 PM", status: "present", hours: 8 },
    { id: 2, employee: "سارة علي", date: "2024-05-20", checkIn: "08:15 AM", checkOut: "04:15 PM", status: "late", hours: 8 },
    { id: 3, employee: "خالد عمر", date: "2024-05-20", checkIn: "-", checkOut: "-", status: "absent", hours: 0 },
  ]);

  const [leaves, setLeaves] = useState([
    { id: 1, employee: "خالد عمر", type: "سنوية", startDate: "2024-06-01", endDate: "2024-06-15", status: "approved", days: 15 },
    { id: 2, employee: "سارة علي", type: "مرضية", startDate: "2024-05-10", endDate: "2024-05-11", status: "pending", days: 2 },
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, employee: "أحمد محمد", type: "عقد عمل", expiryDate: "2024-12-31", status: "valid" },
    { id: 2, employee: "سارة علي", type: "إقامة", expiryDate: "2024-06-01", status: "expiring_soon" },
  ]);

  // --- State for Dialogs ---
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "", department: "", branch: "", joinDate: "" });

  const handleAddEmployee = () => {
    setEmployees([...employees, { ...newEmployee, id: employees.length + 1, status: "active", avatar: "" }]);
    setIsAddEmployeeOpen(false);
    toast({ title: "تم الإضافة", description: "تم إضافة الموظف الجديد بنجاح" });
  };

  const handleApproveLeave = (id: number) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: "approved" } : l));
    toast({ title: "تم الموافقة", description: "تم اعتماد طلب الإجازة" });
  };

  const handleGeneratePayroll = () => {
    toast({ title: "جاري المعالجة", description: "يتم الآن إصدار مسيرات الرواتب..." });
    setTimeout(() => {
        toast({ title: "تم الإصدار", description: "تم إنشاء كشوف المرتبات بنجاح بصيغة PDF" });
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الموارد البشرية</h1>
          <p className="text-muted-foreground mt-1">نظام شامل لإدارة الموظفين، الرواتب، والحضور والانصراف.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
             <Download className="h-4 w-4" />
             تصدير البيانات
           </Button>
           <Button className="gap-2" onClick={() => setIsAddEmployeeOpen(true)}>
             <Plus className="h-4 w-4" />
             موظف جديد
           </Button>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="employees" className="gap-2 py-2">
            <Users className="h-4 w-4" /> الموظفين
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2 py-2">
            <Clock className="h-4 w-4" /> الحضور
          </TabsTrigger>
          <TabsTrigger value="leaves" className="gap-2 py-2">
            <Calendar className="h-4 w-4" /> الإجازات
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2 py-2">
            <DollarSign className="h-4 w-4" /> الرواتب
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2 py-2">
            <FileText className="h-4 w-4" /> العقود
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2 py-2">
            <Award className="h-4 w-4" /> الأداء
          </TabsTrigger>
        </TabsList>

        {/* 1. Employee Directory */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>سجل الموظفين</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث عن موظف..." className="pr-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">المسمى الوظيفي</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">الفرع</TableHead>
                    <TableHead className="text-right">تاريخ التعيين</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.avatar} />
                          <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {emp.name}
                      </TableCell>
                      <TableCell>{emp.role}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.branch}</TableCell>
                      <TableCell>{emp.joinDate}</TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                          {emp.status === "active" ? "نشط" : "في إجازة"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Attendance */}
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">الحضور اليوم</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">92%</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">تأخير</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-600">3 موظفين</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">غياب</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">1 موظف</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
               <div className="flex justify-between">
                 <CardTitle>سجل الحضور والانصراف</CardTitle>
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm">استيراد من البصمة</Button>
                   <Button variant="outline" size="sm">تحديث GPS</Button>
                 </div>
               </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">دخول</TableHead>
                    <TableHead className="text-right">خروج</TableHead>
                    <TableHead className="text-right">ساعات العمل</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell>{rec.employee}</TableCell>
                      <TableCell>{rec.date}</TableCell>
                      <TableCell>{rec.checkIn}</TableCell>
                      <TableCell>{rec.checkOut}</TableCell>
                      <TableCell>{rec.hours}</TableCell>
                      <TableCell>
                        <Badge variant={rec.status === "present" ? "outline" : rec.status === "late" ? "secondary" : "destructive"}>
                          {rec.status === "present" ? "حضور" : rec.status === "late" ? "تأخير" : "غياب"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Leave Management */}
        <TabsContent value="leaves" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card>
               <CardHeader><CardTitle>رصيد الإجازات (المتوسط)</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                 <div className="space-y-1">
                   <div className="flex justify-between text-sm"><span>إجازة سنوية</span><span>21/30 يوم</span></div>
                   <Progress value={70} className="h-2" />
                 </div>
                 <div className="space-y-1">
                   <div className="flex justify-between text-sm"><span>إجازة مرضية</span><span>14/15 يوم</span></div>
                   <Progress value={10} className="h-2" />
                 </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader><CardTitle>تقديم طلب إجازة</CardTitle></CardHeader>
               <CardContent>
                 <Button className="w-full h-24 text-lg border-dashed border-2" variant="outline">
                   <Plus className="mr-2 h-6 w-6" /> تقديم طلب جديد
                 </Button>
               </CardContent>
             </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>طلبات الإجازة المعلقة</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">من</TableHead>
                    <TableHead className="text-right">إلى</TableHead>
                    <TableHead className="text-right">الأيام</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>{leave.employee}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>
                        <Badge variant={leave.status === "approved" ? "default" : "secondary"}>
                          {leave.status === "approved" ? "مقبول" : "معلق"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {leave.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleApproveLeave(leave.id)}><CheckCircle className="h-4 w-4" /></Button>
                            <Button size="sm" variant="destructive"><XCircle className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Payroll */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>مسيرات الرواتب لشهر مايو 2024</CardTitle>
                <CardDescription>إجمالي الرواتب: 145,000 ر.س</CardDescription>
              </div>
              <Button onClick={handleGeneratePayroll}>
                <Printer className="mr-2 h-4 w-4" /> إصدار المسيرات
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">الراتب الأساسي</TableHead>
                    <TableHead className="text-right">بدل سكن</TableHead>
                    <TableHead className="text-right">بدل نقل</TableHead>
                    <TableHead className="text-right">خصومات</TableHead>
                    <TableHead className="text-right">الصافي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>أحمد محمد</TableCell>
                    <TableCell>5,000</TableCell>
                    <TableCell>1,250</TableCell>
                    <TableCell>500</TableCell>
                    <TableCell className="text-red-500">-450</TableCell>
                    <TableCell className="font-bold">6,300</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>سارة علي</TableCell>
                    <TableCell>8,000</TableCell>
                    <TableCell>2,000</TableCell>
                    <TableCell>800</TableCell>
                    <TableCell className="text-red-500">-720</TableCell>
                    <TableCell className="font-bold">10,080</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Documents */}
        <TabsContent value="documents" className="space-y-4">
           <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/10">
             <CardContent className="pt-6 flex items-center gap-4">
               <AlertTriangle className="h-8 w-8 text-yellow-500" />
               <div>
                 <h3 className="font-bold text-yellow-700">تنبيهات انتهاء الصلاحية</h3>
                 <p className="text-sm text-yellow-600/80">يوجد 2 عقود وإقامات ستنتهي خلال 30 يوم.</p>
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader><CardTitle>مكتبة الوثائق والعقود</CardTitle></CardHeader>
             <CardContent>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="text-right">الموظف</TableHead>
                     <TableHead className="text-right">نوع الوثيقة</TableHead>
                     <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                     <TableHead className="text-right">الحالة</TableHead>
                     <TableHead className="text-right">تحميل</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {documents.map((doc) => (
                     <TableRow key={doc.id}>
                       <TableCell>{doc.employee}</TableCell>
                       <TableCell>{doc.type}</TableCell>
                       <TableCell>{doc.expiryDate}</TableCell>
                       <TableCell>
                         <Badge variant={doc.status === "valid" ? "outline" : "destructive"}>
                           {doc.status === "valid" ? "ساري" : "قارب على الانتهاء"}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        </TabsContent>

        {/* 6. Performance */}
        <TabsContent value="performance" className="space-y-4">
           <Card>
             <CardHeader><CardTitle>سجل التقييمات والجزاءات</CardTitle></CardHeader>
             <CardContent>
                <div className="relative border-r border-gray-200 dark:border-gray-700 mr-4 space-y-8">
                  <div className="mr-6 relative">
                    <span className="absolute -right-9 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 ring-8 ring-white dark:ring-gray-900 dark:bg-green-900">
                      <Award className="h-3 w-3 text-green-800 dark:text-green-300" />
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">مكافأة أداء - سارة علي</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">تمت في 15 مايو 2024</time>
                    <p className="text-base font-normal text-gray-500 dark:text-gray-400">حصول الموظفة على جائزة موظف الشهر نظير الأداء المتميز في إدارة التوظيف.</p>
                  </div>
                  
                  <div className="mr-6 relative">
                    <span className="absolute -right-9 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 ring-8 ring-white dark:ring-gray-900 dark:bg-red-900">
                      <AlertTriangle className="h-3 w-3 text-red-800 dark:text-red-300" />
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">لفت نظر - خالد عمر</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">تمت في 10 مايو 2024</time>
                    <p className="text-base font-normal text-gray-500 dark:text-gray-400">بسبب الغياب المتكرر بدون عذر مسبق.</p>
                  </div>
                </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>
              أدخل البيانات الأساسية للموظف لإنشاء الملف الرقمي.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الاسم</Label>
              <Input className="col-span-3" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">المسمى</Label>
              <Input className="col-span-3" value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">القسم</Label>
              <Input className="col-span-3" value={newEmployee.department} onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الفرع</Label>
              <Input className="col-span-3" value={newEmployee.branch} onChange={(e) => setNewEmployee({...newEmployee, branch: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddEmployee}>حفظ وإضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
