import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  FileText, 
  Landmark, 
  Users, 
  PieChart, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Plus,
  Loader2,
  Printer,
  Brain,
  CheckCircle,
  FileCheck,
  FileBadge
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function FinancialAccounting() {
  const { toast } = useToast();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  
  // Bookkeeping State
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Bank Reconciliation State
  const [bankBalance, setBankBalance] = useState("");
  
  // Year Closing State
  const [isClosingYear, setIsClosingYear] = useState(false);
  const [closingStep, setClosingStep] = useState(0); // 0: Idle, 1: Analyzing, 2: Adjusting, 3: Closing, 4: Done

  // Fetch Transactions
  const { data, isLoading } = useQuery({
    queryKey: ["/api/accounting/transactions"],
  });
  
  const transactions = Array.isArray(data) ? data : [];

  // Calculate Financials
  const totalRevenue = transactions
    .filter((t: any) => t.type === 'income' || t.type?.includes('قبض') || t.type?.includes('إيراد'))
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense' || t.type?.includes('صرف') || t.type?.includes('مصروف'))
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

  const netIncome = totalRevenue - totalExpenses;
  const estimatedTax = totalRevenue * 0.15; // 15% VAT assumption

  // Mock Payroll Data
  const employees = [
    { id: 1, name: "أحمد محمد", role: "محاسب", salary: 5000 },
    { id: 2, name: "سارة علي", role: "مدير مالي", salary: 12000 },
    { id: 3, name: "خالد عمر", role: "مدقق", salary: 7000 },
  ];
  const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);

  // Create Transaction Mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/accounting/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting/transactions"] });
      toast({
        title: "تم تسجيل المعاملة",
        description: "تم إضافة المعاملة المالية بنجاح.",
      });
      // Reset form
      setAmount("");
      setType("");
      setDate("");
      setDescription("");
      setIsTransactionOpen(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسجيل المعاملة.",
        variant: "destructive",
      });
    },
  });

  const handleRecordTransaction = () => {
    if (!amount || !description || !date || !type) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      });
      return;
    }

    createTransactionMutation.mutate({
      amount: parseFloat(amount),
      type,
      date,
      description,
      category: "general" 
    });
  };

  const handleRunPayroll = () => {
    createTransactionMutation.mutate({
      amount: totalSalaries,
      type: "مصروف رواتب",
      date: new Date().toISOString().split('T')[0],
      description: "رواتب شهر " + new Date().getMonth() + 1,
      category: "payroll"
    });
    toast({ title: "تم معالجة الرواتب", description: "تم تسجيل مصروف الرواتب بنجاح." });
  };

  const handlePrintZakatDeclaration = () => {
    toast({
      title: "طباعة الإقرار",
      description: "جاري إنشاء ملف PDF للإقرار الزكوي حسب معايير الهيئة...",
    });
    // Simulate printing delay
    setTimeout(() => {
        window.print();
    }, 1000);
  };

  const handlePrintVATReturn = () => {
    toast({
      title: "طباعة الإقرار الضريبي",
      description: "جاري إنشاء نموذج الإقرار الضريبي المعتمد...",
    });
  };

  const handleAutoClosing = () => {
    setIsClosingYear(true);
    setClosingStep(1);

    // Simulate AI steps
    setTimeout(() => setClosingStep(2), 2000); // Analysis done
    setTimeout(() => setClosingStep(3), 4500); // Adjustments done
    setTimeout(() => setClosingStep(4), 7000); // Closing done
    
    setTimeout(() => {
        toast({
            title: "تم إقفال السنة المالية",
            description: "قام الذكاء الاصطناعي بإقفال الحسابات وترحيل الأرصدة بنجاح.",
            variant: "default" // success
        });
        setIsClosingYear(false);
        setClosingStep(0); // Reset or keep at 4 to show success state
    }, 9000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">القسم المالي والمحاسبي المتكامل</h1>
          <p className="text-muted-foreground mt-2">
            هيكل شامل للإدارة المالية لضمان الشفافية ودعم اتخاذ القرارات الاستراتيجية والنمو المستدام.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({ title: "تصدير", description: "جاري تحميل التقارير..." })}>
            <Download className="ml-2 h-4 w-4" />
            تصدير التقارير
          </Button>
          
          <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                معاملة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل معاملة جديدة</DialogTitle>
                <DialogDescription>أدخل تفاصيل المعاملة المالية أدناه.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>نوع المعاملة</Label>
                  <Input placeholder="مثال: فاتورة مبيعات، سند صرف..." value={type} onChange={(e) => setType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ</Label>
                  <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>البيان</Label>
                  <Input placeholder="وصف المعاملة..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRecordTransaction} disabled={createTransactionMutation.isPending}>
                  {createTransactionMutation.isPending ? "جاري التسجيل..." : "حفظ المعاملة"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="statements" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50">
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            القوائم المالية
          </TabsTrigger>
          <TabsTrigger value="bookkeeping" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            مسك الدفاتر
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            تسوية البنك
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            إدارة الرواتب
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            التخطيط المالي
          </TabsTrigger>
          <TabsTrigger value="zakat-tax" className="flex items-center gap-2">
            <FileBadge className="h-4 w-4" />
            الزكاة والضريبة
          </TabsTrigger>
          <TabsTrigger value="closing" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            الإقفال الذكي
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            التدقيق الداخلي
          </TabsTrigger>
        </TabsList>

        {/* Financial Statements */}
        <TabsContent value="statements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الميزانية العمومية</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground mt-2">
                  إجمالي الإيرادات المسجلة.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قائمة الدخل</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{netIncome.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground mt-2">
                  صافي الربح (الإيرادات - المصروفات).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} ر.س</div>
                <p className="text-xs text-muted-foreground mt-2">
                  إجمالي المصروفات المسجلة.
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة على القوائم المالية</CardTitle>
              <CardDescription>
                تحديث دوري لضمان دقة البيانات المالية ودعم اتخاذ القرارات.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/10">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">هامش الربح: {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookkeeping */}
        <TabsContent value="bookkeeping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مسك الدفاتر اليومي</CardTitle>
              <CardDescription>
                تسجيل دقيق لجميع المعاملات المالية والمستندات بشكل يومي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>نوع المعاملة</Label>
                  <Input 
                    placeholder="مثال: فاتورة مبيعات، سند صرف..." 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>البيان</Label>
                  <Input 
                    placeholder="وصف المعاملة..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleRecordTransaction}
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  "تسجيل المعاملة"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>المعاملات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  لا توجد معاملات مسجلة بعد.
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                      </div>
                      <div className="font-bold text-lg">
                        {parseFloat(tx.amount).toFixed(2)} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Reconciliation */}
        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مطابقة السجلات البنكية</CardTitle>
              <CardDescription>
                ضمان تطابق السجلات المحاسبية مع كشوف الحسابات البنكية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Landmark className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">الحساب الجاري الرئيسي</h4>
                      <p className="text-sm text-muted-foreground">الرصيد الدفتري: {netIncome.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="رصيد كشف البنك" 
                      value={bankBalance}
                      onChange={(e) => setBankBalance(e.target.value)}
                      className="w-40"
                    />
                    <Button variant="outline">تحديث</Button>
                  </div>
                </div>
                {bankBalance && (
                  <div className={`p-4 rounded-lg border ${Math.abs(parseFloat(bankBalance) - netIncome) < 0.01 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">الفارق:</span>
                      <span className="text-xl font-bold">{(parseFloat(bankBalance) - netIncome).toFixed(2)} ر.س</span>
                    </div>
                    <p className="text-sm mt-1">
                      {Math.abs(parseFloat(bankBalance) - netIncome) < 0.01 
                        ? "الحسابات متطابقة تماماً." 
                        : "يوجد اختلاف بين السجلات وكشف البنك يرجى المراجعة."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مسيرات الرواتب</CardTitle>
              <CardDescription>
                إدارة رواتب الموظفين والمستحقات الشهرية.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3">الموظف</th>
                        <th className="p-3">الدور الوظيفي</th>
                        <th className="p-3">الراتب الأساسي</th>
                        <th className="p-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id} className="border-t">
                          <td className="p-3 font-medium">{emp.name}</td>
                          <td className="p-3 text-muted-foreground">{emp.role}</td>
                          <td className="p-3">{emp.salary.toLocaleString()} ر.س</td>
                          <td className="p-3 text-green-600">نشط</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50 font-semibold">
                      <tr>
                        <td className="p-3" colSpan={2}>الإجمالي الشهري</td>
                        <td className="p-3 text-primary">{totalSalaries.toLocaleString()} ر.س</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">تصدير كشوفات</Button>
                  <Button onClick={handleRunPayroll} disabled={createTransactionMutation.isPending}>
                    {createTransactionMutation.isPending ? "جاري المعالجة..." : "اعتماد الرواتب"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax & Zakat Tab */}
        <TabsContent value="zakat-tax" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                {/* VAT Card */}
                <Card className="border-t-4 border-t-emerald-500">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>إقرار ضريبة القيمة المضافة</span>
                            <FileCheck className="h-5 w-5 text-emerald-500" />
                        </CardTitle>
                        <CardDescription>حسب أنظمة هيئة الزكاة والضريبة والجمارك (ZATCA)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                             <div className="flex justify-between">
                                 <span>المبيعات الخاضعة للضريبة:</span>
                                 <span className="font-bold">{totalRevenue.toFixed(2)} ر.س</span>
                             </div>
                             <div className="flex justify-between text-muted-foreground text-sm">
                                 <span>المشتريات الخاضعة للضريبة:</span>
                                 <span>{totalExpenses.toFixed(2)} ر.س</span>
                             </div>
                             <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                 <span className="font-semibold">صافي الضريبة المستحقة (15%):</span>
                                 <span className="text-xl font-bold text-emerald-600">{((totalRevenue - totalExpenses) * 0.15).toFixed(2)} ر.س</span>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={handlePrintVATReturn}>
                                <Printer className="ml-2 h-4 w-4" />
                                طباعة الإقرار الضريبي
                            </Button>
                            <Button variant="outline">عرض التفاصيل</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Zakat Card */}
                <Card className="border-t-4 border-t-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>الإقرار الزكوي</span>
                            <Landmark className="h-5 w-5 text-amber-500" />
                        </CardTitle>
                        <CardDescription>تقدير الزكاة الشرعية (2.5%) على الوعاء الزكوي</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                             <div className="flex justify-between">
                                 <span>صافي الأصول الزكوية:</span>
                                 <span className="font-bold">{(netIncome + bankBalance ? parseFloat(bankBalance) : 0).toFixed(2)} ر.س</span>
                             </div>
                             <div className="flex justify-between text-muted-foreground text-sm">
                                 <span>الحول (المدة):</span>
                                 <span>سنة هجرية كاملة</span>
                             </div>
                             <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                 <span className="font-semibold">الزكاة التقديرية (2.5%):</span>
                                 <span className="text-xl font-bold text-amber-600">{((netIncome) * 0.025).toFixed(2)} ر.س</span>
                             </div>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={handlePrintZakatDeclaration}>
                                <Printer className="ml-2 h-4 w-4" />
                                طباعة الإقرار الزكوي
                            </Button>
                            <Button variant="outline">تحديث الوعاء</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>التقويم الضريبي</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3, 4].map((q) => (
                            <div key={q} className={`min-w-[200px] p-4 rounded-lg border ${q === 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-muted'}`}>
                                <h4 className="font-bold mb-1">الربع {q}</h4>
                                <p className="text-sm text-muted-foreground">استحقاق: {30 * q}/03/2025</p>
                                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${q === 1 ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200'}`}>
                                    {q === 1 ? 'مفتوح للتقديم' : 'قادم'}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* AI Closing Tab */}
        <TabsContent value="closing" className="space-y-4">
            <Card className="overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        الإقفال الذكي للسنة المالية
                    </CardTitle>
                    <CardDescription>
                        استخدم قوة الذكاء الاصطناعي لمراجعة الحسابات، إجراء قيود التسوية، وإقفال السنة المالية تلقائياً.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 py-8">
                    {!isClosingYear && closingStep === 0 ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                                <Brain className="h-10 w-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold">جاهز لبدء عملية الإقفال</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                سيقوم النظام بتحليل {transactions.length} معاملة، ومطابقة الأرصدة البنكية، واحتساب الإهلاك، وإنشاء قيود الإقفال النهائية.
                            </p>
                            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg" onClick={handleAutoClosing}>
                                بدء الإقفال الآلي
                            </Button>
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-6">
                            {/* Steps Visualization */}
                            <div className="space-y-4">
                                <div className={`flex items-center gap-4 p-3 rounded-lg border ${closingStep >= 1 ? 'bg-purple-50 border-purple-200' : 'opacity-50'}`}>
                                    {closingStep > 1 ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Loader2 className={`h-6 w-6 text-purple-500 ${closingStep === 1 ? 'animate-spin' : ''}`} />}
                                    <div className="flex-1">
                                        <h4 className="font-medium">تحليل البيانات والمراجعة</h4>
                                        <p className="text-xs text-muted-foreground">فحص اتساق القيود واكتشاف الأخطاء المحتملة</p>
                                    </div>
                                </div>
                                
                                <div className={`flex items-center gap-4 p-3 rounded-lg border ${closingStep >= 2 ? 'bg-blue-50 border-blue-200' : 'opacity-50'}`}>
                                    {closingStep > 2 ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Loader2 className={`h-6 w-6 text-blue-500 ${closingStep === 2 ? 'animate-spin' : ''}`} />}
                                    <div className="flex-1">
                                        <h4 className="font-medium">قيود التسوية والإهلاك</h4>
                                        <p className="text-xs text-muted-foreground">احتساب إهلاك الأصول وتسوية المصروفات المستحقة</p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-4 p-3 rounded-lg border ${closingStep >= 3 ? 'bg-pink-50 border-pink-200' : 'opacity-50'}`}>
                                    {closingStep > 3 ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Loader2 className={`h-6 w-6 text-pink-500 ${closingStep === 3 ? 'animate-spin' : ''}`} />}
                                    <div className="flex-1">
                                        <h4 className="font-medium">إصدار القوائم الختامية</h4>
                                        <p className="text-xs text-muted-foreground">إنشاء الميزانية العمومية وقائمة الدخل النهائية</p>
                                    </div>
                                </div>
                            </div>
                            
                            {closingStep === 4 && (
                                <div className="text-center pt-4 animate-in fade-in zoom-in duration-500">
                                    <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 rounded-full mb-2">
                                        <CheckCircle className="h-6 w-6 mr-2" />
                                        <span className="font-bold">تم الإقفال بنجاح!</span>
                                    </div>
                                    
                                    {/* Closing Summary Card */}
                                    <Card className="max-w-md mx-auto mt-4 mb-6 border-green-200 bg-green-50/50">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-green-800">ملخص ترحيل الأرصدة</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-3">
                                            <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                                <span className="text-muted-foreground">صافي الربح ({netIncome.toFixed(2)} ر.س)</span>
                                                <ArrowDownRight className="h-4 w-4 text-green-600 mx-1" />
                                                <span className="font-bold text-green-900">حساب الأرباح المبقاة (حقوق الملكية)</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-green-200 pb-2">
                                                <span className="text-muted-foreground">الأصول والالتزامات</span>
                                                <ArrowUpRight className="h-4 w-4 text-blue-600 mx-1" />
                                                <span className="font-bold text-blue-900">أرصدة افتتاحية (2026)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">الإيرادات والمصروفات</span>
                                                <span className="font-bold text-gray-500">تم التصفير (0.00 ر.س)</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <p className="text-sm text-muted-foreground mb-4">تم أرشفة السجلات المالية للسنة الحالية بنجاح.</p>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" onClick={() => { setIsClosingYear(false); setClosingStep(0); }}>العودة</Button>
                                        <Button>تحميل التقرير الختامي</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* Tax & Planning */}
        <TabsContent value="planning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>التزامات ضريبة القيمة المضافة</CardTitle>
                <CardDescription>تقدير الضريبة المستحقة بناءً على الإيرادات (15%).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>الإيرادات الخاضعة للضريبة</span>
                    <span className="font-semibold">{totalRevenue.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>نسبة الضريبة</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary pt-2">
                    <span>الضريبة المستحقة (تقريبي)</span>
                    <span>{estimatedTax.toFixed(2)} ر.س</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline">إعداد إقرار ضريبي</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>التوقعات المالية</CardTitle>
                <CardDescription>تنبؤات الأداء للشهر القادم بناءً على المتوسط الحالي.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-600 mb-1">الإيرادات المتوقعة</p>
                    <p className="text-2xl font-bold text-blue-800">{(totalRevenue * 1.1).toFixed(2)} ر.س</p>
                    <p className="text-xs text-blue-500 mt-1">+10% نمو متوقع</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-orange-50">
                    <p className="text-sm text-orange-600 mb-1">المصروفات المتوقعة</p>
                    <p className="text-2xl font-bold text-orange-800">{(totalExpenses * 1.05).toFixed(2)} ر.س</p>
                    <p className="text-xs text-orange-500 mt-1">+5% زيادة متوقعة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Internal Audit */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل التدقيق والمراجعة</CardTitle>
              <CardDescription>
                مراقبة العمليات المالية ورصد التجاوزات أو الأخطاء المحتملة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 p-4 border rounded-lg bg-yellow-50 border-yellow-100">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                      <ShieldCheck className="h-5 w-5" />
                      <h4 className="font-semibold">معاملات عالية القيمة</h4>
                    </div>
                    <p className="text-2xl font-bold text-yellow-800">
                      {transactions.filter((t: any) => parseFloat(t.amount) > 5000).length}
                    </p>
                    <p className="text-sm text-yellow-600">عمليات تجاوزت 5000 ر.س</p>
                  </div>
                  <div className="flex-1 p-4 border rounded-lg bg-red-50 border-red-100">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <FileText className="h-5 w-5" />
                      <h4 className="font-semibold">نقص البيانات</h4>
                    </div>
                    <p className="text-2xl font-bold text-red-800">
                      {transactions.filter((t: any) => !t.description || t.description.length < 5).length}
                    </p>
                    <p className="text-sm text-red-600">عمليات وصفها غير مكتمل</p>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <div className="p-3 bg-muted font-semibold border-b">أحدث التنبيهات</div>
                  {transactions.filter((t: any) => parseFloat(t.amount) > 5000).length === 0 ? (
                     <div className="p-8 text-center text-muted-foreground">سجل نظيف، لا توجد تنبيهات حالياً.</div>
                  ) : (
                    <div className="divide-y">
                      {transactions.filter((t: any) => parseFloat(t.amount) > 5000).map((t: any) => (
                        <div key={t.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
                          <div>
                            <p className="font-medium text-red-600">تنبيه قيمة عالية</p>
                            <p className="text-sm text-muted-foreground">المعاملة: {t.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{parseFloat(t.amount).toFixed(2)} ر.س</p>
                            <Button variant="ghost" size="sm" className="h-6 mt-1 text-xs">مراجعة</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
