import React, { useState } from 'react';
import { TrekPlan, Member } from '../types';
import { GitFork, X, ArrowRight } from 'lucide-react';

interface ForkPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePlan: TrekPlan | null;
  currentMember: Member;
  onForkConfirm: (newTitle: string, newSummary: string) => void;
}

export const ForkPlanModal: React.FC<ForkPlanModalProps> = ({
  isOpen,
  onClose,
  sourcePlan,
  currentMember,
  onForkConfirm,
}) => {
  if (!isOpen || !sourcePlan) return null;

  const [title, setTitle] = useState(`${currentMember.name}의 ${sourcePlan.title.replace(/^.+?의 /, '')}`);
  const [summary, setSummary] = useState(
    `${sourcePlan.authorDisplayName}님의 플랜을 바탕으로 ${currentMember.name}(이)가 수정한 제안안입니다.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onForkConfirm(title.trim(), summary.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">플랜 복사하여 내 플랜 만들기</h3>
              <p className="text-xs text-slate-500">기존 플랜을 훼손하지 않고 나만의 수정안으로 새로 만듭니다</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">원본 플랜</label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
              {sourcePlan.title} ({sourcePlan.authorDisplayName} 작성, {sourcePlan.waypoints.length}개 지점)
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">내 새 플랜 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">수정 의도 및 메모</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>복사본 생성</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
