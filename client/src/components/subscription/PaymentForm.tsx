import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { CreditCard, Users, Calendar, Lock, Shield } from "lucide-react";
import { SiVisa } from "react-icons/si";

interface PaymentFormProps {
  cardDetails: {
    number: string;
    name: string;
    cvv: string;
    expiry: string;
  };
  setCardDetails: (details: any) => void;
}

export function PaymentForm({ cardDetails, setCardDetails }: PaymentFormProps) {
  const { language } = useLanguage();

  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">
              {language === 'ar' ? "بيانات الدفع" : "Payment Details"}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? "أدخل بيانات البطاقة لإتمام عملية الاشتراك" : "Enter card details to complete subscription"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <SiVisa className="h-8 w-8 text-blue-600" />
            <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">Mada</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">{language === 'ar' ? "اسم حامل البطاقة" : "Cardholder Name"}</Label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input 
                id="cardName" 
                placeholder={language === 'ar' ? "الاسم كما يظهر على البطاقة" : "Name as shown on card"}
                className="pl-10 h-11"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">{language === 'ar' ? "رقم البطاقة" : "Card Number"}</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input 
                id="cardNumber" 
                placeholder="0000 0000 0000 0000"
                className="pl-10 h-11 font-mono"
                maxLength={19}
                value={cardDetails.number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                  setCardDetails({...cardDetails, number: val.slice(0, 19)})
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">{language === 'ar' ? "تاريخ الانتهاء" : "Expiry Date"}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="expiry" 
                  placeholder="MM/YY"
                  className="pl-10 h-11 font-mono"
                  maxLength={5}
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                    setCardDetails({...cardDetails, expiry: val})
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="cvv" 
                  placeholder="123"
                  className="pl-10 h-11 font-mono"
                  maxLength={3}
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-5 w-5 text-green-600 shrink-0" />
          <p>
            {language === 'ar' 
              ? "بياناتك مشفرة ومحمية. نحن لا نقوم بتخزين معلومات بطاقتك الكاملة." 
              : "Your data is encrypted and secure. We do not store your full card details."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
