import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion'; 

// تعريف أنواع البيانات 
interface VoiceAssistantProps { 
  defaultLanguage: string; 
} 

const AISecurityReceptionist: React.FC<VoiceAssistantProps> = ({ defaultLanguage }) => { 
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [text, setText] = useState(""); 

  // دالة التحدث باستخدام محرك المتصفح 
  const speak = (message: string) => { 
    if ('speechSynthesis' in window) { 
      // إلغاء أي حديث سابق 
      window.speechSynthesis.cancel(); 

      const utterance = new SpeechSynthesisUtterance(message); 
      utterance.lang = defaultLanguage || 'ar-SA'; 
      
      utterance.onstart = () => setIsSpeaking(true); 
      utterance.onend = () => setIsSpeaking(false); 

      window.speechSynthesis.speak(utterance); 
    } 
  }; 

  const handleWelcome = () => { 
    const welcomeMsg = "أهلاً بك في ديسك تاون، أنا مساعدتك الذكية. كيف يمكنني خدمتك اليوم؟"; 
    setText(welcomeMsg); 
    speak(welcomeMsg); 
  }; 

  return ( 
    <div className="flex flex-col items-center justify-center bg-transparent p-4 w-full"> 
      {/* تمثيل مرئي لنبض الصوت عند التحدث */} 
      <div className="relative mb-8"> 
        <AnimatePresence> 
          {isSpeaking && ( 
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1.5, opacity: 0.3 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              transition={{ repeat: Infinity, duration: 1.5 }} 
              className="absolute inset-0 bg-blue-400 rounded-full blur-3xl" 
            /> 
          )} 
        </AnimatePresence> 
        
        {/* أيقونة أو أفاتار مبسط يعبر عن الحالة */} 
        <div className={`w-32 h-32 rounded-full border-4 ${isSpeaking ? 'border-blue-400' : 'border-slate-500'} flex items-center justify-center transition-colors duration-500 bg-slate-900/50 backdrop-blur-sm`}> 
           <span className="text-5xl">{isSpeaking ? '🎙️' : '👤'}</span> 
        </div> 
      </div> 

      {/* لوحة التحكم */} 
      <motion.div 
        className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center shadow-2xl max-w-md w-full" 
        layout 
      > 
        <p className="text-white mb-4 min-h-[1.5rem] italic"> 
          {text || "اضغط على الزر لتجربة الاستقبال"} 
        </p> 
        
        <button 
          onClick={handleWelcome} 
          disabled={isSpeaking} 
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold hover:shadow-[0_0_20px_rgba(0,163,255,0.5)] disabled:opacity-50 transition-all" 
        > 
          {isSpeaking ? "جاري التحدث..." : "تفعيل الاستقبال"} 
        </button> 
      </motion.div> 
    </div> 
  ); 
}; 

export default AISecurityReceptionist;