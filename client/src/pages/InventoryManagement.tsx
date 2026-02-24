import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  ShoppingCart, 
  Warehouse, 
  TrendingUp, 
  BarChart as BarChartIcon, 
  Settings, 
  Search,
  Plus,
  ArrowRightLeft,
  Truck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Trash2,
  Printer,
  FileDown
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type {
  InventoryProduct,
  InventoryWarehouse,
  InventorySupplier,
  InventoryPurchaseOrder,
  InventorySalesOrder,
} from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function InventoryManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isCreateSOOpen, setIsCreateSOOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<InventoryProduct[]>({
    queryKey: ["/api/inventory/products"],
  });

  const { data: warehouses = [], isLoading: warehousesLoading } = useQuery<InventoryWarehouse[]>({
    queryKey: ["/api/inventory/warehouses"],
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery<InventorySupplier[]>({
    queryKey: ["/api/inventory/suppliers"],
  });

  const { data: purchaseOrders = [], isLoading: poLoading } = useQuery<InventoryPurchaseOrder[]>({
    queryKey: ["/api/inventory/purchase-orders"],
  });

  const { data: salesOrders = [], isLoading: salesLoading } = useQuery<InventorySalesOrder[]>({
    queryKey: ["/api/inventory/sales-orders"],
  });

  // Analytics Calculations
  const totalProducts = products?.length || 0;
  const lowStockProducts = products?.filter((p: any) => {
    const stock = p.stock?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
    return stock < (p.minStockLevel || 10);
  }).length || 0;
  
  const totalInventoryValue = products?.reduce((acc: number, p: any) => {
    const stock = p.stock?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0;
    return acc + (stock * p.price);
  }, 0) || 0;

  const totalSales = salesOrders?.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0) || 0;

  // Forms State
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: 0,
    cost: 0,
    minStockLevel: 10,
    supplierId: "",
  });

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    capacity: 1000,
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  // PO Form State
  const [newPO, setNewPO] = useState<{
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
  }>({
    supplierId: "",
    items: [],
  });

  // SO Form State
  const [newSO, setNewSO] = useState<{
    customerName: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  }>({
    customerName: "",
    items: [],
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory/products", {
        ...data,
        price: Number(data.price),
        cost: Number(data.cost),
        minStockLevel: Number(data.minStockLevel),
        supplierId: data.supplierId ? Number(data.supplierId) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/products"] });
      setIsAddProductOpen(false);
      setNewProduct({ name: "", sku: "", description: "", category: "", price: 0, cost: 0, minStockLevel: 10, supplierId: "" });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة المنتج بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل إضافة المنتج", variant: "destructive" });
    }
  });

  const createWarehouseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory/warehouses", {
        ...data,
        capacity: Number(data.capacity),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/warehouses"] });
      setIsAddWarehouseOpen(false);
      setNewWarehouse({ name: "", location: "", capacity: 1000 });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة المستودع بنجاح" });
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: any) => {
      // Clean up empty strings to avoid validation issues if any
      const cleanedData = {
        ...data,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      };
      const res = await apiRequest("POST", "/api/inventory/suppliers", cleanedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/suppliers"] });
      setIsAddSupplierOpen(false);
      setNewSupplier({ name: "", contactPerson: "", email: "", phone: "", address: "" });
      toast({ title: "تمت العملية بنجاح", description: "تم إضافة المورد بنجاح" });
    },
    onError: (error) => {
      console.error("Supplier creation failed:", error);
      toast({ title: "خطأ", description: "فشل إضافة المورد. تأكد من ملء الحقول المطلوبة.", variant: "destructive" });
    }
  });

  const createPOMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory/purchase-orders", {
        supplierId: Number(data.supplierId),
        items: data.items.map((item: any) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
        status: "ordered",
        totalAmount: data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitCost), 0),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/purchase-orders"] });
      setIsCreatePOOpen(false);
      setNewPO({ supplierId: "", items: [] });
      toast({ title: "تمت العملية بنجاح", description: "تم إنشاء أمر الشراء بنجاح" });
    },
  });

  const createSOMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/inventory/sales-orders", {
        customerName: data.customerName,
        items: data.items.map((item: any) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        status: "pending",
        totalAmount: data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/sales-orders"] });
      setIsCreateSOOpen(false);
      setNewSO({ customerName: "", items: [] });
      toast({ title: "تمت العملية بنجاح", description: "تم إنشاء طلب البيع بنجاح" });
    },
  });

  // Helpers for Order Forms
  const addPOItem = () => {
    setNewPO({ ...newPO, items: [...newPO.items, { productId: "", quantity: 1, unitCost: 0 }] });
  };

  const removePOItem = (index: number) => {
    const items = [...newPO.items];
    items.splice(index, 1);
    setNewPO({ ...newPO, items });
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    const items = [...newPO.items];
    items[index] = { ...items[index], [field]: value };
    // Auto-fill cost if product selected
    if (field === "productId") {
      const product = products?.find((p: any) => p.id.toString() === value);
      if (product) {
        items[index].unitCost = product.cost;
      }
    }
    setNewPO({ ...newPO, items });
  };

  const addSOItem = () => {
    setNewSO({ ...newSO, items: [...newSO.items, { productId: "", quantity: 1, unitPrice: 0 }] });
  };

  const removeSOItem = (index: number) => {
    const items = [...newSO.items];
    items.splice(index, 1);
    setNewSO({ ...newSO, items });
  };

  const updateSOItem = (index: number, field: string, value: any) => {
    const items = [...newSO.items];
    items[index] = { ...items[index], [field]: value };
    // Auto-fill price if product selected
    if (field === "productId") {
      const product = products?.find((p: any) => p.id.toString() === value);
      if (product) {
        items[index].unitPrice = product.price;
      }
    }
    setNewSO({ ...newSO, items });
  };

  // Analytics Data Preparation
  const categoryData = useMemo(() => {
    if (!products) return [];
    const categories: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.category || "غير مصنف";
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [products]);

  const salesData = useMemo(() => {
    if (!salesOrders) return [];
    
    // Group by date
    const salesByDate: Record<string, number> = {};
    salesOrders.forEach((order: any) => {
      // Ensure date is valid before formatting
      if (!order.orderDate) return;
      const dateObj = new Date(order.orderDate);
      if (isNaN(dateObj.getTime())) return;

      const date = format(dateObj, "yyyy-MM-dd");
      salesByDate[date] = (salesByDate[date] || 0) + (order.totalAmount || 0);
    });

    // Convert to array and sort (last 7 entries)
    return Object.entries(salesByDate)
      .map(([date, amount]) => {
        try {
          return { 
            date: format(new Date(date), "MM/dd"), 
            amount 
          };
        } catch (e) {
          return { date, amount };
        }
      })
      .slice(-7);
  }, [salesOrders]);

  const [autoSettings, setAutoSettings] = useState({
    lowStockAlerts: true,
    autoReorder: false,
    email: "admin@example.com"
  });

  const handleSaveAutoSettings = () => {
    toast({
      title: "تم الحفظ",
      description: "تم تحديث إعدادات الأتمتة بنجاح",
    });
  };

  const handlePrintInvoice = (order: any) => {
    setInvoiceOrder(order);
    // Short timeout to allow state update and rendering of invoice section
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportReports = () => {
    window.print();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="container mx-auto p-6 space-y-8" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة المخزون المتكاملة</h1>
          <p className="text-muted-foreground mt-2">
            نظام شامل لتتبع المخزون، المشتريات، والمبيعات لضمان كفاءة سلسلة التوريد.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المنتج الجديد هنا.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم المنتج</Label>
                    <Input 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU (رمز المنتج)</Label>
                    <Input 
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>سعر البيع</Label>
                    <Input 
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>التكلفة</Label>
                    <Input 
                      type="number"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({...newProduct, cost: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الحد الأدنى للمخزون</Label>
                    <Input 
                      type="number"
                      value={newProduct.minStockLevel}
                      onChange={(e) => setNewProduct({...newProduct, minStockLevel: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المورد</Label>
                    <Select 
                      onValueChange={(value) => setNewProduct({...newProduct, supplierId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>إلغاء</Button>
                <Button onClick={() => createProductMutation.mutate(newProduct)}>حفظ المنتج</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="ml-2 h-4 w-4" />
                مورد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المورد الجديد للتواصل والشحن.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>اسم المورد</Label>
                  <Input 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الشخص المسؤول</Label>
                    <Input 
                      value={newSupplier.contactPerson}
                      onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input 
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input 
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input 
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>إلغاء</Button>
                <Button onClick={() => createSupplierMutation.mutate(newSupplier)}>حفظ المورد</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="secondary" onClick={() => setIsCreatePOOpen(true)}>
            <Truck className="ml-2 h-4 w-4" />
            أمر شراء
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            تتبع المخزون
          </TabsTrigger>
          <TabsTrigger value="purchasing" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            أوامر الشراء
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            التخزين والتنظيم
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            المبيعات والطلبات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            التحليلات والتقارير
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            أتمتة العمليات
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tracking */}
        <TabsContent value="tracking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} SAR</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">منتجات منخفضة</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{lowStockProducts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales.toLocaleString()} SAR</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>مراقبة المخزون الفورية</CardTitle>
              <CardDescription>
                تتبع الكميات والمواقع عبر سلسلة التوريد في الوقت الفعلي.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4 space-x-reverse">
                <Input placeholder="بحث عن منتج (الاسم، الرمز، الباركود)..." className="max-w-sm" />
                <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">SKU</TableHead>
                      <TableHead className="text-right">الكمية المتوفرة</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">جاري التحميل...</TableCell>
                      </TableRow>
                    ) : products?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">لا توجد منتجات. قم بإضافة منتج جديد.</TableCell>
                      </TableRow>
                    ) : (
                      products?.map((product: any) => {
                        const totalStock = product.stock?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>{totalStock}</TableCell>
                            <TableCell>{product.price} SAR</TableCell>
                            <TableCell>
                              {totalStock < (product.minStockLevel || 10) ? (
                                <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs w-fit">
                                  <AlertTriangle className="h-3 w-3 ml-1" />
                                  منخفض
                                </span>
                              ) : (
                                <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs w-fit">
                                  <CheckCircle2 className="h-3 w-3 ml-1" />
                                  متوفر
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Order Management */}
        <TabsContent value="purchasing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>إدارة المشتريات</CardTitle>
                <CardDescription>
                  إنشاء أوامر الشراء وتحديد الكميات المثلى وتوقيت الطلب.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddSupplierOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  مورد جديد
                </Button>

                <Dialog open={isCreatePOOpen} onOpenChange={setIsCreatePOOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="ml-2 h-4 w-4" />
                      أمر شراء جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>إنشاء أمر شراء جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>المورد</Label>
                        <Select onValueChange={(val) => setNewPO({...newPO, supplierId: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مورد" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers?.map((s: any) => (
                              <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border rounded p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">المنتجات المطلوبة</h4>
                          <Button variant="ghost" size="sm" onClick={addPOItem}><Plus className="h-4 w-4" /></Button>
                        </div>
                        {newPO.items.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                              <Label className="text-xs">المنتج</Label>
                              <Select onValueChange={(val) => updatePOItem(idx, 'productId', val)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المنتج" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products?.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24 space-y-1">
                              <Label className="text-xs">الكمية</Label>
                              <Input type="number" value={item.quantity} onChange={(e) => updatePOItem(idx, 'quantity', e.target.value)} />
                            </div>
                            <div className="w-24 space-y-1">
                              <Label className="text-xs">التكلفة</Label>
                              <Input type="number" value={item.unitCost} onChange={(e) => updatePOItem(idx, 'unitCost', e.target.value)} />
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePOItem(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => createPOMutation.mutate(newPO)}>إنشاء الأمر</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الأمر</TableHead>
                      <TableHead className="text-right">المورد</TableHead>
                      <TableHead className="text-right">تاريخ الطلب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">جاري التحميل...</TableCell>
                      </TableRow>
                    ) : purchaseOrders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">لا توجد أوامر شراء.</TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrders?.map((po: any) => (
                        <TableRow key={po.id}>
                          <TableCell>#{po.id}</TableCell>
                          <TableCell>{po.supplier?.name}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                return po.orderDate ? format(new Date(po.orderDate), "dd/MM/yyyy") : "-";
                              } catch (e) {
                                return "-";
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {po.status === 'ordered' ? 'تم الطلب' : po.status}
                            </span>
                          </TableCell>
                          <TableCell>{po.totalAmount} SAR</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Management */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>إدارة المستودعات</CardTitle>
                <CardDescription>
                  تتبع مواقع التخزين وإدارة السعة الاستيعابية.
                </CardDescription>
              </div>
              <Dialog open={isAddWarehouseOpen} onOpenChange={setIsAddWarehouseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    مستودع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مستودع جديد</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>اسم المستودع</Label>
                      <Input 
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({...newWarehouse, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الموقع</Label>
                      <Input 
                        value={newWarehouse.location}
                        onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>السعة الاستيعابية</Label>
                      <Input 
                        type="number"
                        value={newWarehouse.capacity}
                        onChange={(e) => setNewWarehouse({...newWarehouse, capacity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => createWarehouseMutation.mutate(newWarehouse)}>حفظ المستودع</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {warehouses?.map((w: any) => (
                  <Card key={w.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">{w.name}</CardTitle>
                      <CardDescription>{w.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-2">السعة: {w.capacity} وحدة</div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[45%]"></div> {/* Mock progress */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {warehouses?.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    لا توجد مستودعات مضافة.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Management */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>إدارة المبيعات</CardTitle>
                <CardDescription>
                  إدارة طلبات المبيعات وحالة الشحن.
                </CardDescription>
              </div>
              <Dialog open={isCreateSOOpen} onOpenChange={setIsCreateSOOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    طلب بيع جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>إنشاء طلب بيع جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>اسم العميل</Label>
                      <Input 
                        value={newSO.customerName}
                        onChange={(e) => setNewSO({...newSO, customerName: e.target.value})}
                      />
                    </div>

                    <div className="border rounded p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">المنتجات المباعة</h4>
                        <Button variant="ghost" size="sm" onClick={addSOItem}><Plus className="h-4 w-4" /></Button>
                      </div>
                      {newSO.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Label className="text-xs">المنتج</Label>
                            <Select onValueChange={(val) => updateSOItem(idx, 'productId', val)}>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المنتج" />
                              </SelectTrigger>
                              <SelectContent>
                                {products?.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24 space-y-1">
                            <Label className="text-xs">الكمية</Label>
                            <Input type="number" value={item.quantity} onChange={(e) => updateSOItem(idx, 'quantity', e.target.value)} />
                          </div>
                          <div className="w-24 space-y-1">
                            <Label className="text-xs">السعر</Label>
                            <Input type="number" value={item.unitPrice} onChange={(e) => updateSOItem(idx, 'unitPrice', e.target.value)} />
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeSOItem(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => createSOMutation.mutate(newSO)}>إنشاء الطلب</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">جاري التحميل...</TableCell>
                      </TableRow>
                    ) : salesOrders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">لا توجد طلبات بيع.</TableCell>
                      </TableRow>
                    ) : (
                      salesOrders?.map((so: any) => (
                        <TableRow key={so.id}>
                          <TableCell>#{so.id}</TableCell>
                          <TableCell>{so.customerName}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                return so.orderDate ? format(new Date(so.orderDate), "dd/MM/yyyy") : "-";
                              } catch (e) {
                                return "-";
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              {so.status === 'pending' ? 'قيد الانتظار' : so.status}
                            </span>
                          </TableCell>
                          <TableCell>{so.totalAmount} SAR</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handlePrintInvoice(so)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleExportReports}>
              <FileDown className="ml-2 h-4 w-4" />
              تصدير التقارير (PDF)
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInventoryValue.toLocaleString()} SAR</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المنتجات النشطة</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchaseOrders?.filter((p: any) => p.status !== 'received').length || 0}</div>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المبيعات الشهرية</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales.toLocaleString()} SAR</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>توزيع المنتجات حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>اتجاهات المبيعات</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" name="المبيعات" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <BarChartIcon className="h-12 w-12 mb-2 opacity-50" />
                    <p>لا توجد بيانات مبيعات كافية للعرض</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قواعد الأتمتة</CardTitle>
              <CardDescription>
                تكوين التنبيهات وإجراءات إعادة الطلب التلقائي.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">تنبيهات انخفاض المخزون</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعار عندما يصل المنتج إلى الحد الأدنى.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={autoSettings.lowStockAlerts} 
                    onCheckedChange={(c) => setAutoSettings({...autoSettings, lowStockAlerts: c})}
                  />
                  <span className="text-sm text-muted-foreground">
                    {autoSettings.lowStockAlerts ? "مفعل" : "معطل"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">إعادة الطلب التلقائي</Label>
                  <p className="text-sm text-muted-foreground">
                    إنشاء أمر شراء تلقائيًا عند نفاد المخزون.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                   <Switch 
                    checked={autoSettings.autoReorder} 
                    onCheckedChange={(c) => setAutoSettings({...autoSettings, autoReorder: c})}
                  />
                  <span className="text-sm text-muted-foreground">
                    {autoSettings.autoReorder ? "مفعل" : "معطل"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                 <h3 className="font-medium mb-2">إعدادات عامة</h3>
                 <div className="grid gap-4 max-w-sm">
                    <div className="grid gap-2">
                       <Label>البريد الإلكتروني للإشعارات</Label>
                       <Input 
                        type="email" 
                        value={autoSettings.email}
                        onChange={(e) => setAutoSettings({...autoSettings, email: e.target.value})}
                       />
                    </div>
                    <Button variant="outline" onClick={handleSaveAutoSettings}>حفظ الإعدادات</Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Hidden Invoice Template for Printing */}
      {invoiceOrder && (
        <div id="invoice-template" className="hidden print:block fixed inset-0 bg-white z-[9999] p-8" style={{ direction: 'rtl' }}>
          <div className="border-b-2 border-primary pb-4 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary">فاتورة ضريبية</h1>
                <p className="text-muted-foreground mt-1">Invoice</p>
              </div>
              <div className="text-left">
                 <h2 className="text-xl font-semibold">{user?.username ? `مكتب ${user.username}` : "مكتب المبيعات الرئيسي"}</h2>
                 <p className="text-sm text-gray-500">الرقم الضريبي: 300000000000003</p>
                 <p className="text-sm text-gray-500">المملكة العربية السعودية</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-500 mb-2">بيانات العميل</h3>
              <p className="text-lg font-bold">{invoiceOrder.customerName}</p>
            </div>
            <div className="text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">رقم الفاتورة:</span>
                <span className="font-bold">#{invoiceOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">التاريخ:</span>
                <span className="font-bold">
                  {invoiceOrder.orderDate ? format(new Date(invoiceOrder.orderDate), "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy")}
                </span>
              </div>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-3 px-4 text-right font-semibold">المنتج</th>
                <th className="py-3 px-4 text-center font-semibold">الكمية</th>
                <th className="py-3 px-4 text-center font-semibold">سعر الوحدة</th>
                <th className="py-3 px-4 text-left font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoiceOrder.items?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.product?.name || "منتج"}</td>
                  <td className="py-3 px-4 text-center">{item.quantity}</td>
                  <td className="py-3 px-4 text-center">{item.unitPrice} SAR</td>
                  <td className="py-3 px-4 text-left">{(item.quantity * item.unitPrice).toFixed(2)} SAR</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span>المجموع الفرعي:</span>
                <span>{invoiceOrder.totalAmount} SAR</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>الضريبة (15%):</span>
                <span>{(invoiceOrder.totalAmount * 0.15).toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold bg-gray-50 p-2 rounded mt-2">
                <span>الإجمالي النهائي:</span>
                <span>{(invoiceOrder.totalAmount * 1.15).toFixed(2)} SAR</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-sm text-gray-500 border-t pt-8">
            <p>شكراً لتعاملكم معنا!</p>
            <p>تم إصدار هذه الفاتورة إلكترونياً وهي معتمدة.</p>
          </div>
          
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #invoice-template, #invoice-template * {
                visibility: visible;
              }
              #invoice-template {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                background: white;
                display: block !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
