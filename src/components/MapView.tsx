import React, { useState, useEffect, useRef } from 'react';
import { Waypoint, TrekPlan, Member } from '../types';
import L from 'leaflet';
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
  Minimize2,
  Columns,
  Square,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Compass,
} from 'lucide-react';

interface MapViewProps {
  plan: TrekPlan;
  currentMember: Member;
  selectedWaypointId: string | null;
  onSelectWaypoint: (waypointId: string) => void;
  onVoteSpot: (waypointId: string, isUp: boolean) => void;
  onOpenSpotComments: (waypoint: Waypoint) => void;
  onOpenAlternative: (waypoint: Waypoint) => void;
  mapLayout?: 'split' | 'wide' | 'fullscreen';
  onChangeMapLayout?: (layout: 'split' | 'wide' | 'fullscreen') => void;
  isMinimalMode?: boolean;
}

// Tile Layer configurations
const TILE_LAYERS = {
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      subdomains: ['a', 'b', 'c'],
      attribution: '© OpenTopoMap, © OpenStreetMap',
    },
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
  },
  standard: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
};

export const MapView: React.FC<MapViewProps> = ({
  plan,
  currentMember,
  selectedWaypointId,
  onSelectWaypoint,
  onVoteSpot,
  onOpenSpotComments,
  onOpenAlternative,
  mapLayout = 'split',
  onChangeMapLayout,
  isMinimalMode = false,
}) => {
  const [mapMode, setMapMode] = useState<'terrain' | 'satellite' | 'standard'>('terrain');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const waypoints = plan.waypoints || [];
  const selectedWaypoint = waypoints.find((w) => w.id === selectedWaypointId);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center to first waypoint or Seoul Namsan
    const initialLat = waypoints[0]?.lat || 37.5512;
    const initialLng = waypoints[0]?.lng || 126.9882;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add Tile Layer
    const currentConfig = TILE_LAYERS[mapMode];
    const tileLayer = L.tileLayer(currentConfig.url, currentConfig.options).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer group for markers and polyline
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    mapInstanceRef.current = map;

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapMode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const config = TILE_LAYERS[mapMode];
    tileLayerRef.current.setUrl(config.url);
  }, [mapMode]);

  // Update Markers & Polyline when waypoints, plan, or selectedWaypointId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    if (waypoints.length === 0) return;

    const latLngs: [number, number][] = [];

    // Helper for badge color classes
    const getBadgeClass = (type: string, isStart: boolean, isEnd: boolean, isSelected: boolean) => {
      let base = '';
      if (isStart) base = 'bg-emerald-600 text-white border-emerald-300';
      else if (isEnd) base = 'bg-rose-600 text-white border-rose-300';
      else if (type === 'REST') base = 'bg-blue-600 text-white border-blue-300';
      else if (type === 'FOOD') base = 'bg-amber-600 text-white border-amber-300';
      else if (type === 'VIEW') base = 'bg-purple-600 text-white border-purple-300';
      else if (type === 'STAY') base = 'bg-indigo-600 text-white border-indigo-300';
      else base = 'bg-slate-700 text-white border-slate-400';

      if (isSelected) {
        base += ' ring-4 ring-emerald-400 ring-offset-1 shadow-2xl scale-110';
      }
      return base;
    };

    // Render Markers for each Waypoint
    waypoints.forEach((wp, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === waypoints.length - 1;
      const isSelected = wp.id === selectedWaypointId;

      latLngs.push([wp.lat, wp.lng]);

      const labelPrefix = isStart ? '🚩 들머리' : isEnd ? '🏁 날머리' : `${idx + 1}`;
      const badgeClass = getBadgeClass(wp.type, isStart, isEnd, isSelected);

      const customIcon = L.divIcon({
        className: 'leaflet-trek-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        html: `
          <div style="position: absolute; transform: translate(-50%, -100%); cursor: pointer; white-space: nowrap;">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-md border-2 font-bold text-xs select-none transition-transform ${badgeClass}">
              <span class="text-[10px] font-black">${labelPrefix}</span>
              <span class="max-w-[100px] truncate text-[11px]">${wp.name}</span>
              ${wp.elevation ? `<span class="text-[9px] opacity-85 font-mono">${wp.elevation}m</span>` : ''}
              ${wp.upVotes.length > 0 ? `<span class="ml-0.5 bg-black/25 px-1 py-0.2 rounded text-[9px]">👍${wp.upVotes.length}</span>` : ''}
              ${wp.comments.length > 0 ? `<span class="bg-black/25 px-1 py-0.2 rounded text-[9px]">💬${wp.comments.length}</span>` : ''}
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #1e293b; margin: -1px auto 0 auto; opacity: 0.85;"></div>
          </div>
        `,
      });

      const marker = L.marker([wp.lat, wp.lng], { icon: customIcon, zIndexOffset: isSelected ? 1000 : idx });
      marker.on('click', () => {
        onSelectWaypoint(wp.id);
        map.panTo([wp.lat, wp.lng], { animate: true });
      });

      layerGroup.addLayer(marker);
    });

    // Outer glow polyline
    const glowPolyline = L.polyline(latLngs, {
      color: mapMode === 'satellite' ? '#34d399' : '#059669',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    });
    layerGroup.addLayer(glowPolyline);

    // Main dash polyline
    const mainPolyline = L.polyline(latLngs, {
      color: mapMode === 'satellite' ? '#10b981' : '#047857',
      weight: 4.5,
      opacity: 0.95,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round',
    });
    layerGroup.addLayer(mainPolyline);

    // Auto fit bounds to show all waypoints
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
    }
  }, [waypoints, plan.id, selectedWaypointId, mapMode]);

  // Fit bounds helper
  const fitBounds = () => {
    if (!mapInstanceRef.current || waypoints.length === 0) return;
    const latLngs: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);
    mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [55, 55], maxZoom: 16 });
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

  // Center coordinate label for info badge
  const centerLat = waypoints[0]?.lat ? (waypoints.reduce((acc, w) => acc + w.lat, 0) / waypoints.length).toFixed(4) : '37.5512';
  const centerLng = waypoints[0]?.lng ? (waypoints.reduce((acc, w) => acc + w.lng, 0) / waypoints.length).toFixed(4) : '126.9882';

  return (
    <div className="relative w-full h-[450px] lg:h-full min-h-[440px] bg-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Real Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        id="leaflet-interactive-map"
      />

      {/* Top Map Controls (Z-index 1000 to overlay above Leaflet) */}
      <div className="relative z-[1000] m-3 flex items-center justify-between pointer-events-none gap-2">
        {/* Layer Selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/90 shadow-md text-xs font-semibold text-slate-700">
          <button
            onClick={() => setMapMode('terrain')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              mapMode === 'terrain' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100'
            }`}
          >
            등산 지형도
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              mapMode === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100'
            }`}
          >
            위성 지도
          </button>
          <button
            onClick={() => setMapMode('standard')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              mapMode === 'standard' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:bg-slate-100'
            }`}
          >
            일반 지도
          </button>
        </div>

        {/* Destination Location Chip (Cleaned: no raw coordinates) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-700">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-slate-800">
            {plan.title.includes('남산') ? '서울 남산' : plan.title.includes('북한산') ? '북한산' : plan.title.includes('관악산') ? '관악산' : plan.title.includes('설악산') ? '설악산' : '지리산'}
          </span>
        </div>

        {/* Zoom & Fit Bounds controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-slate-200/90 shadow-md">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
            title="지도 확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors cursor-pointer"
            title="지도 축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <button
            onClick={fitBounds}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            title="전체 코스 한눈에 맞추기"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">코스 맞춤</span>
          </button>

          {onChangeMapLayout && (
            <>
              <div className="w-px h-4 bg-slate-200 mx-0.5" />
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded">
                <button
                  onClick={() => onChangeMapLayout('split')}
                  className={`px-1.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    mapLayout === 'split' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="기본 분할 뷰 (경계선을 좌우로 드래그하여 크기 조절 가능)"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">분할 (조절)</span>
                </button>
                <button
                  onClick={() => onChangeMapLayout('wide')}
                  className={`px-1.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    mapLayout === 'wide' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="넓은 지도 뷰 (지도 확장)"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">확장</span>
                </button>
                <button
                  onClick={() => onChangeMapLayout(mapLayout === 'fullscreen' ? 'split' : 'fullscreen')}
                  className={`px-1.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    mapLayout === 'fullscreen' ? 'bg-[#064e3b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={mapLayout === 'fullscreen' ? '전체화면 종료' : '지도 전체화면'}
                >
                  {mapLayout === 'fullscreen' ? (
                    <Minimize2 className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline text-[11px]">
                    {mapLayout === 'fullscreen' ? '축소' : '전체'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Popup Card for Selected Waypoint (Z-index 1000) */}
      {selectedWaypoint && (
        <div className="relative z-[1000] m-3 p-3 sm:p-4 bg-white/98 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl max-w-xl self-center w-[calc(100%-24px)] transition-all animate-in fade-in slide-in-from-bottom-3">
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
                <div className="flex items-center gap-2 flex-wrap">
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
                      ? '들머리 (출발지)'
                      : selectedWaypoint.type === 'REST'
                      ? '휴식/쉼터'
                      : selectedWaypoint.type === 'FOOD'
                      ? '식사/식당'
                      : selectedWaypoint.type === 'VIEW'
                      ? '전망/포토존'
                      : selectedWaypoint.type === 'STAY'
                      ? '숙박/대피소'
                      : '날머리 (도착지)'}
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
                    <span><strong>트레킹 가이드:</strong> {selectedWaypoint.aiNote}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Close popup */}
            <button
              onClick={() => onSelectWaypoint('')}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs shrink-0 font-bold cursor-pointer"
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
                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                title="인근 대체 휴식처나 명소를 추천합니다"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>AI 대안 장소</span>
              </button>

              <button
                onClick={() => onOpenSpotComments(selectedWaypoint)}
                className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                <span>의견 {selectedWaypoint.comments.length}개</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status indicator bar (Hidden in minimal mode) */}
      {!isMinimalMode && (
        <div className="relative z-[1000] m-3 flex items-center justify-between text-[11px] text-slate-600 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>실제 지도 기반 트레킹 경로 • 마커 클릭 시 지점별 피드백 및 의견 작성</span>
          </div>
          <div className="hidden sm:block text-slate-400">
            마우스 드래그로 지도 이동 • 휠 스크롤로 확대/축소
          </div>
        </div>
      )}
    </div>
  );
};
