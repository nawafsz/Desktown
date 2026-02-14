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
  UserCircle,
  Bell,
  Home,
  Play,
  X,
  Users,
  Video,
  Clock,
  Upload,
  ChevronLeft,
  ChevronRight,
  Globe,
  Briefcase as JobIcon, // For Jobs
  UserCheck as BrokerIcon, // For Brokers/Brokies
} from "lucide-react";
import logoUrl from "/assets/logo.png";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement, Office, Story } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AISecurityReceptionist from "@/components/AISecurityReceptionist";

const partners = [
  { id: 1, name: "Somira", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: 2, name: "Legal Hub", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: 3, name: "Finance Pro", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { id: 4, name: "Osamo Pro", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  { id: 5, name: "Slamo Pro", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { id: 6, name: "Teems", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop" },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const [viewedAds, setViewedAds] = useState<Set<number>>(new Set());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();
  const [loggedInProfile, setLoggedInProfile] = useState<'office' | 'visitor' | 'employee' | null>(null);

  useEffect(() => {
    const loggedInAs = localStorage.getItem('loggedInAs');
    if (loggedInAs === 'office') setLoggedInProfile('office');
    else if (loggedInAs === 'visitor') setLoggedInProfile('visitor');
    else if (loggedInAs === 'employee') setLoggedInProfile('employee');
    else setLoggedInProfile(null);
  }, [showProfileModal]);

  // Handle redirect after social login
  useEffect(() => {
    const pendingProfileType = localStorage.getItem('pendingProfileType');
    if (pendingProfileType) {
      localStorage.removeItem('pendingProfileType');
      localStorage.setItem('loggedInAs', pendingProfileType);
      if (pendingProfileType === 'office') setLocation('/profile/office');
      else if (pendingProfileType === 'visitor') setLocation('/profile/visitor');
      else if (pendingProfileType === 'employee') setLocation('/profile/employee');
    }
  }, [setLocation]);

  const { data: activeAds = [] } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements/active'],
  });

  const { data: activeStories = [] } = useQuery<(Story & { author?: { firstName?: string; lastName?: string; profileImageUrl?: string } })[]>({
    queryKey: ['/api/public/stories'],
  });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Story types with author info
  type StoryWithAuthor = Story & { author?: { firstName?: string | null; lastName?: string | null; profileImageUrl?: string | null } };

  const [selectedStory, setSelectedStory] = useState<StoryWithAuthor | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserStories, setCurrentUserStories] = useState<StoryWithAuthor[]>([]);

  // Group stories by author
  const groupedStories = activeStories.reduce((acc, story) => {
    const authorId = story.authorId;
    if (!acc[authorId]) {
      acc[authorId] = {
        author: story.author,
        authorId,
        stories: []
      };
    }
    acc[authorId].stories.push(story);
    return acc;
  }, {} as Record<string, { author?: { firstName?: string; lastName?: string; profileImageUrl?: string }; authorId: string; stories: typeof activeStories }>);

  const userGroups = Object.values(groupedStories);

  const openUserStories = (authorId: string) => {
    const userStories = groupedStories[authorId]?.stories || [];
    if (userStories.length > 0) {
      setCurrentUserStories(userStories);
      setCurrentStoryIndex(0);
      setSelectedStory(userStories[0]);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < currentUserStories.length - 1) {
      const newIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(newIndex);
      setSelectedStory(currentUserStories[newIndex]);
    } else {
      setSelectedStory(null);
      setCurrentUserStories([]);
      setCurrentStoryIndex(0);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const newIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(newIndex);
      setSelectedStory(currentUserStories[newIndex]);
    }
  };

  const closeStoryViewer = () => {
    setSelectedStory(null);
    setCurrentUserStories([]);
    setCurrentStoryIndex(0);
  };

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

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 pb-28 pt-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/30">
              D
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">DeskTown</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full h-10 w-10">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-xl border-white/20 shadow-xl">
                <DropdownMenuItem onClick={() => handleLanguageChange('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>العربية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full h-10 w-10">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Cases / Stories Section */}
        <div className="glass rounded-3xl p-4 md:p-6 shadow-sm border border-white/60">
          <h2 className="text-slate-500 text-sm font-medium mb-4 px-2">{language === 'ar' ? 'الحالات' : 'Cases'}</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 px-2 pb-2">
              {/* Active Stories */}
              {userGroups.length > 0 ? (
                userGroups.map((group) => (
                  <div
                    key={group.authorId}
                    className="flex flex-col items-center gap-2 min-w-[64px] cursor-pointer group"
                    onClick={() => openUserStories(group.authorId)}
                  >
                    <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                      <Avatar className="h-14 w-14 border-2 border-white">
                        <AvatarImage src={group.author?.profileImageUrl || ''} className="object-cover" />
                        <AvatarFallback>{group.author?.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[70px]">
                      {group.author?.firstName}
                    </span>
                  </div>
                ))
              ) : (
                partners.map((partner) => (
                  <div key={partner.id} className="flex flex-col items-center gap-2 min-w-[64px] group cursor-pointer">
                    <div className="relative p-[2px] rounded-full bg-slate-100 group-hover:bg-cyan-100 transition-colors">
                      <Avatar className="h-14 w-14 border-2 border-white">
                        <AvatarImage src={partner.avatar} />
                        <AvatarFallback>{partner.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[70px]">
                      {partner.name}
                    </span>
                  </div>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl group min-h-[300px] md:min-h-[400px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent backdrop-blur-[1px]" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 drop-shadow-lg leading-tight">
              {language === 'ar' ? 'مكتبك السحابي،' : 'Your Workspace,'}
              <br />
              <span className="italic">{language === 'ar' ? 'بمفهوم جديد' : 'Redefined'}</span>
            </h1>
          </div>

          {/* AI Receptionist Overlay - Subtle Position */}
          <div className="absolute bottom-4 right-4 z-20 md:bottom-8 md:right-8">
             <div className="scale-75 origin-bottom-right">
                <AISecurityReceptionist defaultLanguage={language === 'ar' ? 'ar-SA' : 'en-US'} />
             </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Featured Ad - Peach Glow */}
          <Card className="glass border-white/50 rounded-3xl overflow-hidden relative group hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl group-hover:bg-orange-400/30 transition-all" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {activeAds[0]?.title || (language === 'ar' ? 'إعلان مميز هنا' : 'Featured Ad Here')}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {activeAds[0]?.description || (language === 'ar' ? 'تعرف علينا للحصول على المزيد من العملاء' : 'Learn about us to get more customers')}
                  </p>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 text-xs h-8 px-4"
                    onClick={() => activeAds[0] && handleAdClick(activeAds[0])}
                  >
                    {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest News - Blue Glow */}
          <Card className="glass border-white/50 rounded-3xl overflow-hidden relative group hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{language === 'ar' ? 'المنصة تقوم بأتمتة الإجراءات' : 'Platform automates procedures'}</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{language === 'ar' ? 'تم إضافة قاعات التدريب والبث المباشر' : 'Training rooms and live streaming added'}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Glass Bottom Navigation */}
      <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl z-50">
        <nav className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl shadow-slate-200/50 backdrop-blur-2xl border border-white/60">
          <Link href="/" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </Link>

          <Link href="/storefront" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">{language === 'ar' ? 'المكاتب' : 'Offices'}</span>
          </Link>

          <div className="flex flex-col items-center gap-1 group relative cursor-pointer">
            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border border-white" />
            <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <BrokerIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">{language === 'ar' ? 'الوسطاء' : 'Brokies'}</span>
          </div>

          <button onClick={() => setShowProfileModal(true)} className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <UserCircle className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">{language === 'ar' ? 'حسابي' : 'Profile'}</span>
          </button>

          <Link href="/jobs" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <JobIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">{language === 'ar' ? 'الوظائف' : 'Jobs'}</span>
          </Link>

          <Link href="/videos" className="flex flex-col items-center gap-1 group">
            <div className="p-2 rounded-xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <Play className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600">{language === 'ar' ? 'المقاطع' : 'Reels'}</span>
          </Link>
        </nav>
      </div>

      {/* Profile Selection Modal (Glassmorphism) */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/20 backdrop-blur-sm"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 rounded-t-3xl p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {language === 'ar' ? 'اختر نوع الحساب' : 'Choose Account Type'}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(loggedInProfile === null || loggedInProfile === 'office') && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    if (loggedInProfile === 'office') setLocation('/profile/office');
                    else {
                      localStorage.setItem('pendingProfileType', 'office');
                      setLocation('/login?role=office_renter&type=office');
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="p-3 rounded-full bg-amber-500 text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="text-slate-800 font-bold text-lg">
                      {language === 'ar' ? (loggedInProfile === 'office' ? 'بروفايل المكتب' : 'دخول المكتب') : (loggedInProfile === 'office' ? 'Office Profile' : 'Office Login')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                    </p>
                  </div>
                </button>
              )}

              {(loggedInProfile === null || loggedInProfile === 'visitor') && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    if (loggedInProfile === 'visitor') setLocation('/profile/visitor');
                    else {
                      localStorage.setItem('pendingProfileType', 'visitor');
                      setLocation('/login?role=visitor&type=visitor');
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="p-3 rounded-full bg-blue-500 text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="text-slate-800 font-bold text-lg">
                      {language === 'ar' ? (loggedInProfile === 'visitor' ? 'بروفايل الزائر' : 'دخول الزائر') : (loggedInProfile === 'visitor' ? 'Visitor Profile' : 'Visitor Login')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                    </p>
                  </div>
                </button>
              )}

              {(loggedInProfile === null || loggedInProfile === 'employee') && (
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    if (loggedInProfile === 'employee') setLocation('/profile/employee');
                    else {
                      localStorage.setItem('pendingProfileType', 'employee');
                      setLocation('/login?role=member&type=employee');
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="p-3 rounded-full bg-emerald-500 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="text-slate-800 font-bold text-lg">
                      {language === 'ar' ? (loggedInProfile === 'employee' ? 'بروفايل الموظف' : 'دخول الموظف') : (loggedInProfile === 'employee' ? 'Employee Profile' : 'Employee Login')}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {language === 'ar' ? 'عبر Google أو Apple أو الإيميل' : 'Via Google, Apple or Email'}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer (Kept largely the same but with lighter backdrop if needed, usually dark is better for media) */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black z-[70] flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white z-20 hover:bg-white/10 rounded-full p-2"
            onClick={closeStoryViewer}
          >
            <X className="h-8 w-8" />
          </button>
          
          {currentStoryIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-20 hover:bg-white/10 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); prevStory(); }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-20 hover:bg-white/10 rounded-full p-2"
            onClick={(e) => { e.stopPropagation(); nextStory(); }}
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          <div className="w-full h-full max-w-lg mx-auto relative" onClick={nextStory}>
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {currentUserStories.map((_, idx) => (
                <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${idx < currentStoryIndex ? 'w-full' :
                      idx === currentStoryIndex ? 'w-full animate-[progress_5s_linear_forwards]' :
                        'w-0'
                      }`}
                  />
                </div>
              ))}
            </div>

            <div className="absolute top-10 left-4 right-16 flex items-center gap-3 z-10">
              <Avatar className="h-10 w-10 ring-2 ring-white/50">
                <AvatarImage src={selectedStory.author?.profileImageUrl || ''} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm">
                  {selectedStory.author?.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-white font-medium text-sm">
                  {selectedStory.author?.firstName} {selectedStory.author?.lastName}
                </span>
                <span className="text-white/60 text-xs">
                  {currentStoryIndex + 1} / {currentUserStories.length}
                </span>
              </div>
            </div>

            {selectedStory.mediaType === 'video' ? (
              <video
                key={selectedStory.id}
                src={selectedStory.mediaUrl}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
                controls
                onEnded={nextStory}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                key={selectedStory.id}
                src={selectedStory.mediaUrl}
                alt={selectedStory.caption || 'Story'}
                className="w-full h-full object-contain"
              />
            )}

            {selectedStory.caption && (
              <div className="absolute bottom-8 left-4 right-4 text-center">
                <p className="text-white text-lg font-medium bg-black/50 rounded-lg px-4 py-2">
                  {selectedStory.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
