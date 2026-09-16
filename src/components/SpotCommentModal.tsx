import React, { useState } from 'react';
import { Waypoint, Member, WaypointComment } from '../types';
import { MessageSquare, X, Send, ThumbsUp, ThumbsDown, User, Clock } from 'lucide-react';

interface SpotCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoint: Waypoint | null;
  currentMember: Member;
  onAddComment: (waypointId: string, text: string) => void;
  onVoteSpot: (waypointId: string, isUp: boolean) => void;
}

export const SpotCommentModal: React.FC<SpotCommentModalProps> = ({
  isOpen,
  onClose,
  waypoint,
  currentMember,
  onAddComment,
  onVoteSpot,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!isOpen || !waypoint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(waypoint.id, commentText.trim());
    setCommentText('');
  };

  const hasUpvoted = waypoint.upVotes.includes(currentMember.id);
  const hasDownvoted = waypoint.downVotes.includes(currentMember.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {waypoint.name} 의견 및 메모
              </h3>
              <p className="text-xs text-slate-500">
                {waypoint.elevation ? `해발 ${waypoint.elevation}m • ` : ''}지점별 찬반 및 멤버 조언
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

        {/* Spot Description & Quick Feedback */}
        <div className="py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            {waypoint.description || '이 지점에 대한 의견이나 팁을 남겨주세요.'}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onVoteSpot(waypoint.id, true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                hasUpvoted
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{waypoint.upVotes.length}</span>
            </button>
            <button
              onClick={() => onVoteSpot(waypoint.id, false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                hasDownvoted
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>{waypoint.downVotes.length}</span>
            </button>
          </div>
        </div>

        {/* Comment Thread List */}
        <div className="py-3 max-h-72 overflow-y-auto space-y-2.5">
          {waypoint.comments.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              아직 작성된 의견이 없습니다. 첫 의견을 남겨보세요!
            </div>
          ) : (
            waypoint.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">{comment.displayName}</span>
                    {comment.userId === currentMember.id && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-medium">
                        나
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(comment.createdAt).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`${currentMember.name}(으)로 의견 남기기... (예: 여기서 15분 휴식해요)`}
            className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">등록</span>
          </button>
        </form>
      </div>
    </div>
  );
};
