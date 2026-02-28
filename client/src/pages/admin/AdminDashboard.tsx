import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash, Printer, FileText, Users, DollarSign, Activity, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const ARAB_COUNTRIES = [
  "المملكة العربية السعودية", "الإمارات العربية المتحدة", "مصر", "الأردن", "الكويت", "قطر", "البحرين", "عمان", 
  "لبنان", "العراق", "سوريا", "فلسطين", "اليمن", "ليبيا", "تونس", "الجزائر", 
  "المغرب", "السودان", "موريتانيا", "الصومال", "جيبوتي", "جزر القمر"
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("clients");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Queries
  const { data: clients, isLoading: loadingClients } = useQuery<any[]>({
    queryKey: ['/api/admin/clients'],
  });

  const { data: financials, isLoading: loadingFinancials } = useQuery<any>({
    queryKey: ['/api/admin/financials'],
  });

  const { data: staff, isLoading: loadingStaff } = useQuery<any[]>({
    queryKey: ['/api/admin/staff'],
  });

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({ title: "تم إنشاء العميل بنجاح" });
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "فشل إنشاء العميل", description: error.message, variant: "destructive" });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({ title: "تم حذف العميل" });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await apiRequest("PATCH", `/api/admin/clients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      toast({ title: "تم تحديث العميل" });
    }
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/staff", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/staff'] });
      toast({ title: "تم إضافة الموظف بنجاح" });
    }
  });

  // Handlers
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    createClientMutation.mutate(data);
  };

  const handlePrintInvoice = (client: any) => {
    // Mock print functionality
    window.print();
    toast({ title: "جاري طباعة الفاتورة..." });
  };

  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">لوحة تحكم المنصة</h1>
          <p className="text-muted-foreground">إدارة العملاء، الاشتراكات، المالية، والموظفين</p>
        </div>
        <div className="flex gap-4">
            <Card className="bg-primary text-primary-foreground p-4 flex items-center gap-4">
                <Users className="h-8 w-8" />
                <div>
                    <p className="text-sm opacity-80">إجمالي العملاء</p>
                    <p className="text-2xl font-bold">{clients?.length || 0}</p>
                </div>
            </Card>
            <Card className="bg-green-600 text-white p-4 flex items-center gap-4">
                <DollarSign className="h-8 w-8" />
                <div>
                    <p className="text-sm opacity-80">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">{financials?.totalRevenue || 0} ر.س</p>
                </div>
            </Card>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px] bg-muted p-1 rounded-xl">
          <TabsTrigger value="clients" className="text-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all">العملاء</TabsTrigger>
          <TabsTrigger value="subscriptions" className="text-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all">الاشتراكات</TabsTrigger>
          <TabsTrigger value="financials" className="text-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all">المالية</TabsTrigger>
          <TabsTrigger value="staff" className="text-lg py-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all">الموظفين</TabsTrigger>
        </TabsList>

        {/* CLIENTS TAB */}
        <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">إدارة العملاء</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Plus className="h-5 w-5" /> إضافة عميل جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>تسجيل عميل جديد (مكتب)</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateClient} className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label>اسم العميل</Label>
                                <Input name="businessName" required placeholder="الاسم التجاري" />
                            </div>
                            <div className="space-y-2">
                                <Label>نوع الكيان</Label>
                                <Select name="businessType" defaultValue="company">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company">شركة</SelectItem>
                                        <SelectItem value="institution">مؤسسة</SelectItem>
                                        <SelectItem value="individual">فرد</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>السجل التجاري (اختياري)</Label>
                                <Input name="crNumber" placeholder="70xxxxxxxx" />
                            </div>
                            <div className="space-y-2">
                                <Label>الدولة</Label>
                                <Select name="country" defaultValue="المملكة العربية السعودية">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ARAB_COUNTRIES.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>المدينة</Label>
                                <Input name="city" required />
                            </div>
                            <div className="space-y-2">
                                <Label>العنوان البريدي</Label>
                                <Input name="address" required />
                            </div>
                            <div className="space-y-2">
                                <Label>البريد الإلكتروني</Label>
                                <Input name="email" type="email" required />
                            </div>
                            <div className="space-y-2">
                                <Label>رقم الاتصال</Label>
                                <Input name="phone" required />
                            </div>
                            <div className="space-y-2">
                                <Label>رقم إضافي (اختياري)</Label>
                                <Input name="additionalPhone" />
                            </div>
                            <div className="space-y-2">
                                <Label>اسم المستخدم</Label>
                                <Input name="username" required />
                            </div>
                            <div className="space-y-2">
                                <Label>كلمة المرور</Label>
                                <Input name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label>نوع الاشتراك</Label>
                                <Select name="subscriptionType" defaultValue="vip">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vip">VIP (مدفوع)</SelectItem>
                                        <SelectItem value="free">مجاني</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 mt-4">
                                <Button type="submit" className="w-full" disabled={createClientMutation.isPending}>
                                    {createClientMutation.isPending ? <Loader2 className="animate-spin" /> : "إضافة وتسجيل"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الاسم التجاري</TableHead>
                            <TableHead className="text-right">اسم المستخدم</TableHead>
                            <TableHead className="text-right">البريد الإلكتروني</TableHead>
                            <TableHead className="text-right">نوع الاشتراك</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingClients ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow>
                        ) : clients?.map((client: any) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.businessName || client.firstName}</TableCell>
                                <TableCell>{client.username}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>
                                    <Badge variant={client.office?.subscriptionPlan === 'vip' ? 'default' : 'secondary'}>
                                        {client.office?.subscriptionPlan?.toUpperCase() || 'FREE'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {client.status === 'online' ? <div className="w-3 h-3 bg-green-500 rounded-full" /> : <div className="w-3 h-3 bg-gray-300 rounded-full" />}
                                        {client.status === 'online' ? 'متصل' : 'غير متصل'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => updateClientMutation.mutate({ 
                                            id: client.id, 
                                            data: { subscriptionType: client.office?.subscriptionPlan === 'vip' ? 'free' : 'vip' } 
                                        })}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteClientMutation.mutate(client.id)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-4">
            <h2 className="text-2xl font-semibold">إدارة الاشتراكات</h2>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">العميل</TableHead>
                            <TableHead className="text-right">الخطة</TableHead>
                            <TableHead className="text-right">الحالة</TableHead>
                            <TableHead className="text-right">تاريخ البدء</TableHead>
                            <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                            <TableHead className="text-right">الاتصال</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients?.map((client: any) => (
                            <TableRow key={client.id}>
                                <TableCell>{client.businessName || client.firstName}</TableCell>
                                <TableCell>{client.subscription?.plan?.toUpperCase() || 'FREE'}</TableCell>
                                <TableCell>
                                    <Badge variant={client.subscription?.status === 'active' ? 'outline' : 'destructive'} className={client.subscription?.status === 'active' ? "border-green-500 text-green-500" : ""}>
                                        {client.subscription?.status || 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{client.subscription?.startDate ? new Date(client.subscription.startDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                                <TableCell>{client.subscription?.endDate ? new Date(client.subscription.endDate).toLocaleDateString('ar-SA') : '-'}</TableCell>
                                <TableCell>
                                    {client.status === 'online' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-300" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </TabsContent>

        {/* FINANCIALS TAB */}
        <TabsContent value="financials" className="space-y-4">
            <h2 className="text-2xl font-semibold">التقارير المالية والفواتير</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle>الإيرادات الشهرية</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{financials?.totalRevenue || 0} ر.س</div>
                        <p className="text-sm text-muted-foreground mt-2">+12% عن الشهر الماضي</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>الاشتراكات النشطة</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{clients?.filter((c:any) => c.office?.subscriptionPlan === 'vip').length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>الفواتير المستحقة</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">0</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader><CardTitle>إصدار الفواتير</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">العميل</TableHead>
                                <TableHead className="text-right">المبلغ</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">الإجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients?.filter((c:any) => c.office?.subscriptionPlan === 'vip').map((client: any) => (
                                <TableRow key={client.id}>
                                    <TableCell>{client.businessName}</TableCell>
                                    <TableCell>3000 ر.س</TableCell>
                                    <TableCell>{new Date().toLocaleDateString('ar-SA')}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(client)}>
                                            <Printer className="h-4 w-4 ml-2" /> طباعة / إرسال
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* STAFF TAB */}
        <TabsContent value="staff" className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">إدارة موظفي المنصة</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="h-4 w-4" /> إضافة موظف</Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                        <DialogHeader><DialogTitle>إضافة موظف جديد</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            createStaffMutation.mutate(Object.fromEntries(formData));
                        }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>الاسم</Label>
                                <Input name="firstName" required />
                            </div>
                            <div className="space-y-2">
                                <Label>اسم المستخدم</Label>
                                <Input name="username" required />
                            </div>
                            <div className="space-y-2">
                                <Label>البريد الإلكتروني</Label>
                                <Input name="email" required type="email" />
                            </div>
                            <div className="space-y-2">
                                <Label>كلمة المرور</Label>
                                <Input name="password" required type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>الدور</Label>
                                <Select name="role" defaultValue="support">
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="support">دعم فني</SelectItem>
                                        <SelectItem value="admin">مدير</SelectItem>
                                        <SelectItem value="manager">مشرف</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full">إضافة</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staff?.map((employee: any) => (
                    <Card key={employee.id} className="hover:shadow-lg transition-all">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {employee.username[0].toUpperCase()}
                            </div>
                            <div>
                                <CardTitle>{employee.firstName || employee.username}</CardTitle>
                                <CardDescription>{employee.role}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>الحالة:</span>
                                    <span className="text-green-500 font-medium">نشط</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>المهام المنجزة:</span>
                                    <span>12</span>
                                </div>
                                <Button variant="outline" className="w-full mt-2">إسناد مهمة</Button>
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