import React from 'react';
import { TrekPlan, TrekSpace, Member } from '../types';
import { ThumbsUp, CheckCircle, Trophy, UserCheck, Shield, Sparkles } from 'lucide-react';

interface OverallVoteBarProps {
  space: TrekSpace;
  activePlan: TrekPlan;
  currentMember: Member;
  onVotePlan: (planId: string) => void;
  onFinalizePlan: (planId: string) => void;
}

export const OverallVoteBar: React.FC<OverallVoteBarProps> = ({
  space,
  activePlan,
  currentMember,
  onVotePlan,
  onFinalizePlan,
}) => {
  // Check if current user has voted for activePlan
  const hasVotedForActivePlan = activePlan.votes.includes(currentMember.id);

  // Check if user has voted for any plan
  const userVotedPlan = space.plans.find((p) => p.votes.includes(currentMember.id));

  // Total members voted
  const allVotedMemberIds = new Set(space.plans.flatMap((p) => p.votes));
  const totalVotesCount = allVotedMemberIds.size;
  const isFinalPlan = space.finalPlanId === activePlan.id;

  // Find voters for this active plan
  const voters = space.members.filter((m) => activePlan.votes.includes(m.id));

  return (
    <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shadow-lg sticky bottom-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Voting Status and Voter Avatar List */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                isFinalPlan
                  ? 'bg-gradient-to-br from-[#064e3b] to-[#881337] shadow-xs'
                  : hasVotedForActivePlan
                  ? 'bg-[#064e3b]'
                  : 'bg-slate-800'
              }`}
            >
              {isFinalPlan ? <Trophy className="w-5 h-5 text-amber-300" /> : <ThumbsUp className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {isFinalPlan ? '최종 확정된 트레킹 코스' : '그룹 최종 의사결정 투표'}
                </span>
                <span className="text-xs font-bold text-[#064e3b] bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  {totalVotesCount}/{space.members.length}명 참여 완료
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                {activePlan.title}{' '}
                <span className="text-[#064e3b] font-extrabold ml-1">
                  ({activePlan.votes.length}표)
                </span>
              </h4>
            </div>
          </div>

          {/* Voter avatars and names */}
          <div className="flex items-center gap-1.5 pl-0 sm:pl-3 border-l-0 sm:border-l border-slate-200">
            <span className="text-xs text-slate-400 font-medium">투표 멤버:</span>
            {voters.length === 0 ? (
              <span className="text-xs text-slate-400 italic">아직 투표한 멤버가 없습니다</span>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                {voters.map((voter) => (
                  <span
                    key={voter.id}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: voter.avatarColor }}
                  >
                    <span>{voter.name}</span>
                    {voter.id === currentMember.id && <span className="text-[10px] opacity-80">(나)</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Vote Action Button + Organizer Finalize Button */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          {/* Main 1-Click Vote Button */}
          <button
            onClick={() => onVotePlan(activePlan.id)}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer ${
              hasVotedForActivePlan
                ? 'bg-[#064e3b] hover:bg-[#047857] text-white ring-2 ring-emerald-400'
                : 'bg-[#881337] hover:bg-[#9f1239] text-white shadow-md'
            }`}
          >
            {hasVotedForActivePlan ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>내 선택 완료 (클릭 시 취소)</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 text-rose-200" />
                <span>
                  {userVotedPlan ? '이 플랜으로 투표 변경' : '이 플랜으로 최종 투표하기'}
                </span>
              </>
            )}
          </button>

          {/* Organizer Finalize Button */}
          {currentMember.role === '방장' && (
            <button
              onClick={() => onFinalizePlan(activePlan.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors border cursor-pointer ${
                isFinalPlan
                  ? 'bg-rose-50 border-rose-300 text-[#881337]'
                  : 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-300 text-[#064e3b]'
              }`}
              title="모임 방장 권한으로 이 플랜을 최종 완주 코스로 확정합니다"
            >
              <Shield className={`w-4 h-4 ${isFinalPlan ? 'text-[#881337]' : 'text-[#064e3b]'}`} />
              <span>{isFinalPlan ? '확정 취소' : '최종 플랜 확정'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
