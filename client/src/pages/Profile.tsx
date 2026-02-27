
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Building2, Check, Plus, X, Home, Briefcase, Play, UserCircle, Edit, Star
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Subscription } from "@shared/schema";

interface Profile {
  id: number;
  ownerId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Profile() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { language, isRTL } = useLanguage();
  
  const [officeName, setOfficeName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ar");
  const [officeDescription, setOfficeDescription] = useState("");
  const [officeType, setOfficeType] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/subscriptions/active'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      return await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({ 
        title: language === 'ar' ? "تم الحفظ" : "Saved", 
        description: language === 'ar' ? "تم حفظ التحديثات بنجاح" : "Your changes have been saved." 
      });
    },
    onError: () => {
      toast({ 
        title: language === 'ar' ? "خطأ" : "Error", 
        description: language === 'ar' ? "فشل في حفظ التحديثات" : "Failed to save changes.", 
        variant: "destructive" 
      });
    },
  });

  const handleAvatarUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const objectPath = result.successful[0].meta?.objectPath;
      if (objectPath) {
        updateProfileMutation.mutate({ avatarUrl: objectPath });
      }
    }
  };

  const getUploadParams = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    const uploadData = data.uploadURL;
    return { 
      method: "PUT" as const, 
      url: uploadData.uploadURL,
      meta: { objectPath: uploadData.objectPath }
    };
  };

  const currentUserName = currentUser 
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email || ''
    : '';

  const displayName = profile?.displayName || currentUserName;

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      displayName: officeName || displayName,
      bio: officeDescription,
    });
  };

  if (profileLoading) {
    return (
      <div className="p-4 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const officeTypes = [
    { value: "legal", label: language === 'ar' ? "محاماة قانونية" : "Legal Services" },
    { value: "consulting", label: language === 'ar' ? "استشارات" : "Consulting" },
    { value: "accounting", label: language === 'ar' ? "محاسبة" : "Accounting" },
    { value: "engineering", label: language === 'ar' ? "هندسة" : "Engineering" },
    { value: "medical", label: language === 'ar' ? "طبي" : "Medical" },
    { value: "technology", label: language === 'ar' ? "تقنية" : "Technology" },
    { value: "general", label: language === 'ar' ? "عام" : "General" },
  ];

  const defaultServices = [
    language === 'ar' ? "الإستشارات" : "Consulting",
    language === 'ar' ? "صياغة الحقوق" : "Rights Drafting",
    language === 'ar' ? "صياغة المتون" : "Document Drafting",
    language === 'ar' ? "التحكم الإداري" : "Administrative Control",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Basic Account Settings */}
        <Card className="bg-white dark:bg-[#1a1f2e] border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {language === 'ar' ? 'إعدادات الحساب الإساسية' : 'Basic Account Settings'}
            </h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                {language === 'ar' ? 'تعديل البيانات' : 'Edit Data'}
              </Button>
            )}
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <Building2 className="h-12 w-12 mb-1" />
                    <span className="text-xs text-center px-2">{displayName || (language === 'ar' ? 'اسم المكتب' : 'Office Name')}</span>
                  </div>
                )}
              </div>
              {isEditing && (
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880}
                  allowedFileTypes={["image/*"]}
                  onGetUploadParameters={getUploadParams}
                  onComplete={handleAvatarUploadComplete}
                  buttonVariant="default"
                  buttonSize="sm"
                >
                  {language === 'ar' ? 'تحديم الصورة' : 'Change Image'}
                </ObjectUploader>
              )}
            </div>

            {isEditing ? (
              // Edit Mode Form
              <>
                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'اسم المكتب / الاسم المستخدم' : 'Office Name / Username'}
                  </Label>
                  <Input
                    value={officeName || displayName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    placeholder={language === 'ar' ? 'مكتب النور الإستشارات' : 'Al Noor Consulting Office'}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-right"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    type="email"
                    value={email || currentUser?.email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 55 123 4567"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'التحقق بخطوتين (2FA)' : 'Two-Factor Authentication (2FA)'}
                  </Label>
                  <div className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {twoFactorEnabled 
                        ? (language === 'ar' ? 'مفعّل' : 'Enabled')
                        : (language === 'ar' ? 'معطّل' : 'Disabled')
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'اللغة' : 'Language'}
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                      <SelectValue placeholder={language === 'ar' ? 'اختر اللغة' : 'Select Language'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</SelectItem>
                      <SelectItem value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              // View Mode (Read Only)
              <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-gray-500 text-sm">{language === 'ar' ? 'الاسم' : 'Name'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{officeName || displayName}</span>
                      {subscription?.plan === 'vip' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 hover:from-yellow-600 hover:to-amber-700 shadow-sm h-5 px-1.5 text-[10px]">
                          <Star className={`h-2.5 w-2.5 fill-current ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          VIP
                        </Badge>
                      )}
                    </div>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-gray-500 text-sm">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                    <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">{email || currentUser?.email}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-gray-500 text-sm">{language === 'ar' ? 'الجوال' : 'Phone'}</span>
                    <span className="font-semibold text-gray-900 dark:text-white" dir="ltr">{phone || "-"}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                    <span className="text-gray-500 text-sm">{language === 'ar' ? 'حالة الحساب' : 'Account Status'}</span>
                    <div className="flex gap-2">
                      {subscription?.plan === 'vip' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          VIP
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </Badge>
                    </div>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Office Identity Settings - Only show edit mode inputs if editing, else show summary */}
        <Card className="bg-white dark:bg-[#1a1f2e] border-0 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-blue-600 dark:bg-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white text-center">
              {language === 'ar' ? 'إعدادات هوية المكتب' : 'Office Identity Settings'}
            </h2>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Check className="h-4 w-4 text-green-500" />
                    {language === 'ar' ? 'نبذة تعريفية عن المكتب' : 'Office Description'}
                  </Label>
                  <Textarea
                    value={officeDescription || profile?.bio || ''}
                    onChange={(e) => setOfficeDescription(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب نبذة تعريفية عن المكتب...' : 'Write a brief description about the office...'}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg min-h-[100px] resize-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Check className="h-4 w-4 text-green-500" />
                    {language === 'ar' ? 'نوع المكتب' : 'Office Type'}
                  </Label>
                  <Select value={officeType} onValueChange={setOfficeType}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                      <SelectValue placeholder={language === 'ar' ? 'اختر نوع المكتب' : 'Select Office Type'} />
                    </SelectTrigger>
                    <SelectContent>
                      {officeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Check className="h-4 w-4 text-green-500" />
                    {language === 'ar' ? 'الخدمات المقدمة' : 'Services Offered'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(services.length > 0 ? services : defaultServices).map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                        onClick={() => removeService(service)}
                      >
                        <Check className="h-3 w-3" />
                        {service}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder={language === 'ar' ? 'أضف خدمة جديدة' : 'Add new service'}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg flex-1"
                      dir={isRTL ? 'rtl' : 'ltr'}
                      onKeyPress={(e) => e.key === 'Enter' && addService()}
                    />
                    <Button 
                      variant="outline" 
                      onClick={addService}
                      className="text-amber-500 border-amber-500 hover:bg-amber-500/10 rounded-lg"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {language === 'ar' ? 'إضافة خدمة أخرى' : 'Add Service'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right block' : ''}`}>
                    {language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      placeholder="12"
                      className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-center"
                    />
                    <span className={`absolute top-1/2 -translate-y-1/2 text-sm text-gray-500 ${isRTL ? 'left-4' : 'right-4'}`}>
                      {language === 'ar' ? 'سنة' : 'years'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
               // View Mode for Identity
               <div className="space-y-4">
                 <div>
                    <span className="block text-gray-500 text-sm mb-1">{language === 'ar' ? 'نبذة تعريفية' : 'Description'}</span>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm leading-relaxed">
                       {officeDescription || profile?.bio || (language === 'ar' ? 'لم يتم إضافة وصف بعد.' : 'No description added yet.')}
                    </p>
                 </div>
                 <div>
                    <span className="block text-gray-500 text-sm mb-2">{language === 'ar' ? 'الخدمات' : 'Services'}</span>
                    <div className="flex flex-wrap gap-2">
                       {(services.length > 0 ? services : defaultServices).map((service, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                             {service}
                          </Badge>
                       ))}
                    </div>
                 </div>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button - Only show in Edit Mode */}
        {isEditing && (
          <Button 
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-full text-lg font-bold shadow-lg mb-24 animate-in fade-in slide-in-from-bottom-4"
          >
            {updateProfileMutation.isPending 
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
              : (language === 'ar' ? 'حفظ التحديثات' : 'Save Changes')
            }
          </Button>
        )}
        
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#0B0F19]/95 backdrop-blur-md border-t border-white/10">
          <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
            <Link 
              href="/"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            >
              <Home className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </Link>
            <Link 
              href="/storefront"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'المكاتب' : 'Offices'}</span>
            </Link>
            <Link 
              href="/profile"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            >
              <UserCircle className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'حسابي' : 'Profile'}</span>
            </Link>
            <Link 
              href="/careers"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'الوظائف' : 'Jobs'}</span>
            </Link>
            <Link 
              href="/videos"
              className="flex flex-col items-center gap-0.5 p-2 min-w-[50px] text-gray-500 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
            >
              <Play className="h-5 w-5" />
              <span className="text-[9px] font-medium">{language === 'ar' ? 'المقاطع' : 'Reels'}</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
