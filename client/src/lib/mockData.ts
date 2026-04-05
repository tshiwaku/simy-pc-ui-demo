/**
 * SIMY PC UI — Demo Mock Data (Single User: 中小企業オーナー)
 */

// ─── 型定義の再エクスポート（後方互換） ──────────────────────────────────────
export type {
  ActionStatus, Category, AgentType, PlanStatus,
  TeamMember, Agent, RelatedIssueRef, Action, ActionJSON,
  MeetingIssue, MeetingDecision, MeetingNote, Meeting, MeetingJSON,
  OKRKeyResult, OKRObjective, MidTermMilestone, MidTermPlan,
  BillingPlan, Invoice, PendingInvite,
} from './types';

import type {
  TeamMember, Action, ActionJSON, Meeting, MeetingJSON,
  OKRObjective, MidTermPlan, BillingPlan, Invoice, PendingInvite,
} from './types';

// ─── JSON データのインポート ───────────────────────────────────────────────
import teamMembersJson from '../data/demo-team-members.json';
import actionsJson from '../data/demo-actions.json';
import meetingsJson from '../data/demo-meetings.json';
import orgPlanJson from '../data/demo-org-plan.json';

// ─── Team Members ─────────────────────────────────────────────────────
export const teamMembers: TeamMember[] = teamMembersJson as TeamMember[];

// ─── ヘルパー：IDからTeamMemberを解決 ────────────────────────────────────
function resolveMember(id: string): TeamMember {
  const m = teamMembers.find(t => t.id === id);
  if (!m) {
    return {
      id,
      name: id,
      nameEn: id,
      role: '',
      avatar: id.slice(0, 2).toUpperCase(),
      color: '#94A3B8',
      email: '',
      department: '',
      actionsCount: 0,
      completedCount: 0,
    };
  }
  return m;
}

// ─── Actions（JSON → Action型にhydrate） ──────────────────────────────────
export const actions: Action[] = (actionsJson as ActionJSON[]).map(a => ({
  ...a,
  assignee: resolveMember(a.assigneeId),
  members: a.memberRoles.map(mr => ({
    member: resolveMember(mr.memberId),
    role: mr.role,
  })),
}));

// ─── Meetings（JSON → Meeting型にhydrate） ────────────────────────────────
export const meetings: Meeting[] = (meetingsJson as MeetingJSON[]).map(m => ({
  ...m,
  participants: m.participantIds.map(id => resolveMember(id)),
}));

// ─── Org Plan Data ───────────────────────────────────────────────────
export const midTermPlan: MidTermPlan = orgPlanJson.midTermPlan as MidTermPlan;
export const currentOKRs: OKRObjective[] = orgPlanJson.currentOKRs as OKRObjective[];

export const billingPlans: BillingPlan[] = [
  {
    id: 'plan-starter',
    name: 'スターター',
    price: 9800,
    currency: 'JPY',
    period: '月',
    features: ['アクション管理', 'AIエージェント 5件/月', 'チームメンバー 5名まで'],
    isCurrent: false,
  },
  {
    id: 'plan-growth',
    name: 'グロース',
    price: 29800,
    currency: 'JPY',
    period: '月',
    features: ['スターターの全機能', 'AIエージェント 無制限', 'チームメンバー 20名まで', 'ダッシュボード分析'],
    isCurrent: true,
  },
  {
    id: 'plan-enterprise',
    name: 'エンタープライズ',
    price: 0,
    currency: 'JPY',
    period: '月',
    features: ['グロースの全機能', 'カスタム連携', '専任サポート', 'SLA保証'],
    isCurrent: false,
  },
];

export const invoices: Invoice[] = [
  { id: 'inv-001', date: '2026-03-01', amount: 29800, currency: 'JPY', status: 'paid', description: 'グロースプラン 3月分' },
  { id: 'inv-002', date: '2026-02-01', amount: 29800, currency: 'JPY', status: 'paid', description: 'グロースプラン 2月分' },
  { id: 'inv-003', date: '2026-01-01', amount: 29800, currency: 'JPY', status: 'paid', description: 'グロースプラン 1月分' },
];

export const pendingInvites: PendingInvite[] = [];

// ─── Digital Twin data ────────────────────────────────────────────────
export const digitalTwinData = {
  user: teamMembers[0],
};
