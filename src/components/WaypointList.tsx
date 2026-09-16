import React from 'react';
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
} from 'lucide-react';

interface WaypointListProps {
  plan: TrekPlan;
  currentMember: Member;
  selectedWaypointId: string | null;
  onSelectWaypoint: (waypointId: string) => void;
  onVoteSpot: (waypointId: string, isUp: boolean) => void;
  onOpenSpotComments: (waypoint: Waypoint) => void;
  onOpenAlternative: (waypoint: Waypoint) => void;
  onAddWaypointClick: () => void;
}

export const WaypointList: React.FC<WaypointListProps> = ({
  plan,
  currentMember,
  selectedWaypointId,
  onSelectWaypoint,
  onVoteSpot,
  onOpenSpotComments,
  onOpenAlternative,
  onAddWaypointClick,
}) => {
  const getSpotIcon = (type: string) => {
    switch (type) {
      case 'START':
        return <Flag className="w-3.5 h-3.5 text-emerald-600" />;
      case 'REST':
        return <Coffee className="w-3.5 h-3.5 text-blue-600" />;
      case 'FOOD':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'VIEW':
        return <Camera className="w-3.5 h-3.5 text-purple-600" />;
      case 'STAY':
        return <Home className="w-3.5 h-3.5 text-indigo-600" />;
      case 'END':
        return <MapPin className="w-3.5 h-3.5 text-rose-600" />;
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
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-y-auto">
      {/* Plan Header Info Card */}
      <div className="p-3.5 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>추천인: <strong className="text-slate-800">{plan.authorDisplayName}</strong></span>
          </div>
          {plan.isAiGenerated && (
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              AI 맞춤 추천
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
          {plan.title}
        </h3>

        {plan.summary && (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
            {plan.summary}
          </p>
        )}

        {/* Mini Elevation Gain preview */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>코스 경유지: <strong>{plan.waypoints.length}개 지점</strong></span>
          </div>
          <button
            onClick={onAddWaypointClick}
            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>지점 추가</span>
          </button>
        </div>
      </div>

      {/* Waypoint Timeline List */}
      <div className="p-3 space-y-2.5 flex-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>코스 상세 동선 (순서대로 방문)</span>
          <span className="text-[11px] font-normal text-slate-400">지점별 찬반 & 의견</span>
        </div>

        {plan.waypoints.map((wp, index) => {
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
                  ? 'bg-emerald-50/60 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                  : 'bg-white hover:bg-slate-50/90 border-slate-200'
              }`}
            >
              {/* Connector line between cards */}
              {index < plan.waypoints.length - 1 && (
                <div className="absolute left-6 -bottom-3 w-0.5 h-3 bg-slate-300 z-0" />
              )}

              {/* Top row: Number, Icon, Name, Elevation, Type */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
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
                <div className="mt-2 bg-emerald-50/80 rounded-md p-1.5 text-[11px] text-emerald-900 flex items-start gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{wp.aiNote}</span>
                </div>
              )}

              {/* Feedback and Comment row: Directly as specified in PRD */}
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
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
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
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
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
                    className="text-[10px] text-slate-500 hover:text-emerald-700 hover:underline flex items-center gap-0.5"
                    title="Gemini AI 대체 장소 추천"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    <span>대안 추천</span>
                  </button>

                  <button
                    onClick={() => onOpenSpotComments(wp)}
                    className="flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-0.5 rounded font-medium transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    <span>{wp.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Latest Comment Excerpt (PRD: "지점별 코멘트/댓글 요약") */}
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
      </div>
    </div>
  );
};
