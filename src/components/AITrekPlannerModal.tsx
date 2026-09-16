import React, { useState, useEffect } from 'react';
import { Member, TrekPlan, Waypoint, SpotType } from '../types';
import {
  Sparkles,
  X,
  Compass,
  Loader2,
  ArrowRight,
  Check,
  AlertCircle,
  MapPin,
  Repeat,
  PenTool,
  Plus,
  Trash2,
  Navigation,
  Mountain,
} from 'lucide-react';

interface AITrekPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMember: Member;
  onPlanCreated: (newPlan: TrekPlan) => void;
  defaultDestination: string;
}

interface QuickPreset {
  label: string;
  destination: string;
  startPoint: string;
  endPoint: string;
  isLoop: boolean;
  distance: number;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    label: '남산: 남산타워 둘레길 (원점회귀)',
    destination: '서울 남산타워 (남산둘레길)',
    startPoint: '남산 백범광장 & 한양도성 탐방로 입구',
    endPoint: '남산 백범광장 & 회현역 (원점회귀)',
    isLoop: true,
    distance: 6.5,
  },
  {
    label: '남산: 명동역 ➔ 남산타워 ➔ 국립극장 (종주)',
    destination: '서울 남산타워 (명동-남산-국립극장)',
    startPoint: '명동역 3번 출구 & 케이블카 입구',
    endPoint: '국립극장 & 장충단공원',
    isLoop: false,
    distance: 7.2,
  },
  {
    label: '북한산: 북한산성 ↔ 백운대 (원점회귀)',
    destination: '북한산 국립공원 (백운대)',
    startPoint: '북한산성 탐방지원센터',
    endPoint: '북한산성 탐방지원센터 (원점회귀)',
    isLoop: true,
    distance: 8.8,
  },
  {
    label: '관악산: 서울대입구 ↔ 연주대 (원점회귀)',
    destination: '관악산 (연주대)',
    startPoint: '서울대 건설환경연구소 & 관악산 입구',
    endPoint: '서울대입구 만남의광장 (원점회귀)',
    isLoop: true,
    distance: 7.5,
  },
  {
    label: '지리산: 성삼재 ↔ 노고단 (원점회귀)',
    destination: '지리산 국립공원 (노고단)',
    startPoint: '성삼재 주차장 & 탐방로 입구',
    endPoint: '성삼재 주차장 (원점회귀)',
    isLoop: true,
    distance: 12,
  },
  {
    label: '설악산: 오색약수 ↔ 주전골 ↔ 용소폭포',
    destination: '설악산 국립공원 (주전골)',
    startPoint: '오색약수 탐방지원센터',
    endPoint: '오색 주차장 (원점회귀)',
    isLoop: true,
    distance: 8.5,
  },
];

function getDestinationCenter(dest: string) {
  const d = (dest || '').toLowerCase();
  if (d.includes('남산') || d.includes('타워') || d.includes('namsan') || d.includes('서울타워')) {
    return { lat: 37.5512, lng: 126.9882, defaultElev: 265, name: '남산타워' };
  }
  if (d.includes('북한산') || d.includes('백운대')) {
    return { lat: 37.6608, lng: 126.9934, defaultElev: 836, name: '북한산' };
  }
  if (d.includes('관악산') || d.includes('연주대')) {
    return { lat: 37.4444, lng: 126.9639, defaultElev: 629, name: '관악산' };
  }
  if (d.includes('설악산')) {
    return { lat: 38.0890, lng: 128.4480, defaultElev: 380, name: '설악산' };
  }
  if (d.includes('지리산')) {
    return { lat: 35.3197, lng: 127.5262, defaultElev: 1090, name: '지리산' };
  }
  return { lat: 37.5512, lng: 126.9882, defaultElev: 265, name: '남산타워' };
}

