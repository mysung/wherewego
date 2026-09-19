import React, { useState, useEffect } from 'react';
import { TrekPlan } from '../types';
import { Edit3, X, Check, Ruler, Clock, TrendingUp, DollarSign, Activity, MapPin, Compass } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrekPlan | null;
  onSavePlan: (updatedPlan: TrekPlan) => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSavePlan,
}) => {
  const [title, setTitle] = useState('');
  const [authorDisplayName, setAuthorDisplayName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [totalDistance, setTotalDistance] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'하' | '중' | '상'>('중');
  const [elevationGain, setElevationGain] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [summary, setSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (plan && isOpen) {
      setTitle(plan.title || '');
      setAuthorDisplayName(plan.authorDisplayName || '');
      setStartPoint(plan.startPoint || plan.waypoints[0]?.name || '');
      setEndPoint(plan.endPoint || plan.waypoints[plan.waypoints.length - 1]?.name || '');
      setTotalDistance(plan.totalDistance || '7km');
      setTotalDuration(plan.totalDuration || '3시간');
      setDifficulty(plan.difficulty || '중');
      setElevationGain(plan.elevationGain || '+350m');
      setEstimatedCost(plan.estimatedCost || '20,000원/인');
      setSummary(plan.summary || '');
      setErrorMessage(null);
    }
  }, [plan, isOpen]);

  if (!isOpen || !plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('코스 제안 제목을 입력해주세요.');
      return;
    }

    const updatedPlan: TrekPlan = {
      ...plan,
      title: title.trim(),
      authorDisplayName: authorDisplayName.trim() || plan.authorDisplayName,
      startPoint: startPoint.trim() || undefined,
      endPoint: endPoint.trim() || undefined,
      totalDistance: totalDistance.trim() || plan.totalDistance,
      totalDuration: totalDuration.trim() || plan.totalDuration,
      difficulty,
      elevationGain: elevationGain.trim() || undefined,
      estimatedCost: estimatedCost.trim() || undefined,
      summary: summary.trim() || undefined,
    };

    onSavePlan(updatedPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-4 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                코스 제안 정보 편집
              </h3>
              <p className="text-xs text-slate-500">
                코스 제목, 들머리/날머리, 총 거리, 소요시간 등 상세 정보를 수정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              코스 제안 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 미님의 남산타워 힐링 둘레길 코스"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
              required
            />
          </div>

          {/* Author Display Name & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                제안자 / 작성자 표시명
              </label>
              <input
                type="text"
                value={authorDisplayName}
                onChange={(e) => setAuthorDisplayName(e.target.value)}
                placeholder="예: 미님"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                코스 난이도
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                {(['하', '중', '상'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                      difficulty === lvl
                        ? lvl === '하'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : lvl === '중'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl === '하' ? '하 (초급)' : lvl === '중' ? '중 (중급)' : '상 (상급)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trailhead (들머리) & Ending point (날머리) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>들머리 (출발 지점)</span>
              </label>
              <input
                type="text"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                placeholder="예: 백범광장 입구"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-rose-600" />
                <span>날머리 (도착 지점)</span>
              </label>
              <input
                type="text"
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                placeholder="예: 회현역 (원점회귀)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Total Distance, Duration, Elevation, Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Ruler className="w-3 h-3 text-emerald-600" />
                <span>총 거리</span>
              </label>
              <input
                type="text"
                value={totalDistance}
                onChange={(e) => setTotalDistance(e.target.value)}
                placeholder="예: 6.5km"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>소요 시간</span>
              </label>
              <input
                type="text"
                value={totalDuration}
                onChange={(e) => setTotalDuration(e.target.value)}
                placeholder="예: 2시간 40분"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-indigo-600" />
                <span>고도 상승</span>
              </label>
              <input
                type="text"
                value={elevationGain}
                onChange={(e) => setElevationGain(e.target.value)}
                placeholder="예: +280m"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-700" />
                <span>예상 경비</span>
              </label>
              <input
                type="text"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="예: 15,000원/인"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>

          {/* Summary / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              코스 한줄 요약 / 추천 포인트
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: 도심 속 숲길과 서울 전망을 감상하며 초보자도 쾌적하게 완주할 수 있는 코스입니다."
              rows={2}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>수정사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
