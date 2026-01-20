
import React from 'react';
import { Star, Trash2, MessageSquare, User, Gamepad2 } from 'lucide-react';
import { DB } from '../../db';
import { Review } from '../../types';
import { useDialog } from '../../contexts/DialogContext';
import { useNotification } from '../../App';

export const AdminReviews = ({ reviews }: { reviews: Review[] }) => {
  const { showDialog } = useDialog();
  const { showToast } = useNotification();

  const handleDelete = (id: string) => {
    showDialog({
      title: 'ยืนยันการลบรีวิว?',
      message: 'รีวิวนี้จะถูกลบออกจากหน้าเว็บอย่างถาวร คุณแน่ใจหรือไม่?',
      type: 'danger',
      confirmText: 'ลบทันที',
      onConfirm: async () => {
        await DB.deleteReview(id);
        showToast('ลบรีวิวเรียบร้อยแล้ว', 'success');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">จัดการรีวิว</h2>
        <div className="bg-white px-6 py-2 rounded-full border border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          {reviews.length} CUSTOMER REVIEWS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[50px] text-center text-slate-300 font-bold border-2 border-dashed border-white">
            ยังไม่มีรีวิวจากลูกค้า
          </div>
        )}
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-[50px] p-8 shadow-sm border border-white hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                ))}
              </div>
              <button 
                onClick={() => handleDelete(review.id)}
                className="p-3 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <p className="text-slate-700 font-bold text-sm leading-relaxed mb-6">"{review.comment}"</p>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><User size={14}/></div>
                <div className="text-[10px] font-black text-slate-500 truncate">{review.userName}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><Gamepad2 size={14}/></div>
                <div className="text-[10px] font-black text-slate-500 truncate">{review.gameName}</div>
              </div>
            </div>

            <div className="mt-4 text-[8px] font-black text-slate-300 uppercase tracking-widest text-right">
              {new Date(review.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
