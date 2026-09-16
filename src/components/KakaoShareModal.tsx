import React, { useState } from 'react';
import { TrekPlan, TrekSpace, Member } from '../types';
import { Share2, X, Copy, Check, ExternalLink, ThumbsUp, Send, CheckCircle2 } from 'lucide-react';

interface KakaoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: TrekSpace;
  activePlan: TrekPlan;
  currentMember: Member;
  onOneClickVote: (planId: string) => void;
}

export const KakaoShareModal: React.FC<KakaoShareModalProps> = ({
  isOpen,
  onClose,
  space,
  activePlan,
  currentMember,
  onOneClickVote,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPollText, setCopiedPollText] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?planId=${activePlan.id}&vote=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getFormattedPollText = () => {
    const lines = [
      `[어디갈까 (WhereWeGo) - 8인 트레킹 코스 투표]`,
      `모임명: ${space.title}`,
      `일시: ${space.date}`,
      ``,
      `멤버 여러분, 각자 추천한 플랜 중 가장 마음에 드는 코스에 투표해주세요!`,
      ``,
    ];

    space.plans.forEach((p, idx) => {
      const num = idx + 1;
      const votesText = p.votes.length > 0 ? ` [👍 ${p.votes.length}표]` : '';
      const startText = p.startPoint || p.waypoints[0]?.name || '들머리';
      const endText = p.endPoint || p.waypoints[p.waypoints.length - 1]?.name || '날머리';
      lines.push(
        `${num}안: ${p.title}\n   • 코스: [들머리] ${startText} ➔ [날머리] ${endText}\n   • 제원: ${p.totalDistance} | ${p.totalDuration} | 난이도 ${p.difficulty}${votesText}`
      );
    });

    lines.push(``);
    lines.push(`👉 지도 보고 원클릭 투표하기:`);
    lines.push(shareUrl);

    return lines.join('\n');
  };

  const handleCopyPollText = () => {
    navigator.clipboard.writeText(getFormattedPollText());
    setCopiedPollText(true);
    setTimeout(() => setCopiedPollText(false), 2000);
  };

  const handleSimulateDeepLinkVote = () => {
    onOneClickVote(activePlan.id);
    setVoteSuccess(true);
    setTimeout(() => setVoteSuccess(false), 2500);
  };

  // Top 3 waypoints for summary
  const keyWaypoints = activePlan.waypoints.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEE500] text-[#3C1E1E] flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                카카오톡 공유 & 간편 투표
              </h3>
              <p className="text-xs text-slate-500">
                단체 카톡방으로 플랜 카드 발송 및 원클릭 투표 연동
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

        {/* Realistic KakaoTalk Card Preview */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-500 mb-2">
            카카오톡 메시지 카드 미리보기 (Kakao Feed Card)
          </label>

          <div className="bg-[#bacee0] p-3.5 rounded-2xl shadow-inner">
            {/* Kakao Bubble */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-sm mx-auto border border-slate-200/80">
              {/* Header inside Card */}
              <div className="bg-[#FEE500] px-3.5 py-2 flex items-center justify-between text-[#3c1e1e]">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>어디갈까 (WhereWeGo)</span>
                  <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded font-medium">
                    트레킹 투표
                  </span>
                </div>
                <span className="text-[10px] font-medium opacity-80">8인 모임 전용</span>
              </div>

              {/* Card Image Simulation with route polyline */}
              <div className="relative h-28 bg-emerald-800 text-white flex items-center justify-center overflow-hidden p-3">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="relative z-20 text-center">
                  <span className="text-[11px] font-semibold text-emerald-300">
                    {space.destination}
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">
                    {activePlan.title}
                  </h4>
                  <div className="text-[10px] text-emerald-200 mt-0.5 font-medium">
                    들머리: {activePlan.startPoint || activePlan.waypoints[0]?.name || '시작점'} ➔ 날머리: {activePlan.endPoint || activePlan.waypoints[activePlan.waypoints.length - 1]?.name || '도착점'}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-emerald-100 font-mono">
                    <span>{activePlan.totalDistance}</span>
                    <span>•</span>
                    <span>{activePlan.totalDuration}</span>
                    <span>•</span>
                    <span>난이도 {activePlan.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Key waypoints list */}
              <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-1 text-xs">
                <div className="font-semibold text-slate-700 text-[11px]">주요 경유 지점:</div>
                <div className="space-y-0.5 text-slate-600 text-[11px]">
                  {keyWaypoints.map((w, i) => (
                    <div key={w.id} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-600" />
                      <span>{w.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons on Card */}
              <div className="p-2.5 bg-white space-y-1.5">
                {/* Method A: Direct 1-Click Vote Button */}
                <button
                  onClick={handleSimulateDeepLinkVote}
                  className="w-full py-2 bg-[#FEE500] hover:bg-[#FADA0A] text-[#3c1e1e] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>[원클릭 딥링크] 이 플랜에 바로 투표하기</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>웹앱에서 전체 지도 & 의견 확인</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback after test voting */}
          {voteSuccess && (
            <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>'{currentMember.name}'님의 투표가 즉시 반영되었습니다! (실시간 집계 완료)</span>
            </div>
          )}
        </div>

        {/* Copy Options */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleCopyPollText}
              className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPollText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">카톡 투표 텍스트 복사완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-700" />
                  <span>단체방 투표 텍스트 복사</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="딥링크 공유 URL 복사"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '복사됨' : '링크 복사'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            카카오 단체 대화방에 붙여넣어 멤버 8명의 투표를 1초 만에 취합하세요.
          </p>
        </div>
      </div>
    </div>
  );
};
