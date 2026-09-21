import React from 'react';
import { TrekPlan, Member } from '../types';
import {
  Sparkles,
  GitFork,
  ThumbsUp,
  Compass,
  Clock,
  Ruler,
  DollarSign,
  Activity,
  TrendingUp,
  ListFilter,
  Edit3,
  Trash2,
} from 'lucide-react';

interface PlanTabBarProps {
  plans: TrekPlan[];
  activePlanId: string;
  onSelectPlan: (planId: string) => void;
  onOpenAIGenerator: () => void;
  onForkPlan: (plan: TrekPlan) => void;
  onOpenVerify: () => void;
  currentMember: Member;
  onOpenAllPlans: () => void;
  onEditPlan: (plan: TrekPlan) => void;
  onDeletePlan: (planId: string) => void;
  isMinimalMode?: boolean;
}

export const PlanTabBar: React.FC<PlanTabBarProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onOpenAIGenerator,
  onForkPlan,
  onOpenVerify,
  currentMember,
  onOpenAllPlans,
  onEditPlan,
  onDeletePlan,
  isMinimalMode = false,
}) => {
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0];

  // Find leader plan by vote count
  const maxVotes = Math.max(...plans.map((p) => p.votes.length), 0);

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Top row: Tab pills & Action buttons */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2 overflow-x-auto">
        {/* Plan Tabs & Add Plan Button */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {/* All Proposals View Button */}
          <button
            onClick={onOpenAllPlans}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#064e3b] bg-emerald-50/80 hover:bg-emerald-100 hover:text-[#047857] border border-emerald-300 rounded-t-xl transition-all shrink-0 cursor-pointer shadow-2xs"
            title="등록된 모든 트레킹 코스 제안 목록 보기 및 비교"
          >
            <ListFilter className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>모든 제안 목록 ({plans.length})</span>
          </button>

          {plans.map((plan, index) => {
            const isActive = plan.id === activePlanId;
            const isLeading = plan.votes.length > 0 && plan.votes.length === maxVotes;
            const letter = String.fromCharCode(65 + index); // A, B, C...

            return (
              <div
                key={plan.id}
                className={`group relative flex items-center rounded-t-xl border-t border-x transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-50 border-slate-300 text-[#064e3b] shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/70'
                }`}
              >
                {/* Active bottom bar accent */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#064e3b] rounded-full" />
                )}

                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold cursor-pointer text-left"
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-[#064e3b] text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[120px] sm:max-w-[180px]">
                        {plan.title}
                      </span>
                      {plan.isAiGenerated && (
                        <span className="text-[10px] bg-rose-50 text-[#881337] px-1 py-0.2 rounded border border-rose-200/80 font-medium">
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
                        ? 'bg-rose-50 text-[#881337] border border-rose-300/80'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-2.5 h-2.5 text-[#881337]" />
                    <span>{plan.votes.length}표</span>
                    {isLeading && <span className="text-[10px]">👑</span>}
                  </div>
                </button>

                {/* Quick Edit & Delete icons on tab hover/active */}
                <div className="flex items-center pr-2 gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPlan(plan);
                    }}
                    className="p-1 text-slate-400 hover:text-[#064e3b] hover:bg-slate-200/80 rounded transition-colors cursor-pointer"
                    title={`'${plan.title}' 코스 편집`}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlan(plan.id);
                    }}
                    disabled={plans.length <= 1}
                    className={`p-1 rounded transition-colors cursor-pointer ${
                      plans.length <= 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-400 hover:text-[#881337] hover:bg-rose-50'
                    }`}
                    title={
                      plans.length <= 1
                        ? '최소 1개의 코스 제안이 유지되어야 합니다'
                        : `'${plan.title}' 코스 삭제`
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dedicated + New Plan Button right beside tabs */}
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#064e3b] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-t-xl transition-all shrink-0 cursor-pointer"
            title="새로운 들머리/날머리 및 코스로 플랜 추가하기"
          >
            <span className="w-4 h-4 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-xs font-bold">+</span>
            <span>새 플랜 생성</span>
          </button>
        </div>

        {/* Action Buttons: Edit, Delete, Fork, AI Generate */}
        <div className="flex items-center gap-2 pb-2 md:pb-0 shrink-0 flex-wrap">
          {/* Currently Selected Plan Title Tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/90 border border-emerald-300 text-xs shadow-2xs">
            <span className="text-slate-500 font-medium">선택 코스:</span>
            <span className="font-bold text-[#064e3b] max-w-[200px] truncate" title={activePlan.title}>
              {activePlan.title}
            </span>
          </div>

          <button
            onClick={() => onEditPlan(activePlan)}
            className="flex items-center gap-1 text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#064e3b] px-2.5 py-1.5 rounded-lg font-medium transition-colors border border-slate-300 hover:border-emerald-300 cursor-pointer"
            title="현재 선택된 코스의 이름, 들머리/날머리, 거리 등 정보 편집"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>코스 편집</span>
          </button>

          <button
            onClick={() => onDeletePlan(activePlan.id)}
            disabled={plans.length <= 1}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border cursor-pointer ${
              plans.length <= 1
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-rose-50 text-[#881337] border-rose-200 hover:border-rose-300'
            }`}
            title={
              plans.length <= 1
                ? '최소 1개의 코스 제안이 유지되어야 합니다'
                : '현재 선택된 코스 제안 삭제'
            }
          >
            <Trash2 className="w-3.5 h-3.5 text-[#881337]" />
            <span>코스 삭제</span>
          </button>

          <button
            onClick={() => onForkPlan(activePlan)}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-slate-300/80 cursor-pointer"
            title="현재 선택된 플랜을 복사하여 내 추천 플랜으로 새로 작성합니다"
          >
            <GitFork className="w-3.5 h-3.5 text-slate-600" />
            <span>플랜 복사(Fork)</span>
          </button>

          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#064e3b] to-[#881337] hover:from-[#047857] hover:to-[#9f1239] text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>AI 플랜 자동생성</span>
          </button>
        </div>
      </div>

      {/* Bottom Summary Strip: Key Metrics (Cleaned: removed estimatedCost, auto-compact in minimal mode) */}
      {!isMinimalMode ? (
        <div className="bg-slate-50 border-t border-slate-200/90 py-1.5 px-3 sm:px-6 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            {/* Key Numbers: Trailhead, Distance, Duration, Difficulty */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-slate-700">
              {/* Trailhead (들머리) & Ending (날머리) Badge */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-[#064e3b] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#064e3b]"></span>
                  들머리: {activePlan.startPoint || activePlan.waypoints[0]?.name || '출발점'}
                </span>
                <span className="text-slate-400 text-xs">➔</span>
                <span className="text-[11px] font-bold text-[#881337] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#881337]"></span>
                  날머리: {activePlan.endPoint || activePlan.waypoints[activePlan.waypoints.length - 1]?.name || '원점회귀'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#064e3b]" />
                <span className="text-slate-500">총 거리:</span>
                <strong className="text-slate-900 font-bold">{activePlan.totalDistance}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#881337]" />
                <span className="text-slate-500">예상 소요:</span>
                <strong className="text-slate-900 font-bold">{activePlan.totalDuration}</strong>
              </div>

              {activePlan.elevationGain && (
                <div className="flex items-center gap-1.5 hidden lg:flex">
                  <TrendingUp className="w-4 h-4 text-[#064e3b]" />
                  <span className="text-slate-500">고도:</span>
                  <strong className="text-slate-900 font-bold">{activePlan.elevationGain}</strong>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#881337]" />
                <span className="text-slate-500">난이도:</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    activePlan.difficulty === '하'
                      ? 'bg-emerald-100 text-[#064e3b]'
                      : activePlan.difficulty === '중'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-[#881337]'
                  }`}
                >
                  {activePlan.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-1.5 hidden sm:flex">
                <Compass className="w-4 h-4 text-slate-600" />
                <span className="text-slate-500">경유지:</span>
                <strong className="text-slate-900">{activePlan.waypoints.length}곳</strong>
              </div>
            </div>

            {/* Actions: View All & Verify */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAllPlans}
                className="flex items-center gap-1 text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
              >
                <ListFilter className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>제안 전체 비교</span>
              </button>

              <button
                onClick={onOpenVerify}
                className="flex items-center gap-1.5 text-xs bg-white hover:bg-rose-50 text-slate-700 hover:text-[#881337] border border-slate-300 hover:border-rose-300 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#881337]" />
                <span>AI 안전 검증</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Ultra Minimal Mode Single-line bar */
        <div className="bg-slate-50 border-t border-slate-200 py-1 px-3 sm:px-6 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-700 font-medium">
            <span className="text-[#064e3b] font-bold">
              {activePlan.startPoint || '출발'} ➔ {activePlan.endPoint || '도착'}
            </span>
            <span>•</span>
            <span>거리 <strong>{activePlan.totalDistance}</strong></span>
            <span>•</span>
            <span>소요 <strong>{activePlan.totalDuration}</strong></span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">미니멀 모드 활성 중</span>
        </div>
      )}
    </div>
  );
};
