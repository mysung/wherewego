import React, { useState, useEffect } from 'react';
import { TrekSpace, TrekPlan, Member, Waypoint } from './types';
import { INITIAL_SPACES, INITIAL_MEMBERS } from './data/initialData';
import { Header } from './components/Header';
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

const STORAGE_KEY = 'wherewego_trek_space_v2';

export default function App() {
  // Load initial space from localStorage or fallback
  const [space, setSpace] = useState<TrekSpace>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SPACES[0];
  });

  // Current logged in member (simulated from the 8 members: default 미영)
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

  // Reset to initial data
  const handleResetData = () => {
    if (window.confirm('지리산 8인 트레킹 기본 데이터로 초기화하시겠습니까?')) {
      localStorage.removeItem(STORAGE_KEY);
      setSpace(INITIAL_SPACES[0]);
      setActivePlanId(INITIAL_SPACES[0].plans[0].id);
      setCurrentMember(INITIAL_MEMBERS[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. Header (Brand, Space, 8-Member avatars, Profile switcher, Kakao button) */}
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
      />

      {/* 2. Plan Tab Bar (Tab comparison, quick stats, AI generate button, Fork button) */}
      <PlanTabBar
        plans={space.plans}
        activePlanId={activePlanId}
        onSelectPlan={(id) => {
          setActivePlanId(id);
          setSelectedWaypointId(null);
        }}
        onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
        onForkPlan={handleOpenFork}
        onOpenVerify={() => setIsVerifyOpen(true)}
        currentMember={currentMember}
      />

      {/* 3. Main Workspace: Split View (Left: Waypoint Timeline & Feedback, Right: Interactive Map) */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-xs">
        {/* Left Column (4 cols on lg): Waypoint Timeline, Spot Feedbacks, AI Notes */}
        <div className="lg:col-span-5 xl:col-span-4 h-[420px] lg:h-[calc(100vh-230px)] min-h-[380px] bg-white border-r border-slate-200">
          <WaypointList
            plan={activePlan}
            currentMember={currentMember}
            selectedWaypointId={selectedWaypointId}
            onSelectWaypoint={(id) => setSelectedWaypointId(id)}
            onVoteSpot={handleVoteSpot}
            onOpenSpotComments={(wp) => setSpotCommentWaypoint(wp)}
            onOpenAlternative={(wp) => setSpotAlternativeWaypoint(wp)}
            onAddWaypointClick={() => setIsAddWaypointOpen(true)}
          />
        </div>

        {/* Right Column (7-8 cols on lg): Interactive Map with Route & Pins */}
        <div className="lg:col-span-7 xl:col-span-8 h-[450px] lg:h-[calc(100vh-230px)] min-h-[420px] bg-slate-900">
          <MapView
            plan={activePlan}
            currentMember={currentMember}
            selectedWaypointId={selectedWaypointId}
            onSelectWaypoint={(id) => setSelectedWaypointId(id)}
            onVoteSpot={handleVoteSpot}
            onOpenSpotComments={(wp) => setSpotCommentWaypoint(wp)}
            onOpenAlternative={(wp) => setSpotAlternativeWaypoint(wp)}
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
    </div>
  );
}
