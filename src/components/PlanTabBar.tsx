import React from 'react';
import { TrekPlan, Member } from '../types';
import { Sparkles, GitFork, ThumbsUp, Compass, Clock, Ruler, DollarSign, Activity, CheckCircle2, TrendingUp } from 'lucide-react';

interface PlanTabBarProps {
  plans: TrekPlan[];
  activePlanId: string;
  onSelectPlan: (planId: string) => void;
  onOpenAIGenerator: () => void;
  onForkPlan: (plan: TrekPlan) => void;
  onOpenVerify: () => void;
  currentMember: Member;
}

export const PlanTabBar: React.FC<PlanTabBarProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenAIGenerator,
  onForkPlan,
  onOpenVerify,
  currentMember,
}) => {
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0];

  // Find leader plan by vote count
  const maxVotes = Math.max(...plans.map((p) => p.votes.length), 0);

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Top row: Tab pills & Action buttons */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2 overflow-x-auto">
        {/* Plan Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {plans.map((plan, index) => {
            const isActive = plan.id === activePlanId;
            const isLeading = plan.votes.length > 0 && plan.votes.length === maxVotes;
            const letter = String.fromCharCode(65 + index); // A, B, C...

            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold border-t border-x transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-50 border-slate-300 text-emerald-800 shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/70'
                }`}
              >
                {/* Active bottom bar accent */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}

                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {letter}
                </span>

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[140px] sm:max-w-[200px]">
                      {plan.title}
                    </span>
                    {plan.isAiGenerated && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-200/60 font-medium">
                        AI
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-normal text-slate-400">
                    작성자: {plan.authorDisplayName}
                  </span>
                </div>

                {/* Vote Count Badge */}
                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-1 ${
                    isLeading
                      ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ThumbsUp className="w-2.5 h-2.5" />
                  <span>{plan.votes.length}표</span>
                  {isLeading && <span className="text-[10px]">👑</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: AI Trek Planner & Fork Plan */}
        <div className="flex items-center gap-2 pb-2 md:pb-0 shrink-0">
          <button
            onClick={() => onForkPlan(activePlan)}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-slate-300/80 cursor-pointer"
            title="현재 선택된 플랜을 복사하여 내 추천 플랜으로 새로 작성합니다"
          >
            <GitFork className="w-3.5 h-3.5 text-slate-600" />
            <span>이 플랜 복사(Fork)</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 플랜 자동생성</span>
          </button>
        </div>
      </div>

      {/* Bottom Summary Strip: Key Metrics from PRD */}
      <div className="bg-slate-50 border-t border-slate-200/90 py-2 px-3 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Key Numbers */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-700">
            <div className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-500">총 거리:</span>
              <strong className="text-slate-900 font-bold">{activePlan.totalDistance}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-slate-500">예상 소요:</span>
              <strong className="text-slate-900 font-bold">{activePlan.totalDuration}</strong>
            </div>

            {activePlan.elevationGain && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-500">고도 상승:</span>
                <strong className="text-slate-900 font-bold">{activePlan.elevationGain}</strong>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600" />
              <span className="text-slate-500">난이도:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  activePlan.difficulty === '하'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activePlan.difficulty === '중'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {activePlan.difficulty}
              </span>
            </div>

            {activePlan.estimatedCost && (
              <div className="flex items-center gap-1.5 hidden md:flex">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <span className="text-slate-500">예상 경비:</span>
                <strong className="text-slate-900">{activePlan.estimatedCost}</strong>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-slate-600" />
              <span className="text-slate-500">경유지:</span>
              <strong className="text-slate-900">{activePlan.waypoints.length}곳</strong>
            </div>
          </div>

          {/* AI Course Verify Trigger button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVerify}
              className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI 피로도·안전 검증</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
