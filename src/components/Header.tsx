import React, { useState } from 'react';
import { Member, TrekSpace, TrekPlan } from '../types';
import { Mountain, Users, Share2, Copy, Check, Sparkles, Trophy, Award, Shield } from 'lucide-react';

interface HeaderProps {
  space: TrekSpace;
  currentMember: Member;
  onSelectMember: (member: Member) => void;
  activePlan: TrekPlan;
  onOpenKakaoShare: () => void;
  onOpenAIGenerator: () => void;
  onOpenVerify: () => void;
  onCopyKakaoText: () => void;
  copiedText: boolean;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  space,
  currentMember,
  onSelectMember,
  activePlan,
  onOpenKakaoShare,
  onOpenAIGenerator,
  onOpenVerify,
  onCopyKakaoText,
  copiedText,
  onResetData,
}) => {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Count total votes across all plans
  const totalVotesCast = space.plans.reduce((acc, p) => acc + p.votes.length, 0);
  const finalPlan = space.plans.find((p) => p.id === space.finalPlanId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner if plan is confirmed */}
      {finalPlan && (
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              🎉 8인 멤버 최종 합의 완료! <strong className="font-bold underline">{finalPlan.title}</strong>(으)로 일정이 확정되었습니다.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand & Space Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Mountain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>어디갈까</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  WhereWeGo
                </span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium hidden sm:inline-block">
                8인 트레킹 플래너
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-800">{space.title}</span>
              <span className="text-slate-300">•</span>
              <span>{space.date}</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-emerald-600 font-medium hidden sm:inline">
                {space.destination}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: 8 Members Avatar bar, User Switcher, Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-between md:justify-end">
          {/* 8 Members Avatar row */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex -space-x-1.5 overflow-hidden">
              {space.members.map((m) => {
                // Check if this member has voted
                const hasVoted = space.plans.some((p) => p.votes.includes(m.id));
                const isCurrent = m.id === currentMember.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    title={`${m.name} (${m.gender === 'M' ? '남' : '여'}, 체력 ${m.fitnessLevel}${m.role === '방장' ? ', 방장' : ''}) - ${hasVoted ? '투표 완료' : '미투표'}`}
                    className={`relative w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                      isCurrent ? 'ring-2 ring-emerald-500 border-white z-10' : 'border-white'
                    }`}
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.slice(0, 1)}
                    {hasVoted && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-600 pl-1 font-medium hidden sm:block">
              참여 <strong className="text-emerald-700">{space.members.length}명</strong>
              <span className="text-slate-400"> ({totalVotesCast}/{space.members.length} 투표)</span>
            </div>
          </div>

          {/* Current User Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentMember.avatarColor }}
              />
              <span>나: <strong>{currentMember.name}</strong></span>
              {currentMember.role === '방장' && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold">
                  방장
                </span>
              )}
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {showMemberDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-40">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  8인 멤버 시뮬레이션 (전환 클릭)
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {space.members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectMember(m);
                        setShowMemberDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        m.id === currentMember.id ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                          style={{ backgroundColor: m.avatarColor }}
                        >
                          {m.name.slice(0, 1)}
                        </span>
                        <span>{m.name} ({m.gender === 'M' ? '남' : '여'})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {m.role === '방장' ? '방장' : `체력 ${m.fitnessLevel}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Kakao Poll Copy Button */}
          <button
            onClick={onCopyKakaoText}
            className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            title="카카오톡 단체방에 바로 붙여넣을 수 있는 투표 텍스트 복사"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">카톡 텍스트 복사됨!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">카톡 투표 텍스트 복사</span>
                <span className="sm:hidden">카톡 복사</span>
              </>
            )}
          </button>

          {/* Kakao Share Modal Button */}
          <button
            onClick={onOpenKakaoShare}
            className="flex items-center gap-1.5 text-xs bg-[#FEE500] hover:bg-[#FADA0A] text-[#3c1e1e] font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>카카오톡 공유</span>
          </button>
        </div>
      </div>
    </header>
  );
};
