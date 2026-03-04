import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";

export function PromotionalAd() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();

  const normalizeWhatsappNumber = (rawPhone: string) => {
    const digitsOnly = rawPhone.replace(/[^\d]/g, "");
    if (!digitsOnly) return null;
    if (digitsOnly.startsWith("966")) return digitsOnly;
    if (digitsOnly.startsWith("0") && digitsOnly.length === 10) {
      return `966${digitsOnly.slice(1)}`;
    }
    return digitsOnly;
  };

  const handleSubscribeClick = async () => {
    const whatsappWindow = window.open("about:blank", "_blank", "noopener,noreferrer");

    try {
      const res = await fetch("/api/public/offices");
      const offices = (await res.json()) as Array<{
        slug: string;
        name?: string | null;
        contactPhone?: string | null;
      }>;

      const office =
        offices.find((o) => (o.slug || "").toLowerCase() === "desktown") ||
        offices.find((o) => (o.name || "").toLowerCase().includes("desktown")) ||
        offices[0];

      if (!office?.slug) {
        whatsappWindow?.close();
        setLocation("/storefront");
        return;
      }

      const phone = office.contactPhone ? normalizeWhatsappNumber(office.contactPhone) : null;
      if (phone) {
        const text =
          language === "ar"
            ? "السلام عليكم، أريد الاشتراك والتواصل مع موظف الاستقبال."
            : "Hello, I want to subscribe and chat with the receptionist.";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        whatsappWindow?.location.assign(url);
      } else {
        whatsappWindow?.close();
      }

      setLocation(`/office/${office.slug}?chat=1`);
    } catch {
      whatsappWindow?.close();
      setLocation("/storefront");
    }
  };

  return (
    <Card className="w-full overflow-hidden border-none bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 shadow-2xl my-6 relative group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
      
      <CardContent className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl text-center md:text-left rtl:md:text-right">
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
            {language === 'ar' ? 'اشترك معنا الآن' : 'Subscribe With Us Now'}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 text-2xl md:text-4xl mt-2">
              {language === 'ar' ? 'وانطلق بمشروعك نحو القمة' : 'And Take Your Project to the Top'}
            </span>
          </h2>
          <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto md:mx-0">
            {language === 'ar' 
              ? 'احصل على مكتبك الافتراضي المتكامل مع دعم فني متواصل وميزات حصرية لإدارة أعمالك بكل احترافية.' 
              : 'Get your integrated virtual office with continuous technical support and exclusive features to manage your business professionally.'}
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button 
            onClick={handleSubscribeClick}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg px-8 py-8 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] transition-all transform hover:scale-105 flex items-center gap-3 border border-amber-400/30"
          >
            <MessageCircle className="w-8 h-8" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-normal opacity-90">{language === 'ar' ? 'تحدث معنا' : 'Chat with us'}</span>
              <span>{language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
