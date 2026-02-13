import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Mail, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Activity,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  TrendingUp,
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User, Task } from "@shared/schema";
import { useLanguage, translations } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

function getEffectiveStatus(user: User): "online" | "away" | "offline" | "busy" {
  const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  if (user.status === "online" && user.lastSeenAt) {
    const lastSeen = new Date(user.lastSeenAt).getTime();
    const now = Date.now();
    if (now - lastSeen > INACTIVE_THRESHOLD) {
      return "offline";
    }
  }
  
  return (user.status as "online" | "away" | "offline" | "busy") || "offline";
}

export default function Team() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  
  // Performance Review State
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<User | null>(null);
  const [rating, setRating] = useState(0);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch Sales Data (Mock for now, would be real API)
  const { data: salesOrders = [] } = useQuery({
    queryKey: ["/api/inventory/sales-orders"],
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["/api/inventory/purchase-orders"],
  });

  // Calculate Sales Performance
  const employeePerformance = useMemo(() => {
    return users.map(user => {
      // Mock: Link random sales to users for demo if no real link exists
      // In real app: salesOrders.filter(o => o.salesRepId === user.id)
      const userSales = salesOrders.filter((o: any) => o.id % users.length === user.id % users.length);
      const totalSales = userSales.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      
      return {
        ...user,
        totalSales,
        salesCount: userSales.length,
        rating: (user as any).rating || Math.floor(Math.random() * 5) + 1, // Mock rating if not in DB
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [users, salesOrders]);

  const topPerformer = employeePerformance[0];

  const filteredMembers = employeePerformance.filter(
    (user) => {
      const term = search.toLowerCase();
      return (
        (`${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(term)) ||
        (user.department?.toLowerCase().includes(term) || false) ||
        (user.role?.toLowerCase().includes(term) || false)
      );
    }
  );

  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(t => t.assigneeId === userId);
    const completed = userTasks.filter(t => t.status === "completed").length;
    return { tasksCompleted: completed, total: userTasks.length };
  };

  const teamStats = {
    total: users.length,
    departments: departments.length,
    online: users.filter(u => getEffectiveStatus(u) === "online").length,
  };

  const handleRateEmployee = () => {
    // API call to save rating would go here
    toast({
      title: "تم التقييم",
      description: `تم تقييم الموظف ${reviewTarget?.firstName} بنجاح بـ ${rating} نجوم.`,
    });
    setReviewOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-team-title">فريق العمل والمبيعات</h1>
            <p className="text-muted-foreground text-sm">تتبع أداء المبيعات وتقييم الموظفين</p>
          </div>
        </div>
      </div>

      {/* Top Performer Banner */}
      {topPerformer && topPerformer.totalSales > 0 && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="p-4 bg-amber-500/20 rounded-full">
              <Trophy className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-800">نجم المبيعات لهذا الشهر</h3>
              <p className="text-amber-700">الموظف الأكثر مبيعاً: <span className="font-bold">{topPerformer.firstName} {topPerformer.lastName}</span></p>
            </div>
            <div className="mr-auto text-left">
              <p className="text-sm text-amber-600">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-amber-800">{topPerformer.totalSales.toLocaleString()} SAR</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">قائمة الموظفين</TabsTrigger>
          <TabsTrigger value="sales">أداء المبيعات</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Existing Team List UI */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t.team?.totalMembers || "Total Members", value: teamStats.total, icon: Users, color: "from-emerald-500 to-green-500" },
              { label: t.team?.departments || "Departments", value: teamStats.departments, icon: Briefcase, color: "from-violet-500 to-purple-500" },
              { label: t.team?.onlineNow || "Online Now", value: teamStats.online, icon: Activity, color: "from-cyan-500 to-teal-500" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم، المسمى الوظيفي، أو القسم..."
                  className="pr-10 bg-white/5 border-white/10 focus:border-emerald-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[80px]"
              >
                بحث
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full bg-white/5" />
              ))
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const displayName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Unknown';
                const stats = getUserStats(member.id);
                const isExpanded = selectedMember === member.id;
                const effectiveStatus = getEffectiveStatus(member);
                
                return (
                  <Card
                    key={member.id}
                    className="glass border-white/5 hover-glow cursor-pointer transition-all duration-300 relative overflow-hidden"
                    onClick={() => setSelectedMember(isExpanded ? null : member.id)}
                  >
                    {/* Sales Rank Badge */}
                    {member.totalSales > 0 && (
                      <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-br-lg font-bold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        #{employeePerformance.indexOf(member) + 1} مبيعات
                      </div>
                    )}

                    <CardContent className="p-5 pt-8">
                      <div className="flex items-start gap-4">
                        <UserAvatar
                          name={displayName}
                          avatar={member.profileImageUrl}
                          size="lg"
                          status={effectiveStatus}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold">{displayName}</p>
                            <div className="flex text-amber-400">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < member.rating ? "fill-current" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{member.role || (t.team?.member || "member")}</p>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {member.department && (
                              <Badge variant="outline" className="text-xs bg-white/5 border-white/10">
                                {member.department}
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs capitalize ${
                                effectiveStatus === 'online' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                  : effectiveStatus === 'away'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${
                                effectiveStatus === 'online' ? 'bg-emerald-400' 
                                : effectiveStatus === 'away' ? 'bg-amber-400' 
                                : 'bg-slate-400'
                              }`} />
                              {effectiveStatus === 'online' ? "متصل" : effectiveStatus === 'away' ? "مشغول" : "غير متصل"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">مبيعات الشهر</p>
                              <p className="text-lg font-semibold text-emerald-400">{member.totalSales.toLocaleString()} SAR</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5">
                              <p className="text-xs text-muted-foreground">المهام المنجزة</p>
                              <p className="text-lg font-semibold">{stats.tasksCompleted}</p>
                            </div>
                          </div>
                          
                          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                            <Button 
                              size="sm" 
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewTarget(member);
                                setReviewOpen(true);
                              }}
                            >
                              <Star className="h-4 w-4 ml-2" />
                              تقييم الأداء
                            </Button>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                              <Mail className="h-4 w-4" />
                              بريد
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 gap-1.5">
                              <MessageSquare className="h-4 w-4" />
                              رسالة
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-full glass border-white/5">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-1">لا يوجد موظفين يطابقون بحثك</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>لوحة قيادة مبيعات الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50">
                    <div className={`text-2xl font-bold w-8 text-center ${index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-orange-700" : "text-muted-foreground"}`}>
                      #{index + 1}
                    </div>
                    <UserAvatar name={member.username} avatar={member.profileImageUrl} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{member.firstName} {member.lastName}</span>
                        <span className="font-bold">{member.totalSales.toLocaleString()} SAR</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-500" 
                          style={{ width: `${(member.totalSales / (topPerformer?.totalSales || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>{member.salesCount} عمليات بيع</span>
                        <div className="flex items-center text-amber-500">
                          {member.rating} <Star className="h-3 w-3 fill-current ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تقييم أداء الموظف</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="flex items-center gap-4">
              <UserAvatar name={reviewTarget?.username || ""} avatar={reviewTarget?.profileImageUrl} size="lg" />
              <div>
                <h3 className="font-bold">{reviewTarget?.firstName} {reviewTarget?.lastName}</h3>
                <p className="text-sm text-muted-foreground">{reviewTarget?.role}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>التقييم العام (من 5)</Label>
              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="lg"
                    className={`p-2 h-12 w-12 rounded-full hover:bg-amber-500/10 ${rating >= star ? "text-amber-500" : "text-muted-foreground"}`}
                    onClick={() => setRating(star)}
                  >
                    <Star className={`h-8 w-8 ${rating >= star ? "fill-current" : ""}`} />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>ملاحظات المدير</Label>
              <Input placeholder="أضف ملاحظات حول الأداء..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>إلغاء</Button>
            <Button onClick={handleRateEmployee}>حفظ التقييم</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
