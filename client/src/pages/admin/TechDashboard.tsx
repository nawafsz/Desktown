import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Briefcase, CheckCircle, Clock, AlertCircle, Trash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function TechDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("offices");

    // Queries
    const { data: offices, isLoading: loadingOffices } = useQuery<any[]>({
        queryKey: ['/api/support/offices'],
    });

    const { data: tickets, isLoading: loadingTickets } = useQuery<any[]>({
        queryKey: ['/api/admin/tickets'], // Using admin route for now as we added it there
    });

    // Mutations
    const updateTicketMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await apiRequest("POST", `/api/admin/tickets/${id}/reply`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
            toast({ title: "تم تحديث حالة التذكرة" });
        }
    });

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'resolved': return 'bg-green-500 hover:bg-green-600';
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'open': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
            <h1 className="text-4xl font-bold mb-8 text-blue-900">لوحة الدعم الفني</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full justify-start gap-4 bg-transparent p-0">
                    <TabsTrigger value="offices" className="text-lg px-8 py-3 bg-white shadow-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all border">
                        <Briefcase className="ml-2 h-5 w-5" /> إدارة المكاتب
                    </TabsTrigger>
                    <TabsTrigger value="tickets" className="text-lg px-8 py-3 bg-white shadow-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all border">
                        <MessageSquare className="ml-2 h-5 w-5" /> تذاكر الدعم
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="offices" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingOffices ? <Loader2 className="animate-spin h-10 w-10 mx-auto" /> : offices?.map((office: any) => (
                            <Card key={office.id} className="hover:shadow-lg transition-all border-t-4 border-t-blue-500 cursor-pointer">
                                <CardHeader>
                                    <CardTitle>{office.name}</CardTitle>
                                    <CardDescription>{office.slug}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mb-4">
                                        <Badge variant={office.subscriptionPlan === 'vip' ? 'default' : 'secondary'}>
                                            {office.subscriptionPlan?.toUpperCase() || 'FREE'}
                                        </Badge>
                                        <Badge variant={office.isPublished ? 'outline' : 'destructive'} className={office.isPublished ? 'text-green-600 border-green-600' : ''}>
                                            {office.isPublished ? 'منشور' : 'مسودة'}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1">تعديل الأقسام</Button>
                                        <Button variant="destructive" size="icon"><Trash className="h-4 w-4" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="space-y-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">العنوان</TableHead>
                                    <TableHead className="text-right">المرسل</TableHead>
                                    <TableHead className="text-right">الأولوية</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">الإجراء</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingTickets ? <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="mx-auto animate-spin" /></TableCell></TableRow> : tickets?.map((ticket: any) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium">{ticket.title}</TableCell>
                                        <TableCell>{ticket.reporter?.username || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={ticket.priority === 'high' ? 'text-red-500 border-red-500' : ''}>
                                                {ticket.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(ticket.status)}>
                                                {ticket.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => updateTicketMutation.mutate({ id: ticket.id, status: 'resolved' })}>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    رد
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}