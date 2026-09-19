import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  RotateCcw,
  MapPin,
  Calendar,
  Users,
  Upload,
} from 'lucide-react';
import { TrekSpace, TrekPlan } from '../types';

export interface BannerPreset {
  id: string;
  name: string;
  location: string;
  tag: string;
  url: string;
  mood: string;
}

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: 'misty-ridge',
    name: '운무와 여명이 머무는 지리산 능선',
    location: '지리산 노고단~천왕봉',
    tag: '장엄한 운해',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=80',
    mood: '새벽 안개를 뚫고 마주하는 가슴 벅찬 산마루의 장관',
  },
  {
    id: 'pine-forest',
    name: '피톤치드 쏟아지는 아침 숲길',
    location: '설악산 주전골 & 사려니 숲',
    tag: '피톤치드 힐링',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1800&q=80',
    mood: '흙내음과 바람 소리를 따라 걷는 고요한 치유의 걸음',
  },
  {
    id: 'golden-ridge',
    name: '황금빛 억새와 능선 파노라마',
    location: '영남알프스 간월재~신불산',
    tag: '가을 억새 은빛길',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=80',
    mood: '은빛 물결 사이로 펼쳐지는 완만한 능선 트레킹',
  },
  {
    id: 'rocky-peak',
    name: '웅장한 바위 암릉과 청명한 하늘',
    location: '북한산 백운대 암릉',
    tag: '쾌적한 바위 능선',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80',
    mood: '발아래 펼쳐진 풍경을 굽어보는 시원한 조망의 순간',
  },
  {
    id: 'hallasan-trail',
    name: '한라산 영실코스 기암괴석과 구름길',
    location: '제주 한라산 영실~윗세오름',
    tag: '제주 비경',
    url: '/hallasan-yeongsil.jpg',
    mood: '사계절 변화무쌍한 구름과 화산석이 빚어낸 천혜의 산책로',
  },
  {
    id: 'autumn-trail',
    name: '오색 단풍으로 물든 계곡 산길',
    location: '내장산 & 오대산 선재길',
    tag: '단풍 시즌 트레킹',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
    mood: '바스락거리는 낙엽을 밟으며 걷는 가을 정취의 정점',
  },
  {
    id: 'alpine-lake',
    name: '청록빛 호수와 만년설 고산 트레킹',
    location: '스위스 알프스 고산 트레일',
    tag: '이국적 절경',
    url: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&w=1800&q=80',
    mood: '자연의 웅장함에 압도되는 일생일대의 고산 산책',
  },
  {
    id: 'valley-creek',
    name: '맑은 계곡물과 숲그늘 쉼터',
    location: '설악산 천불동 계곡길',
    tag: '청량한 계곡길',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1800&q=80',
    mood: '시원한 물소리를 길동무 삼아 걷는 청량한 트레킹',
  },
];

const STORAGE_BANNER_KEY = 'wherewego_trek_banner_img_v3';
const STORAGE_COLLAPSED_KEY = 'wherewego_trek_banner_collapsed_v1';

interface TrekHeroBannerProps {
  space: TrekSpace;
  activePlan: TrekPlan;
}

