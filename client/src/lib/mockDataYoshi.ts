/**
 * SIMY PC UI — Yoshi Tamura (CoreWeave) モックデータ
 *
 * データはすべて src/data/yoshi-*.json から読み込む。
 * 型定義は src/lib/types.ts に集約。
 * このファイルはhydrate（ID→オブジェクト変換）と後方互換エクスポートのみを担う。
 */

import type {
  TeamMember, Action, ActionJSON, Meeting, MeetingJSON,
  OKRObjective, MidTermPlan, BillingPlan, Invoice, PendingInvite,
} from './types';

// ─── JSON データのインポート ───────────────────────────────────────────────
import yoshiTeamMembersJson from '../data/yoshi-team-members.json';
import yoshiActionsJson from '../data/yoshi-actions.json';
import yoshiMeetingsJson from '../data/yoshi-meetings.json';
import yoshiOrgPlanJson from '../data/yoshi-org-plan.json';

// ─── Team Members ─────────────────────────────────────────────────────
export const yoshiTeamMembers: TeamMember[] = yoshiTeamMembersJson as TeamMember[];

// ─── ヘルパー：IDからTeamMemberを解決（見つからない場合はフォールバック） ──────
function resolveYoshiMember(id: string): TeamMember {
  const m = yoshiTeamMembers.find(t => t.id === id);
  if (m) return m;
  // 外部参加者（顧客など）はフォールバック
  return {
    id,
    name: id,
    nameEn: id,
    role: 'External',
    avatar: id.slice(0, 2).toUpperCase(),
    color: '#6B7280',
    email: '',
    department: 'External',
    actionsCount: 0,
    completedCount: 0,
    isAdmin: false,
  } as TeamMember;
}

// ─── Actions（JSON → Action型にhydrate） ──────────────────────────────────
export const yoshiActions: Action[] = (yoshiActionsJson as ActionJSON[]).map(a => ({
  ...a,
  assignee: resolveYoshiMember(a.assigneeId),
  members: a.memberRoles.map(mr => ({
    member: resolveYoshiMember(mr.memberId),
    role: mr.role,
  })),
}));

// ─── Meetings（JSON → Meeting型にhydrate） ────────────────────────────────
export const yoshiMeetings: Meeting[] = (yoshiMeetingsJson as MeetingJSON[]).map(m => ({
  ...m,
  participants: m.participantIds.map(id => resolveYoshiMember(id)),
}));

// ─── Org Plan Data ───────────────────────────────────────────────────
export const yoshiCurrentOKRs: OKRObjective[] = yoshiOrgPlanJson.currentOKRs as OKRObjective[];
export const yoshiMidTermPlan: MidTermPlan = yoshiOrgPlanJson.midTermPlan as MidTermPlan;
export const yoshiBillingPlans: BillingPlan[] = yoshiOrgPlanJson.billingPlans as BillingPlan[];
export const yoshiInvoices: Invoice[] = yoshiOrgPlanJson.invoices as Invoice[];
export const yoshiPendingInvites: PendingInvite[] = yoshiOrgPlanJson.pendingInvites as PendingInvite[];

// ─── Digital Twin data ────────────────────────────────────────────────
export const yoshiDigitalTwinData = {
  ...(yoshiOrgPlanJson.digitalTwinData as object),
  user: yoshiTeamMembers[0],
};
