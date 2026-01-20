
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// NOTE: Replace with your valid API Key
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'สวัสดีครับ! ยินดีต้อนรับสู่ ATEE TOPUP มีอะไรให้ผมช่วยไหมครับ? สอบถามวิธีการเติมเกม หรือติดตามสถานะได้เลยครับ' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      // Ensure you have a valid API key. 404 Error usually means invalid Model Name.
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp', // Updated to a valid available model
        contents: [
          { role: 'user', parts: [{ text: `You are a helpful customer support agent for "ATEE TOPUP", a game top-up website. Answer in Thai. Be polite, friendly, and concise. Current user asks: ${userMsg}` }] }
        ]
      });

      const text = response.text || "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว โปรดติดต่อแอดมินทางไลน์ครับ";
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = "ขออภัยครับ ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้";
      
      if (error.status === 404) {
        errorMsg = "ระบบ AI กำลังปิดปรับปรุง (Model Not Found)";
      } else if (error.status === 400 || error.message?.includes('API key')) {
        errorMsg = "กรุณาตั้งค่า API Key ให้ถูกต้อง";
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[2000] w-[90vw] md:w-[380px] bg-white dark:bg-slate-800 rounded-[35px] shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-white font-black text-lg leading-none">ATEE AI</h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">Virtual Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-[20px] text-sm font-bold leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-600'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-[20px] rounded-bl-none border border-slate-100 dark:border-slate-600 shadow-sm flex gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-full border border-transparent focus-within:border-blue-500 transition-all"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all shadow-md"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
