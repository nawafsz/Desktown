import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  ListChecks, 
  FileText, 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  ArrowLeft,
  Calendar as CalendarIcon,
  Download,
  Share2
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GeneralDepartment() {
  const { language, isRTL } = useLanguage();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("tab") || "dashboard";
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock Data
  const taskStats = [
    { name: language === 'ar' ? "مكتملة" : "Completed", value: 12 },
    { name: language === 'ar' ? "قيد التنفيذ" : "In Progress", value: 8 },
    { name: language === 'ar' ? "معلقة" : "Pending", value: 5 },
    { name: language === 'ar' ? "متأخرة" : "Overdue", value: 2 },
  ];

  const weeklyActivity = [
    { name: language === 'ar' ? "السبت" : "Sat", tasks: 4, files: 2 },
    { name: language === 'ar' ? "الأحد" : "Sun", tasks: 6, files: 5 },
    { name: language === 'ar' ? "الاثنين" : "Mon", tasks: 8, files: 3 },
    { name: language === 'ar' ? "الثلاثاء" : "Tue", tasks: 5, files: 4 },
    { name: language === 'ar' ? "الأربعاء" : "Wed", tasks: 9, files: 6 },
    { name: language === 'ar' ? "الخميس" : "Thu", tasks: 7, files: 2 },
    { name: language === 'ar' ? "الجمعة" : "Fri", tasks: 2, files: 1 },
  ];

  const tasks = [
    { id: 1, title: "Prepare Monthly Report", assignee: "Sarah Smith", status: "in-progress", priority: "high", dueDate: "2025-02-28" },
    { id: 2, title: "Update Team Guidelines", assignee: "Ahmed Ali", status: "pending", priority: "medium", dueDate: "2025-03-05" },
    { id: 3, title: "Organize Team Building Event", assignee: "John Doe", status: "completed", priority: "low", dueDate: "2025-02-20" },
    { id: 4, title: "Review New Policy Draft", assignee: "Sarah Smith", status: "overdue", priority: "high", dueDate: "2025-02-25" },
  ];

  const notes = [
    { id: 1, title: "Meeting Minutes - Feb 25", content: "Discussed Q1 goals and team expansion plans...", author: "Ahmed Ali", date: "2025-02-25" },
    { id: 2, title: "Project Ideas", content: "Brainstorming session for the new internal tool...", author: "Sarah Smith", date: "2025-02-24" },
    { id: 3, title: "Important Contacts", content: "List of vendors and key stakeholders...", author: "John Doe", date: "2025-02-20" },
  ];

  const files = [
    { id: 1, name: "Q1_Report.pdf", type: "pdf", size: "2.5 MB", uploader: "Sarah Smith", date: "2025-02-26" },
    { id: 2, name: "Team_Photo.jpg", type: "image", size: "4.1 MB", uploader: "Ahmed Ali", date: "2025-02-25" },
    { id: 3, name: "Budget_Sheet.xlsx", type: "excel", size: "1.2 MB", uploader: "John Doe", date: "2025-02-24" },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  const STATUS_COLORS = {
    "completed": "bg-green-100 text-green-700",
    "in-progress": "bg-blue-100 text-blue-700",
    "pending": "bg-yellow-100 text-yellow-700",
    "overdue": "bg-red-100 text-red-700"
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
              <Briefcase className="h-8 w-8 text-primary" />
              {language === 'ar' ? "القسم العام" : "General Department"}
            </h1>
          </div>
          <p className="text-muted-foreground md:mr-10 md:ml-10">
            {language === 'ar' 
              ? "إدارة المهام، الملاحظات، والملفات المشتركة للفريق." 
              : "Manage tasks, notes, and shared team files."}
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? "مهمة جديدة" : "New Task"}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-2 gap-2 bg-muted/50 w-full justify-start">
          <TabsTrigger value="dashboard" className="flex items-center gap-2 flex-1 md:flex-none">
            <Briefcase className="h-4 w-4" />
            {language === 'ar' ? "لوحة القيادة" : "Dashboard"}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2 flex-1 md:flex-none">
            <ListChecks className="h-4 w-4" />
            {language === 'ar' ? "المهام" : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2 flex-1 md:flex-none">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? "الملاحظات" : "Notes"}
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2 flex-1 md:flex-none">
            <FolderOpen className="h-4 w-4" />
            {language === 'ar' ? "الملفات" : "Files"}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "المهام النشطة" : "Active Tasks"}
                </CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">13</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "3 مهام عالية الأولوية" : "3 high priority"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "الملفات المشتركة" : "Shared Files"}
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "+12 هذا الأسبوع" : "+12 this week"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "الملاحظات" : "Notes"}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "آخر تحديث اليوم" : "Last updated today"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? "أعضاء الفريق" : "Team Members"}
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? "الجميع نشط الآن" : "All active now"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? "حالة المهام" : "Task Status"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStats.map((entry, index) => (
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
                <CardTitle>{language === 'ar' ? "النشاط الأسبوعي" : "Weekly Activity"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tasks" name={language === 'ar' ? "المهام" : "Tasks"} fill="#3b82f6" />
                    <Bar dataKey="files" name={language === 'ar' ? "الملفات" : "Files"} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{language === 'ar' ? "قائمة المهام" : "Tasks List"}</CardTitle>
                <div className="flex gap-2">
                  <Input 
                    placeholder={language === 'ar' ? "بحث في المهام..." : "Search tasks..."} 
                    className="w-64"
                  />
                  <Button variant="outline"><Filter className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${task.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">{task.assignee.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{task.assignee}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "الأولوية" : "Priority"}</p>
                        <Badge variant={task.priority === 'high' ? "destructive" : task.priority === 'medium' ? "secondary" : "outline"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? "الحالة" : "Status"}</p>
                        <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] || "bg-gray-100"}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="text-center hidden sm:block">
                         <p className="text-xs text-muted-foreground">{language === 'ar' ? "تاريخ الاستحقاق" : "Due Date"}</p>
                         <p className="text-sm flex items-center gap-1">
                           <CalendarIcon className="h-3 w-3" />
                           {task.dueDate}
                         </p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle>{language === 'ar' ? "ملاحظات الفريق" : "Team Notes"}</CardTitle>
                 <Button className="gap-2">
                   <Plus className="h-4 w-4" />
                   {language === 'ar' ? "ملاحظة جديدة" : "New Note"}
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {notes.map((note) => (
                    <Card key={note.id} className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
                       <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex justify-between">
                            {note.title}
                            <FileText className="h-4 w-4 text-yellow-600" />
                          </CardTitle>
                       </CardHeader>
                       <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{note.content}</p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-yellow-200 dark:border-yellow-900/30 pt-2">
                             <span>{note.author}</span>
                             <span>{note.date}</span>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
                 <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-lg h-[180px] cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                       <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                       <p className="text-sm text-muted-foreground">{language === 'ar' ? "إضافة ملاحظة سريعة" : "Add Quick Note"}</p>
                    </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
           <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                   <CardTitle>{language === 'ar' ? "مدير الملفات" : "File Manager"}</CardTitle>
                   <div className="flex gap-2">
                      <Button variant="outline" className="gap-2">
                        <Share2 className="h-4 w-4" />
                        {language === 'ar' ? "مشاركة" : "Share"}
                      </Button>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        {language === 'ar' ? "رفع ملف" : "Upload"}
                      </Button>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    {files.map((file) => (
                       <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                             </div>
                             <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{file.size} • {file.date}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground hidden md:inline-block">by {file.uploader}</span>
                             <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                             <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}