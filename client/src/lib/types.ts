/**
 * SIMY PC UI — 共通型定義
 * すべてのモックデータ・JSONデータで使用する型をここに集約する
 */

export type ActionStatus = 'pending' | 'ai-running' | 'yours' | 'stopped' | 'completed' | 'archived';
export type Category = 'Engineering' | 'Sales' | 'Executive' | 'Marketing' | 'HR' | 'Finance';
export type AgentType = 'One-shot PR' | 'Manus' | 'Claude Coworker' | 'None';
export type PlanStatus = 'on-track' | 'at-risk' | 'behind' | 'completed' | 'not-started';

export interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  avatar: string;
  color: string;
  email: string;
  department: string;
  actionsCount: number;
  completedCount: number;
  isAdmin?: boolean;
}

export interface Agent {
  id: string;
  name: AgentType;
  description: string;
  status: 'running' | 'idle' | 'queued';
  isAuto?: boolean;
  logs?: string[];
  repositories?: { name: string; access: string }[];
}

export interface RelatedIssueRef {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'done';
}

export interface Action {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  category: Category;
  createdAt: string;
  updatedAt: string;
  assignee: TeamMember;
  agents: Agent[];
  members: { member: TeamMember; role: 'Accountability' | 'Responsibility' }[];
  isArchived: boolean;
  stoppedDays?: number;
  doneState?: string;
  changeHistory: { version: number; description: string; date: string; author: string }[];
  relatedIssues?: RelatedIssueRef[];
}

// ─── JSON用フラット型（TeamMember参照をIDで持つ） ─────────────────────────
export interface ActionJSON {
  id: string;
  title: string;
  description: string;
  status: ActionStatus;
  category: Category;
  createdAt: string;
  updatedAt: string;
  assigneeId: string;
  agents: Agent[];
  memberRoles: { memberId: string; role: 'Accountability' | 'Responsibility' }[];
  isArchived: boolean;
  stoppedDays?: number;
  doneState?: string;
  changeHistory: { version: number; description: string; date: string; author: string }[];
  relatedIssues?: RelatedIssueRef[];
}

// ─── Meeting ──────────────────────────────────────────────────────────
export interface MeetingIssue {
  id: string;
  title: string;
  source: string;
  sourceDate: string;
  status: 'open' | 'resolved' | 'deferred';
  priority: 'high' | 'medium' | 'low';
  description?: string;
}

export interface MeetingDecision {
  id: string;
  title: string;
  decidedAt?: string;
  dueBy?: string;
  owner?: string;
  status: 'decided' | 'pending' | 'must-decide';
  description?: string;
}

export interface MeetingNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: TeamMember[];
  agenda: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  location: string;
  actions: string[];
  relatedMeetings?: { id: string; title: string; date: string }[];
  issues?: MeetingIssue[];
  decisions?: MeetingDecision[];
  notes?: MeetingNote[];
  summary?: string;
}

// ─── JSON用フラット型（participantIdsでTeamMemberを参照） ──────────────────
export interface MeetingJSON {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  participantIds: string[];
  agenda: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  location: string;
  actions: string[];
  relatedMeetings?: { id: string; title: string; date: string }[];
  issues?: MeetingIssue[];
  decisions?: MeetingDecision[];
  notes?: MeetingNote[];
  summary?: string;
}

// ─── Org Plan ────────────────────────────────────────────────────────
export interface OKRKeyResult {
  id: string;
  title: string;
  progress: number;
  target: string;
  current: string;
  unit: string;
  status: PlanStatus;
  owner: string;
}

export interface OKRObjective {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: PlanStatus;
  quarter: string;
  keyResults: OKRKeyResult[];
}

export interface MidTermMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: PlanStatus;
  progress: number;
  owner: string;
  category: string;
}

export interface MidTermPlan {
  id: string;
  title: string;
  period: string;
  vision: string;
  status: PlanStatus;
  overallProgress: number;
  milestones: MidTermMilestone[];
}

// ─── Admin Data ─────────────────────────────────────────────────────
export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  isCurrent: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  downloadUrl?: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invitedAt: string;
  invitedBy: string;
}
