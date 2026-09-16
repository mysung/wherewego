import React, { useState, useEffect } from 'react';
import { Waypoint, AISpotAlternative } from '../types';
import { Sparkles, X, MapPin, ArrowRight, Loader2, Check } from 'lucide-react';

interface AISpotAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  waypoint: Waypoint | null;
  destination: string;
  onReplaceSpot: (waypointId: string, newName: string, reason: string) => void;
}

export const AISpotAlternativeModal: React.FC<AISpotAlternativeModalProps> = ({
  isOpen,
  onClose,
  waypoint,
  destination,
  onReplaceSpot,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISpotAlternative[]>([]);
  const [reasonRequest, setReasonRequest] = useState('8인 멤버가 편안하게 쉴 수 있는 그늘 쉼터나 사진 포인트');

  useEffect(() => {
    if (isOpen && waypoint) {
      fetchAlternatives();
    }
  }, [isOpen, waypoint?.id]);

  const fetchAlternatives = async () => {
    if (!waypoint) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpot: waypoint,
          destination,
          reason: reasonRequest,
        }),
      });
      const data = await res.json();
      if (data.success && data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !waypoint) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI 대안 장소 추천 (Course Copilot)
              </h3>
              <p className="text-xs text-slate-500">
                현재 지점: <strong className="text-slate-800">{waypoint.name}</strong>
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

        {/* Content */}
        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600">
            Gemini AI가 해당 위치 인근에서 8인 트레킹 동호회에 더 적합한 대체 명소와 휴식지를 찾아 제안합니다.
          </p>

          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-2" />
              <p className="text-xs text-slate-600 font-medium">인근 트레킹 포인트 탐색 중...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-2.5">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.name}
                      </h4>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        {item.extraMinutes}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onReplaceSpot(waypoint.id, item.name, item.reason);
                      onClose();
                    }}
                    className="shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>교체 적용</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              추천 가능한 대안 장소를 불러오지 못했습니다.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={fetchAlternatives}
            disabled={loading}
            className="text-xs text-emerald-700 font-medium hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>다른 대안 다시 추천받기</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
