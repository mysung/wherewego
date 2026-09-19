import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrekSpace, TrekPlan, Member, Waypoint } from './types';
import { INITIAL_SPACES, INITIAL_MEMBERS } from './data/initialData';
import { Header } from './components/Header';
import { TrekHeroBanner } from './components/TrekHeroBanner';
import { PlanTabBar } from './components/PlanTabBar';
import { MapView } from './components/MapView';
import { WaypointList } from './components/WaypointList';
import { OverallVoteBar } from './components/OverallVoteBar';
import { AITrekPlannerModal } from './components/AITrekPlannerModal';
import { AICourseVerifyModal } from './components/AICourseVerifyModal';
import { AISpotAlternativeModal } from './components/AISpotAlternativeModal';
import { SpotCommentModal } from './components/SpotCommentModal';
import { KakaoShareModal } from './components/KakaoShareModal';
import { ForkPlanModal } from './components/ForkPlanModal';
import { AddWaypointModal } from './components/AddWaypointModal';
import { MemberManageModal } from './components/MemberManageModal';
import { EditPlanModal } from './components/EditPlanModal';
import { AllPlansModal } from './components/AllPlansModal';
import { GripVertical } from 'lucide-react';

const STORAGE_KEY = 'wherewego_trek_space_v4';
const STORAGE_SPLIT_WIDTH_KEY = 'wherewego_split_panel_width';