export const TrekHeroBanner: React.FC<TrekHeroBannerProps> = ({ space, activePlan }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current active background image
  const [currentImage, setCurrentImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BANNER_KEY) || localStorage.getItem('wherewego_trek_banner_img_v2');
      if (saved) {
        // If previous saved image was the old incorrect photo, migrate to authentic Hallasan
        if (saved.includes('1578632767115-351597cf2477')) {
          return '/hallasan-yeongsil.jpg';
        }
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return BANNER_PRESETS[0].url;
  });

  // Modal open for changing banner image
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Save changes to localStorage
  const handleSelectImage = (url: string) => {
    setCurrentImage(url);
    try {
      localStorage.setItem(STORAGE_BANNER_KEY, url);
    } catch (e) {
      console.error(e);
    }
    setIsModalOpen(false);
    setUploadError(null);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    handleSelectImage(customUrlInput.trim());
    setCustomUrlInput('');
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    // Check size (under 6MB)
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('이미지 파일 크기는 6MB 이하로 업로드해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        handleSelectImage(dataUrl);
      }
    };
    reader.onerror = () => {
      setUploadError('이미지 파일을 읽는 도중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, String(next));
    } catch (e) {
      console.error(e);
    }
  };

  const activePreset = BANNER_PRESETS.find((p) => p.url === currentImage);

  return (
    <div className="relative w-full border-b border-slate-200 overflow-hidden bg-slate-900 select-none">
      {/* 1. Background Image with Rich Forest Green & Deep Wine Vignette Gradient */}
      <div
        className={`relative w-full transition-all duration-300 overflow-hidden bg-slate-900 ${
          isCollapsed ? 'h-14 sm:h-16' : 'h-36 sm:h-44 md:h-48'
        }`}
      >
        <img
          src={currentImage}
          alt="트레킹 배경 파노라마"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== BANNER_PRESETS[0].url) {
              target.src = BANNER_PRESETS[0].url;
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-500"
        />

        {/* Dual Tone Atmosphere Overlay:
            Left/Top: Deep Forest Green (#064e3b/55%)
            Right/Bottom: Sophisticated Wine Bordeaux (#881337/50%)
            Center: Natural scenic transparency with subtle darkening for crystal-clear readability
        */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/60 via-slate-900/35 to-[#881337]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />

        {/* 2. Banner Content Layer */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between">
          {/* Left Text Block */}
          <div className="max-w-2xl text-white">
            {/* Tag / Category Badge (Forest Green & Wine Accent) */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#064e3b] text-emerald-200 border border-emerald-400/40 shadow-xs">
                <Compass className="w-3 h-3 text-emerald-300" />
                <span>단체 트레킹</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#881337] text-rose-100 border border-rose-400/40 shadow-xs">
                <Sparkles className="w-3 h-3 text-rose-200" />
                <span>
                  {activePlan?.difficulty === '상'
                    ? '도전 암릉 코스'
                    : activePlan?.difficulty === '중'
                    ? '능선 종주 산행'
                    : '힐링 둘레길'}
                </span>
              </span>

              {activePlan && (
                <span className="text-[11px] text-emerald-100/90 hidden sm:inline-flex items-center gap-1">
                  <span>선택된 코스:</span>
                  <strong className="text-white font-semibold underline decoration-emerald-300">
                    {activePlan.title}
                  </strong>
                </span>
              )}
            </div>

            {/* Headline Title */}
            {!isCollapsed ? (
              <>
                <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-md leading-snug">
                  {activePlan ? activePlan.title : space.title}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 line-clamp-1 drop-shadow font-medium">
                  {activePlan?.summary ||
                    `맑은 공기와 푸른 능선 속에서 ${space.members.length}명이 함께 완성해나가는 최적의 트레킹 여정`}
                </p>

                {/* Sub info row: date, location, trail summary */}
                <div className="mt-2.5 flex items-center gap-3 sm:gap-4 text-xs text-white/85 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{space.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-300" />
                    <span>
                      {activePlan?.startPoint
                        ? `${activePlan.startPoint} ~ ${activePlan.endPoint || '원점회귀'}`
                        : space.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 hidden md:flex">
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>
                      {space.members.length}인 참여 중 (현재 {activePlan?.votes.length || 0}표 확보)
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* Compact bar when collapsed */
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-white truncate">
                  {activePlan ? activePlan.title : space.title}
                </h2>
                <span className="text-xs text-emerald-200/90 hidden sm:inline">
                  • {activePlan?.startPoint || space.destination} ({activePlan?.votes.length || 0}표)
                </span>
              </div>
            )}
          </div>

          {/* Right Action Controls: Change Image & Toggle Size */}
          <div className="flex items-center gap-2 shrink-0 self-center">
            {/* Change Image Button (Wine Burgundy Point) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#881337] hover:bg-[#9f1239] text-white border border-rose-400/40 shadow-sm transition-all hover:scale-105 cursor-pointer backdrop-blur-xs"
              title="상단 트레킹 배경 이미지를 다른 멋진 풍경이나 내 사진으로 교체합니다"
            >
              <Camera className="w-3.5 h-3.5 text-rose-200" />
              <span>이미지 변경</span>
            </button>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/90 border border-white/20 transition-colors cursor-pointer"
              title={isCollapsed ? '배너 펼치기' : '배너 접기'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-emerald-300" />
              ) : (
                <ChevronUp className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Image Selector & Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
            {/* Modal Header (Forest Green & Wine Theme) */}
            <div className="bg-gradient-to-r from-[#064e3b] to-[#881337] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">최상단 트레킹 배경 이미지 교체</h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    추천 트레킹 명소 프리셋, 내 컴퓨터/스마트폰 사진 업로드 또는 이미지 URL로 변경할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="mx-4 mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {uploadError}
              </div>
            )}

            {/* Content area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Option A: Presets */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>추천 트레킹 명소 갤러리 (8종)</span>
                  <span className="text-[11px] text-[#064e3b] font-medium">원하는 카드를 누르면 바로 교체됩니다</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BANNER_PRESETS.map((preset) => {
                    const isSelected = currentImage === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectImage(preset.url)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#064e3b] ring-2 ring-emerald-400 shadow-md scale-[1.01]'
                            : 'border-slate-200 hover:border-[#881337] hover:shadow-md'
                        }`}
                      >
                        {/* Preset Thumbnail */}
                        <div className="h-28 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                          {/* Selected Check Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#064e3b] text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span>현재 적용중</span>
                            </div>
                          )}

                          {/* Tag */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-medium">
                            {preset.tag}
                          </div>

                          {/* Preset Name & Location */}
                          <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                            <h4 className="text-xs font-bold truncate leading-tight drop-shadow">
                              {preset.name}
                            </h4>
                            <p className="text-[10px] text-slate-200 truncate mt-0.5">
                              {preset.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Option B: Local File Upload */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#064e3b]" />
                      <span>내 PC 또는 스마트폰의 트레킹 사진 업로드</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      직접 촬영한 산행 사진을 선택하면 상단 배너로 즉시 적용됩니다.
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>사진 선택</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Option C: Direct Image URL input */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#881337]" />
                  <span>웹 이미지 URL 직접 입력</span>
                </div>
                <form onSubmit={handleApplyCustomUrl} className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/... 또는 웹 이미지 링크"
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#881337] hover:bg-[#9f1239] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    URL 적용
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => handleSelectImage(BANNER_PRESETS[0].url)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>지리산 기본 풍경으로 복원</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
