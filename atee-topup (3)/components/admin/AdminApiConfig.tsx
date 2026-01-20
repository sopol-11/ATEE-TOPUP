
import React, { useState } from 'react';
import { Plus, Trash2, Globe, X, Save, Edit3 } from 'lucide-react';
import { DB } from '../../db';
import { ApiConfig } from '../../types';

export const AdminApiConfig = ({ apiConfigs }: { apiConfigs: ApiConfig[] }) => {
  const [editConfig, setEditConfig] = useState<Partial<ApiConfig> | null>(null);

  const handleSave = () => {
    if (!editConfig?.name || !editConfig?.endpoint) return;
    const config = {
      id: editConfig.id || Math.random().toString(36).substr(2, 9),
      name: editConfig.name,
      endpoint: editConfig.endpoint,
      method: editConfig.method || 'GET',
      headers: editConfig.headers || '{}',
      responsePath: editConfig.responsePath || 'data.name'
    } as ApiConfig;
    DB.saveApiConfig(config);
    setEditConfig(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">API Verification Config</h2>
        <button 
          onClick={() => setEditConfig({ method: 'GET' })}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={18}/> Add New API
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apiConfigs.map(config => (
          <div key={config.id} className="bg-white rounded-[50px] p-8 border border-white shadow-sm space-y-4 group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><Globe size={24}/></div>
                <div>
                  <h4 className="font-black text-slate-800">{config.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{config.method}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditConfig(config)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-500 break-all">
              {config.endpoint}
            </div>
          </div>
        ))}
      </div>

      {editConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[60px] p-10 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="text-2xl font-black text-slate-800">Verification API Detail</h3>
              <button onClick={() => setEditConfig(null)} className="p-2 text-slate-400"><X/></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">API Name</label>
                <input type="text" value={editConfig.name || ''} onChange={e => setEditConfig({...editConfig, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" placeholder="e.g., Roblox ID Verify" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Endpoint URL (Use {`{id}`} for variable)</label>
                <input type="text" value={editConfig.endpoint || ''} onChange={e => setEditConfig({...editConfig, endpoint: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" placeholder="https://api.game.com/player/{id}" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Method</label>
                  <select value={editConfig.method} onChange={e => setEditConfig({...editConfig, method: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">Response Path</label>
                  <input type="text" value={editConfig.responsePath || ''} onChange={e => setEditConfig({...editConfig, responsePath: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" placeholder="data.username" />
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-lg shadow-xl hover:bg-black transition-all">
              Save API Config
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
