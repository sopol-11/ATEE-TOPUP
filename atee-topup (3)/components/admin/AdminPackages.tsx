
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Package as PackageIcon, DollarSign, Clock, Check, X } from 'lucide-react';
import { DB } from '../../db';
import { Package, Game } from '../../types';

export const AdminPackages = ({ packages, games }: { packages: Package[], games: Game[] }) => {
  const [editPkg, setEditPkg] = useState<Partial<Package> | null>(null);

  const handleSave = () => {
    if (!editPkg?.name || !editPkg?.gameId) return;
    const p = {
      id: editPkg.id || Math.random().toString(36).substr(2, 9),
      gameId: editPkg.gameId,
      name: editPkg.name,
      price: editPkg.price || 0,
      allowInstallment: editPkg.allowInstallment || false,
      active: editPkg.active !== false
    } as Package;
    DB.savePackage(p);
    setEditPkg(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">จัดการแพ็กเกจ</h2>
        <button onClick={() => setEditPkg({ active: true, allowInstallment: false })} className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
          <Plus size={18}/> เพิ่มแพ็กเกจ
        </button>
      </div>

      <div className="bg-white rounded-[50px] p-10 border border-white shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">Game</th>
              <th className="px-6 py-4">Package Name</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Installment</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {packages.map(p => (
              <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-6 py-6 font-bold text-slate-500">{games.find(g => g.id === p.gameId)?.name || 'Unknown'}</td>
                <td className="px-6 py-6 font-black text-slate-800 text-lg">{p.name}</td>
                <td className="px-6 py-6 font-black text-blue-600">฿{p.price.toLocaleString()}</td>
                <td className="px-6 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${p.allowInstallment ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                    {p.allowInstallment ? 'Allowed' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                   <div className="flex justify-end gap-2">
                     <button onClick={() => setEditPkg(p)} className="p-3 bg-slate-50 rounded-full hover:bg-blue-600 hover:text-white transition-all text-slate-400"><Edit3 size={16}/></button>
                     <button className="p-3 bg-slate-50 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400"><Trash2 size={16}/></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editPkg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[60px] p-10 max-w-lg w-full shadow-2xl space-y-8">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="text-2xl font-black text-slate-800">Package Details</h3>
                <button onClick={() => setEditPkg(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X/></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Game</label>
                  <select 
                    value={editPkg.gameId || ''} 
                    onChange={e => setEditPkg({...editPkg, gameId: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold focus:outline-none"
                  >
                    <option value="">-- เลือกเกม --</option>
                    {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Package Name</label>
                  <input type="text" value={editPkg.name || ''} onChange={e => setEditPkg({...editPkg, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Price (THB)</label>
                  <input type="number" value={editPkg.price || 0} onChange={e => setEditPkg({...editPkg, price: parseFloat(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold" />
                </div>
                <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-[30px] cursor-pointer">
                   <input type="checkbox" checked={editPkg.allowInstallment} onChange={e => setEditPkg({...editPkg, allowInstallment: e.target.checked})} className="w-5 h-5 rounded-lg" />
                   <span className="text-sm font-bold text-slate-600">เปิดให้ผ่อนชำระรายการนี้</span>
                </label>
              </div>
              <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-lg shadow-xl hover:bg-black transition-all">
                บันทึกแพ็กเกจ
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
