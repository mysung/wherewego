import React, { useState, useEffect } from 'react';
import { TrekPlan, AIVerifyResult } from '../types';
import { Sparkles, X, ShieldCheck, AlertTriangle, Users, CheckCircle2, CloudRain, Loader2 } from 'lucide-react';

interface AICourseVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrekPlan;
}

export const AICourseVerifyModal: React.FC<AICourseVerifyModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIVerifyResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      verifyCourse();
    }
  }, [isOpen, plan.id]);

  const verifyCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/verify-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTitle: plan.title,
          totalDistance: plan.totalDistance,
          totalDuration: plan.totalDuration,
          difficulty: plan.difficulty,
          waypoints: plan.waypoints.map((w) => ({
            name: w.name,
            elevation: w.elevation,
            type: w.type,
          })),
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setResult(data.feedback);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                AI 코스 피로도 & 안전 검증
              </h3>
              <p className="text-xs text-slate-500">
                8인 트레킹 모임(남5 여3) 기준 코스 밸런스 및 피로도 시뮬레이션
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-800">코스 경사도와 소요 시간을 분석하고 있습니다...</p>
            <p className="text-xs text-slate-500 mt-1">Gemini AI가 8인의 평균 피로도를 계산 중입니다</p>
          </div>
        ) : result ? (
          <div className="py-4 space-y-4">
            {/* Score & Verdict Banner */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800">종합 안전 및 밸런스 점수</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {result.verdict}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {result.score || 90}
                </span>
                <span className="text-xs text-emerald-700 font-bold"> / 100점</span>
              </div>
            </div>

            {/* Fatigue Analysis */}
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                구간별 난이도 & 피로도 분석
              </h5>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                {result.fatigueAnalysis}
              </div>
            </div>

            {/* 8-Person Group Pacing Advice */}
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                8인 그룹 페이스 안배 조언 (남5, 여3 체력 고려)
              </h5>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-950 leading-relaxed">
                {result.groupPacingAdvice}
              </div>
            </div>

            {/* Checklist */}
            {result.weatherChecklist && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-emerald-600" />
                  당일 권장 준비물 & 안전 체크리스트
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {result.weatherChecklist.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
