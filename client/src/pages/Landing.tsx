import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Briefcase,
  Gift,
  User,
  UserCircle,
  Bell,
  Monitor,
  Globe,
  X,
  Users,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import logoUrl from "/assets/logo.png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement, Office } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { PromotionalAd } from "@/components/PromotionalAd";
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
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedAds, setViewedAds] = useState<Set<number>>(new Set());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();

  // Check which profile is logged in
  const [loggedInProfile, setLoggedInProfile] = useState<'office' | 'visitor' | 'employee' | null>(null);

  useEffect(() => {
    const loggedInAs = localStorage.getItem('loggedInAs');

    if (loggedInAs === 'office') {
      setLoggedInProfile('office');
    } else if (loggedInAs === 'visitor') {
      setLoggedInProfile('visitor');
    } else if (loggedInAs === 'employee') {
      setLoggedInProfile('employee');
    } else {
      setLoggedInProfile(null);
    }
  }, [showProfileModal]);

  // Handle redirect after social login
  useEffect(() => {
    const pendingProfileType = localStorage.getItem('pendingProfileType');
    if (pendingProfileType) {
      // Clear the pending type
      localStorage.removeItem('pendingProfileType');
      // Set as logged in
      localStorage.setItem('loggedInAs', pendingProfileType);
      // Redirect to the appropriate profile page
      if (pendingProfileType === 'office') {
        setLocation('/profile/office');
      } else if (pendingProfileType === 'visitor') {
        setLocation('/profile/visitor');
      } else if (pendingProfileType === 'employee') {
        setLocation('/profile/employee');
      }
    }
  }, [setLocation]);

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
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">DeskTown</span>
            <img src={logoUrl} alt="DeskTown" className="h-10 w-10 object-contain" />
          </div>
        </header>

        {/* Promotional Ad */}
        <PromotionalAd />

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-[#111625]">
          <div
            className="h-72 md:h-96 lg:h-[32rem] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 ease-in-out"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19]/90 via-[#0B0F19]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 items-start text-left z-10 pointer-events-none">
            <div className="max-w-2xl pointer-events-auto space-y-6">
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 backdrop-blur-md px-4 py-1.5 text-sm uppercase tracking-wider">
                {language === 'ar' ? 'مستقبل العمل هنا' : 'The Future of Work is Here'}
              </Badge>

              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                  {language === 'ar' ? 'افتح مكتبك' : 'Open Your'}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 filter drop-shadow-sm">
                    {language === 'ar' ? 'السحابي' : 'Cloud Office'}
                  </span>
                </h2>
                <p className="text-gray-300 text-lg md:text-xl font-light max-w-lg leading-relaxed">
                  {language === 'ar'
                    ? 'بدون تكاليف تأسيس، بدون حدود جغرافية. ابدأ رحلتك الريادية اليوم في دقيقة واحدة.'
                    : 'No rent. No limits. Start your entrepreneurial journey today in just one minute.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  className="bg-white text-black hover:bg-gray-100 rounded-full font-bold px-8 py-6 text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  onClick={() => setLocation("/storefront")}
                >
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-full font-medium px-8 py-6 text-lg backdrop-blur-sm transition-all hover:scale-105"
                  onClick={() => {
                    const element = document.getElementById('featured-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {language === 'ar' ? 'اكتشف المزيد' : 'Learn More'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Ad + News Grid */}
        <div id="featured-section" className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Featured Ad Card - Expanded */}
          {activeAds.length > 0 ? (
            activeAds.slice(0, 1).map((ad) => (
              <Card
                key={ad.id}
                className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl cursor-pointer"
                onClick={() => handleAdClick(ad)}
                data-testid={`card-ad-${ad.id}`}
              >
                <CardContent className="p-0 relative h-full min-h-[280px] flex flex-col justify-end overflow-hidden group-hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] transition-all duration-500">
                  {/* Background Image/Gradient */}
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-[#1a1f2e]/80 to-transparent" />

                  <div className="relative z-10 p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20">
                        {language === 'ar' ? 'مميز' : 'Featured'}
                      </Badge>
                      <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Gift className="h-5 w-5 text-amber-400" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{ad.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2 text-shadow-sm">{ad.description}</p>

                      <Button
                        className="w-full bg-white text-black hover:bg-amber-50 rounded-xl font-bold h-12 shadow-lg transition-all transform active:scale-95 flex items-center justify-between px-4 group/btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (ad.linkUrl) {
                            window.open(ad.linkUrl, '_blank');
                          }
                        }}
                        data-testid={`button-ad-link-${ad.id}`}
                      >
                        <span>{language === 'ar' ? 'اكتشف العرض' : 'View Offer'}</span>
                        <ChevronRight className={`h-5 w-5 text-amber-600 transition-transform group-hover/btn:translate-x-1 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl" data-testid="card-featured-ad">
              <CardContent className="p-6">
                <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold text-white mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'إعلان مميز هنّا' : 'Featured Ad Here'}
                    </h3>
                    <p className={`text-gray-400 text-sm leading-relaxed font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'اعرف عنّا للحصول على مزيد العملاء' : 'Learn about us to get more customers'}
                    </p>
                  </div>
                  <Gift className="h-12 w-12 text-amber-500 flex-shrink-0" />
                </div>
                <Button
                  className="w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 text-white rounded-full text-sm py-3 h-auto font-bold shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50 border-t border-amber-300/30"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* News Card */}
          <Card className="bg-[#1a1f2e] border border-amber-500/40 rounded-2xl cursor-pointer hover:bg-[#21283b] transition-all" onClick={() => setLocation("/news")} data-testid="card-news">
            <CardContent className="p-6">
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
                <Card className="bg-[#1a1f2e] border border-white/5 overflow-hidden group hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1" data-testid={`card-office-${office.id}`}>
                  <div className="h-24 bg-gradient-to-br from-gray-800 to-[#111625] relative p-4 flex flex-col justify-between group-hover:from-gray-800 group-hover:to-gray-900 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Building2 className="h-16 w-16 text-white" />
                    </div>

                    <Badge variant="secondary" className="w-fit bg-white/10 text-white backdrop-blur-sm border-none">
                      {office.tenant}
                    </Badge>
                  </div>

                  <CardContent className="p-5 relative">
                    <div className="absolute -top-6 right-4 h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/20 ring-4 ring-[#1a1f2e] group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>

                    <div className="mt-2 space-y-2">
                      <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">{office.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{office.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-2 space-x-reverse">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-6 w-6 rounded-full bg-gray-700 border-2 border-[#1a1f2e]" />
                        ))}
                      </div>
                      <span className="text-xs text-amber-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        {language === 'ar' ? 'عرض المكتب' : 'View Office'}
                        <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                      </span>
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
              href="/storefront"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-ads"
            >
              <Megaphone className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'إعلانات الشركات' : 'Company Ads'}</span>
            </Link>
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-profile"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'حسابي' : 'Profile'}</span>
            </button>
            <Link
              href="/careers"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
              data-testid="nav-bottom-careers"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الوظائف' : 'Jobs'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Selection Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#1a1f2e] rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {language === 'ar' ? 'اختر نوع الحساب' : 'Choose Account Type'}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="button-close-profile-modal"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* Office Login - Show only if no one logged in OR office is logged in */}
              {(loggedInProfile === null || loggedInProfile === 'office') && (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      if (loggedInProfile === 'office') {
                        // Already logged in, go to profile
                        setLocation('/profile/office');
                      } else {
                        // Store pending profile type and redirect to login page
                        localStorage.setItem('pendingProfileType', 'office');
                        setLocation('/login?role=office_renter&type=office');
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl hover:border-amber-400 transition-all"
                    data-testid="button-office-login"
                  >
                    <div className="p-3 rounded-full bg-amber-500">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {language === 'ar' ? (loggedInProfile === 'office' ? 'بروفايل المكتب' : 'دخول المكتب') : (loggedInProfile === 'office' ? 'Office Profile' : 'Office Login')}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                      </p>
                    </div>
                  </button>

                  {/* Google Login for Office */}
                  {loggedInProfile === null && (
                    <Button
                      onClick={() => {
                        localStorage.setItem('pendingProfileType', 'office');
                        window.location.href = '/api/auth/google';
                      }}
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl py-2 h-auto gap-2"
                      data-testid="button-google-office-login"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>{language === 'ar' ? 'الدخول عبر جوجل' : 'Login with Google'}</span>
                    </Button>
                  )}
                </>
              )}

              {/* Visitor Login - Show only if no one logged in OR visitor is logged in */}
              {(loggedInProfile === null || loggedInProfile === 'visitor') && (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      if (loggedInProfile === 'visitor') {
                        // Already logged in, go to profile
                        setLocation('/profile/visitor');
                      } else {
                        // Store pending profile type and redirect to login page
                        localStorage.setItem('pendingProfileType', 'visitor');
                        setLocation('/login?role=visitor&type=visitor');
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl hover:border-blue-400 transition-all"
                    data-testid="button-visitor-login"
                  >
                    <div className="p-3 rounded-full bg-blue-500">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {language === 'ar' ? (loggedInProfile === 'visitor' ? 'بروفايل الزائر' : 'دخول الزائر') : (loggedInProfile === 'visitor' ? 'Visitor Profile' : 'Visitor Login')}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                      </p>
                    </div>
                  </button>

                  {/* Google Login for Visitor */}
                  {loggedInProfile === null && (
                    <Button
                      onClick={() => {
                        localStorage.setItem('pendingProfileType', 'visitor');
                        window.location.href = '/api/auth/google';
                      }}
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl py-2 h-auto gap-2"
                      data-testid="button-google-visitor-login"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>{language === 'ar' ? 'الدخول عبر جوجل' : 'Login with Google'}</span>
                    </Button>
                  )}
                </>
              )}

              {/* Employee Login - Show only if no one logged in OR employee is logged in */}
              {(loggedInProfile === null || loggedInProfile === 'employee') && (
                <>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      if (loggedInProfile === 'employee') {
                        // Already logged in, go to profile
                        setLocation('/profile/employee');
                      } else {
                        // Store pending profile type and redirect to login page
                        localStorage.setItem('pendingProfileType', 'employee');
                        setLocation('/login?role=member&type=employee');
                      }
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl hover:border-emerald-400 transition-all"
                    data-testid="button-employee-login"
                  >
                    <div className="p-3 rounded-full bg-emerald-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {language === 'ar' ? (loggedInProfile === 'employee' ? 'بروفايل الموظف' : 'دخول الموظف') : (loggedInProfile === 'employee' ? 'Employee Profile' : 'Employee Login')}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                      </p>
                    </div>
                  </button>

                  {/* Google Login for Employee */}
                  {loggedInProfile === null && (
                    <Button
                      onClick={() => {
                        localStorage.setItem('pendingProfileType', 'employee');
                        window.location.href = '/api/auth/google';
                      }}
                      variant="outline"
                      className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl py-2 h-auto gap-2"
                      data-testid="button-google-employee-login"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>{language === 'ar' ? 'الدخول عبر جوجل' : 'Login with Google'}</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
