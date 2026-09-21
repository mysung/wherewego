import React, { useState } from 'react';
import { Waypoint, TrekPlan, Member } from '../types';
import {
  Flag,
  Coffee,
  Utensils,
  Camera,
  Home,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  User,
  Plus,
  ArrowRight,
  Compass,
  Ruler,
  Clock,
  Activity,
  Edit3,
  Trash2,
  GitFork,
  ArrowLeft,
  ListFilter,
  Route,
  CheckCircle2,
  Crown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WaypointListProps {
  plans: TrekPlan[];
  activePlan: TrekPlan;
  activePlanId: string;
  onSelectPlan: (planId: string) => void;
  currentMember: Member;
  members: Member[];
  selectedWaypointId: string | null;
  onSelectWaypoint: (waypointId: string) => void;
  onVoteSpot: (waypointId: string, isUp: boolean) => void;
  onOpenSpotComments: (waypoint: Waypoint) => void;
  onOpenAlternative: (waypoint: Waypoint) => void;
  onAddWaypointClick: () => void;
  onEditPlan: (plan: TrekPlan) => void;
  onDeletePlan: (planId: string) => void;
  onForkPlan: (plan: TrekPlan) => void;
  onOpenAIGenerator: () => void;
  onOpenAllPlansModal?: () => void;
  viewMode?: 'proposals' | 'waypoints';
  onViewModeChange?: (mode: 'proposals' | 'waypoints') => void;
  isMinimalMode?: boolean;
}

export const WaypointList: React.FC<WaypointListProps> = ({
  plans,
  activePlan,
  activePlanId,
  onSelectPlan,
  currentMember,
  members,
  selectedWaypointId,
  onSelectWaypoint,
  onVoteSpot,
  onOpenSpotComments,
  onOpenAlternative,
  onAddWaypointClick,
  onEditPlan,
  onDeletePlan,
  onForkPlan,
  onOpenAIGenerator,
  onOpenAllPlansModal,
  viewMode: controlledViewMode,
  onViewModeChange,
  isMinimalMode = false,
}) => {
  // Local state if not controlled externally
  const [internalViewMode, setInternalViewMode] = useState<'proposals' | 'waypoints'>('proposals');

  const currentMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;

  const setViewMode = (mode: 'proposals' | 'waypoints') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Find max votes for leader badge
  const maxVotes = Math.max(...plans.map((p) => p.votes.length), 0);

  // Set of plan IDs that are expanded to show full details
  const [expandedPlanIds, setExpandedPlanIds] = useState<Set<string>>(
    () => new Set([activePlanId])
  );

  const toggleExpandPlan = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    setExpandedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });
  };

  // Active plan index letter (A, B, C...)
  const activePlanIndex = plans.findIndex((p) => p.id === activePlan.id);
  const activeLetter = String.fromCharCode(65 + Math.max(0, activePlanIndex));

  const getSpotIcon = (type: string) => {
    switch (type) {
      case 'START':
        return <Flag className="w-3.5 h-3.5 text-[#064e3b]" />;
      case 'REST':
        return <Coffee className="w-3.5 h-3.5 text-[#047857]" />;
      case 'FOOD':
        return <Utensils className="w-3.5 h-3.5 text-[#881337]" />;
      case 'VIEW':
        return <Camera className="w-3.5 h-3.5 text-[#065f46]" />;
      case 'STAY':
        return <Home className="w-3.5 h-3.5 text-[#881337]" />;
      case 'END':
        return <MapPin className="w-3.5 h-3.5 text-[#881337]" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getSpotBadge = (type: string) => {
    switch (type) {
      case 'START':
        return '출발지';
      case 'REST':
        return '휴식';
      case 'FOOD':
        return '식사';
      case 'VIEW':
        return '전망';
      case 'STAY':
        return '숙소';
      case 'END':
        return '도착';
      default:
        return '경유';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-hidden">
      {/* 1. Top Panel Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 p-2 shrink-0">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('proposals')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentMode === 'proposals'
                ? 'bg-white text-[#064e3b] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>모든 제안 목록 ({plans.length})</span>
          </button>

          <button
            onClick={() => setViewMode('waypoints')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentMode === 'waypoints'
                ? 'bg-white text-[#881337] shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-[#881337]" />
            <span>코스 상세 동선 ({activePlan.waypoints.length}곳)</span>
          </button>
        </div>
      </div>

      {/* 2. Content Area: Either All Proposals Cards OR Active Course Detailed Waypoints */}
      <div className="flex-1 overflow-y-auto">
        {currentMode === 'proposals' ? (
          /* =========================================================================
             VIEW 1: All Course Proposal Cards (모든 제안 목록 카드 형태)
             ========================================================================= */
          <div className="p-3 sm:p-3.5 space-y-3">
            {/* Header Description & Add Plan Action */}
            <div className="flex items-center justify-between pb-1 px-1">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>추천 트레킹 제안 카드 목록</span>
                  <span className="text-[11px] font-bold text-[#064e3b] bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                    총 {plans.length}개
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  카드를 클릭하면 해당 코스의 <strong>상세 동선과 지점</strong>이 열립니다.
                </p>
              </div>

              <button
                onClick={onOpenAIGenerator}
                className="flex items-center gap-1 text-[11px] font-bold text-[#064e3b] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>새 플랜</span>
              </button>
            </div>

            {/* Proposal Cards List */}
            {plans.map((plan, index) => {
              const isSelected = plan.id === activePlanId;
              const isExpanded = expandedPlanIds.has(plan.id);
              const letter = String.fromCharCode(65 + index);
              const isLeading = plan.votes.length > 0 && plan.votes.length === maxVotes;
              const voterMembers = members.filter((m) => plan.votes.includes(m.id));

              return (
                <div
                  key={plan.id}
                  onClick={(e) => {
                    onSelectPlan(plan.id);
                    toggleExpandPlan(e, plan.id);
                  }}
                  className={`group relative rounded-xl p-3 sm:p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-[#064e3b] shadow-xs ring-1 ring-emerald-300'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Connector line between cards for unified timeline look */}
                  {index < plans.length - 1 && (
                    <div className="absolute left-6 -bottom-3.5 w-0.5 h-3 bg-slate-300 z-0" />
                  )}

                  {/* Card Header: Letter, Title, Badges, Votes, Expand Chevron */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      {/* Letter Icon Badge */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#064e3b] text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </div>

                      {/* Title & Author */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#064e3b] transition-colors">
                            {plan.title}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#064e3b] bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-200">
                              선택됨
                            </span>
                          )}
                          {isLeading && (
                            <span className="text-[10px] font-bold text-[#881337] bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-[#881337]" />
                              최다득표
                            </span>
                          )}
                          {plan.isAiGenerated && (
                            <span className="text-[10px] bg-rose-50 text-[#881337] px-1.5 py-0.2 rounded border border-rose-200 font-medium">
                              AI 추천
                            </span>
                          )}
                        </div>

                        {/* Essential summary row: Author & Key Specs at a glance */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                          <span>
                            제안: <strong className="text-slate-800">{plan.authorDisplayName}</strong>
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{plan.totalDistance}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{plan.totalDuration}</span>
                          <span
                            className={`px-1 rounded text-[10px] font-semibold ${
                              plan.difficulty === '하'
                                ? 'bg-emerald-100 text-[#064e3b]'
                                : plan.difficulty === '중'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-[#881337]'
                            }`}
                          >
                            난이도 {plan.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Votes Count Badge & Expand Toggle Chevron */}
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                        <ThumbsUp className="w-3 h-3 text-[#064e3b]" />
                        <span className="text-xs font-bold text-[#064e3b]">{plan.votes.length}표</span>
                      </div>
                      <button
                        onClick={(e) => toggleExpandPlan(e, plan.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={isExpanded ? '간략히 보기' : '상세 정보 펼치기'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 들머리 (출발) ➔ 날머리 (도착) Strip - Always visible key info */}
                  <div className="mt-2 bg-slate-50/90 rounded-lg p-1.5 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <MapPin className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">들머리:</span>
                        <strong className="text-slate-800 text-[11px]">
                          {plan.startPoint || plan.waypoints[0]?.name || '출발점'}
                        </strong>
                      </div>
                    </div>

                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 mx-1" />

                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <Compass className="w-3.5 h-3.5 text-[#881337] shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="text-[10px] text-slate-400 font-medium mr-1">날머리:</span>
                        <strong className="text-slate-800 text-[11px]">
                          {plan.endPoint || plan.waypoints[plan.waypoints.length - 1]?.name || '원점회귀'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE SECTION: Full stats, Elevation, Waypoints, Summary, Actions */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                      {/* Trail Metrics Specs (상승 고도 등 세부 스펙) */}
                      <div className={`grid ${isMinimalMode ? 'grid-cols-3' : 'grid-cols-4'} gap-1.5 text-center text-[11px] bg-slate-50/60 p-1.5 rounded-lg border border-slate-100`}>
                        <div>
                          <div className="text-[10px] text-slate-400">거리</div>
                          <div className="font-bold text-slate-800">{plan.totalDistance}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">소요</div>
                          <div className="font-bold text-slate-800">{plan.totalDuration}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">난이도</div>
                          <div className="font-bold text-slate-800">
                            <span
                              className={`px-1 rounded text-[10px] ${
                                plan.difficulty === '하'
                                  ? 'bg-emerald-100 text-[#064e3b]'
                                  : plan.difficulty === '중'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-[#881337]'
                              }`}
                            >
                              {plan.difficulty}
                            </span>
                          </div>
                        </div>
                        {!isMinimalMode && (
                          <div>
                            <div className="text-[10px] text-slate-400">상승</div>
                            <div className="font-bold text-slate-800">{plan.elevationGain || '-'}</div>
                          </div>
                        )}
                      </div>

                      {/* Waypoints Sequence Preview & Summary */}
                      {!isMinimalMode && (
                        <>
                          <div className="flex items-center gap-1 flex-wrap text-[10px]">
                            <span className="text-slate-400 font-medium">동선 ({plan.waypoints.length}곳):</span>
                            {plan.waypoints.slice(0, 4).map((wp, wIdx) => (
                              <span
                                key={wp.id}
                                className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {wIdx + 1}. {wp.name}
                              </span>
                            ))}
                            {plan.waypoints.length > 4 && (
                              <span className="text-slate-400 font-medium">
                                +{plan.waypoints.length - 4}곳
                              </span>
                            )}
                          </div>

                          {plan.summary && (
                            <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50/70 p-1.5 rounded border border-slate-100/70">
                              {plan.summary}
                            </p>
                          )}
                        </>
                      )}

                      {/* Card Action Footer */}
                      <div
                        className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* View Course Detail CTA */}
                        <button
                          onClick={() => {
                            onSelectPlan(plan.id);
                            setViewMode('waypoints');
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#064e3b] hover:text-[#047857] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <Route className="w-3 h-3 text-[#881337]" />
                          <span>상세 동선 보기 ({plan.waypoints.length}곳)</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        {/* Quick Edit, Fork, Delete buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditPlan(plan)}
                            className="p-1 text-slate-500 hover:text-[#064e3b] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="코스 제안 정보 편집"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onForkPlan(plan)}
                            className="p-1 text-slate-500 hover:text-[#064e3b] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="플랜 복사(Fork)"
                          >
                            <GitFork className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeletePlan(plan.id)}
                            disabled={plans.length <= 1}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              plans.length <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-[#881337] hover:bg-rose-50'
                            }`}
                            title={
                              plans.length <= 1
                                ? '최소 1개의 코스 제안이 유지되어야 합니다'
                                : `'${plan.title}' 삭제`
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             VIEW 2: Active Course Waypoint Timeline (코스 상세 동선 항목)
             ========================================================================= */
          <div className="flex flex-col">
            {/* Top Back Header: Navigate back to All Proposals */}
            <div className="p-3 bg-white border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewMode('proposals')}
                  className="flex items-center gap-1 text-xs font-bold text-[#064e3b] hover:text-[#047857] transition-colors cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>모든 제안 목록 보기</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditPlan(activePlan)}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#064e3b] px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>편집</span>
                  </button>
                  <button
                    onClick={onAddWaypointClick}
                    className="flex items-center gap-1 text-[11px] text-[#064e3b] hover:text-[#047857] font-bold px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>지점 추가</span>
                  </button>
                </div>
              </div>

              {/* Active Plan Title & Author */}
              <div className="mt-2.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-4 h-4 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-bold text-[10px]">
                    {activeLetter}
                  </span>
                  <span>제안자: <strong className="text-slate-800">{activePlan.authorDisplayName}</strong></span>
                  {activePlan.isAiGenerated && (
                    <span className="text-[10px] bg-rose-50 text-[#881337] font-semibold px-1.5 py-0.2 rounded border border-rose-200">
                      AI 추천
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                  {activePlan.title}
                </h3>

                {activePlan.summary && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {activePlan.summary}
                  </p>
                )}

                {/* Trailhead -> Ending point summary banner */}
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-medium">들머리:</span>{' '}
                    <strong className="text-[#064e3b]">{activePlan.startPoint || activePlan.waypoints[0]?.name}</strong>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 mx-1" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 font-medium">날머리:</span>{' '}
                    <strong className="text-[#881337]">{activePlan.endPoint || activePlan.waypoints[activePlan.waypoints.length - 1]?.name}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Waypoints Sequence Cards */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>코스 상세 동선 (순서대로 방문)</span>
                <span className="text-[11px] font-normal text-slate-400">지점별 찬반 & 의견</span>
              </div>

              {activePlan.waypoints.map((wp, index) => {
                const isSelected = wp.id === selectedWaypointId;
                const hasUpvoted = wp.upVotes.includes(currentMember.id);
                const hasDownvoted = wp.downVotes.includes(currentMember.id);
                const latestComment = wp.comments.length > 0 ? wp.comments[wp.comments.length - 1] : null;

                return (
                  <div
                    key={wp.id}
                    onClick={() => onSelectWaypoint(wp.id)}
                    className={`relative rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#064e3b] shadow-xs ring-1 ring-emerald-300'
                        : 'bg-white hover:bg-slate-50/90 border-slate-200'
                    }`}
                  >
                    {/* Connector line between cards */}
                    {index < activePlan.waypoints.length - 1 && (
                      <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-slate-300 z-0" />
                    )}

                    {/* Top row: Number, Name, Elevation, Type */}
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {wp.name}
                            </h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                              {getSpotBadge(wp.type)}
                            </span>
                            {wp.elevation && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {wp.elevation}m
                              </span>
                            )}
                          </div>

                          {wp.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {wp.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-1 rounded-md bg-slate-50 shrink-0">
                        {getSpotIcon(wp.type)}
                      </div>
                    </div>

                    {/* AI Note if present */}
                    {wp.aiNote && (
                      <div className="mt-2 bg-emerald-50/80 rounded-md p-1.5 text-[11px] text-[#064e3b] flex items-start gap-1">
                        <Sparkles className="w-3 h-3 text-[#064e3b] shrink-0 mt-0.5" />
                        <span className="leading-tight">{wp.aiNote}</span>
                      </div>
                    )}

                    {/* Feedback and Comment row */}
                    <div
                      className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Spot Voting Buttons: 👍 count / 👎 count */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onVoteSpot(wp.id, true)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                            hasUpvoted
                              ? 'bg-[#064e3b] border-[#064e3b] text-white shadow-2xs'
                              : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700 hover:text-[#064e3b]'
                          }`}
                          title="이 지점 좋아요 (동의)"
                        >
                          <ThumbsUp className="w-2.5 h-2.5" />
                          <span>{wp.upVotes.length}</span>
                        </button>

                        <button
                          onClick={() => onVoteSpot(wp.id, false)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                            hasDownvoted
                              ? 'bg-[#881337] border-[#881337] text-white shadow-2xs'
                              : 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-700 hover:text-[#881337]'
                          }`}
                          title="이 지점 글쎄요 (개선 의견 있음)"
                        >
                          <ThumbsDown className="w-2.5 h-2.5" />
                          <span>{wp.downVotes.length}</span>
                        </button>
                      </div>

                      {/* Comment summary & Open comments trigger */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenAlternative(wp)}
                          className="text-[10px] text-slate-500 hover:text-[#064e3b] hover:underline flex items-center gap-0.5 cursor-pointer"
                          title="Gemini AI 대체 장소 추천"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-[#881337]" />
                          <span>대안 추천</span>
                        </button>

                        <button
                          onClick={() => onOpenSpotComments(wp)}
                          className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-[#064e3b] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          <span>{wp.comments.length}</span>
                        </button>
                      </div>
                    </div>

                    {/* Latest Comment Excerpt */}
                    {latestComment && (
                      <div
                        onClick={() => onOpenSpotComments(wp)}
                        className="mt-1.5 text-[11px] text-slate-600 bg-slate-50/90 rounded px-2 py-1 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="truncate">
                          <strong className="text-slate-800 font-semibold">{latestComment.displayName}:</strong>{' '}
                          <span className="text-slate-600 italic">"{latestComment.text}"</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom switch back link */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setViewMode('proposals')}
                  className="text-xs text-[#064e3b] hover:text-[#047857] font-semibold hover:underline cursor-pointer"
                >
                  ← 다른 제안 카드 목록 비교하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
