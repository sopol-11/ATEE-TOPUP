
import React, { useState } from 'react';
import { Plus, Trash2, LayoutGrid, X, Check, Edit3 } from 'lucide-react';
import { DB } from '../../db';
import { GameForm, Game, FormField } from '../../types';

export const AdminForms = ({ forms, games }: { forms: GameForm[], games: Game[] }) => {
  const [editForm, setEditForm] = useState<GameForm | null>(null);

  const handleAddField = () => {
    if (!editForm) return;
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 6),
      label: 'New Field',
      type: 'text',
      required: true,
      placeholder: 'Enter detail'
    };
    setEditForm({ ...editForm, fields: [...editForm.fields, newField] });
  };

  const handleSave = () => {
    if (!editForm?.gameId) return;
    DB.saveForm(editForm);
    setEditForm(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">Form Builder</h2>
        <button onClick={() => setEditForm({ gameId: '', fields: [] })} className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus size={18}/> สร้างฟอร์มใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {forms.map(f => (
          <div key={f.gameId} className="bg-white rounded-[50px] p-10 border border-white shadow-sm space-y-6 group hover:shadow-xl transition-all">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-50 text-blue-500 rounded-[20px] shadow-sm"><LayoutGrid size={24}/></div>
                 <div>
                   <div className="text-lg font-black text-slate-800">{games.find(g => g.id === f.gameId)?.name || 'Unknown'}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.fields.length} Input Fields</div>
                 </div>
               </div>
               <button onClick={() => setEditForm(f)} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white rounded-full transition-all"><Edit3 size={16}/></button>
             </div>
             <div className="space-y-2">
               {f.fields.map(field => (
                 <div key={field.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">{field.label}</span>
                    <span className="text-[8px] font-black text-slate-300 uppercase px-2 py-1 bg-white rounded-full">{field.type}</span>
                 </div>
               ))}
             </div>
          </div>
        ))}
      </div>

      {editForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[60px] p-10 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
             <div className="flex justify-between items-center border-b border-slate-50 pb-4">
               <h3 className="text-2xl font-black text-slate-800">Build Dynamic Form</h3>
               <button onClick={() => setEditForm(null)} className="p-2 text-slate-400"><X/></button>
             </div>
             <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Game</label>
                 <select 
                   value={editForm.gameId} 
                   onChange={e => setEditForm({...editForm, gameId: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold focus:outline-none"
                 >
                   <option value="">-- เลือกเกม --</option>
                   {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                 </select>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Fields</span>
                    <button onClick={handleAddField} className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1"><Plus size={12}/> Add Field</button>
                  </div>
                  {editForm.fields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-slate-50 rounded-[35px] border border-slate-100 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="Field Label (e.g. UID)" value={field.label} onChange={e => {
                           const newFields = [...editForm.fields];
                           newFields[index].label = e.target.value;
                           setEditForm({...editForm, fields: newFields});
                         }} className="px-5 py-3 rounded-full text-xs font-bold" />
                         <select value={field.type} onChange={e => {
                           const newFields = [...editForm.fields];
                           newFields[index].type = e.target.value as any;
                           setEditForm({...editForm, fields: newFields});
                         }} className="px-5 py-3 rounded-full text-xs font-bold">
                           <option value="text">Text Input</option>
                           <option value="number">Number Input</option>
                           <option value="password">Password</option>
                         </select>
                       </div>
                       <div className="flex justify-between items-center">
                         <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                           <input type="checkbox" checked={field.required} onChange={e => {
                             const newFields = [...editForm.fields];
                             newFields[index].required = e.target.checked;
                             setEditForm({...editForm, fields: newFields});
                           }} /> Required
                         </label>
                         <button onClick={() => {
                           const newFields = editForm.fields.filter((_, i) => i !== index);
                           setEditForm({...editForm, fields: newFields});
                         }} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
             <button onClick={handleSave} className="w-full py-5 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl hover:bg-blue-700 transition-all">
                Save Form Configuration
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
