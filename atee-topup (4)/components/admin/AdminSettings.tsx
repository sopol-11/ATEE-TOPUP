
import React, { useState } from 'react';
import { Save, ShieldAlert, CreditCard, Lock, Volume2, Key, Search, Plus, Trash2, ExternalLink } from 'lucide-react';
import { DB } from '../../db';
import { SystemSettings, ContactChannel } from '../../types';
import { useNotification } from '../../App';
import { useDialog } from '../../contexts/DialogContext';

export const AdminSettings = ({ settings: initialSettings }: { settings: SystemSettings }) => {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const { showToast } = useNotification();
  const { showDialog } = useDialog();

  const handleSave = () => {
    showDialog({
      title: 'บันทึกการตั้งค่า?',
      message: 'การเปลี่ยนจะถูกอัปเดตไปยังระบบทันที คุณแน่ใจหรือไม่?',
      type: 'warning',
      onConfirm: async () => {
        await DB.saveSettings(settings);
        showToast('บันทึกการตั้งค่าสำเร็จ!', 'success');
      }
    });
  };

  const addContact = () => {
    const newContact: ContactChannel = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Facebook',
      value: '',
      url: ''
    };
    setSettings({
      ...settings,
      contactChannels: [...(settings.contactChannels || []), newContact]
    });
  };

  const removeContact = (id: string) => {
    setSettings({
      ...settings,
      contactChannels: (settings.contactChannels || []).filter(c => c.id !== id)
    });
  };

  const updateContact = (id: string, field: keyof ContactChannel, value: string) => {
    setSettings({
      ...settings,
      contactChannels: (settings.contactChannels || []).map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    });
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl">
      <div className="px-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">การตั้งค่าระบบ</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Global Shop Configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Contact Info Management */}
        <div className="lg:col-span-2 bg-white rounded-[60px] p-12 border border-white shadow-sm space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
               <ExternalLink size={18} className="text-green-500" /> Contact Channels
             </h3>
             <button onClick={addContact} className="text-[10px] font-black text-blue-500 flex items-center gap-1 uppercase hover:bg-blue-50 px-3 py-1 rounded-full transition-all">
               <Plus size={12}/> Add Channel
             </button>
          </div>
          <div className="space-y-4">
             {(settings.contactChannels || []).map((contact) => (
               <div key={contact.id} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-[30px] border border-slate-100">
                  <input 
                    type="text" 
                    placeholder="Name (e.g. Line)" 
                    value={contact.name} 
                    onChange={e => updateContact(contact.id, 'name', e.target.value)}
                    className="w-full md:w-1/4 px-4 py-3 rounded-full text-xs font-bold"
                  />
                  <input 
                    type="text" 
                    placeholder="Value (e.g. @myshop)" 
                    value={contact.value} 
                    onChange={e => updateContact(contact.id, 'value', e.target.value)}
                    className="w-full md:w-1/4 px-4 py-3 rounded-full text-xs font-bold"
                  />
                  <input 
                    type="text" 
                    placeholder="URL (https://...)" 
                    value={contact.url || ''} 
                    onChange={e => updateContact(contact.id, 'url', e.target.value)}
                    className="flex-1 px-4 py-3 rounded-full text-xs font-bold text-blue-600"
                  />
                  <button onClick={() => removeContact(contact.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 size={16}/>
                  </button>
               </div>
             ))}
             {(settings.contactChannels || []).length === 0 && (
               <div className="text-center text-slate-400 text-xs font-bold py-4">No contact channels configured.</div>
             )}
          </div>
        </div>

        {/* Maintenance & Flags */}
        <div className="bg-white rounded-[60px] p-10 border border-white shadow-sm space-y-8">
           <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
             <ShieldAlert size={18} className="text-red-500" /> Maintenance & Security
           </h3>
           <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-slate-50 rounded-[35px] border border-slate-100 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-500 rounded-2xl"><ShieldAlert size={18}/></div>
                    <span className="text-sm font-black text-slate-700">โหมดปิดปรับปรุง</span>
                  </div>
                  <input type="checkbox" checked={settings.isMaintenanceMode} onChange={e => setSettings({...settings, isMaintenanceMode: e.target.checked})} className="w-6 h-6 rounded-lg accent-red-500" />
                </label>
                {settings.isMaintenanceMode && (
                  <textarea 
                    value={settings.maintenanceMessage || ''}
                    onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})}
                    placeholder="ข้อความแจ้งเตือนขณะปิดปรับปรุง..."
                    className="w-full p-4 rounded-[20px] text-xs font-bold border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-100"
                    rows={3}
                  />
                )}
              </div>
              
              <label className="flex items-center justify-between p-6 bg-slate-50 rounded-[35px] border border-slate-100 cursor-pointer hover:bg-white transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-500 rounded-2xl"><Lock size={18}/></div>
                  <span className="text-sm font-black text-slate-700">บังคับล็อกอิน</span>
                </div>
                <input type="checkbox" checked={settings.forceLogin} onChange={e => setSettings({...settings, forceLogin: e.target.checked})} className="w-6 h-6 rounded-lg accent-blue-500" />
              </label>
           </div>
        </div>

        {/* Slip Verification Settings */}
        <div className="bg-white rounded-[60px] p-10 border border-white shadow-sm space-y-8">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Search size={18} className="text-blue-500" /> Slip Verification System
          </h3>
          <div className="space-y-6">
            <label className="flex items-center justify-between p-6 bg-slate-50 rounded-[35px] border border-slate-100 cursor-pointer hover:bg-white transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-500 rounded-2xl"><Search size={18}/></div>
                <span className="text-sm font-black text-slate-700">เปิดระบบเช็คสลิปอัตโนมัติ</span>
              </div>
              <input 
                type="checkbox" 
                checked={settings.isSlipVerifyEnabled} 
                onChange={e => setSettings({...settings, isSlipVerifyEnabled: e.target.checked})} 
                className="w-6 h-6 rounded-lg accent-blue-500" 
              />
            </label>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Slip Verify API Key</label>
              <div className="relative">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="password" 
                  value={settings.slipVerifyApiKey || ''} 
                  onChange={e => setSettings({...settings, slipVerifyApiKey: e.target.value})} 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" 
                  placeholder="กรอก API Key จาก EasySlip/SlipOk"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Config */}
        <div className="lg:col-span-2 bg-white rounded-[60px] p-12 border border-white shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
               <CreditCard size={18} className="text-blue-500" /> Payment Provider Configuration
             </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4 p-8 bg-blue-50/30 rounded-[45px] border border-blue-50">
               <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">PromptPay Config</div>
               <input type="text" value={settings.promptPayId} onChange={e => setSettings({...settings, promptPayId: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-full font-bold text-sm shadow-inner" placeholder="Mobile / ID" />
               <input type="text" value={settings.promptPayName} onChange={e => setSettings({...settings, promptPayName: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-full font-bold text-sm shadow-inner" placeholder="Name" />
             </div>
             
             <div className="space-y-4 p-8 bg-orange-50/30 rounded-[45px] border border-orange-50">
               <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">TrueMoney Config</div>
               <input type="text" value={settings.truemoneyPhone} onChange={e => setSettings({...settings, truemoneyPhone: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-full font-bold text-sm shadow-inner" placeholder="Phone" />
               <input type="text" value={settings.truemoneyName} onChange={e => setSettings({...settings, truemoneyName: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-full font-bold text-sm shadow-inner" placeholder="Name" />
             </div>
          </div>
        </div>

        {/* Global UI Settings */}
        <div className="lg:col-span-2 bg-white rounded-[60px] p-12 border border-white shadow-sm space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
             <Volume2 size={18} className="text-slate-500" /> UI & Announcement
          </h3>
          <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ข้อความประกาศ (วิ่ง)</label>
               <input type="text" value={settings.announcement || ''} onChange={e => setSettings({...settings, announcement: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" />
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 pt-10">
          <button 
            onClick={handleSave} 
            className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 shimmer-btn"
          >
            <Save size={24}/> บันทึกการตั้งค่าทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};