export const AITrekPlannerModal: React.FC<AITrekPlannerModalProps> = ({
  isOpen,
  onClose,
  currentMember,
  onPlanCreated,
  defaultDestination,
}) => {
  // Modal Creation Mode: 'AI' (AI 스마트 설계) vs 'MANUAL' (직접 코스 입력)
  const [activeTab, setActiveTab] = useState<'AI' | 'MANUAL'>('AI');

  // Common Trailhead (들머리) & Ending (날머리) state
  const [destination, setDestination] = useState(defaultDestination || '지리산 국립공원');
  const [startPoint, setStartPoint] = useState('성삼재 주차장 & 탐방로 입구');
  const [endPoint, setEndPoint] = useState('성삼재 주차장 (원점회귀)');
  const [isLoop, setIsLoop] = useState(true);

  // AI Planner Form states
  const [difficulty, setDifficulty] = useState<'하' | '중' | '상'>('중');
  const [distanceKm, setDistanceKm] = useState(12);
  const [priority, setPriority] = useState('경치 & 쉼터 배려');
  const [customPrompt, setCustomPrompt] = useState(
    '체력이 약한 멤버 3명을 배려해서 중간에 그늘 쉼터가 많고 하산 후 산채비빔밥을 먹을 수 있는 코스로 부탁해.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Course Form states
  const [manualTitle, setManualTitle] = useState(`${currentMember.name}의 추천 트레킹 플랜`);
  const [manualDistance, setManualDistance] = useState('11.5km');
  const [manualDuration, setManualDuration] = useState('4시간 00분');
  const [manualElevation, setManualElevation] = useState('+520m');
  const [manualCost, setManualCost] = useState('25,000원/인');
  const [manualSummary, setManualSummary] = useState(
    '8인 모임의 체력 안배와 풍경 감상을 위해 설계한 직접 작성 코스입니다.'
  );
  const [manualWaypoints, setManualWaypoints] = useState<
    { name: string; type: SpotType; desc: string; elevation: number }[]
  >([
    { name: '노고단 대피소 & 취사장', type: 'REST', desc: '화장실, 식수 보충, 단체 간식 휴식', elevation: 1350 },
    { name: '노고단 고개 전망대', type: 'VIEW', desc: '지리산 능선 조망 및 단체 기념 촬영', elevation: 1507 },
    { name: '산채 정식 식당가', type: 'FOOD', desc: '하산 후 막걸리와 산채비빔밥 뒤풀이', elevation: 1090 },
  ]);

  // CRITICAL FIX: Whenever modal opens, reset temporary generated states so user can ALWAYS create new plans
  useEffect(() => {
    if (isOpen) {
      setGeneratedPlan(null);
      setErrorMsg(null);
      setIsLoading(false);
      // Reset manual title according to current member
      setManualTitle(`${currentMember.name}의 ${destination.split(' ')[0]} 추천 플랜`);
    }
  }, [isOpen, currentMember.name, destination]);

  if (!isOpen) return null;

  // Handle destination change with smart trailhead/ending suggestion
  const handleDestinationChange = (newDest: string) => {
    setDestination(newDest);
    const d = newDest.toLowerCase();
    if (d.includes('남산') || d.includes('타워') || d.includes('namsan')) {
      if (startPoint.includes('성삼재') || startPoint === '') {
        setStartPoint('남산 백범광장 & 한양도성 탐방로 입구');
        setEndPoint(isLoop ? '남산 백범광장 & 회현역 (원점회귀)' : '명동역 3번 출구 & 케이블카');
        setDistanceKm(6.5);
        setCustomPrompt('8인 모임의 체력 편차를 배려해 완만한 남산 둘레길과 N서울타워 팔각정 전망대, 하산 후 남산 돈까스를 먹는 코스로 부탁해.');
      }
    } else if (d.includes('북한산') || d.includes('백운대')) {
      if (startPoint.includes('성삼재') || startPoint.includes('남산')) {
        setStartPoint('북한산성 탐방지원센터');
        setEndPoint('북한산성 탐방지원센터 (원점회귀)');
        setDistanceKm(8.8);
      }
    } else if (d.includes('관악산') || d.includes('연주대')) {
      if (startPoint.includes('성삼재') || startPoint.includes('남산')) {
        setStartPoint('서울대 건설환경연구소 & 관악산 입구');
        setEndPoint('서울대입구 만남의광장 (원점회귀)');
        setDistanceKm(7.5);
      }
    }
  };

  // Handle preset selection
  const handleSelectPreset = (preset: QuickPreset) => {
    setDestination(preset.destination);
    setStartPoint(preset.startPoint);
    setEndPoint(preset.endPoint);
    setIsLoop(preset.isLoop);
    setDistanceKm(preset.distance);
    setManualDistance(`${preset.distance}km`);
    if (preset.destination.includes('남산')) {
      setCustomPrompt('체력이 약한 멤버를 배려해 완만한 남산 둘레길과 팔각정 전망대, 하산 후 남산 돈까스를 즐기는 힐링 코스로 부탁해.');
    }
  };

  // Handle loop toggle
  const handleToggleLoop = (checked: boolean) => {
    setIsLoop(checked);
    if (checked) {
      setEndPoint(`${startPoint.replace(/\s*\(원점회귀\)/, '')} (원점회귀)`);
    }
  };

  // Handle start point change
  const handleStartPointChange = (val: string) => {
    setStartPoint(val);
    if (isLoop) {
      setEndPoint(`${val.replace(/\s*\(원점회귀\)/, '')} (원점회귀)`);
    }
  };

  // 1. AI Plan Generation API Call
  const handleGenerateAI = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startPoint,
          endPoint,
          isLoop,
          difficulty,
          targetDistanceKm: distanceKm,
          priority,
          prompt: customPrompt,
          authorName: currentMember.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
      } else {
        setErrorMsg(data.message || '플랜 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: any) {
      setErrorMsg('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Apply AI Plan to Workspace
  const handleApplyAIPlan = () => {
    if (!generatedPlan) return;

    const rawWaypoints = generatedPlan.waypoints || [];

    // Ensure first waypoint is START with startPoint and last is END with endPoint
    const center = getDestinationCenter(destination);
    const formattedWaypoints: Waypoint[] = rawWaypoints.map((wp: any, idx: number) => {
      const isFirst = idx === 0;
      const isLast = idx === rawWaypoints.length - 1;

      return {
        id: `wp-ai-${Date.now()}-${idx}`,
        name: isFirst ? startPoint : isLast ? endPoint : wp.name || `지점 ${idx + 1}`,
        lat: Number(wp.lat) || (center.lat + (idx === 0 ? -0.004 : idx * 0.003)),
        lng: Number(wp.lng) || (center.lng + (idx === 0 ? -0.004 : idx * 0.003)),
        elevation: Number(wp.elevation) || (center.defaultElev + (isFirst ? -100 : idx * 25)),
        type: isFirst ? 'START' : isLast ? 'END' : wp.type || 'REST',
        description: wp.description || '',
        aiNote: wp.aiNote || '',
        upVotes: [currentMember.id],
        downVotes: [],
        comments: [],
      };
    });

    const newPlan: TrekPlan = {
      id: `plan-ai-${Date.now()}`,
      spaceId: 'space-jirisan-01',
      title:
        generatedPlan.title ||
        `${currentMember.name}의 ${destination.split(' ')[0]} [${startPoint} ~ ${endPoint}] 플랜`,
      authorId: currentMember.id,
      authorDisplayName: currentMember.name,
      isAiGenerated: true,
      aiPromptUsed: customPrompt,
      isPublished: true,
      startPoint,
      endPoint,
      totalDistance: generatedPlan.totalDistance || `${distanceKm}km`,
      totalDuration: generatedPlan.totalDuration || '4시간 10분',
      elevationGain: generatedPlan.elevationGain || '+520m',
      difficulty: generatedPlan.difficulty || difficulty,
      estimatedCost: generatedPlan.estimatedCost || '25,000원/인',
      summary:
        generatedPlan.summary ||
        `${startPoint} 들머리에서 출발하여 ${endPoint} 날머리로 이어지는 8인 맞춤 추천 코스입니다.`,
      votes: [currentMember.id],
      waypoints: formattedWaypoints,
      createdAt: new Date().toISOString(),
    };

    // Callback to parent App
    onPlanCreated(newPlan);

    // CRITICAL: Clean up state immediately so next plan creation works flawlessly
    setGeneratedPlan(null);
    setErrorMsg(null);
    setIsLoading(false);
    onClose();
  };

  // 3. Create Manual Course
  const handleApplyManualPlan = (e: React.FormEvent) => {
    e.preventDefault();

    const center = getDestinationCenter(destination);

    const startWp: Waypoint = {
      id: `wp-man-start-${Date.now()}`,
      name: startPoint,
      lat: center.lat - 0.005,
      lng: center.lng - 0.005,
      elevation: Math.max(80, center.defaultElev - 140),
      type: 'START',
      description: '들머리: 주차 및 장비 점검, 스트레칭 후 단체 출발',
      aiNote: '출발 전 수분 섭취 및 신발 끈 점검',
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    };

    const midWps: Waypoint[] = manualWaypoints.map((mw, idx) => ({
      id: `wp-man-mid-${Date.now()}-${idx}`,
      name: mw.name,
      lat: center.lat + (idx - 1) * 0.003,
      lng: center.lng + (idx - 1) * 0.003,
      elevation: mw.elevation || center.defaultElev,
      type: mw.type,
      description: mw.desc,
      aiNote: '8인 멤버 페이스 조절 및 휴식 권장',
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    }));

    const endWp: Waypoint = {
      id: `wp-man-end-${Date.now()}`,
      name: endPoint,
      lat: isLoop ? center.lat - 0.005 : center.lat + 0.008,
      lng: isLoop ? center.lng - 0.005 : center.lng + 0.008,
      elevation: isLoop ? Math.max(80, center.defaultElev - 140) : Math.max(60, center.defaultElev - 180),
      type: 'END',
      description: '날머리: 트레킹 안전 종료 및 단체 정산, 뒤풀이 이동',
      aiNote: '완주 기념 축하 및 귀가 차량 배정',
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    };

    const allWaypoints = [startWp, ...midWps, endWp];

    const newPlan: TrekPlan = {
      id: `plan-man-${Date.now()}`,
      spaceId: 'space-jirisan-01',
      title: manualTitle || `${currentMember.name}의 추천 플랜`,
      authorId: currentMember.id,
      authorDisplayName: currentMember.name,
      isAiGenerated: false,
      isPublished: true,
      startPoint,
      endPoint,
      totalDistance: manualDistance,
      totalDuration: manualDuration,
      elevationGain: manualElevation,
      difficulty,
      estimatedCost: manualCost,
      summary: manualSummary,
      votes: [currentMember.id],
      waypoints: allWaypoints,
      createdAt: new Date().toISOString(),
    };

    onPlanCreated(newPlan);

    // State cleanup
    setGeneratedPlan(null);
    setErrorMsg(null);
    setIsLoading(false);
    onClose();
  };

  // Add waypoint to manual list
  const handleAddManualWaypoint = () => {
    setManualWaypoints((prev) => [
      ...prev,
      {
        name: `중간 쉼터 ${prev.length + 1}`,
        type: 'REST',
        desc: '휴식 및 수분 보충 지점',
        elevation: 1200,
      },
    ]);
  };

  // Remove waypoint from manual list
  const handleRemoveManualWaypoint = (idx: number) => {
    setManualWaypoints((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 my-6 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>새 트레킹 플랜 생성</span>
                <span className="text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  작성자: {currentMember.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                들머리(시작점)와 날머리(도착점)를 지정하여 8인 맞춤 코스를 제안합니다
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: AI 스마트 생성 vs 직접 코스 입력 */}
        <div className="pt-3 pb-1 flex border-b border-slate-200 gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('AI');
              setErrorMsg(null);
            }}
            className={`pb-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'AI'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI 맞춤 설계 (Gemini 3.8 Flash)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('MANUAL');
              setErrorMsg(null);
            }}
            className={`pb-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'MANUAL'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <PenTool className="w-4 h-4 text-slate-600" />
            <span>직접 코스 입력 (들머리/날머리 수동)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="py-3.5 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* 1. Quick Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                <span>대표 코스 빠른 선택 (들머리 ↔ 날머리 프리셋)</span>
              </label>
              <span className="text-[11px] text-slate-400">클릭 시 자동 입력</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {QUICK_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="shrink-0 text-xs px-2.5 py-1 rounded-lg border bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-slate-700 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Destination Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">목적지 / 대상 명산</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              placeholder="예: 서울 남산타워, 북한산, 지리산 노고단 등"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* 3. 들머리 (START) & 날머리 (END) - Core User Requirement */}
          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>들머리 (시작 지점) & 날머리 (도착 지점) 설정</span>
              </h4>

              {/* Loop Toggle */}
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLoop}
                  onChange={(e) => handleToggleLoop(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Repeat className="w-3.5 h-3.5 text-slate-500" />
                <span>원점 회귀 (시작점=도착점)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 들머리 (Start Point) */}
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>들머리 (출발 지점)</span>
                </label>
                <input
                  type="text"
                  value={startPoint}
                  onChange={(e) => handleStartPointChange(e.target.value)}
                  placeholder="예: 성삼재 주차장, 중산리 탐방안내소"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                  required
                />
              </div>

              {/* 날머리 (End Point) */}
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>날머리 (도착/하산 지점)</span>
                </label>
                <input
                  type="text"
                  value={endPoint}
                  onChange={(e) => {
                    setEndPoint(e.target.value);
                    if (isLoop && e.target.value !== startPoint) {
                      setIsLoop(false);
                    }
                  }}
                  placeholder="예: 성삼재 원점회귀, 화엄사 주차장"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * 코스는 지정하신 <strong>'{startPoint}'</strong>에서 시작하여{' '}
              <strong>'{endPoint}'</strong>(으)로 마무리되도록 설계됩니다.
            </p>
          </div>

          {/* TAB 1: AI Planner Settings */}
          {activeTab === 'AI' && (
            <div className="space-y-3.5">
              {/* Difficulty & Distance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">코스 난이도</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['하', '중', '상'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          difficulty === diff
                            ? diff === '하'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : diff === '중'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {diff} ({diff === '하' ? '초보' : diff === '중' ? '보통' : '고급'})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                    <span>
                      목표 거리: <strong>{distanceKm} km</strong>
                    </span>
                    <span className="text-slate-400 font-normal">8인 권장: 8~15km</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="22"
                    step="1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full accent-emerald-600 mt-2"
                  />
                </div>
              </div>

              {/* Priority Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">우선순위 테마</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    '경치 & 쉼터 배려',
                    '현지 맛집 & 먹거리',
                    '완만한 숲길 힐링',
                    '인생샷 포토존 중심',
                    '대피소 온수/간식 휴식',
                  ].map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setPriority(theme)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        priority === theme
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  자유 요청사항 (AI 전달 메모)
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="예: 체력이 약한 멤버 3명을 배려해서 중간에 그늘 쉼터가 많고 점심에 산채비빔밥을 먹을 수 있는 코스로 짜줘."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* AI Generated Preview Box */}
              {generatedPlan && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      AI 플랜 맞춤 설계 완료!
                    </span>
                    <span className="text-xs text-emerald-700 font-mono font-bold">
                      {generatedPlan.totalDistance} • {generatedPlan.totalDuration}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{generatedPlan.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{generatedPlan.summary}</p>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] font-bold text-slate-600 mr-1">경유 동선:</span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      들머리: {startPoint}
                    </span>
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    {(generatedPlan.waypoints || []).slice(1, -1).map((wp: any, i: number) => (
                      <React.Fragment key={i}>
                        <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-slate-700">
                          {wp.name}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </React.Fragment>
                    ))}
                    <span className="text-[11px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold">
                      날머리: {endPoint}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setGeneratedPlan(null)}
                      className="text-slate-500 hover:text-slate-800 underline text-[11px] cursor-pointer"
                    >
                      조건 변경하여 다시 설계하기
                    </button>
                    <span className="text-[11px] text-emerald-700">
                      아래 '내 플랜으로 등록하기' 버튼을 누르면 즉시 후보 플랜에 반영됩니다.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Manual Course Input */}
          {activeTab === 'MANUAL' && (
            <form id="manual-plan-form" onSubmit={handleApplyManualPlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">플랜 제안 제목</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                  required
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">총 거리</label>
                  <input
                    type="text"
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    placeholder="12.0km"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">예상 시간</label>
                  <input
                    type="text"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="4시간 15분"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">고도 상승</label>
                  <input
                    type="text"
                    value={manualElevation}
                    onChange={(e) => setManualElevation(e.target.value)}
                    placeholder="+500m"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">1인 예상 비용</label>
                  <input
                    type="text"
                    value={manualCost}
                    onChange={(e) => setManualCost(e.target.value)}
                    placeholder="25,000원/인"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300"
                  />
                </div>
              </div>

              {/* Mid Waypoints List */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    중간 경유지 목록 ({manualWaypoints.length}개)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddManualWaypoint}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-300 px-2 py-1 rounded-lg hover:bg-emerald-50 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>경유지 추가</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {/* Fixed Start */}
                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-emerald-900">
                      [들머리 / 출발지] {startPoint}
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                      START
                    </span>
                  </div>

                  {/* Configurable Mid waypoints */}
                  {manualWaypoints.map((mw, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-2"
                    >
                      <span className="w-4 text-center font-bold text-slate-400">{idx + 1}</span>
                      <input
                        type="text"
                        value={mw.name}
                        onChange={(e) => {
                          const updated = [...manualWaypoints];
                          updated[idx].name = e.target.value;
                          setManualWaypoints(updated);
                        }}
                        placeholder="지점명 (예: 무넹기 쉼터)"
                        className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                      />
                      <select
                        value={mw.type}
                        onChange={(e) => {
                          const updated = [...manualWaypoints];
                          updated[idx].type = e.target.value as SpotType;
                          setManualWaypoints(updated);
                        }}
                        className="text-[11px] px-1.5 py-1 border border-slate-200 rounded bg-slate-50"
                      >
                        <option value="REST">휴식(REST)</option>
                        <option value="VIEW">전망(VIEW)</option>
                        <option value="FOOD">식사(FOOD)</option>
                        <option value="STAY">숙박(STAY)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualWaypoint(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Fixed End */}
                  <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200 text-xs flex items-center justify-between">
                    <span className="font-bold text-rose-900">
                      [날머리 / 도착지] {endPoint}
                    </span>
                    <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold">
                      END
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  플랜 소개 및 특징
                </label>
                <textarea
                  rows={2}
                  value={manualSummary}
                  onChange={(e) => setManualSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            닫기
          </button>

          <div className="flex items-center gap-2">
            {activeTab === 'AI' ? (
              !generatedPlan ? (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isLoading || !startPoint.trim() || !endPoint.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>들머리~날머리 동선 AI 설계 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>AI 플랜 자동 생성</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyAIPlan}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{currentMember.name}의 새 플랜으로 등록</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <button
                type="submit"
                form="manual-plan-form"
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>직접 작성한 새 플랜 등록</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
