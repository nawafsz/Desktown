import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Task, User } from "@shared/schema";
import { useLanguage, translations } from "@/lib/i18n";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

export default function Tasks() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all_tasks");
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", assigneeId: "" });

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; assigneeId?: string }) => {
      return await apiRequest("POST", "/api/tasks", {
        ...data,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: "", description: "", priority: "medium", assigneeId: "" });
      toast({ 
        title: language === 'ar' ? "تم إنشاء المهمة" : "Task created", 
        description: language === 'ar' ? "تمت إضافة المهمة الجديدة بنجاح." : "Your new task has been added successfully." 
      });
    },
    onError: () => {
      toast({ 
        title: t.tickets?.error || "Error", 
        description: language === 'ar' ? "فشل في إنشاء المهمة." : "Failed to create task.", 
        variant: "destructive" 
      });
    },
  });

  const handleCreateTask = () => {
    if (newTask.title) {
      createTaskMutation.mutate(newTask);
    }
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const filteredTasks = tasks.filter((task) => {
    let matchesFilter = true;
    if (filter !== "all") {
      matchesFilter = task.status === filter;
    }
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'ar' ? 'إدارة المهام' : 'Tasks Management'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {language === 'ar' ? 'تتبع وإدارة مهام فريقك' : 'Track and manage your team tasks'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => setActiveTab("new_task")}>
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'مهمة جديدة' : 'New Task'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: language === 'ar' ? 'قيد الانتظار' : 'Pending', value: taskStats.pending, color: "text-slate-500", bg: "bg-slate-500/10" },
          { label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress', value: taskStats.inProgress, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: language === 'ar' ? 'مكتملة' : 'Completed', value: taskStats.completed, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: language === 'ar' ? 'الإجمالي' : 'Total', value: taskStats.total, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="glass border-white/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-white/10">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Task'}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{language === 'ar' ? 'عنوان المهمة' : 'Task Title'}</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل العنوان...' : 'Enter title...'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">{language === 'ar' ? 'المسند إليه' : 'Assignee'}</Label>
                <Select
                  value={newTask.assigneeId}
                  onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder={language === 'ar' ? 'اختر موظفاً' : 'Select employee'} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">{t.tickets?.priority || "Priority"}</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t.tickets?.highPriority || "High"}</SelectItem>
                    <SelectItem value="medium">{t.tickets?.mediumPriority || "Normal"}</SelectItem>
                    <SelectItem value="low">{t.tickets?.lowPriority || "Low"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t.tickets?.description || "Description"}</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {language === 'ar' ? 'إضافة المهمة' : 'Add Task'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{language === 'ar' ? 'المهام النشطة' : 'Active Tasks'}</h2>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-white/5" />)
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const assignee = getUserById(task.assigneeId);
                  return (
                    <Card key={task.id} className="glass border-white/5 hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{task.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {assignee ? `${assignee.firstName || ''} ${assignee.lastName || ''}` : 'Unassigned'}
                            </p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={priorityColors[task.priority as string]}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={statusColors[task.status as string]}>
                              {task.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>{language === 'ar' ? 'لا توجد مهام' : 'No tasks found'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
