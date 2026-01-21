
import React from 'react';
import { Users, ShieldCheck, ShieldAlert, Lock, Unlock, Mail, Shield } from 'lucide-react';
import { DB } from '../../db';
import { User } from '../../types';

export const AdminUsers = ({ users }: { users: User[] }) => {
  const handleToggleBlock = (user: User) => {
    DB.updateUser({ ...user, isBlocked: !user.isBlocked });
  };

  const handleToggleRole = (user: User) => {
    DB.updateUser({ ...user, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
  };

  return (
    <div className="space-y-8">
      <div className="px-4">
        <h2 className="text-3xl font-black text-slate-800">User Management</h2>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Manage permissions and security</p>
      </div>

      <div className="bg-white rounded-[50px] p-10 border border-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">{u.email[0]}</div>
                     <div>
                       <div className="font-black text-slate-800 text-lg">{u.email}</div>
                       <div className="text-[10px] font-bold text-slate-400">UID: {u.uid || 'N/A'}</div>
                     </div>
                   </div>
                </td>
                <td className="px-6 py-8">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm ${u.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-blue-100 text-blue-600'}`}>
                     {u.role}
                   </span>
                </td>
                <td className="px-6 py-8">
                   <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${u.isBlocked ? 'text-red-500' : 'text-green-500'}`}>
                      {u.isBlocked ? <ShieldAlert size={14}/> : <ShieldCheck size={14}/>}
                      {u.isBlocked ? 'Blocked' : 'Active'}
                   </div>
                </td>
                <td className="px-6 py-8 text-right">
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleRole(u)} 
                        className="p-3 bg-slate-50 rounded-full hover:bg-slate-900 hover:text-white transition-all text-slate-400"
                        title="Change Role"
                      >
                        <Shield size={18}/>
                      </button>
                      <button 
                        onClick={() => handleToggleBlock(u)} 
                        className={`p-3 rounded-full transition-all ${u.isBlocked ? 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'}`}
                        title={u.isBlocked ? 'Unblock' : 'Block User'}
                      >
                        {u.isBlocked ? <Unlock size={18}/> : <Lock size={18}/>}
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};