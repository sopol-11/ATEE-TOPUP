
import React from 'react';
import { AlertTriangle, Wrench, Clock, ExternalLink } from 'lucide-react';
import { DB } from '../db';

export const MaintenanceScreen = () => {
  const settings = DB.getSettings();

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white rounded-[60px] p-10 md:p-16 max-w-2xl w-full shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-50"></div>
        <div className="relative z-10 space-y-8">
          <div className="w-32 h-32 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-xl">
            <Wrench size={64} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">
              ระบบปิดปรับปรุง
            </h1>
            <div className="inline-block px-6 py-2 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              Under Maintenance
            </div>
            <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-md mx-auto">
              {settings.maintenanceMessage || 'ขออภัยในความไม่สะดวก ขณะนี้ระบบกำลังปิดปรับปรุงเพื่ออัปเกรดประสิทธิภาพ กรุณาลองใหม่อีกครั้งในภายหลัง'}
            </p>
          </div>

          <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 space-y-4">
             <div className="flex items-center justify-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest">
               <Clock size={14}/> ติดตามสถานะได้ที่
             </div>
             {settings.contactChannels && settings.contactChannels.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {settings.contactChannels.map((c, i) => (
                    <a key={i} href={c.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all text-sm font-bold text-slate-700">
                      {c.name}: <span className="text-blue-600">{c.value}</span> <ExternalLink size={12}/>
                    </a>
                  ))}
                </div>
             ) : (
                <div className="text-xl font-black text-slate-800">{settings.contactLine}</div>
             )}
          </div>
        </div>
      </div>
      <div className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
        ATEE TOPUP SYSTEM
      </div>
    </div>
  );
};
