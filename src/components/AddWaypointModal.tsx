import React, { useState } from 'react';
import { SpotType, Waypoint } from '../types';
import { Plus, X, MapPin } from 'lucide-react';

interface AddWaypointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWaypoint: (waypoint: Omit<Waypoint, 'id' | 'upVotes' | 'downVotes' | 'comments'>) => void;
}

export const AddWaypointModal: React.FC<AddWaypointModalProps> = ({
  isOpen,
  onClose,
  onAddWaypoint,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<SpotType>('REST');
  const [elevation, setElevation] = useState(1100);
  const [description, setDescription] = useState('');
  const [aiNote, setAiNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddWaypoint({
      name: name.trim(),
      type,
      lat: 35.31 + (Math.random() - 0.5) * 0.02,
      lng: 127.53 + (Math.random() - 0.5) * 0.02,
      elevation: Number(elevation) || 1000,
      description: description.trim(),
      aiNote: aiNote.trim(),
    });

    setName('');
    setDescription('');
    setAiNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">새 경유지 추가</h3>
              <p className="text-xs text-slate-500">현재 플랜에 새로운 쉼터, 식당, 또는 전망대를 추가합니다</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">지점명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 뱀사골 단풍 쉼터"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">구분 유형</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SpotType)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="START">출발지 (START)</option>
                <option value="REST">휴식/쉼터 (REST)</option>
                <option value="FOOD">식사/식당 (FOOD)</option>
                <option value="VIEW">전망/포토존 (VIEW)</option>
                <option value="STAY">숙박/대피소 (STAY)</option>
                <option value="END">도착지 (END)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">예상 고도 (m)</label>
              <input
                type="number"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">지점 상세 설명</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="지점에 대한 설명과 편의시설(식수, 화장실 등)"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">안전 및 체력 메모</label>
            <input
              type="text"
              value={aiNote}
              onChange={(e) => setAiNote(e.target.value)}
              placeholder="예: 경사 급함, 15분 휴식 권장"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              지점 추가 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
