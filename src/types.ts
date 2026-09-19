export type SpotType = 'START' | 'REST' | 'FOOD' | 'VIEW' | 'STAY' | 'END';

export interface Member {
  id: string;
  name: string; // 성(姓) 제외 이름 (예: 미님, 민수) 또는 닉네임
  gender: 'M' | 'F';
  role: '방장' | '멤버';
  avatarColor: string;
  fitnessLevel: '상' | '중' | '하';
}

export interface WaypointComment {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation?: number; // meters
  type: SpotType;
  description?: string;
  aiNote?: string;
  upVotes: string[]; // memberIds
  downVotes: string[]; // memberIds
  comments: WaypointComment[];
}

export interface TrekPlan {
  id: string;
  spaceId: string;
  title: string;
  authorId: string;
  authorDisplayName: string; // 성 제외 이름 or 닉네임
  isAiGenerated?: boolean;
  aiPromptUsed?: string;
  isPublished: boolean;
  startPoint?: string; // 들머리 (출발 지점)
  endPoint?: string; // 날머리 (도착 지점)
  totalDistance: string; // e.g. "12.5km"
  totalDuration: string; // e.g. "4시간 30분"
  elevationGain?: string; // e.g. "+550m"
  difficulty: '하' | '중' | '상';
  estimatedCost?: string; // e.g. "25,000원/인"
  summary?: string;
  votes: string[]; // memberIds who voted for this plan
  waypoints: Waypoint[];
  createdAt: string;
}

export interface TrekSpace {
  id: string;
  title: string;
  destination: string;
  date: string;
  members: Member[];
  plans: TrekPlan[];
  finalPlanId?: string | null;
  isVotingClosed: boolean;
}

export interface AIVerifyResult {
  score: number;
  verdict: string;
  fatigueAnalysis: string;
  groupPacingAdvice: string;
  weatherChecklist: string[];
}

export interface AISpotAlternative {
  name: string;
  reason: string;
  extraMinutes: string;
}