export default function App() {
  // Load initial space from localStorage or fallback
  const [space, setSpace] = useState<TrekSpace>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('wherewego_trek_space_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title && parsed.title.includes('8인')) {
          parsed.title = parsed.title.replace('8인 ', '').replace(' 8인', '');
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SPACES[0];
  });

  // Current logged in member (simulated from the 8 members: default 미님)
  const [currentMember, setCurrentMember] = useState<Member>(() => {
    return space.members[0] || INITIAL_MEMBERS[0];
  });

  // Active plan ID
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    return space.plans[0]?.id || '';
  });

  // Selected waypoint
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Modals state
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isKakaoShareOpen, setIsKakaoShareOpen] = useState(false);
  const [isForkOpen, setIsForkOpen] = useState(false);
  const [forkSourcePlan, setForkSourcePlan] = useState<TrekPlan | null>(null);
  const [isAddWaypointOpen, setIsAddWaypointOpen] = useState(false);
  const [isMemberManageOpen, setIsMemberManageOpen] = useState(false);
  const [isAllPlansOpen, setIsAllPlansOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrekPlan | null>(null);
  const [leftPanelView, setLeftPanelView] = useState<'proposals' | 'waypoints'>('proposals');
  const [mapLayout, setMapLayout] = useState<'split' | 'wide' | 'fullscreen'>(() => {
    try {
      const saved = localStorage.getItem('wherewego_map_layout');
      if (saved === 'split' || saved === 'wide' || saved === 'fullscreen') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'split';
  });

  // Minimal Mode state (user requested toggle to hide secondary info & statistics)
  const [isMinimalMode, setIsMinimalMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wherewego_minimal_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMinimalMode = () => {
    setIsMinimalMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('wherewego_minimal_mode', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Adjustable split panel width percentage (left panel width in %, default 35%)
  const [leftPanelPercent, setLeftPanelPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SPLIT_WIDTH_KEY);
      if (saved) {
        const num = parseFloat(saved);
        if (num >= 20 && num <= 70) return num;
      }
    } catch (e) {
      console.error(e);
    }
    return 35; // Default ~35% for left proposal list, 65% for map
  });

  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move and mouse up handlers for smooth vertical divider dragging
  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerWidth = rect.width;
      const offsetX = e.clientX - rect.left;
      const newPercent = (offsetX / containerWidth) * 100;
      // Restrict left panel between 20% and 65% so neither side collapses completely
      const clamped = Math.min(Math.max(newPercent, 20), 65);
      setLeftPanelPercent(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
      try {
        localStorage.setItem(STORAGE_SPLIT_WIDTH_KEY, leftPanelPercent.toString());
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Add cursor styling to body while dragging
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingDivider, leftPanelPercent]);
  const [spotCommentWaypoint, setSpotCommentWaypoint] = useState<Waypoint | null>(null);
  const [spotAlternativeWaypoint, setSpotAlternativeWaypoint] = useState<Waypoint | null>(null);
  const [copiedTextToast, setCopiedTextToast] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(space));
    } catch (e) {
      console.error(e);
    }
  }, [space]);

  // Handle URL deep-link parameter for Kakao 1-click vote (?planId=...&vote=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planIdParam = params.get('planId');
    const voteParam = params.get('vote');

    if (planIdParam && space.plans.some((p) => p.id === planIdParam)) {
      setActivePlanId(planIdParam);
      if (voteParam === 'true') {
        handleVotePlan(planIdParam);
      }
    }
  }, []);

  const activePlan = space.plans.find((p) => p.id === activePlanId) || space.plans[0];

  // Vote for a plan (1 vote per member rule)
  const handleVotePlan = (planId: string) => {
    setSpace((prev) => {
      const updatedPlans = prev.plans.map((p) => {
        // If clicking same plan, toggle vote
        if (p.id === planId) {
          const hasVoted = p.votes.includes(currentMember.id);
          return {
            ...p,
            votes: hasVoted
              ? p.votes.filter((id) => id !== currentMember.id)
              : [...p.votes, currentMember.id],
          };
        } else {
          // Remove vote from other plans (1인 1표)
          return {
            ...p,
            votes: p.votes.filter((id) => id !== currentMember.id),
          };
        }
      });
      return { ...prev, plans: updatedPlans };
    });
  };

  // Vote on a specific spot (좋아요/글쎄요)
  const handleVoteSpot = (waypointId: string, isUp: boolean) => {
    setSpace((prev) => {
      const updatedPlans = prev.plans.map((plan) => {
        if (plan.id !== activePlanId) return plan;
        const updatedWaypoints = plan.waypoints.map((wp) => {
          if (wp.id !== waypointId) return wp;

          let newUp = [...wp.upVotes];
          let newDown = [...wp.downVotes];

          if (isUp) {
            if (newUp.includes(currentMember.id)) {
              newUp = newUp.filter((id) => id !== currentMember.id);
            } else {
              newUp.push(currentMember.id);
              newDown = newDown.filter((id) => id !== currentMember.id);
            }
          } else {
            if (newDown.includes(currentMember.id)) {
              newDown = newDown.filter((id) => id !== currentMember.id);
            } else {
              newDown.push(currentMember.id);
              newUp = newUp.filter((id) => id !== currentMember.id);
            }
          }

          return { ...wp, upVotes: newUp, downVotes: newDown };
        });
        return { ...plan, waypoints: updatedWaypoints };
      });
      return { ...prev, plans: updatedPlans };
    });

    // Also update spotCommentWaypoint if open
    if (spotCommentWaypoint && spotCommentWaypoint.id === waypointId) {
      setSpotCommentWaypoint((prevWp) => {
        if (!prevWp) return null;
        let newUp = [...prevWp.upVotes];
        let newDown = [...prevWp.downVotes];
        if (isUp) {
          if (newUp.includes(currentMember.id)) {
            newUp = newUp.filter((id) => id !== currentMember.id);
          } else {
            newUp.push(currentMember.id);
            newDown = newDown.filter((id) => id !== currentMember.id);
          }
        } else {
          if (newDown.includes(currentMember.id)) {
            newDown = newDown.filter((id) => id !== currentMember.id);
          } else {
            newDown.push(currentMember.id);
            newUp = newUp.filter((id) => id !== currentMember.id);
          }
        }
        return { ...prevWp, upVotes: newUp, downVotes: newDown };
      });
    }
  };

  // Add comment to waypoint
  const handleAddComment = (waypointId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      userId: currentMember.id,
      displayName: currentMember.name,
      text,
      createdAt: new Date().toISOString(),
    };

    setSpace((prev) => {
      const updatedPlans = prev.plans.map((plan) => {
        if (plan.id !== activePlanId) return plan;
        const updatedWaypoints = plan.waypoints.map((wp) => {
          if (wp.id !== waypointId) return wp;
          return {
            ...wp,
            comments: [...wp.comments, newComment],
          };
        });
        return { ...plan, waypoints: updatedWaypoints };
      });
      return { ...prev, plans: updatedPlans };
    });

    if (spotCommentWaypoint && spotCommentWaypoint.id === waypointId) {
      setSpotCommentWaypoint((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
  };

  // AI / Manual Plan Created
  const handlePlanCreated = (newPlan: TrekPlan) => {
    setSpace((prev) => {
      const isNamsan = newPlan.title.includes('남산') || (newPlan.startPoint && newPlan.startPoint.includes('남산'));
      const isBukhansan = newPlan.title.includes('북한산') || (newPlan.startPoint && newPlan.startPoint.includes('북한산'));
      const isGwanak = newPlan.title.includes('관악산') || (newPlan.startPoint && newPlan.startPoint.includes('관악산'));

      let newDest = prev.destination;
      let newTitle = prev.title;

      if (isNamsan) {
        newDest = '서울 남산타워 (둘레길 & N서울타워)';
        newTitle = '남산타워 힐링 둘레길 8인 트레킹 모임';
      } else if (isBukhansan) {
        newDest = '북한산 국립공원 (백운대)';
        newTitle = '북한산 백운대 정복 8인 트레킹';
      } else if (isGwanak) {
        newDest = '관악산 (연주대)';
        newTitle = '관악산 연주대 8인 트레킹';
      }

      return {
        ...prev,
        destination: newDest,
        title: newTitle,
        plans: [...prev.plans, newPlan],
      };
    });
    setActivePlanId(newPlan.id);
  };

  // Fork existing plan
  const handleOpenFork = (planToFork: TrekPlan) => {
    setForkSourcePlan(planToFork);
    setIsForkOpen(true);
  };

  const handleForkConfirm = (newTitle: string, newSummary: string) => {
    if (!forkSourcePlan) return;

    const forkedWaypoints = forkSourcePlan.waypoints.map((w, idx) => ({
      ...w,
      id: `wp-fork-${Date.now()}-${idx}`,
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    }));

    const forkedPlan: TrekPlan = {
      ...forkSourcePlan,
      id: `plan-fork-${Date.now()}`,
      title: newTitle,
      authorId: currentMember.id,
      authorDisplayName: currentMember.name,
      summary: newSummary,
      votes: [currentMember.id],
      waypoints: forkedWaypoints,
      createdAt: new Date().toISOString(),
    };

    setSpace((prev) => ({
      ...prev,
      plans: [...prev.plans, forkedPlan],
    }));
    setActivePlanId(forkedPlan.id);
  };

  // Edit Course Proposal
  const handleOpenEditPlan = (plan: TrekPlan) => {
    setEditingPlan(plan);
  };

  const handleSaveUpdatedPlan = (updatedPlan: TrekPlan) => {
    setSpace((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
    }));
  };

  // Delete Course Proposal
  const handleDeletePlan = (planId: string) => {
    if (space.plans.length <= 1) {
      alert('최소 1개의 코스 제안이 유지되어야 합니다. 삭제 대신 코스 정보 편집을 이용해 주세요.');
      return;
    }

    const targetPlan = space.plans.find((p) => p.id === planId);
    const planTitle = targetPlan ? targetPlan.title : '선택한 코스';

    if (window.confirm(`'${planTitle}' 코스 제안을 정말 삭제하시겠습니까?`)) {
      setSpace((prev) => {
        const remainingPlans = prev.plans.filter((p) => p.id !== planId);
        return {
          ...prev,
          finalPlanId: prev.finalPlanId === planId ? null : prev.finalPlanId,
          plans: remainingPlans,
        };
      });

      // If active plan was deleted, select next remaining plan
      if (activePlanId === planId) {
        const remainingPlans = space.plans.filter((p) => p.id !== planId);
        if (remainingPlans.length > 0) {
          setActivePlanId(remainingPlans[0].id);
          setSelectedWaypointId(null);
        }
      }
    }
  };

  // Add new waypoint to active plan
  const handleAddWaypoint = (newWpData: Omit<Waypoint, 'id' | 'upVotes' | 'downVotes' | 'comments'>) => {
    const newWp: Waypoint = {
      ...newWpData,
      id: `wp-custom-${Date.now()}`,
      upVotes: [currentMember.id],
      downVotes: [],
      comments: [],
    };

    setSpace((prev) => {
      const updatedPlans = prev.plans.map((plan) => {
        if (plan.id !== activePlanId) return plan;
        return {
          ...plan,
          waypoints: [...plan.waypoints, newWp],
        };
      });
      return { ...prev, plans: updatedPlans };
    });
  };

  // Replace waypoint with AI alternative
  const handleReplaceSpot = (waypointId: string, newName: string, reason: string) => {
    setSpace((prev) => {
      const updatedPlans = prev.plans.map((plan) => {
        if (plan.id !== activePlanId) return plan;
        const updatedWaypoints = plan.waypoints.map((wp) => {
          if (wp.id !== waypointId) return wp;
          return {
            ...wp,
            name: newName,
            description: `[AI 추천 대체 지점] ${reason}`,
            aiNote: '8인 멤버 맞춤 추천으로 대체된 스팟입니다.',
          };
        });
        return { ...plan, waypoints: updatedWaypoints };
      });
      return { ...prev, plans: updatedPlans };
    });
  };

  // Finalize plan as meeting decision
  const handleFinalizePlan = (planId: string) => {
    setSpace((prev) => ({
      ...prev,
      finalPlanId: prev.finalPlanId === planId ? null : planId,
    }));
  };

  // Copy Kakao formatted text
  const handleCopyKakaoText = () => {
    const lines = [
      `[어디갈까 (WhereWeGo) - 8인 트레킹 코스 투표]`,
      `모임명: ${space.title}`,
      `일시: ${space.date}`,
      ``,
      `8명 멤버 여러분, 각자 추천한 트레킹 플랜 중 가장 원하는 코스에 투표해 주세요!`,
      ``,
    ];

    space.plans.forEach((p, idx) => {
      lines.push(
        `${idx + 1}안: ${p.title} (${p.totalDistance}, ${p.totalDuration}, 난이도:${p.difficulty}) [👍 ${p.votes.length}표]`
      );
    });

    lines.push(``);
    lines.push(`👉 웹앱에서 지도 보고 바로 투표하기:`);
    lines.push(`${window.location.origin}/?planId=${activePlanId}&vote=true`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedTextToast(true);
    setTimeout(() => setCopiedTextToast(false), 2500);
  };

  // Update 8 members (including host) and sync across active state
  const handleSaveMembers = (updatedMembers: Member[]) => {
    // Find if currentMember's name or attributes changed
    const updatedCurrent = updatedMembers.find((m) => m.id === currentMember.id);
    if (updatedCurrent) {
      setCurrentMember(updatedCurrent);
    }

    // Also synchronize authorDisplayName and comment displayName across plans so that existing comments/plans reflect new names
    setSpace((prev) => {
      const memberMap = new Map(updatedMembers.map((m) => [m.id, m]));

      const updatedPlans = prev.plans.map((plan) => {
        const planAuthor = memberMap.get(plan.authorId);
        const updatedAuthorName = planAuthor ? planAuthor.name : plan.authorDisplayName;

        const updatedWaypoints = plan.waypoints.map((wp) => {
          const updatedComments = wp.comments.map((c) => {
            const commentAuthor = memberMap.get(c.userId);
            return commentAuthor
              ? { ...c, displayName: commentAuthor.name }
              : c;
          });
          return { ...wp, comments: updatedComments };
        });

        return {
          ...plan,
          authorDisplayName: updatedAuthorName,
          waypoints: updatedWaypoints,
        };
      });

      return {
        ...prev,
        members: updatedMembers,
        plans: updatedPlans,
      };
    });
  };

  // Reset to initial data
  const handleResetData = () => {
    if (window.confirm('기본 8인 트레킹 데이터로 초기화하시겠습니까?')) {
      localStorage.removeItem(STORAGE_KEY);
      setSpace(INITIAL_SPACES[0]);
      setActivePlanId(INITIAL_SPACES[0].plans[0].id);
      setCurrentMember(INITIAL_MEMBERS[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. Header (Brand, Space, 8-Member avatars, Profile switcher, Minimal Mode toggle, Kakao button) */}
      <Header
        space={space}
        currentMember={currentMember}
        onSelectMember={setCurrentMember}
        activePlan={activePlan}
        onOpenKakaoShare={() => setIsKakaoShareOpen(true)}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onOpenVerify={() => setIsVerifyOpen(true)}
        onCopyKakaoText={handleCopyKakaoText}
        copiedText={copiedTextToast}
        onResetData={handleResetData}
        onOpenMemberManage={() => setIsMemberManageOpen(true)}
        isMinimalMode={isMinimalMode}
        onToggleMinimalMode={toggleMinimalMode}
      />

      {/* Trek Hero Banner (Slim banner; in minimal mode it is further reduced to a clean 1-line strip) */}
      <TrekHeroBanner space={space} activePlan={activePlan} isMinimalMode={isMinimalMode} />

      {/* 2. Plan Tab Bar (Tab comparison, quick stats, AI generate button, Fork button) */}
      <PlanTabBar
        plans={space.plans}
        activePlanId={activePlanId}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setSelectedWaypointId(null);
          setLeftPanelView('waypoints');
        }}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onForkPlan={handleOpenFork}
        onOpenVerify={() => setIsVerifyOpen(true)}
        currentMember={currentMember}
        onOpenAllPlans={() => setLeftPanelView('proposals')}
        onEditPlan={handleOpenEditPlan}
        onDeletePlan={handleDeletePlan}
        isMinimalMode={isMinimalMode}
      />

      {/* 3. Main Workspace: Split View (Left: Proposals / Waypoint Timeline, Right: Interactive Map with Draggable Resizer) */}
      <main
        ref={containerRef}
        className={`flex-1 w-full mx-auto overflow-hidden shadow-xs transition-all duration-300 ${
          mapLayout === 'fullscreen'
            ? 'fixed inset-0 z-50 bg-slate-900 flex flex-col'
            : mapLayout === 'wide'
            ? 'max-w-[96rem] flex flex-col lg:flex-row'
            : 'max-w-7xl flex flex-col lg:flex-row'
        }`}
      >
        {/* Left Column: Proposals / Waypoints list with adjustable width */}
        {mapLayout !== 'fullscreen' && (
          <div
            style={{
              // On desktop (lg+), use dynamically calculated percentage from vertical resizer
              // If mapLayout === 'wide', clamp it even tighter or respect user preference
              flexBasis: undefined,
            }}
            className={`transition-[width] duration-75 bg-white flex flex-col shrink-0 ${
              mapLayout === 'wide'
                ? 'w-full lg:w-[28%] min-w-[280px] max-w-[420px]'
                : 'w-full'
            } h-[440px] lg:h-[calc(100vh-230px)] min-h-[400px]`}
            {...(mapLayout === 'split'
              ? {
                  style: {
                    width: `${leftPanelPercent}%`,
                    minWidth: '280px',
                    maxWidth: '65%',
                  },
                }
              : {})}
          >
            <WaypointList
              plans={space.plans}
              activePlan={activePlan}
              activePlanId={activePlanId}
              onSelectPlan={(id) => {
                setActivePlanId(id);
                setSelectedWaypointId(null);
                setLeftPanelView('waypoints');
              }}
              currentMember={currentMember}
              members={space.members}
              selectedWaypointId={selectedWaypointId}
              onSelectWaypoint={(id) => setSelectedWaypointId(id)}
              onVoteSpot={handleVoteSpot}
              onOpenSpotComments={(wp) => setSpotCommentWaypoint(wp)}
              onOpenAlternative={(wp) => setSpotAlternativeWaypoint(wp)}
              onAddWaypointClick={() => setIsAddWaypointOpen(true)}
              onEditPlan={handleOpenEditPlan}
              onDeletePlan={handleDeletePlan}
              onForkPlan={handleOpenFork}
              onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
              onOpenAllPlansModal={() => setIsAllPlansOpen(true)}
              viewMode={leftPanelView}
              onViewModeChange={(mode) => setLeftPanelView(mode)}
              isMinimalMode={isMinimalMode}
            />
          </div>
        )}

        {/* Vertical Resizer Divider Bar (Desktop lg+) */}
        {mapLayout !== 'fullscreen' && (
          <div
            onMouseDown={handleMouseDownDivider}
            className={`hidden lg:flex items-center justify-center relative select-none z-20 group cursor-col-resize w-3.5 -mx-1.5 hover:w-4 hover:-mx-2 transition-all shrink-0 ${
              isDraggingDivider ? 'bg-emerald-500/20' : 'hover:bg-emerald-500/10'
            }`}
            title="좌우로 드래그하여 제안 목록과 지도의 크기를 조절하세요"
          >
            {/* Thin vertical border line */}
            <div
              className={`w-[2px] h-full transition-colors ${
                isDraggingDivider
                  ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.6)]'
                  : 'bg-slate-300 group-hover:bg-emerald-500'
              }`}
            />

            {/* Centered Pill Handle Indicator */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 px-0.5 py-2.5 rounded-full border shadow-sm flex flex-col items-center justify-center transition-all ${
                isDraggingDivider
                  ? 'bg-[#064e3b] text-white border-emerald-500 scale-110'
                  : 'bg-white text-slate-500 border-slate-300 group-hover:border-emerald-500 group-hover:text-emerald-700 group-hover:shadow-md'
              }`}
            >
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* Right Column: Interactive Map taking remaining flex space */}
        <div
          className={`flex-1 min-w-0 bg-slate-900 relative transition-all duration-300 ${
            mapLayout === 'fullscreen'
              ? 'w-full h-full'
              : 'w-full h-[450px] lg:h-[calc(100vh-230px)] min-h-[420px]'
          } ${isDraggingDivider ? 'pointer-events-none' : ''}`}
        >
          <MapView
            plan={activePlan}
            currentMember={currentMember}
            selectedWaypointId={selectedWaypointId}
            onSelectWaypoint={(id) => setSelectedWaypointId(id)}
            onVoteSpot={handleVoteSpot}
            onOpenSpotComments={(wp) => setSpotCommentWaypoint(wp)}
            onOpenAlternative={(wp) => setSpotAlternativeWaypoint(wp)}
            mapLayout={mapLayout}
            onChangeMapLayout={(layout) => {
              setMapLayout(layout);
              try {
                localStorage.setItem('wherewego_map_layout', layout);
              } catch (e) {
                console.error(e);
              }
            }}
            isMinimalMode={isMinimalMode}
          />
        </div>
      </main>

      {/* 4. Bottom Panel: Overall Final Decision & 1-Click Vote */}
      <OverallVoteBar
        space={space}
        activePlan={activePlan}
        currentMember={currentMember}
        onVotePlan={handleVotePlan}
        onFinalizePlan={handleFinalizePlan}
      />

      {/* MODALS */}
      {/* AI Trek Planner Modal (Gemini 3.8 Flash) */}
      <AITrekPlannerModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        currentMember={currentMember}
        onPlanCreated={handlePlanCreated}
        defaultDestination={space.destination}
      />

      {/* AI Course Verify Modal (Fatigue, 8-Person Pacing, Safety) */}
      <AICourseVerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        plan={activePlan}
      />

      {/* AI Spot Alternative Modal (Gemini Course Copilot) */}
      <AISpotAlternativeModal
        isOpen={!!spotAlternativeWaypoint}
        onClose={() => setSpotAlternativeWaypoint(null)}
        waypoint={spotAlternativeWaypoint}
        destination={space.destination}
        onReplaceSpot={handleReplaceSpot}
      />

      {/* Waypoint Comment Modal */}
      <SpotCommentModal
        isOpen={!!spotCommentWaypoint}
        onClose={() => setSpotCommentWaypoint(null)}
        waypoint={spotCommentWaypoint}
        currentMember={currentMember}
        onAddComment={handleAddComment}
        onVoteSpot={handleVoteSpot}
      />

      {/* Kakao Share & Quick Poll Modal */}
      <KakaoShareModal
        isOpen={isKakaoShareOpen}
        onClose={() => setIsKakaoShareOpen(false)}
        space={space}
        activePlan={activePlan}
        currentMember={currentMember}
        onOneClickVote={(planId) => {
          handleVotePlan(planId);
        }}
      />

      {/* Fork/Clone Plan Modal */}
      <ForkPlanModal
        isOpen={isForkOpen}
        onClose={() => setIsForkOpen(false)}
        sourcePlan={forkSourcePlan}
        currentMember={currentMember}
        onForkConfirm={handleForkConfirm}
      />

      {/* Add Waypoint Modal */}
      <AddWaypointModal
        isOpen={isAddWaypointOpen}
        onClose={() => setIsAddWaypointOpen(false)}
        onAddWaypoint={handleAddWaypoint}
      />

      {/* 8-Member Name & Host Management Modal */}
      <MemberManageModal
        isOpen={isMemberManageOpen}
        onClose={() => setIsMemberManageOpen(false)}
        members={space.members}
        currentMember={currentMember}
        onSaveMembers={handleSaveMembers}
      />

      {/* All Course Proposals List Modal */}
      <AllPlansModal
        isOpen={isAllPlansOpen}
        onClose={() => setIsAllPlansOpen(false)}
        plans={space.plans}
        activePlanId={activePlanId}
        members={space.members}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setSelectedWaypointId(null);
        }}
        onEditPlan={handleOpenEditPlan}
        onDeletePlan={handleDeletePlan}
        onForkPlan={handleOpenFork}
        onOpenCreatePlan={() => setIsAIGeneratorOpen(true)}
      />

      {/* Edit Course Proposal Modal */}
      <EditPlanModal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        onSavePlan={handleSaveUpdatedPlan}
      />
    </div>
  );
}
