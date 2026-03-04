import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, FileText, Send } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  amount: string;
  currency: string;
  description: string;
  date: string;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: InvoiceData) => void;
}

export function InvoiceModal({ isOpen, onClose, onSend }: InvoiceModalProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    clientName: "",
    amount: "",
    currency: "SAR",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (!data.clientName || !data.amount) return;
    onSend(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{language === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientName" className="text-right">
              {language === 'ar' ? 'العميل' : 'Client'}
            </Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => setData({ ...data, clientName: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {language === 'ar' ? 'المبلغ' : 'Amount'}
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="amount"
                type="number"
                value={data.amount}
                onChange={(e) => setData({ ...data, amount: e.target.value })}
                className="flex-1"
              />
              <Input
                value={data.currency}
                onChange={(e) => setData({ ...data, currency: e.target.value })}
                className="w-20"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>
            {language === 'ar' ? 'إرسال الفاتورة' : 'Send Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface InvoiceMessageProps {
  data: InvoiceData;
}

export function InvoiceMessage({ data }: InvoiceMessageProps) {
  const { language } = useLanguage();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
          <head>
            <title>Invoice ${data.invoiceNumber}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              .header { text-align: center; margin-bottom: 40px; }
              .details { margin-bottom: 20px; }
              .amount { font-size: 24px; font-weight: bold; color: #d97706; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: ${language === 'ar' ? 'right' : 'left'}; }
              th { background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${language === 'ar' ? 'فاتورة ضريبية' : 'Tax Invoice'}</h1>
              <p>#${data.invoiceNumber}</p>
            </div>
            <div class="details">
              <p><strong>${language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> ${data.date}</p>
              <p><strong>${language === 'ar' ? 'العميل:' : 'Client:'}</strong> ${data.clientName}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>${language === 'ar' ? 'الوصف' : 'Description'}</th>
                  <th>${language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${data.description || (language === 'ar' ? 'خدمات عامة' : 'General Services')}</td>
                  <td>${data.amount} ${data.currency}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin-top: 40px; text-align: ${language === 'ar' ? 'left' : 'right'};">
              <p class="amount">${language === 'ar' ? 'الإجمالي:' : 'Total:'} ${data.amount} ${data.currency}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="w-72 bg-white/5 border-amber-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-500">
          <FileText className="h-4 w-4" />
          {language === 'ar' ? 'فاتورة' : 'Invoice'} #{data.invoiceNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold mb-1">{data.amount} <span className="text-sm font-normal text-muted-foreground">{data.currency}</span></div>
        <p className="text-sm text-muted-foreground">{data.clientName}</p>
        {data.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{data.description}</p>}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full gap-2 hover:bg-amber-500/10 hover:text-amber-500 border-amber-500/30" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          {language === 'ar' ? 'طباعة' : 'Print'}
        </Button>
      </CardFooter>
    </Card>
  );
}
