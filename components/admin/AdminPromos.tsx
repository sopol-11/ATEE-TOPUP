
import React, { useState } from 'react';
import { Plus, Trash2, ImageIcon, Link, Check, X, Edit3 } from 'lucide-react';
import { DB } from '../../db';
import { PromoBanner } from '../../types';

export const AdminPromos = ({ promos }: { promos: PromoBanner[] }) => {
  const [editPromo, setEditPromo] = useState<Partial<PromoBanner> | null>(null);

  const handleSave = () => {
    if (!editPromo?.image) return;
    const p = {
      id: editPromo.id || Math.random().toString(36).substr(2, 9),
      image: editPromo.image || '',
      link: editPromo.link || '',
      priority: editPromo.priority || 0,
      active: editPromo.active !== false
    } as PromoBanner;
    DB.savePromo(p);
    setEditPromo(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">Carousel Banners</h2>
        <button onClick={() => setEditPromo({ active: true, priority: 0 })} className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
          <Plus size={18}/> เพิ่มแบนเนอร์
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {promos.map(p => (
          <div key={p.id} className="bg-white rounded-[50px] overflow-hidden border border-white shadow-sm group hover:shadow-xl transition-all">
             <div className="aspect-video relative overflow-hidden">
               <img src={p.image} className="w-full h-full object-cover" alt="" />
               <div className="absolute top-6 right-6 flex gap-2">
                  <button onClick={() => setEditPromo(p)} className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-blue-500"><Edit3 size={18}/></button>
                  <button onClick={() => DB.deletePromo(p.id)} className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-red-500"><Trash2 size={18}/></button>
               </div>
               <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-black/50 backdrop-blur rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                 Priority: {p.priority}
               </div>
             </div>
             <div className="p-6 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Link</div>
                  <div className="text-xs font-bold text-slate-600 truncate">{p.link || 'No Link Attached'}</div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${p.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {p.active ? 'Showing' : 'Hidden'}
                </div>
             </div>
          </div>
        ))}
      </div>

      {editPromo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[60px] p-10 max-w-lg w-full shadow-2xl space-y-6">
              <h3 className="text-2xl font-black text-slate-800">Banner Details</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Banner Image URL</label>
                  <input type="text" value={editPromo.image || ''} onChange={e => setEditPromo({...editPromo, image: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Redirect Link (Optional)</label>
                  <input type="text" value={editPromo.link || ''} onChange={e => setEditPromo({...editPromo, link: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Sort Priority</label>
                    <input type="number" value={editPromo.priority || 0} onChange={e => setEditPromo({...editPromo, priority: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" />
                  </div>
                  <label className="flex items-center gap-3 px-6 bg-slate-50 rounded-full border border-slate-100">
                    <input type="checkbox" checked={editPromo.active} onChange={e => setEditPromo({...editPromo, active: e.target.checked})} />
                    <span className="text-xs font-bold text-slate-600">Active</span>
                  </label>
                </div>
              </div>
              <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-lg shadow-xl hover:bg-black transition-all">
                 Publish Banner
              </button>
              <button onClick={() => setEditPromo(null)} className="w-full py-3 text-slate-400 font-black text-xs uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
};