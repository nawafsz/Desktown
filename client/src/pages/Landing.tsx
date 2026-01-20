import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Search,
  Briefcase,
  Gift,
  User,
  DoorOpen,
  Bell,
  Monitor,
  Globe,
  Home,
  CreditCard,
  Mail,
  Eye,
  ShieldCheck,
} from "lucide-react";
import logoUrl from "@assets/Photoroom_٢٠٢٥١٢٢٨_١٢٣٠١٥_1766915940136.png";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement, Office } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const partners = [
  { id: 1, name: "Somira", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: 2, name: "Legal Hub", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: 3, name: "Finance Pro", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { id: 4, name: "Finance Pro", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: 5, name: "Osamo Pro", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  { id: 6, name: "Sliamo Pro", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { id: 7, name: "قدوه.رائد", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop" },
  { id: 8, name: "لايزي", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedAds, setViewedAds] = useState<Set<number>>(new Set());
  const { language, setLanguage, isRTL } = useLanguage();

  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  const quickActions = [
    { icon: Briefcase, label: language === 'ar' ? 'الوظائف' : 'Jobs', href: "/careers" },
    { icon: Eye, label: language === 'ar' ? 'دخول الزائر' : 'Visitor', href: "/storefront" },
    { icon: User, label: language === 'ar' ? 'دخول المؤقت' : 'Temp', href: "/employee-portal" },
    { icon: DoorOpen, label: language === 'ar' ? 'دخول المكتب' : 'Office', action: 'login' },
  ];

  const newsItems = [
    { icon: Bell, text: language === 'ar' ? 'تعمل المنصة على أتمتة الإجراءات' : 'Platform automates procedures' },
    { icon: Monitor, text: language === 'ar' ? 'تم إضافة قاعات التدريب والبث المباشر' : 'Training rooms and live streaming added' },
  ];

  const { data: activeAds = [] } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements/active'],
  });

  const { data: realOffices = [] } = useQuery<Office[]>({
    queryKey: ['/api/public/offices'],
  });

  const trackAdView = async (adId: number) => {
    if (!viewedAds.has(adId)) {
      setViewedAds(prev => new Set(prev).add(adId));
      try {
        await apiRequest('POST', `/api/advertisements/${adId}/view`);
      } catch (error) {
        console.error('Failed to track ad view:', error);
      }
    }
  };

  const handleAdClick = async (ad: Advertisement) => {
    try {
      await apiRequest('POST', `/api/advertisements/${ad.id}/click`);
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    if (activeAds && activeAds.length > 0) {
      activeAds.forEach(ad => trackAdView(ad.id));
    }
  }, [activeAds]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  const displayOffices = realOffices.length > 0
    ? realOffices.slice(0, 2).map(office => ({
      id: office.id,
      name: office.name,
      slug: office.slug,
      description: office.description || 'Virtual Office',
      tenant: office.name,
    }))
    : [
      { id: 1, name: 'Virtual Office', slug: 'virtual-1', description: 'Ooon dell usd lifrendi', tenant: 'Sep Haytt' },
      { id: 2, name: 'Virtual Office', slug: 'virtual-2', description: 'Ooon dell usd lifrendi', tenant: 'Sepsi Ink' },
    ];

  return (
    <div className={`min-h-screen bg-[#0B0F19] text-white ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-5 pb-24">

        {/* Header */}
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9" data-testid="button-language-switcher">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#1a1f2e] border-white/10">
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
            {user?.role === 'admin' && (
              <Link href="/admin/platform">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 h-9 px-3 gap-2 hidden md:flex">
                  <ShieldCheck className="h-4 w-4" />
                  {language === 'ar' ? "إدارة المنصة" : "Admin Panel"}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">OneDesk</span>
            <img src={logoUrl} alt="OneDesk" className="h-8 w-8 object-contain" />
          </div>
        </header>

        {/* Search Bar with Title */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white whitespace-nowrap">{language === 'ar' ? 'الحالات' : 'Cases'}</h2>
          <div className="relative flex-1">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500`} />
            <Input
              placeholder={language === 'ar' ? 'ابحث عن المكاتب الافتراضية...' : 'Search for virtual offices...'}
              className={`${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} h-11 bg-[#1a1f2e] border-0 text-white placeholder:text-gray-500 rounded-xl text-sm`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* User Avatars Scroll */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {partners.map((partner) => (
              <div key={partner.id} className="flex flex-col items-center gap-1.5 min-w-[60px]">
                <Avatar className="h-12 w-12 ring-2 ring-amber-500/60">
                  <AvatarImage src={partner.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-medium">
                    {partner.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-gray-400 truncate max-w-[60px] text-center">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <div
            className="h-40 md:h-52 lg:h-64 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(11,15,25,0.2), rgba(11,15,25,0.85)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80')`
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-center px-4 md:px-8 items-start text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {language === 'ar' ? 'افتح مكتبك السحابي الآن' : 'Open Your Cloud Office Now'}
            </h2>
            <p className="text-amber-500 text-2xl md:text-3xl lg:text-4xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {language === 'ar' ? '- بدون إيجار تقليدي' : '- No Traditional Rent'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <Card className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                action.action === 'login' ? (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full bg-gradient-to-b from-[#252a3a] to-[#1a1f2e] border-amber-500/40 text-white hover:from-[#2a3045] hover:to-[#1f2535] hover:border-amber-500/60 rounded-xl py-2.5 h-auto gap-1 text-[10px] font-bold flex-col sm:flex-row shadow-lg shadow-black/30 ring-1 ring-white/5"
                    style={{ transform: 'translateY(0)', transition: 'all 0.15s ease' }}
                    onClick={handleLogin}
                    data-testid={`button-quick-action-${index}`}
                  >
                    <action.icon className="h-4 w-4 text-amber-500 drop-shadow-md" />
                    <span className="drop-shadow-sm">{action.label}</span>
                  </Button>
                ) : (
                  <Link key={index} href={action.href!} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-gradient-to-b from-[#252a3a] to-[#1a1f2e] border-amber-500/40 text-white hover:from-[#2a3045] hover:to-[#1f2535] hover:border-amber-500/60 rounded-xl py-2.5 h-auto gap-1 text-[10px] font-bold flex-col sm:flex-row shadow-lg shadow-black/30 ring-1 ring-white/5"
                      style={{ transform: 'translateY(0)', transition: 'all 0.15s ease' }}
                      data-testid={`button-quick-action-${index}`}
                    >
                      <action.icon className="h-4 w-4 text-amber-500 drop-shadow-md" />
                      <span className="drop-shadow-sm">{action.label}</span>
                    </Button>
                  </Link>
                )
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Ad + News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Featured Ad Card */}
          {activeAds.length > 0 ? (
            activeAds.slice(0, 1).map((ad) => (
              <Card
                key={ad.id}
                className="bg-[#1a1f2e] border-amber-500/20 cursor-pointer"
                onClick={() => handleAdClick(ad)}
                data-testid={`card-ad-${ad.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <span className="text-4xl" style={{ filter: 'drop-shadow(3px 3px 4px rgba(0,0,0,0.5))' }}>🎁</span>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">{ad.title}</h3>
                      <p className="text-gray-400 text-[10px] leading-tight mb-2 line-clamp-2">{ad.description}</p>
                      <Button
                        className="bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-white rounded-full text-[10px] px-4 py-1.5 h-auto font-bold shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50 border-t border-amber-300/30"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl" data-testid="card-featured-ad">
              <CardContent className="p-4">
                <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <h3 className={`text-sm font-bold text-white mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'إعلان مميز هنّا' : 'Featured Ad Here'}
                    </h3>
                    <p className={`text-gray-400 text-[11px] leading-relaxed font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'اعرف عنّا للحصول على مزيد العملاء' : 'Learn about us to get more customers'}
                    </p>
                  </div>
                  <span className="text-4xl flex-shrink-0" style={{ filter: 'drop-shadow(3px 3px 4px rgba(0,0,0,0.5))' }}>🎁</span>
                </div>
                <Button
                  className="w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-white rounded-full text-xs py-2.5 h-auto font-bold shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50 border-t border-amber-300/30"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* News Card */}
          <Card className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl" data-testid="card-news">
            <CardContent className="p-5">
              <h3 className={`text-sm font-bold mb-3 text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'مقتطفات آخر الأخبار' : 'Latest News'}
              </h3>
              <div className="space-y-3">
                {newsItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 text-[11px] text-gray-300 font-bold text-right flex-row-reverse" dir="rtl">
                    <item.icon className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item.text}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {displayOffices.map((office) => (
              <Link key={office.id} href={`/office/${office.slug}`}>
                <Card className="bg-white text-gray-900 overflow-hidden" data-testid={`card-office-${office.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs">{office.name}</h3>
                        <p className="text-[9px] text-gray-500 truncate">{office.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-[8px]">
                          {office.tenant.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] font-medium text-gray-900">{office.tenant}</p>
                        <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-700 border-amber-200 px-1.5 py-0 h-4">
                          {language === 'ar' ? 'مستأجر' : 'Renter'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-xl border-t border-white/5 safe-area-inset-bottom"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label={language === 'ar' ? 'التنقل السريع' : 'Quick Navigation'}
        data-testid="nav-bottom-bar"
      >
        <div className="max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            <Link
              href="/"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-home"
            >
              <Home className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </Link>
            <Link
              href="/storefront"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-offices"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'المكاتب' : 'Offices'}</span>
            </Link>
            <Link
              href="/storefront"
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
              href="/employee-portal"
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
