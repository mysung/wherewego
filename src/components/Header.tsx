import React, { useState } from 'react';
import { Member, TrekSpace, TrekPlan } from '../types';
import { Mountain, Users, Share2, Copy, Check, Sparkles, Trophy, Award, Shield, UserCog, Eye, EyeOff, LayoutGrid } from 'lucide-react';

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
  onOpenMemberManage: () => void;
  isMinimalMode?: boolean;
  onToggleMinimalMode?: () => void;
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
  onOpenMemberManage,
  isMinimalMode = false,
  onToggleMinimalMode,
}) => {
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Count total votes across all plans
  const totalVotesCast = space.plans.reduce((acc, p) => acc + p.votes.length, 0);
  const finalPlan = space.plans.find((p) => p.id === space.finalPlanId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner if plan is confirmed */}
      {finalPlan && (
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#881337] text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Trophy className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              🎉 참여 멤버 최종 합의 완료! <strong className="font-bold underline text-emerald-200">{finalPlan.title}</strong>(으)로 일정이 확정되었습니다.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand & Space Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-white flex items-center justify-center shadow-sm shrink-0 border border-emerald-600/50 relative">
            <Mountain className="w-6 h-6 text-emerald-100" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#881337] border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>어디갈까</span>
                <span className="text-xs sm:text-sm font-bold text-[#064e3b] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  WhereWeGo
                </span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-[#881337] font-semibold border border-rose-200/80 hidden sm:inline-block">
                트레킹 플래너
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-800">{space.title}</span>
              <span className="text-slate-300">•</span>
              <span>{space.date}</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[#064e3b] font-bold hidden sm:inline">
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
                    className={`relative w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center border-2 transition-transform hover:scale-110 cursor-pointer ${
                      isCurrent ? 'ring-2 ring-[#064e3b] border-white z-10 scale-105' : 'border-white'
                    }`}
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.slice(0, 1)}
                    {hasVoted && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#064e3b] rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-slate-600 pl-1 font-medium hidden sm:block">
              참여 <strong className="text-[#064e3b]">{space.members.length}명</strong>
              <span className="text-slate-400"> ({totalVotesCast}/{space.members.length} 투표)</span>
            </div>

            {/* Edit members button */}
            <button
              onClick={onOpenMemberManage}
              className="flex items-center gap-1 text-[11px] text-[#881337] hover:text-[#9f1239] bg-rose-50/80 hover:bg-rose-100/70 border border-rose-200 px-2 py-1 rounded-md transition-colors ml-0.5 font-semibold cursor-pointer"
              title="방장을 포함한 참여 멤버 명단 및 정보 관리"
            >
              <UserCog className="w-3 h-3 text-[#881337]" />
              <span>이름 편집</span>
            </button>
          </div>

          {/* Current User Switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMemberDropdown(!showMemberDropdown)}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium transition-colors cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentMember.avatarColor }}
              />
              <span>나: <strong>{currentMember.name}</strong></span>
              {currentMember.role === '방장' && (
                <span className="text-[10px] bg-[#881337] text-white px-1.5 py-0.2 rounded font-semibold">
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
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        m.id === currentMember.id ? 'bg-emerald-50/90 font-bold text-[#064e3b]' : 'text-slate-700'
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

                {/* Edit 8 members option in dropdown */}
                <div className="p-1 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
                  <button
                    onClick={() => {
                      setShowMemberDropdown(false);
                      onOpenMemberManage();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-1.5 text-[#064e3b] hover:bg-emerald-50 rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    <UserCog className="w-3.5 h-3.5 text-[#064e3b]" />
                    <span>8인 멤버 이름 편집 / 방장 설정</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minimal Mode Toggle Button */}
          {onToggleMinimalMode && (
            <button
              onClick={onToggleMinimalMode}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                isMinimalMode
                  ? 'bg-[#064e3b] text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-300'
              }`}
              title={
                isMinimalMode
                  ? '미니멀 모드 켜짐: 필수 지도와 핵심 코스만 표시 중 (클릭 시 상세 모드로 복원)'
                  : '미니멀 모드 켜기: 세부 통계와 보조 정보를 숨기고 지도와 핵심 코스에 집중'
              }
            >
              {isMinimalMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-emerald-200" />
                  <span>미니멀 모드 <strong>ON</strong></span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>미니멀 모드</span>
                </>
              )}
            </button>
          )}

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
