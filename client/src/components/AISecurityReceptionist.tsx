import React, { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceAssistantProps { 
  defaultLanguage: string; 
} 

const AISecurityReceptionist: React.FC<VoiceAssistantProps> = ({ defaultLanguage }) => { 
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [aiText, setAiText] = useState(""); 
  const [sentiment, setSentiment] = useState<'neutral' | 'happy' | 'angry'>('neutral');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Determine colors based on sentiment
  const getMoodColor = () => {
    switch (sentiment) {
      case 'happy': return 'bg-green-500 border-green-400 shadow-green-500/50';
      case 'angry': return 'bg-red-500 border-red-400 shadow-red-500/50';
      default: return 'bg-blue-500 border-blue-400 shadow-blue-500/50';
    }
  };

  const getMoodBorder = () => {
    switch (sentiment) {
      case 'happy': return 'border-green-400';
      case 'angry': return 'border-red-400';
      default: return 'border-blue-400';
    }
  };

  // Mock ChatGPT API Interaction
  const processAIResponse = async (inputText: string) => {
    // Simulation of sending text to ChatGPT API
    // In a real scenario: const response = await fetch('/api/chat', { body: { text: inputText } });
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    const lowerText = inputText.toLowerCase();
    let responseText = "";
    let detectedSentiment: 'neutral' | 'happy' | 'angry' = 'neutral';

    if (lowerText.includes('شكرا') || lowerText.includes('ممتاز') || lowerText.includes('سعيد') || lowerText.includes('good') || lowerText.includes('thanks')) {
      responseText = defaultLanguage.includes('ar') ? "العفو! أنا سعيدة جداً بخدمتك." : "You're welcome! Happy to help.";
      detectedSentiment = 'happy';
    } else if (lowerText.includes('سيء') || lowerText.includes('غبي') || lowerText.includes('مشكلة') || lowerText.includes('bad') || lowerText.includes('error')) {
      responseText = defaultLanguage.includes('ar') ? "أعتذر عن الإزعاج. جاري تحويلك للمدير." : "I apologize. Connecting you to a manager.";
      detectedSentiment = 'angry';
    } else {
      responseText = defaultLanguage.includes('ar') 
        ? `سمعتك تقول: "${inputText}". كيف يمكنني المساعدة أيضاً؟` 
        : `I heard you say: "${inputText}". How else can I help?`;
      detectedSentiment = 'neutral';
    }

    setSentiment(detectedSentiment);
    setAiText(responseText);
    speak(responseText);
  };

  // Text-to-Speech & Lip-Sync Simulation
  const speak = (message: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(message); 
      utterance.lang = defaultLanguage || 'ar-SA'; 
      
      // Simulate Lip-Sync: Avatar moves when speaking
      utterance.onstart = () => setIsSpeaking(true); 
      utterance.onend = () => {
        setIsSpeaking(false);
        setSentiment('neutral'); // Reset mood after speaking
      }; 

      window.speechSynthesis.speak(utterance); 
    }
  }; 

  // Handle listening end
  useEffect(() => {
    if (!listening && transcript) {
      processAIResponse(transcript);
      resetTranscript();
    }
  }, [listening, transcript]);

  const handleStartListening = () => {
    if (browserSupportsSpeechRecognition) {
      resetTranscript();
      SpeechRecognition.startListening({ language: defaultLanguage, continuous: false });
    } else {
      // Fallback
      handleWelcome();
    }
  };

  const handleWelcome = () => { 
    const welcomeMsg = defaultLanguage.includes('ar') 
      ? "أهلاً بك في ديسك تاون. اضغط للتحدث معي." 
      : "Welcome to DeskTown. Tap to speak with me.";
    setAiText(welcomeMsg); 
    speak(welcomeMsg); 
  }; 

  return ( 
    <div className="flex flex-col items-center justify-center bg-transparent p-4 w-full"> 
      {/* Visual Avatar with Mood & Lip-Sync */} 
      <div className="relative mb-8"> 
        <AnimatePresence> 
          {(isSpeaking || listening) && ( 
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1.5, opacity: 0.3 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              transition={{ repeat: Infinity, duration: 1.5 }} 
              className={`absolute inset-0 rounded-full blur-3xl ${getMoodColor().split(' ')[0]}`} 
            /> 
          )} 
        </AnimatePresence> 
        
        {/* Avatar Circle */} 
        <div className={`w-32 h-32 rounded-full border-4 ${getMoodBorder()} flex items-center justify-center transition-all duration-500 bg-slate-900/80 backdrop-blur-sm shadow-2xl overflow-hidden`}> 
           {/* Lip-Sync Animation: Change icon/image based on speaking state */}
           <motion.div
              animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={isSpeaking ? { repeat: Infinity, duration: 0.2 } : {}}
              className="w-full h-full"
            >
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400" 
                alt="AI Receptionist" 
                className="w-full h-full object-cover"
              />
            </motion.div>
        </div> 
      </div> 

      {/* Control Panel */} 
      <motion.div 
        className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 text-center shadow-2xl max-w-md w-full" 
        layout 
      > 
        <p className="text-white/90 mb-4 min-h-[3rem] font-medium text-lg leading-relaxed" dir="auto"> 
          {listening ? (transcript || "...") : (aiText || (defaultLanguage.includes('ar') ? "اضغط للتحدث" : "Tap to speak"))} 
        </p> 
        
        <div className="flex gap-3 justify-center">
          <button 
            onClick={handleStartListening} 
            disabled={isSpeaking || listening} 
            className={`px-8 py-3 bg-gradient-to-r ${listening ? 'from-red-500 to-pink-500' : 'from-blue-600 to-cyan-500'} text-white rounded-full font-bold hover:shadow-[0_0_20px_rgba(0,163,255,0.5)] disabled:opacity-50 transition-all transform active:scale-95`} 
          > 
            {listening ? "جاري الاستماع..." : isSpeaking ? "جاري الرد..." : "تحدث معي 🎙️"} 
          </button>
        </div>
      </motion.div> 
    </div> 
  ); 
}; 

export default AISecurityReceptionist;