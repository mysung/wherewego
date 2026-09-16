import React, { useState } from 'react';
import { Member, TrekPlan, Waypoint } from '../types';
import { Sparkles, X, Compass, Loader2, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface AITrekPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  onPlanCreated: (newPlan: TrekPlan) => void;
  defaultDestination: string;
}

export const AITrekPlannerModal: React.FC<AITrekPlannerModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  onPlanCreated,
  defaultDestination,
}) => {
  const [destination, setDestination] = useState(defaultDestination || '지리산 노고단');
  const [difficulty, setDifficulty] = useState<'하' | '중' | '상'>('중');
  const [distanceKm, setDistanceKm] = useState(11);
  const [priority, setPriority] = useState('경치 & 쉼터 배려');
  const [customPrompt, setCustomPrompt] = useState(
    '체력이 약한 멤버 3명을 배려해서 중간에 그늘 쉼터가 많고 하산 후 산채비빔밥을 먹을 수 있는 코스로 부탁해.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          difficulty,
          targetDistanceKm: distanceKm,
          priority,
          prompt: customPrompt,
          authorName: currentMember.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
      } else {
        setErrorMsg(data.message || '플랜 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlan = () => {
    if (!generatedPlan) return;

    const newWaypoints: Waypoint[] = (generatedPlan.waypoints || []).map((wp: any, idx: number) => ({
      id: `wp-ai-${Date.now()}-${idx}`,
      name: wp.name || `지점 ${idx + 1}`,
      lat: wp.lat || 35.3 + idx * 0.005,
      lng: wp.lng || 127.5 + idx * 0.004,
      elevation: wp.elevation || 1000,
      type: wp.type || (idx === 0 ? 'START' : idx === (generatedPlan.waypoints.length - 1) ? 'END' : 'REST'),
      description: wp.description || '',
      aiNote: wp.aiNote || '',
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    }));

    const newPlan: TrekPlan = {
      id: `plan-ai-${Date.now()}`,
      spaceId: 'space-jirisan-01',
      title: generatedPlan.title || `${currentMember.name}의 AI 추천 트레킹 플랜`,
      authorId: currentMember.id,
      authorDisplayName: currentMember.name,
      isAiGenerated: true,
      aiPromptUsed: customPrompt,
      isPublished: true,
      totalDistance: generatedPlan.totalDistance || `${distanceKm}km`,
      totalDuration: generatedPlan.totalDuration || '3시간 40분',
      elevationGain: generatedPlan.elevationGain || '+480m',
      difficulty: generatedPlan.difficulty || difficulty,
      estimatedCost: generatedPlan.estimatedCost || '25,000원/인',
      summary: generatedPlan.summary || 'AI가 8인 멤버의 선호도와 피로도를 종합 분석하여 설계한 맞춤 플랜입니다.',
      votes: [currentMember.id], // Creator votes for their own proposal by default
      waypoints: newWaypoints,
      createdAt: new Date().toISOString(),
    };

    onPlanCreated(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                AI 트레킹 플랜 생성 어시스턴트
              </h3>
              <p className="text-xs text-slate-500">
                Gemini 3.8 Flash가 8인 멤버의 체력과 취향에 최적화된 동선을 설계합니다
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

        {/* Body */}
        <div className="py-4 space-y-4">
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              목적지 / 대상 명산
            </label>
            <div className="flex gap-2 flex-wrap mb-1.5">
              {['지리산 노고단', '설악산 주전골', '북한산 둘레길', '한라산 영실', '오대산 선재길'].map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => setDestination(place)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    destination === place
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {place}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="예: 지리산 성삼재~노고단 둘레길"
            />
          </div>

          {/* Difficulty & Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                코스 난이도
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['하', '중', '상'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      difficulty === diff
                        ? diff === '하'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : diff === '중'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {diff} ({diff === '하' ? '초보' : diff === '중' ? '보통' : '고급'})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                <span>목표 거리: <strong>{distanceKm} km</strong></span>
                <span className="text-slate-400 font-normal">권장 8~15km</span>
              </label>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
            </div>
          </div>

          {/* Priority Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              우선순위 테마
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                '경치 & 쉼터 배려',
                '현지 맛집 & 먹거리',
                '완만한 숲길 힐링',
                '인생샷 포토존 중심',
                '대피소 온수/간식 휴식',
              ].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setPriority(theme)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    priority === theme
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              자유 요청사항 (AI 프롬프트)
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="예: 체력이 약한 멤버 3명을 배려해서 중간에 그늘 쉼터가 많고 점심에 산채비빔밥을 먹을 수 있는 코스로 짜줘."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Plan Preview if available */}
          {generatedPlan && (
            <div className="mt-4 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  AI 플랜 설계 완료
                </span>
                <span className="text-xs text-emerald-700 font-mono">
                  {generatedPlan.totalDistance} • {generatedPlan.totalDuration}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{generatedPlan.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{generatedPlan.summary}</p>
              
              <div className="pt-2 border-t border-emerald-100 flex flex-wrap gap-1.5">
                {(generatedPlan.waypoints || []).map((wp: any, i: number) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900"
                  >
                    {i + 1}. {wp.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            닫기
          </button>

          {!generatedPlan ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI 코스 설계 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 플랜 자동 생성</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApplyPlan}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer"
            >
              <span>{currentMember.name}의 플랜으로 등록하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
