import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Globe, 
  Calendar as CalendarIcon, 
  User, 
  Bell, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Message {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
  translation?: string; // Translated summary for admin
}

interface AIReceptionistProps {
  officeName: string;
  onVipDetected?: () => void;
}

export function AIReceptionist({ officeName, onVipDetected }: AIReceptionistProps) {
  const { language: uiLanguage } = useLanguage(); // Interface language (Arabic/English)
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorLang, setVisitorLang] = useState<'ar' | 'en' | 'ja'>('ar'); // Default visitor language
  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Simulated AI Avatar Image
  const avatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop";

  // 1. Face/Voice Recognition Simulation (Cookies/LocalStorage)
  useEffect(() => {
    const storedName = localStorage.getItem('visitor_name');
    if (storedName) {
      setVisitorName(storedName);
      addAiMessage(
        visitorLang === 'ja' 
          ? `お帰りなさい、${storedName}さん。${officeName}へようこそ。今日はどのようなご用件でしょうか？` 
          : visitorLang === 'en'
          ? `Welcome back, ${storedName}. Good to see you again at ${officeName}. How can I help you today?`
          : `أهلاً بعودتك، ${storedName}. سعيد برؤيتك مجدداً في ${officeName}. كيف يمكنني مساعدتك اليوم؟`
      );
    } else {
      addAiMessage(
        visitorLang === 'ja'
          ? `${officeName}へようこそ。私はAI受付です。お名前をお伺いしてもよろしいですか？`
          : visitorLang === 'en'
          ? `Welcome to ${officeName}. I am the AI Receptionist. May I have your name, please?`
          : `مرحباً بك في ${officeName}. أنا موظفة الاستقبال الذكية. هل لي أن أتشرف بمعرفة اسمك؟`
      );
    }
  }, [officeName]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addAiMessage = (content: string, translation?: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      content,
      timestamp: new Date(),
      translation
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  // 2. Real-time Translation & 4. Filtering Logic
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    const userInput = inputValue; // Keep ref for logic
    setInputValue("");

    // Simulate processing delay
    setTimeout(() => {
      processUserIntent(userInput);
    }, 1000);
  };

  const processUserIntent = (text: string) => {
    const lowerText = text.toLowerCase();

    // Name capturing if not known
    if (!visitorName) {
      const name = text.split(' ').pop() || text; // Simple extraction
      setVisitorName(name);
      localStorage.setItem('visitor_name', name);
      addAiMessage(
        visitorLang === 'ja'
          ? `ありがとうございます、${name}さん。ご要件をお聞かせください。（予約、商談、その他）`
          : visitorLang === 'en'
          ? `Thank you, ${name}. How can I assist you? (Booking, Business, Other)`
          : `شكراً لك، ${name}. كيف يمكنني خدمتك؟ (حجز موعد، عمل، استفسار)`
      );
      return;
    }

    // 3. Smart Scheduling
    if (lowerText.includes('appointment') || lowerText.includes('booking') || lowerText.includes('موعد') || lowerText.includes('حجز') || lowerText.includes('予約')) {
      addAiMessage(
        visitorLang === 'ja'
          ? `承知いたしました。Googleカレンダーを確認します... ご希望の日時を選択してください。`
          : visitorLang === 'en'
          ? `Certainly. Checking Google Calendar... Please select a suitable date.`
          : `بالتأكيد. جاري التحقق من تقويم Google... الرجاء اختيار التاريخ المناسب.`
      );
      setShowCalendar(true);
      return;
    }

    // 4. Filtering / VIP Detection
    if (lowerText.includes('vip') || lowerText.includes('invest') || lowerText.includes('budget') || lowerText.includes('استثمار') || lowerText.includes('ميزانية')) {
      // Trigger VIP Alert
      if (onVipDetected) onVipDetected();
      
      // Simulate Admin Notification
      toast({
        title: uiLanguage === 'ar' ? "⚠️ تنبيه عميل VIP" : "⚠️ VIP Client Alert",
        description: uiLanguage === 'ar' 
          ? `تم اكتشاف عميل مهم (${visitorName}) يسأل عن استثمار/ميزانية.` 
          : `High-value client detected (${visitorName}) asking about investment/budget.`,
        variant: "destructive", // Red alert
      });

      addAiMessage(
        visitorLang === 'ja'
          ? `素晴らしいお話ですね。シニアマネージャーにお繋ぎします。少々お待ちください。`
          : visitorLang === 'en'
          ? `That sounds promising. Let me connect you with a senior manager immediately. Please hold.`
          : `هذا يبدو رائعاً. سأقوم بتوصيلك بمدير المكتب فوراً. لحظة من فضلك.`
      , "Client is asking about high-value topics. Connected to manager.");
      return;
    }

    // Default Response based on Language
    if (visitorLang === 'ja') {
      addAiMessage(`申し訳ありません、よく聞き取れませんでした。もう一度お願いします。`, "Sorry, I didn't catch that.");
    } else if (visitorLang === 'en') {
      addAiMessage(`I understand. Is there anything else I can help you with?`);
    } else {
      addAiMessage(`فهمت. هل هناك أي شيء آخر يمكنني مساعدتك به؟`);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDate(date);
    setShowCalendar(false);
    if (date) {
      toast({
        title: uiLanguage === 'ar' ? "تم الحجز" : "Booked",
        description: uiLanguage === 'ar' ? "تم إضافة الموعد إلى تقويم Google" : "Appointment added to Google Calendar",
      });
      addAiMessage(
        visitorLang === 'ja'
          ? `${date.toLocaleDateString()}で予約を確定しました。確認メールをお送りしました。`
          : visitorLang === 'en'
          ? `Appointment confirmed for ${date.toLocaleDateString()}. Confirmation sent.`
          : `تم تأكيد الموعد بتاريخ ${date.toLocaleDateString()}. تم إرسال التأكيد.`
      );
    }
  };

  return (
    <Card className="h-[500px] flex flex-col shadow-xl border-primary/20 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary animate-pulse">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {uiLanguage === 'ar' ? 'المساعد الذكي' : 'AI Receptionist'}
              <Badge variant="secondary" className="text-[10px] h-5">Online</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {visitorLang === 'ja' ? '日本語' : visitorLang === 'en' ? 'English' : 'العربية'}
            </p>
          </div>
        </div>
        
        {/* Language Switcher Simulation */}
        <div className="flex gap-1">
          <Button 
            variant={visitorLang === 'ar' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={() => { setVisitorLang('ar'); setMessages([]); }}
          >
            عربي
          </Button>
          <Button 
            variant={visitorLang === 'en' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={() => { setVisitorLang('en'); setMessages([]); }}
          >
            EN
          </Button>
          <Button 
            variant={visitorLang === 'ja' ? 'default' : 'ghost'} 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={() => { setVisitorLang('ja'); setMessages([]); }}
          >
            JP
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
              
              {/* Admin Translation Summary */}
              {msg.translation && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                  <Globe className="h-3 w-3 text-yellow-500" />
                  <span>{uiLanguage === 'ar' ? 'ترجمة للإدارة:' : 'Admin Translation:'} {msg.translation}</span>
                </div>
              )}
              
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Calendar Interaction */}
          {showCalendar && (
            <div className="flex justify-start">
               <Card className="p-2 border-primary/20 bg-background shadow-lg">
                 <Calendar
                   mode="single"
                   selected={date}
                   onSelect={handleDateSelect}
                   className="rounded-md border"
                 />
               </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            placeholder={
              visitorLang === 'ja' ? 'メッセージを入力...' 
              : visitorLang === 'en' ? 'Type your message...' 
              : 'اكتب رسالتك...'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button 
            size="icon" 
            className="shrink-0 rounded-full shadow-md"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
