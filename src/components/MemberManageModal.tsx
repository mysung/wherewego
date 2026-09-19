import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { INITIAL_MEMBERS } from '../data/initialData';
import {
  Users,
  X,
  Crown,
  RotateCcw,
  Check,
  UserPlus,
  Trash2,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface MemberManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentMember: Member;
  onSaveMembers: (updatedMembers: Member[]) => void;
}

const AVATAR_PALETTE = [
  '#064e3b',
  '#881337',
  '#0284c7',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#059669',
  '#ea580c',
  '#4f46e5',
  '#0891b2',
  '#16a34a',
  '#be123c',
  '#4338ca',
  '#ca8a04',
];

export const MemberManageModal: React.FC<MemberManageModalProps> = ({
  isOpen,
  onClose,
  members,
  currentMember,
  onSaveMembers,
}) => {
  const [editedMembers, setEditedMembers] = useState<Member[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedMembers(JSON.parse(JSON.stringify(members)));
      setErrorMessage(null);
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

  // Add a new member
  const handleAddMember = () => {
    const nextIdx = editedMembers.length + 1;
    const newId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMember: Member = {
      id: newId,
      name: `멤버${nextIdx}`,
      gender: nextIdx % 2 === 0 ? 'F' : 'M',
      role: '멤버',
      avatarColor: AVATAR_PALETTE[(nextIdx - 1) % AVATAR_PALETTE.length],
      fitnessLevel: '중',
    };
    setEditedMembers((prev) => [...prev, newMember]);
    setErrorMessage(null);
  };

  // Delete a member
  const handleDeleteMember = (targetId: string) => {
    if (editedMembers.length <= 1) {
      setErrorMessage('트레킹 모임에는 최소 1명 이상의 참여 멤버가 필요합니다.');
      return;
    }

    const targetMember = editedMembers.find((m) => m.id === targetId);
    const remaining = editedMembers.filter((m) => m.id !== targetId);

    // If deleting the host, assign host to the first remaining member
    if (targetMember?.role === '방장' && remaining.length > 0) {
      remaining[0].role = '방장';
    }

    setEditedMembers(remaining);
    setErrorMessage(null);
  };

  // Change a member's name
  const handleNameChange = (id: string, newName: string) => {
    setEditedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name: newName } : m))
    );
    if (errorMessage) setErrorMessage(null);
  };

  // Change gender
  const handleGenderChange = (id: string, gender: 'M' | 'F') => {
    setEditedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, gender } : m))
    );
  };

  // Change fitness level
  const handleFitnessChange = (id: string, fitnessLevel: '상' | '중' | '하') => {
    setEditedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, fitnessLevel } : m))
    );
  };

  // Set host/leader (방장)
  const handleSetHost = (targetId: string) => {
    setEditedMembers((prev) =>
      prev.map((m) => ({
        ...m,
        role: m.id === targetId ? '방장' : '멤버',
      }))
    );
  };

  // Reset to default names and roles
  const handleResetToDefault = () => {
    setEditedMembers(JSON.parse(JSON.stringify(INITIAL_MEMBERS)));
    setErrorMessage(null);
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editedMembers.length === 0) {
      setErrorMessage('최소 1명 이상의 멤버가 필요합니다.');
      return;
    }

    // Validation: ensure all names are non-empty
    for (const m of editedMembers) {
      if (!m.name.trim()) {
        setErrorMessage('모든 참여 멤버의 이름을 1자 이상 입력해주세요.');
        return;
      }
    }

    // Ensure at least one host exists
    const hasHost = editedMembers.some((m) => m.role === '방장');
    const finalMembers = editedMembers.map((m, idx) => ({
      ...m,
      name: m.name.trim(),
      role: !hasHost && idx === 0 ? ('방장' as const) : m.role,
    }));

    onSaveMembers(finalMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#064e3b] border border-emerald-200 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  참여 인원 관리 및 멤버 설정
                </h3>
                <span className="text-xs font-bold bg-emerald-50 text-[#064e3b] px-2.5 py-0.5 rounded-full border border-emerald-200">
                  현재 총 {editedMembers.length}명 참여
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                멤버를 추가하거나 삭제하고, 이름·성별·체력 및 방장 권한을 자유롭게 조정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-[#881337] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#881337] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top Action: Add Member Button */}
        <div className="mt-3.5 flex items-center justify-between gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600">
            새로운 산행 친구가 합류했나요? 인원을 추가해보세요.
          </div>
          <button
            type="button"
            onClick={handleAddMember}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#064e3b] hover:bg-[#047857] transition-all shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>멤버 추가</span>
          </button>
        </div>

        {/* Form list of members */}
        <form onSubmit={handleSave} className="mt-3">
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2.5">
            {editedMembers.map((member, idx) => {
              const isCurrent = member.id === currentMember.id;
              const isHost = member.role === '방장';

              return (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHost
                      ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                      : isCurrent
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Left: Avatar & Name Input */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs border-2 border-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name ? member.name.slice(0, 1) : `${idx + 1}`}
                    </div>

                    <div className="w-16 sm:w-20 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-700">
                          {idx + 1}번
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold text-[#064e3b] bg-emerald-100 px-1 py-0.2 rounded">
                            나
                          </span>
                        )}
                      </div>
                      <div className="text-[11px]">
                        {isHost ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-800 font-bold">
                            <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                            방장
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">참여 멤버</span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Name Input */}
                    <div className="flex-1 min-w-[100px]">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleNameChange(member.id, e.target.value)}
                        placeholder={`멤버 ${idx + 1} 이름`}
                        maxLength={10}
                        className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  {/* Right: Gender, Fitness Level, Host Assign Button, Delete Button */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap shrink-0">
                    {/* Gender toggle */}
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleGenderChange(member.id, 'F')}
                        className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          member.gender === 'F'
                            ? 'bg-pink-100 text-pink-700 font-bold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        여
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenderChange(member.id, 'M')}
                        className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          member.gender === 'M'
                            ? 'bg-blue-100 text-blue-700 font-bold'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        남
                      </button>
                    </div>

                    {/* Fitness Level toggle */}
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px]">
                      {(['하', '중', '상'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleFitnessChange(member.id, level)}
                          className={`px-1.5 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                            member.fitnessLevel === level
                              ? 'bg-[#064e3b] text-white font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                          title={`체력: ${level}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>

                    {/* Host designate button */}
                    {isHost ? (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600" />
                        방장
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetHost(member.id)}
                        className="text-[11px] text-slate-600 hover:text-amber-800 bg-white hover:bg-amber-50 border border-slate-200 px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                        title="이 멤버에게 방장 권한을 위임합니다"
                      >
                        방장 위임
                      </button>
                    )}

                    {/* Delete Member Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={editedMembers.length <= 1}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        editedMembers.length <= 1
                          ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                          : 'text-slate-400 hover:text-[#881337] hover:bg-rose-50 border-slate-200 hover:border-rose-200'
                      }`}
                      title={
                        editedMembers.length <= 1
                          ? '최소 1명의 멤버가 필요합니다'
                          : `${member.name} 멤버 삭제`
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 8인 멤버로 복원</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#064e3b] hover:bg-[#047857] rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>저장 완료</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
