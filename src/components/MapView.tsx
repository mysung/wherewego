import React, { useState, useEffect, useRef } from 'react';
import { Waypoint, TrekPlan, Member } from '../types';
import {
  MapPin,
  Flag,
  Coffee,
  Utensils,
  Camera,
  Home,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';

interface MapViewProps {
  plan: TrekPlan;
  currentMember: Member;
  selectedWaypointId: string | null;
  onSelectWaypoint: (waypointId: string) => void;
  onVoteSpot: (waypointId: string, isUp: boolean) => void;
  onOpenSpotComments: (waypoint: Waypoint) => void;
  onOpenAlternative: (waypoint: Waypoint) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  plan,
  currentMember,
  selectedWaypointId,
  onSelectWaypoint,
  onVoteSpot,
  onOpenSpotComments,
  onOpenAlternative,
}) => {
  const [mapMode, setMapMode] = useState<'terrain' | 'satellite' | 'standard'>('terrain');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const waypoints = plan.waypoints;
  const selectedWaypoint = waypoints.find((w) => w.id === selectedWaypointId);

  // Calculate bounding box for auto fit-bounds on plan change
  const lats = waypoints.map((w) => w.lat);
  const lngs = waypoints.map((w) => w.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Auto reset pan & zoom when plan changes
  useEffect(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, [plan.id]);

  // Convert GPS (lat, lng) into percentage coordinates inside the bounding box
  const getCoordinates = (lat: number, lng: number) => {
    const latSpan = maxLat - minLat || 0.01;
    const lngSpan = maxLng - minLng || 0.01;

    // Normalizing with padding
    const padding = 15; // 15% inner padding
    const usableWidth = 100 - padding * 2;
    const usableHeight = 100 - padding * 2;

    const x = padding + ((lng - minLng) / lngSpan) * usableWidth;
    // Invert lat because higher lat is North (top)
    const y = 100 - (padding + ((lat - minLat) / latSpan) * usableHeight);

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const fitBounds = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getSpotIcon = (type: string, isSmall = false) => {
    const sizeClass = isSmall ? 'w-3 h-3' : 'w-4 h-4';
    switch (type) {
      case 'START':
        return <Flag className={sizeClass} />;
      case 'REST':
        return <Coffee className={sizeClass} />;
      case 'FOOD':
        return <Utensils className={sizeClass} />;
      case 'VIEW':
        return <Camera className={sizeClass} />;
      case 'STAY':
        return <Home className={sizeClass} />;
      case 'END':
        return <MapPin className={sizeClass} />;
      default:
        return <MapPin className={sizeClass} />;
    }
  };

  const getSpotColor = (type: string) => {
    switch (type) {
      case 'START':
        return 'bg-emerald-600 text-white border-emerald-400';
      case 'REST':
        return 'bg-blue-600 text-white border-blue-400';
      case 'FOOD':
        return 'bg-amber-600 text-white border-amber-400';
      case 'VIEW':
        return 'bg-purple-600 text-white border-purple-400';
      case 'STAY':
        return 'bg-indigo-600 text-white border-indigo-400';
      case 'END':
        return 'bg-rose-600 text-white border-rose-400';
      default:
        return 'bg-slate-700 text-white border-slate-500';
    }
  };

  // Generate SVG path for waypoints polyline
  const polylinePoints = waypoints
    .map((wp) => {
      const { x, y } = getCoordinates(wp.lat, wp.lng);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full h-[450px] lg:h-full min-h-[440px] bg-slate-900 overflow-hidden select-none flex flex-col justify-between">
      {/* Map Layer Background Simulation (Terrain / Satellite / Standard) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-colors duration-300 ${
          mapMode === 'terrain'
            ? 'bg-[#e2e8dd]'
            : mapMode === 'satellite'
            ? 'bg-[#1b2b25]'
            : 'bg-[#f4f3f0]'
        }`}
        style={{
          backgroundImage:
            mapMode === 'terrain'
              ? 'radial-gradient(#b8c5b0 1.5px, transparent 1.5px), radial-gradient(#d3ded0 1.5px, transparent 1.5px)'
              : mapMode === 'satellite'
              ? 'radial-gradient(#143323 2px, transparent 2px)'
              : 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize:
            mapMode === 'terrain' ? '30px 30px, 60px 60px' : '40px 40px',
        }}
      >
        {/* Mountain Contour Lines effect for Trekking context */}
        {mapMode === 'terrain' && (
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="contours" width="160" height="160" patternUnits="userSpaceOnUse">
                <circle cx="80" cy="80" r="40" fill="none" stroke="#2e583c" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="#2e583c" strokeWidth="1.2" />
                <circle cx="80" cy="80" r="100" fill="none" stroke="#2e583c" strokeWidth="0.8" />
                <circle cx="80" cy="80" r="130" fill="none" stroke="#2e583c" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contours)" />
          </svg>
        )}

        {/* Scalable Container for SVG Route & Pins */}
        <div
          className="absolute inset-0 origin-center transition-transform duration-100"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* SVG Polyline connecting waypoints */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Outer glow shadow */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={mapMode === 'satellite' ? '#34d399' : '#059669'}
              strokeWidth="1.8"
              strokeOpacity="0.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main trekking polyline */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke={mapMode === 'satellite' ? '#10b981' : '#047857'}
              strokeWidth="0.9"
              strokeDasharray="2 1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path segment markers / distance ticks */}
            {waypoints.map((wp, idx) => {
              if (idx === waypoints.length - 1) return null;
              const nextWp = waypoints[idx + 1];
              const pt1 = getCoordinates(wp.lat, wp.lng);
              const pt2 = getCoordinates(nextWp.lat, nextWp.lng);
              const midX = (pt1.x + pt2.x) / 2;
              const midY = (pt1.y + pt2.y) / 2;

              return (
                <circle
                  key={`mid-${idx}`}
                  cx={midX}
                  cy={midY}
                  r="0.8"
                  fill="#ffffff"
                  stroke="#047857"
                  strokeWidth="0.4"
                />
              );
            })}
          </svg>

          {/* Render Waypoint Pins */}
          {waypoints.map((wp, idx) => {
            const { x, y } = getCoordinates(wp.lat, wp.lng);
            const isSelected = wp.id === selectedWaypointId;
            const hasUpvoted = wp.upVotes.includes(currentMember.id);
            const hasDownvoted = wp.downVotes.includes(currentMember.id);

            return (
              <div
                key={wp.id}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-20 transition-all ${
                  isSelected ? 'z-30 scale-125' : 'hover:scale-115'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWaypoint(wp.id);
                }}
              >
                {/* Pin Head */}
                <div
                  className={`relative cursor-pointer shadow-md rounded-full px-2 py-1 flex items-center gap-1 border-2 font-bold text-xs ${getSpotColor(
                    wp.type
                  )} ${isSelected ? 'ring-4 ring-emerald-400' : ''}`}
                >
                  <span className="text-[10px] opacity-90">{idx + 1}.</span>
                  {getSpotIcon(wp.type, true)}
                  <span className="max-w-[85px] sm:max-w-[120px] truncate text-[11px] font-semibold">
                    {wp.name}
                  </span>

                  {/* Feedback summary pill */}
                  {wp.upVotes.length > 0 && (
                    <span className="ml-0.5 bg-black/25 text-[10px] px-1 rounded-full flex items-center gap-0.5">
                      👍{wp.upVotes.length}
                    </span>
                  )}
                  {wp.comments.length > 0 && (
                    <span className="bg-black/25 text-[10px] px-1 rounded-full flex items-center gap-0.5">
                      💬{wp.comments.length}
                    </span>
                  )}
                </div>

                {/* Pin pointer tick */}
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-800 mx-auto -mt-0.5 opacity-80" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Map Controls: Layer switcher, GPS info */}
      <div className="relative z-20 m-3 flex items-center justify-between pointer-events-none">
        {/* Layer Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700">
          <button
            onClick={() => setMapMode('terrain')}
            className={`px-2 py-1 rounded transition-colors ${
              mapMode === 'terrain' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'
            }`}
          >
            등산 지형도
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-1 rounded transition-colors ${
              mapMode === 'satellite' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'
            }`}
          >
            위성 지도
          </button>
          <button
            onClick={() => setMapMode('standard')}
            className={`px-2 py-1 rounded transition-colors ${
              mapMode === 'standard' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100'
            }`}
          >
            표준 뷰
          </button>
        </div>

        {/* Zoom & Fit Bounds controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/90 shadow-sm">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="지도 확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
            title="지도 축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <button
            onClick={fitBounds}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 transition-colors"
            title="전체 경로 한눈에 보기"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">경로 맞춤</span>
          </button>
        </div>
      </div>

      {/* Bottom Popup Card for Selected Waypoint */}
      {selectedWaypoint && (
        <div className="relative z-30 m-3 p-3 sm:p-4 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl max-w-xl self-center w-[calc(100%-24px)] transition-all animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div
                className={`p-2 rounded-lg shrink-0 ${getSpotColor(
                  selectedWaypoint.type
                )}`}
              >
                {getSpotIcon(selectedWaypoint.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {selectedWaypoint.name}
                  </h4>
                  {selectedWaypoint.elevation && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                      해발 {selectedWaypoint.elevation}m
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                    {selectedWaypoint.type === 'START'
                      ? '출발지'
                      : selectedWaypoint.type === 'REST'
                      ? '휴식/쉼터'
                      : selectedWaypoint.type === 'FOOD'
                      ? '식사/식당'
                      : selectedWaypoint.type === 'VIEW'
                      ? '전망/포토존'
                      : selectedWaypoint.type === 'STAY'
                      ? '숙박/대피소'
                      : '도착지'}
                  </span>
                </div>
                {selectedWaypoint.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {selectedWaypoint.description}
                  </p>
                )}
                {selectedWaypoint.aiNote && (
                  <div className="mt-1.5 flex items-start gap-1.5 bg-emerald-50/80 border border-emerald-200/60 p-2 rounded-lg text-xs text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>트레킹 AI 조언:</strong> {selectedWaypoint.aiNote}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Close popup */}
            <button
              onClick={() => onSelectWaypoint('')}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs shrink-0 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Action Row: Spot Feedback (좋아요/글쎄요) + Comment Thread + AI Alternative */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">지점 피드백:</span>
              <button
                onClick={() => onVoteSpot(selectedWaypoint.id, true)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  selectedWaypoint.upVotes.includes(currentMember.id)
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>좋아요</span>
                <span className="font-bold">{selectedWaypoint.upVotes.length}</span>
              </button>

              <button
                onClick={() => onVoteSpot(selectedWaypoint.id, false)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                  selectedWaypoint.downVotes.includes(currentMember.id)
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>글쎄요</span>
                <span className="font-bold">{selectedWaypoint.downVotes.length}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAlternative(selectedWaypoint)}
                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                title="Gemini AI가 인근 대체 휴식처나 명소를 추천합니다"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>AI 대안 장소</span>
              </button>

              <button
                onClick={() => onOpenSpotComments(selectedWaypoint)}
                className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold transition-colors"
              >
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                <span>의견 {selectedWaypoint.comments.length}개</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status indicator bar */}
      <div className="relative z-20 m-3 flex items-center justify-between text-[11px] text-slate-500 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-md border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>8인 그룹 동선 비교 모드 • 마커 클릭 시 지점별 찬반 & 의견 등록 가능</span>
        </div>
        <div className="hidden sm:block">
          마우스 드래그로 지도 이동 / 마우스 휠 또는 우측 상단 버튼으로 확대·축소
        </div>
      </div>
    </div>
  );
};
