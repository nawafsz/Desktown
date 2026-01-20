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
  Ticket as TicketIcon, 
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Ticket, User } from "@shared/schema";
import { useLanguage, translations } from "@/lib/i18n";

const statusColors: Record<string, string> = {
  open: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  in_progress: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const priorityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const statusIcons: Record<string, typeof AlertCircle> = {
  open: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle2,
  closed: CheckCircle2,
};

export default function Tickets() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("all_tickets");
  const [activeTab, setActiveTab] = useState("all_tickets");
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium", department: "" });

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; priority: string; department?: string }) => {
      return await apiRequest("POST", "/api/tickets", {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: "open",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setNewTicket({ title: "", description: "", priority: "medium", department: "" });
      toast({ title: t.tickets?.ticketCreated || "Ticket created", description: t.tickets?.ticketCreatedDesc || "Your support ticket has been submitted." });
    },
    onError: () => {
      toast({ title: t.tickets?.error || "Error", description: t.tickets?.failedCreate || "Failed to create ticket.", variant: "destructive" });
    },
  });

  const handleCreateTicket = () => {
    if (newTicket.title) {
      createTicketMutation.mutate(newTicket);
    }
  };

  const getUserById = (userId: string | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const filteredTickets = tickets.filter((ticket) => {
    let matchesFilter = true;
    if (filter === "open" || filter === "in_progress" || filter === "resolved" || filter === "closed") {
      matchesFilter = ticket.status === filter;
    } else if (filter === "breaches") {
      matchesFilter =
        ticket.priority === "high" &&
        ticket.status !== "resolved" &&
        ticket.status !== "closed";
    }
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    breaches: tickets.filter(
      t =>
        t.priority === "high" &&
        t.status !== "resolved" &&
        t.status !== "closed"
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto flex">
        <aside className="hidden md:flex flex-col w-60 border-r border-white/5 bg-slate-900/60">
          <div className="px-6 py-5 text-lg font-semibold tracking-tight">
            {t.tickets?.supportCenter || "Support Center"}
          </div>
          <nav className="flex-1 px-2 space-y-1">
            {[
              { id: "dashboard", label: t.tickets?.navDashboard || "Dashboard" },
              { id: "all_tickets", label: t.tickets?.navAllTickets || "All Tickets" },
              { id: "new_ticket", label: t.tickets?.navNewTicket || "New Ticket" },
              { id: "sentiments", label: t.tickets?.navSentiments || "Sentiments" },
              { id: "my_tickets", label: t.tickets?.navMyTickets || "My Tickets" },
              { id: "unassigned", label: t.tickets?.navUnassigned || "Unassigned" },
              { id: "assigned_to_me", label: t.tickets?.navAssignedToMe || "Assigned to Me" },
              { id: "overdue", label: t.tickets?.navOverdue || "Overdue" },
              { id: "knowledge", label: t.tickets?.navKnowledge || "Knowledge" },
              { id: "reports", label: t.tickets?.navReports || "Reports" },
              { id: "administration", label: t.tickets?.navAdministration || "Administration" },
              { id: "filter", label: t.tickets?.navFilter || "Filter" },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeNav === item.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "all_tickets") setFilter("all");
                  if (item.id === "overdue") setFilter("breaches");
                }}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-4 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-tickets-title">
                {t.tickets?.supportCenterTitle || "Support Center"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {t.tickets?.supportCenterSubtitle || "Track and manage all support tickets"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="gap-2" data-testid="button-new-ticket" onClick={() => setActiveTab("new_ticket")}>
                <Plus className="h-4 w-4" />
                {t.tickets?.newTicket || "New Ticket"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2 text-sm">
            {[
              { id: "dashboard", label: t.tickets?.tabDashboard || "Dashboard" },
              { id: "all_tickets", label: t.tickets?.tabAllTickets || "All Tickets" },
              { id: "new_ticket", label: t.tickets?.tabNewTicket || "New Ticket" },
              { id: "sentiments", label: t.tickets?.tabSentiments || "Sentiments" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                id: "open",
                label: t.tickets?.openTickets || "Open Tickets",
                value: ticketStats.open,
                color: "from-emerald-500 to-green-500",
                helper: t.tickets?.openTicketsHelper || "Assigned to you",
              },
              {
                id: "breaches",
                label: t.tickets?.breaches || "Breaches",
                value: ticketStats.breaches,
                color: "from-yellow-400 to-amber-500",
                helper: t.tickets?.breachesHelper || "All overdue",
              },
              {
                id: "in_progress",
                label: t.tickets?.inProgress || "In Progress",
                value: ticketStats.inProgress,
                color: "from-orange-500 to-red-500",
                helper: t.tickets?.inProgressHelper || "All unresolved",
              },
              {
                id: "total",
                label: t.tickets?.totalTickets || "Total Tickets",
                value: ticketStats.total,
                color: "from-slate-500 to-slate-600",
                helper: t.tickets?.totalTicketsHelper || "All generated",
              },
            ].map((stat) => (
              <button
                key={stat.id}
                type="button"
                className="glass rounded-xl p-4 border border-white/5 text-left hover-glow transition-all"
                onClick={() => {
                  if (stat.id === "open") setFilter("open");
                  if (stat.id === "in_progress") setFilter("in_progress");
                  if (stat.id === "total") setFilter("all");
                  if (stat.id === "breaches") setFilter("breaches");
                }}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{stat.helper}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {t.tickets?.newSupportRequest || "New Support Request"}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t.tickets?.ticketTitle || "Subject"}</Label>
                    <Input
                      id="title"
                      placeholder={t.tickets?.titlePlaceholder || "Enter subject..."}
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-violet-500/50"
                      data-testid="input-ticket-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">{t.tickets?.department || "Department"}</Label>
                    <Select
                      value={newTicket.department}
                      onValueChange={(value) => setNewTicket({ ...newTicket, department: value })}
                    >
                      <SelectTrigger
                        id="department"
                        className="bg-white/5 border-white/10"
                        data-testid="select-ticket-department"
                      >
                        <SelectValue placeholder={t.tickets?.departmentPlaceholder || "Select department"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">{t.tickets?.departmentSupport || "Support"}</SelectItem>
                        <SelectItem value="sales">{t.tickets?.departmentSales || "Sales"}</SelectItem>
                        <SelectItem value="billing">{t.tickets?.departmentBilling || "Billing"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">{t.tickets?.priority || "Priority"}</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger
                        id="priority"
                        className="bg-white/5 border-white/10"
                        data-testid="select-ticket-priority"
                      >
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
                      placeholder={
                        t.tickets?.descriptionPlaceholder ||
                        "Provide a detailed description of the issue..."
                      }
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-violet-500/50 min-h-[120px]"
                      data-testid="input-ticket-description"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateTicket}
                    disabled={createTicketMutation.isPending}
                    data-testid="button-create-ticket"
                  >
                    {createTicketMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t.tickets?.submitting || "Submitting..."}
                      </>
                    ) : (
                      t.tickets?.submitTicket || "Submit Ticket"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {t.tickets?.activeTickets || "Active Tickets"}
                  </h2>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.tickets?.searchTickets || "Search tickets..."}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10 focus:border-violet-500/50"
                      data-testid="input-search-tickets"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full bg-white/5" />
                      ))
                  ) : filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const reporter = getUserById(ticket.reporterId);
                      const assignee = getUserById(ticket.assigneeId);
                      const StatusIcon = statusIcons[ticket.status as string] || AlertCircle;

                      return (
                        <Card
                          key={ticket.id}
                          className="glass border-white/5 hover-glow cursor-pointer transition-all duration-300"
                          data-testid={`card-ticket-${ticket.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div
                                  className={`p-2.5 rounded-xl ${
                                    statusColors[ticket.status as string]?.split(" ")[0] ||
                                    "bg-slate-500/10"
                                  }`}
                                >
                                  <StatusIcon
                                    className={`h-5 w-5 ${
                                      statusColors[ticket.status as string]?.split(" ")[1] ||
                                      "text-slate-400"
                                    }`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">
                                      T-{String(ticket.id).padStart(3, "0")}
                                    </span>
                                    <h3 className="font-semibold truncate">{ticket.title}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {t.tickets?.reportedBy || "Reported by"}{" "}
                                    {reporter
                                      ? `${reporter.firstName || ""} ${reporter.lastName || ""}`.trim() ||
                                        reporter.email
                                      : t.tickets?.unknown || "Unknown"}
                                    {assignee && (
                                      <span className="text-cyan-400">
                                        {" "}
                                        • {t.tickets?.assignedTo || "Assigned to"}{" "}
                                        {`${assignee.firstName || ""} ${assignee.lastName || ""}`.trim() ||
                                          assignee.email}
                                      </span>
                                    )}
                                  </p>
                                  {ticket.description && (
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                      {ticket.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className={
                                    priorityColors[ticket.priority as string] || priorityColors.medium
                                  }
                                >
                                  {ticket.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={statusColors[ticket.status as string] || statusColors.open}
                                >
                                  {ticket.status?.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="glass border-white/5">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <TicketIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm mb-1">
                          {search
                            ? t.tickets?.noTicketsMatch || "No tickets match your search"
                            : t.tickets?.noTicketsYet || "No tickets yet"}
                        </p>
                        <p className="text-xs">
                          {t.tickets?.createFirstTicket ||
                            "Create your first support ticket to get started"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
