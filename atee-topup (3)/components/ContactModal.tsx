
import React from 'react';
import { X, ExternalLink, Phone, MessageCircle, Facebook } from 'lucide-react';
import { DB } from '../db';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const settings = DB.getSettings();
  const contacts = settings.contactChannels || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[50px] w-full max-w-md p-8 shadow-2xl border border-white dark:border-slate-800 animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[25px] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Phone size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">ติดต่อเรา</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Contact Support Channels</p>
        </div>

        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="text-center text-slate-400 font-bold py-4">
              {settings.contactLine || "ยังไม่มีช่องทางติดต่อ"}
            </div>
          ) : (
            contacts.map((contact, index) => (
              <a 
                key={index}
                href={contact.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-[25px] border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm text-slate-700 dark:text-slate-200">
                    {contact.name.toLowerCase().includes('face') ? <Facebook size={20}/> : 
                     contact.name.toLowerCase().includes('line') ? <MessageCircle size={20}/> : 
                     <Phone size={20}/>}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{contact.name}</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{contact.value}</div>
                  </div>
                </div>
                <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
