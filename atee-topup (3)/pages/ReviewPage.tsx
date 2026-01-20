
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, MessageSquare, TrendingUp } from 'lucide-react';
import { DB } from '../db';

export const ReviewPage = () => {
  const navigate = useNavigate();
  const reviews = useMemo(() => DB.getReviews().sort((a, b) => b.createdAt - a.createdAt), []);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => dist[r.rating - 1]++);
    return {
      avg: (sum / total).toFixed(1),
      total,
      distribution: dist.reverse()
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter(r => r.rating === filterRating);
  }, [reviews, filterRating]);

  return (
    <div className="pt-10 pb-20 px-4 max-w-5xl mx-auto space-y-10 animate-smooth-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-4 bg-white rounded-full shadow-sm border border-white hover:bg-slate-50 transition-all text-slate-400 active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">รีวิวจากลูกค้า</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Our Happy Customers</p>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[60px] p-10 border border-white shadow-xl flex flex-col items-center justify-center text-center space-y-4 animate-smooth-in stagger-1">
          <div className="text-7xl font-black text-slate-800 tracking-tighter">{stats.avg}</div>
          <div className="flex text-amber-400 gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={28} fill={i < Math.round(Number(stats.avg)) ? "currentColor" : "none"} strokeWidth={i < Math.round(Number(stats.avg)) ? 0 : 2} />
            ))}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">คะแนนจาก {stats.total} ผู้ใช้งาน</div>
        </div>

        <div className="md:col-span-2 bg-white rounded-[60px] p-10 border border-white shadow-xl space-y-6 animate-smooth-in stagger-2">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Satisfaction Rate
          </h3>
          <div className="space-y-4">
            {stats.distribution.map((count, i) => {
              const starLevel = 5 - i;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div 
                  key={starLevel} 
                  className={`flex items-center gap-5 cursor-pointer group p-2 rounded-full transition-all ${filterRating === starLevel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setFilterRating(filterRating === starLevel ? null : starLevel)}
                >
                  <div className="flex items-center gap-1.5 w-14 shrink-0">
                    <span className="text-[11px] font-black text-slate-600">{starLevel}</span>
                    <Star size={14} className="text-amber-400" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-1000 shadow-sm" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-[10px] font-black text-slate-400 group-hover:text-slate-800 transition-colors">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <div className="p-3 bg-rose-100 text-rose-500 rounded-2xl shadow-sm"><MessageSquare size={24} fill="currentColor" /></div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              {filterRating ? `${filterRating} Stars Reviews` : 'Recent Feedback'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real voices from real users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredReviews.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white/40 border-2 border-dashed border-white rounded-[60px] text-slate-400 font-bold uppercase tracking-widest">
              No reviews found in this category
            </div>
          ) : (
            filteredReviews.map((review, idx) => (
              <div key={review.id} className={`bg-white rounded-[50px] p-10 shadow-sm border border-white hover:shadow-2xl transition-all group animate-smooth-in stagger-${(idx % 4) + 1} hover:translate-y-[-5px]`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full">
                    {new Date(review.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <p className="text-slate-700 font-bold text-base leading-relaxed mb-8 italic">"{review.comment}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-slate-500 font-black text-sm uppercase shadow-inner">
                    {review.userName[0]}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-sm tracking-tight">{review.userName}</div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Item: {review.gameName}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
