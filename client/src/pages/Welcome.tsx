import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Building2, 
  Search,
  Gift,
  Newspaper,
  Briefcase,
  Home,
  CreditCard,
  Mail,
  Globe,
  Eye,
  User,
  DoorOpen,
  Bell,
  Monitor,
} from "lucide-react";
import logoUrl from "@assets/Photoroom_٢٠٢٥١٢٢٨_١٢٣٠١٥_1766915940136.png";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Office, OfficeService, User as UserType } from "@shared/schema";
import { useLanguage, type Language } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Welcome() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage, isRTL } = useLanguage();

  const { data: offices = [] } = useQuery<Office[]>({
    queryKey: ['/api/public/offices'],
  });

  const { data: allUsers = [] } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const quickActions = [
    { icon: Briefcase, label: language === 'ar' ? 'الوظائف' : 'Jobs', href: "/careers", color: "text-amber-500" },
    { icon: Eye, label: language === 'ar' ? 'دخول الزائر' : 'Visitor', href: "/visitor/offices", color: "text-amber-500" },
    { icon: User, label: language === 'ar' ? 'دخول المؤقت' : 'Temp Login', href: "/employee-portal", color: "text-amber-500" },
    { icon: DoorOpen, label: language === 'ar' ? 'دخول المكتب' : 'Office Login', href: "/auth", color: "text-amber-500" },
  ];

  const featuredOffices = offices.slice(0, 2);
  const featuredUsers = allUsers.slice(0, 8);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const newsItems = [
    { icon: Bell, text: language === 'ar' ? 'تعمل المنصة على أتمتة الإجراءات' : 'Platform automates procedures' },
    { icon: Monitor, text: language === 'ar' ? 'تم إضافة قاعات التدريب والبث المباشر' : 'Training rooms and live streaming added' },
  ];

  const defaultUsers = [
    { name: 'Somira', initial: 'S' },
    { name: 'Legal Hub', initial: 'L' },
    { name: 'Finance Pro', initial: 'F' },
    { name: 'Finance Pro', initial: 'F' },
    { name: 'Osamo Pro', initial: 'O' },
    { name: 'Sliamo Pro', initial: 'S' },
    { name: 'قذفورك', initial: 'ق' },
    { name: 'لايزن', initial: 'ل' },
  ];

  return (
    <div className={`min-h-screen bg-[#0B0F19] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto p-4 space-y-5 pb-24">
        
        {/* Header */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="DeskTown" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-white">DeskTown</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9" data-testid="button-language-switcher">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-[#1a1f2e] border-white/10">
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange('en')}
                  className={`text-white hover:bg-white/10 ${language === 'en' ? 'bg-amber-500/20' : ''}`}
                  data-testid="menu-item-english"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange('ar')}
                  className={`text-white hover:bg-white/10 ${language === 'ar' ? 'bg-amber-500/20' : ''}`}
                  data-testid="menu-item-arabic"
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Section Title */}
        <div className={`flex items-center ${isRTL ? 'justify-end' : 'justify-start'}`}>
          <h2 className="text-lg font-bold text-white">{language === 'ar' ? 'الحالات' : 'Cases'}</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500`} />
          <Input
            placeholder={language === 'ar' ? 'ابحث عن المكاتب الافتراضية...' : 'Search for virtual offices...'}
            className={`${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} h-11 bg-[#1a1f2e] border-0 text-white placeholder:text-gray-500 rounded-xl text-sm`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-welcome-search"
          />
        </div>

        {/* User Avatars Scroll */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {(featuredUsers.length > 0 ? featuredUsers : defaultUsers.map((u, i) => ({ id: i, firstName: u.name, profileImageUrl: null, email: u.name }))).map((u: any, index) => (
              <div key={u.id || index} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <Avatar className="h-12 w-12 ring-2 ring-amber-500/60">
                  <AvatarImage src={u.profileImageUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-medium">
                    {(u.firstName?.[0] || u.email?.[0] || defaultUsers[index]?.initial || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-gray-400 truncate max-w-[60px] text-center">
                  {u.firstName || defaultUsers[index]?.name || 'User'}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <div 
            className="h-40 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(11,15,25,0.2), rgba(11,15,25,0.85)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80')`
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {language === 'ar' ? 'افتح مكتبك السحابي الآن' : 'Open Your Cloud Office Now'}
            </h2>
            <p className="text-amber-500 text-base font-semibold">
              {language === 'ar' ? '- بدون إيجار تقليدي' : '- No Traditional Rent'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-[#1a1f2e] border-amber-500/30 text-white hover:bg-amber-500/20 hover:border-amber-500/60 rounded-full px-3 py-1.5 h-auto gap-1.5 text-xs"
                data-testid={`button-quick-action-${index}`}
              >
                <action.icon className={`h-3.5 w-3.5 ${action.color}`} />
                <span>{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Featured Ad + News Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Featured Ad Card */}
          <Card className="bg-[#1a1f2e] border-amber-500/20" data-testid="card-featured-ad">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">
                    {language === 'ar' ? 'إعلان مميز هنّا' : 'Featured Ad Here'}
                  </h3>
                  <p className="text-gray-400 text-[10px] leading-tight mb-2">
                    {language === 'ar' ? 'اعرف عنّا للحصول على مزيد العملاء' : 'Learn about us to get more customers'}
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-[10px] px-3 py-1 h-auto font-semibold"
                  >
                    {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* News Card */}
          <Card className="bg-[#1a1f2e] border-white/10" data-testid="card-news">
            <CardContent className="p-4">
              <h3 className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{language === 'ar' ? 'مقتطفات آخر الأخبار' : 'Latest News'}</span>
              </h3>
              <div className="space-y-2">
                {newsItems.map((item, index) => (
                  <div key={index} className={`flex items-start gap-2 text-[10px] text-gray-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                    <item.icon className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Virtual Offices Section */}
        <div>
          <h2 className={`text-base font-bold mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'وصول عالمي: مكتبك الافتراضي' : 'Global Reach: Your Virtual Office'}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {(featuredOffices.length > 0 ? featuredOffices : [
              { id: 1, name: 'Virtual Office', description: 'Ooon dell usd lifrendi', tenant: 'Sep Haytt' },
              { id: 2, name: 'Virtual Office', description: 'Ooon dell usd lifrendi', tenant: 'Sepsi Ink' },
            ]).map((office: any, index) => (
              <Card key={office.id || index} className="bg-white text-gray-900 overflow-hidden" data-testid={`card-office-${office.id || index}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-xs">{office.name || 'Virtual Office'}</h3>
                      <p className="text-[9px] text-gray-500 truncate">{office.description || 'Ooon dell usd lifrendi'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-[8px]">
                        {(office.tenant || office.name || 'VO').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] font-medium text-gray-900">{office.tenant || 'Sep Haytt'}</p>
                      <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-700 border-amber-200 px-1.5 py-0 h-4">
                        {language === 'ar' ? 'مستأجر' : 'Renter'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-xl border-t border-white/5"
        aria-label={language === 'ar' ? 'التنقل السريع' : 'Quick Navigation'}
        data-testid="nav-bottom-bar"
      >
        <div className="max-w-lg mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            <Link 
              href="/welcome"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-home"
            >
              <Home className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </Link>
            <Link 
              href="/visitor/offices"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-offices"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'المكاتب' : 'Offices'}</span>
            </Link>
            <Link 
              href="/visitor/services"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-services"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الخدمات' : 'Services'}</span>
            </Link>
            <Link 
              href="/careers"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-careers"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الوظائف' : 'Jobs'}</span>
            </Link>
            <Link 
              href="/visitor/contact"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-contact"
            >
              <Mail className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'تواصل' : 'Contact'}</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
