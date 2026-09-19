import React, { useState, useMemo } from 'react';
import { TrekPlan, Member } from '../types';
import {
  ListFilter,
  X,
  Plus,
  ThumbsUp,
  Ruler,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  MapPin,
  Compass,
  Edit3,
  Trash2,
  GitFork,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Eye,
  Crown,
  Search,
} from 'lucide-react';

interface AllPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: TrekPlan[];
  activePlanId: string;
  members: Member[];
  onSelectPlan: (planId: string) => void;
  onEditPlan: (plan: TrekPlan) => void;
  onDeletePlan: (planId: string) => void;
  onForkPlan: (plan: TrekPlan) => void;
  onOpenCreatePlan: () => void;
}

export const AllPlansModal: React.FC<AllPlansModalProps> = ({
  isOpen,
  onClose,
  plans,
  activePlanId,
  members,
  onSelectPlan,
  onEditPlan,
  onDeletePlan,
  onForkPlan,
  onOpenCreatePlan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'votes' | 'distance' | 'difficulty'>('default');

  // Max votes for badge
  const maxVotes = Math.max(...plans.map((p) => p.votes.length), 0);

  // Filtered & Sorted plans
  const filteredPlans = useMemo(() => {
    let result = plans.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.authorDisplayName.toLowerCase().includes(q) ||
        (p.startPoint && p.startPoint.toLowerCase().includes(q)) ||
        (p.endPoint && p.endPoint.toLowerCase().includes(q)) ||
        (p.summary && p.summary.toLowerCase().includes(q))
      );
    });

    if (sortBy === 'votes') {
      result = [...result].sort((a, b) => b.votes.length - a.votes.length);
    } else if (sortBy === 'distance') {
      result = [...result].sort((a, b) => {
        const distA = parseFloat(a.totalDistance) || 0;
        const distB = parseFloat(b.totalDistance) || 0;
        return distA - distB;
      });
    } else if (sortBy === 'difficulty') {
      const rank = { 하: 1, 중: 2, 상: 3 };
      result = [...result].sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
    }

    return result;
  }, [plans, searchTerm, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-4 sm:p-6 my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ListFilter className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  트레킹 코스 제안 전체 목록
                </h3>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  총 {plans.length}개 제안
                </span>
              </div>
              <p className="text-xs text-slate-500">
                참여 멤버들이 등록한 모든 코스 제안을 한눈에 비교하고, 선택·편집·삭제할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenCreatePlan();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 플랜 등록</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="코스명, 제안자, 들머리 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center text-xs text-slate-600">
            <span className="font-medium text-slate-400">정렬:</span>
            <button
              onClick={() => setSortBy('default')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'default'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              기본순
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'votes'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              최다 득표순
            </button>
            <button
              onClick={() => setSortBy('distance')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'distance'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              거리 짧은순
            </button>
            <button
              onClick={() => setSortBy('difficulty')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'difficulty'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              난이도 쉬운순
            </button>
          </div>
        </div>

        {/* Plans List Scrollable Area */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">검색 조건과 일치하는 코스 제안이 없습니다.</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const originalIndex = plans.findIndex((p) => p.id === plan.id);
              const letter = String.fromCharCode(65 + Math.max(0, originalIndex));
              const isActive = plan.id === activePlanId;
              const isLeading = plan.votes.length > 0 && plan.votes.length === maxVotes;
              const voterMembers = members.filter((m) => plan.votes.includes(m.id));

              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-3.5 sm:p-4 transition-all ${
                    isActive
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {letter}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {plan.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              현재 선택됨
                            </span>
                          )}
                          {isLeading && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-0.5">
                              <Crown className="w-3 h-3 text-amber-600" />
                              최다 득표 1위
                            </span>
                          )}
                          {plan.isAiGenerated && (
                            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/80">
                              AI 추천
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>
                            제안자: <strong className="text-slate-800">{plan.authorDisplayName}</strong>
                          </span>
                          <span>•</span>
                          <span>경유지 {plan.waypoints.length}곳</span>
                        </div>
                      </div>
                    </div>

                    {/* Votes summary */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{plan.votes.length}표</span>
                      </div>
                      {voterMembers.length > 0 && (
                        <div className="flex -space-x-1 ml-1">
                          {voterMembers.slice(0, 5).map((voter) => (
                            <div
                              key={voter.id}
                              className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white"
                              style={{ backgroundColor: voter.avatarColor }}
                              title={`${voter.name} 투표`}
                            >
                              {voter.name.slice(0, 1)}
                            </div>
                          ))}
                          {voterMembers.length > 5 && (
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 flex items-center justify-center border border-white">
                              +{voterMembers.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trail specs */}
                  <div className="py-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {/* 들머리 -> 날머리 */}
                    <div className="col-span-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 font-semibold">들머리 (출발)</div>
                        <div className="font-semibold text-slate-800 truncate text-[11px]">
                          {plan.startPoint || plan.waypoints[0]?.name || '출발지'}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-slate-400 font-semibold">날머리 (도착)</div>
                        <div className="font-semibold text-slate-800 truncate text-[11px]">
                          {plan.endPoint || plan.waypoints[plan.waypoints.length - 1]?.name || '원점회귀'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">총 거리</div>
                        <div className="font-bold text-slate-800 text-xs">{plan.totalDistance}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">예상 소요</div>
                        <div className="font-bold text-slate-800 text-xs">{plan.totalDuration}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">난이도</div>
                        <div className="font-bold text-slate-800 text-xs">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              plan.difficulty === '하'
                                ? 'bg-emerald-100 text-emerald-800'
                                : plan.difficulty === '중'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {plan.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary text if present */}
                  {plan.summary && (
                    <div className="text-xs text-slate-600 bg-slate-50/50 p-2 rounded-md mb-2 line-clamp-2">
                      {plan.summary}
                    </div>
                  )}

                  {/* Waypoint chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[11px]">
                    <span className="text-slate-400 font-medium">주요 경유지:</span>
                    {plan.waypoints.slice(0, 6).map((wp, idx) => (
                      <span
                        key={wp.id}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200"
                      >
                        {idx + 1}. {wp.name}
                      </span>
                    ))}
                    {plan.waypoints.length > 6 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        외 {plan.waypoints.length - 6}곳
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onSelectPlan(plan.id);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-slate-100 text-slate-500 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isActive ? '현재 선택 중' : '이 코스 선택·지도 보기'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onForkPlan(plan);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="이 플랜을 바탕으로 새 플랜을 복사 작성합니다"
                      >
                        <GitFork className="w-3.5 h-3.5 text-slate-500" />
                        <span>복사(Fork)</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditPlan(plan)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>코스 정보 편집</span>
                      </button>

                      <button
                        onClick={() => onDeletePlan(plan.id)}
                        disabled={plans.length <= 1}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          plans.length <= 1
                            ? 'text-slate-300 bg-slate-50 border border-slate-200 cursor-not-allowed'
                            : 'text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200'
                        }`}
                        title={
                          plans.length <= 1
                            ? '최소 1개의 코스 제안이 유지되어야 합니다'
                            : `'${plan.title}' 코스 삭제`
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            총 <strong>{plans.length}</strong>개의 코스 제안 등록됨 (최소 1개 유지 필요)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
