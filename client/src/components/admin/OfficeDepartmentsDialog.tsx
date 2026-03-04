
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash, GripVertical } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OfficeDepartmentsDialogProps {
  officeId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

type OfficeDepartmentItem = {
  id: number;
  name: string;
  nameAr: string | null;
};

export function OfficeDepartmentsDialog({ officeId, isOpen, onClose }: OfficeDepartmentsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptNameAr, setNewDeptNameAr] = useState("");

  const { data: departments, isLoading } = useQuery<OfficeDepartmentItem[]>({
    queryKey: [`/api/offices/${officeId}/departments`],
    enabled: !!officeId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!officeId) return;
      await apiRequest("POST", `/api/offices/${officeId}/departments`, {
        name: newDeptName,
        nameAr: newDeptNameAr,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/offices/${officeId}/departments`] });
      setNewDeptName("");
      setNewDeptNameAr("");
      toast({ title: "تم إضافة القسم بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل إضافة القسم", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/company/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/offices/${officeId}/departments`] });
      toast({ title: "تم حذف القسم" });
    },
    onError: () => {
      toast({ title: "فشل حذف القسم", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptNameAr) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة الأقسام والهيكل التنظيمي</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>اسم القسم (English)</Label>
              <Input 
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g. HR"
                required
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>اسم القسم (عربي)</Label>
              <Input 
                value={newDeptNameAr}
                onChange={(e) => setNewDeptNameAr(e.target.value)}
                placeholder="مثال: الموارد البشرية"
                required
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>

          <div className="border rounded-lg divide-y">
            {isLoading ? (
              <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : (departments ?? []).length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">لا توجد أقسام مضافة</div>
            ) : (
              (departments ?? []).map((dept) => (
                <div key={dept.id} className="p-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <div>
                      <p className="font-medium">{dept.nameAr}</p>
                      <p className="text-xs text-muted-foreground">{dept.name}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
                        deleteMutation.mutate(dept.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
