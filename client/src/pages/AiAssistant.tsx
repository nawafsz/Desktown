import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  Package, 
  DollarSign,
  BarChart3,
  BrainCircuit,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, translations } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "alert" | "insight";
}

interface Insight {
  id: string;
  type: "financial" | "inventory" | "meeting" | "general";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  icon: any;
}

export default function AiAssistant() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم في إدارة أعمالك؟",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const { data: salesOrdersData } = useQuery({ queryKey: ["/api/inventory/sales-orders"] });
  const salesOrders = salesOrdersData || [];

  const { data: purchaseOrdersData } = useQuery({ queryKey: ["/api/inventory/purchase-orders"] });
  const purchaseOrders = purchaseOrdersData || [];

  const { data: productsData } = useQuery({ queryKey: ["/api/inventory/products"] });
  const products = productsData || [];

  const { data: stockData } = useQuery({ queryKey: ["/api/inventory/stock"] });
  const stock = stockData || [];

  const { data: meetingsData } = useQuery({ queryKey: ["/api/meetings"] });
  const meetings = meetingsData || [];

  const { data: transactionsData } = useQuery({ queryKey: ["/api/finance/transactions"] });
  const transactions = transactionsData || [];

  const { data: usersData } = useQuery({ queryKey: ["/api/users"] });
  const users = usersData || [];

  const { data: departmentsData } = useQuery({ queryKey: ["/api/departments"] });
  const departments = departmentsData || [];

  // --- Analysis Engine ---
  const insights: Insight[] = [];

  // 1. Sales Analysis
  const totalSales = salesOrders.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0);
  const totalExpenses = purchaseOrders.reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0);
  const profit = totalSales - totalExpenses;

  if (profit > 0) {
    insights.push({
      id: "fin-1",
      type: "financial",
      title: "أداء مالي إيجابي",
      description: `صافي الربح لديك ${profit.toLocaleString()} SAR. استمر في هذا الأداء الجيد!`,
      severity: "low",
      icon: TrendingUp
    });
  } else if (profit < 0) {
    insights.push({
      id: "fin-2",
      type: "financial",
      title: "تنبيه مالي",
      description: `النفقات تتجاوز الإيرادات بمقدار ${Math.abs(profit).toLocaleString()} SAR. يرجى مراجعة المشتريات.`,
      severity: "high",
      icon: AlertTriangle
    });
  }

  // 2. Inventory Analysis
  const lowStockProducts = products.filter((p: any) => {
    const productStock = stock.find((s: any) => s.productId === p.id)?.quantity || 0;
    return productStock < (p.minStockLevel || 5);
  });

  if (lowStockProducts.length > 0) {
    insights.push({
      id: "inv-1",
      type: "inventory",
      title: "نقص في المخزون",
      description: `يوجد ${lowStockProducts.length} منتجات وصلت للحد الأدنى للمخزون.`,
      severity: "medium",
      icon: Package
    });
  }

  // 3. Meetings Analysis
  const today = new Date();
  const upcomingMeetings = meetings.filter((m: any) => new Date(m.startTime) > today).sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  if (upcomingMeetings.length > 0) {
    const nextMeeting = upcomingMeetings[0];
    insights.push({
      id: "mtg-1",
      type: "meeting",
      title: "اجتماع قادم",
      description: `لديك اجتماع "${nextMeeting.title}" في ${format(new Date(nextMeeting.startTime), "HH:mm")}.`,
      severity: "medium",
      icon: Calendar
    });
  }

  // --- Chat Logic ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => {
      let responseContent = "عذراً، لم أفهم طلبك. يمكنك سؤالي عن المبيعات، المخزون، أو الاجتماعات.";
      const lowerInput = userMessage.content.toLowerCase();

      // Simple Intent Recognition
      if (lowerInput.includes("مبيعات") || lowerInput.includes("بيع") || lowerInput.includes("sales")) {
        responseContent = `إجمالي مبيعاتك المسجلة هو **${totalSales.toLocaleString()} SAR** من خلال ${salesOrders.length} طلبات بيع.`;
      } else if (lowerInput.includes("شراء") || lowerInput.includes("مصروفات") || lowerInput.includes("expenses")) {
        responseContent = `إجمالي المصروفات والمشتريات هو **${totalExpenses.toLocaleString()} SAR**.`;
      } else if (lowerInput.includes("ربح") || lowerInput.includes("أرباح") || lowerInput.includes("profit")) {
        responseContent = `صافي الربح الحالي هو **${profit.toLocaleString()} SAR**.`;
      } else if (lowerInput.includes("مخزون") || lowerInput.includes("منتجات") || lowerInput.includes("stock")) {
        if (lowStockProducts.length > 0) {
          responseContent = `لديك **${products.length}** منتجات مسجلة. انتبه! هناك **${lowStockProducts.length}** منتجات منخفضة المخزون تحتاج لإعادة طلب.`;
        } else {
          responseContent = `حالة المخزون جيدة. لديك **${products.length}** منتجات وجميعها فوق الحد الأدنى.`;
        }
      } else if (lowerInput.includes("اجتماع") || lowerInput.includes("مواعيد") || lowerInput.includes("meeting")) {
        if (upcomingMeetings.length > 0) {
          const next = upcomingMeetings[0];
          responseContent = `لديك **${upcomingMeetings.length}** اجتماعات قادمة. الاجتماع التالي هو "**${next.title}**" بتاريخ ${format(new Date(next.startTime), "PPP p", { locale: ar })}.`;
        } else {
          responseContent = "لا توجد اجتماعات مجدولة قادمة.";
        }
      } else if (lowerInput.includes("مرحبا") || lowerInput.includes("هلا")) {
        responseContent = "أهلاً بك! كيف يمكنني مساعدتك في إدارة أعمالك اليوم؟";
      } else if (lowerInput.includes("موظف") || lowerInput.includes("فريق") || lowerInput.includes("راتب") || lowerInput.includes("رواتب")) {
        const totalEmployees = users.length;
        const employeeList = users.map((u: any) => {
          // Mock salary based on role for demonstration as per user request
          let salary = 0;
          switch (u.role) {
            case 'admin': salary = 15000; break;
            case 'manager': salary = 12000; break;
            case 'office_renter': salary = 8000; break;
            default: salary = 5000;
          }
          return `• ${u.firstName || ''} ${u.lastName || ''} (${u.role || 'موظف'}) - الراتب: ${salary.toLocaleString()} SAR`;
        }).join("\n");
        
        responseContent = `لديك **${totalEmployees}** موظفين مسجلين:\n\n${employeeList}`;
      } else {
        // Generic search fallback
        const keywords = lowerInput.split(" ");
        const foundProducts = products.filter((p: any) => keywords.some((k: string) => p.name.toLowerCase().includes(k)));
        const foundMeetings = meetings.filter((m: any) => keywords.some((k: string) => m.title.toLowerCase().includes(k)));
        
        if (foundProducts.length > 0) {
          responseContent = `وجدت معلومات حول المنتجات:\n` + foundProducts.map((p: any) => `- ${p.name}: ${p.stock || 0} قطعة`).join("\n");
        } else if (foundMeetings.length > 0) {
          responseContent = `وجدت اجتماعات مطابقة:\n` + foundMeetings.map((m: any) => `- ${m.title} في ${format(new Date(m.startTime), "PPP")}`).join("\n");
        } else {
          responseContent = "يمكنني مساعدتك في:\n- تحليل المبيعات والمصروفات\n- حالة المخزون والمنتجات\n- مواعيد الاجتماعات\n- بيانات الموظفين والرواتب\n\nاسألني عن أي من هذه المواضيع!";
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col gap-6" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20">
          <BrainCircuit className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            المساعد الذكي
          </h1>
          <p className="text-muted-foreground">تحليل فوري للمبيعات، المخزون، والعمليات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col border-blue-500/10 shadow-xl shadow-blue-500/5 overflow-hidden glass">
          <CardHeader className="border-b bg-white/5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-blue-500/20">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-700">AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-blue-900">محادثة ذكية</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    متصل - جاهز للمساعدة
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                v1.0
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7]" ref={scrollRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 shadow-sm transition-all hover:-translate-y-0.5 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-br-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] border border-blue-700"
                        : "bg-white border-2 border-slate-100 text-slate-800 rounded-2xl rounded-bl-none shadow-[4px_4px_0px_0px_rgba(200,200,200,0.2)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {msg.role === "assistant" && <Sparkles className="h-5 w-5 text-blue-500 mt-1 shrink-0" />}
                      <div className="whitespace-pre-line leading-relaxed font-medium">{msg.content}</div>
                    </div>
                    <div className={`text-[10px] mt-2 opacity-70 ${msg.role === "user" ? "text-blue-100" : "text-slate-400"}`}>
                      {format(msg.timestamp, "p", { locale: ar })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-slate-100 rounded-2xl rounded-bl-none p-4 shadow-[4px_4px_0px_0px_rgba(200,200,200,0.2)]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t">
              <form 
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل عن المبيعات، المخزون، أو اطلب تحليل مالي..."
                  className="flex-1 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-emerald-900 placeholder:text-emerald-900/50 font-medium"
                />
                <Button type="submit" disabled={!input.trim() || isTyping} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                  <Send className="h-4 w-4 ml-2" />
                  إرسال
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Insights & Quick Stats */}
        <div className="space-y-6 flex flex-col h-full overflow-y-auto pr-1">
          
          {/* Active Insights */}
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
                <ActivityIcon className="h-5 w-5 text-blue-600" />
                تحليلات وتنبيهات
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {insights.length > 0 ? (
                insights.map((insight) => (
                  <Card key={insight.id} className={`border-l-4 overflow-hidden transition-all hover:shadow-md ${
                    insight.severity === 'high' ? 'border-l-red-500 bg-red-50/50' : 
                    insight.severity === 'medium' ? 'border-l-amber-500 bg-amber-50/50' : 
                    'border-l-emerald-500 bg-emerald-50/50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          insight.severity === 'high' ? 'bg-red-100 text-red-600' : 
                          insight.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          <insight.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm mb-1 text-slate-800">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
                  <CardContent className="p-6 text-center text-blue-400">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-blue-700 font-medium">لا توجد تنبيهات نشطة حالياً. أمورك ممتازة!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card className="glass border-blue-500/10 shadow-lg shadow-blue-500/5">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">ملخص سريع</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="text-xs text-blue-600 font-medium mb-1">المبيعات</div>
                <div className="text-lg font-bold text-slate-800">{totalSales.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 shadow-sm">
                <div className="text-xs text-pink-600 font-medium mb-1">المصروفات</div>
                <div className="text-lg font-bold text-slate-800">{totalExpenses.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 shadow-sm">
                <div className="text-xs text-amber-600 font-medium mb-1">المخزون</div>
                <div className="text-lg font-bold text-slate-800">{products.length} صنف</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                <div className="text-xs text-emerald-600 font-medium mb-1">الربح</div>
                <div className="text-lg font-bold text-slate-800">{profit.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-900 px-1">إجراءات مقترحة</h3>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3 bg-white border-blue-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all" onClick={() => setInput("اعطني تقرير مالي مختصر")}>
              <BarChart3 className="h-4 w-4 text-blue-500" />
              طلب تقرير مالي
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3 bg-white border-blue-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 hover:shadow-md transition-all" onClick={() => setInput("ما هي المنتجات التي أوشكت على النفاذ؟")}>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              فحص نواقص المخزون
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3 bg-white border-blue-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all" onClick={() => setInput("متى موعد اجتماعي القادم؟")}>
              <Calendar className="h-4 w-4 text-emerald-500" />
              جدول الاجتماعات
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
