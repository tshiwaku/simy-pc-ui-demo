/**
 * SIMY PC UI — 奈良県立医科大学 (Masato Kasahara) モックデータ
 *
 * データはすべて src/data/nara-*.json から読み込む。
 * 型定義は src/lib/types.ts に集約。
 * このファイルはhydrate（ID→オブジェクト変換）と後方互換エクスポートのみを担う。
 */

import type {
  TeamMember, Action, ActionJSON, Meeting, MeetingJSON,
  OKRObjective, MidTermPlan, BillingPlan, Invoice, PendingInvite,
} from './types';

// ─── JSON データのインポート ───────────────────────────────────────────────
import naraTeamMembersJson from '../data/nara-team-members.json';
import naraActionsJson from '../data/nara-actions.json';
import naraMeetingsJson from '../data/nara-meetings.json';
import naraOrgPlanJson from '../data/nara-org-plan.json';

// ─── Team Members ─────────────────────────────────────────────────────
export const naraTeamMembers: TeamMember[] = naraTeamMembersJson as TeamMember[];

// ─── ヘルパー：IDからTeamMemberを解決 ────────────────────────────────────
function resolveNaraMember(id: string): TeamMember {
  const m = naraTeamMembers.find(t => t.id === id);
  if (!m) throw new Error(`NaraTeamMember not found: ${id}`);
  return m;
}

// ─── Actions（JSON → Action型にhydrate） ──────────────────────────────────
export const naraActions: Action[] = (naraActionsJson as ActionJSON[]).map(a => ({
  ...a,
  assignee: resolveNaraMember(a.assigneeId),
  members: a.memberRoles.map(mr => ({
    member: resolveNaraMember(mr.memberId),
    role: mr.role,
  })),
}));

// ─── Meetings（JSON → Meeting型にhydrate） ────────────────────────────────
export const naraMeetings: Meeting[] = (naraMeetingsJson as MeetingJSON[]).map(m => ({
  ...m,
  participants: m.participantIds.map(id => resolveNaraMember(id)),
}));

// ─── Org Plan Data ───────────────────────────────────────────────────
export const naraCurrentOKRs: OKRObjective[] = naraOrgPlanJson.currentOKRs as OKRObjective[];
export const naraMidTermPlan: MidTermPlan = naraOrgPlanJson.midTermPlan as MidTermPlan;
export const naraBillingPlans: BillingPlan[] = naraOrgPlanJson.billingPlans as BillingPlan[];
export const naraInvoices: Invoice[] = naraOrgPlanJson.invoices as Invoice[];
export const naraPendingInvites: PendingInvite[] = naraOrgPlanJson.pendingInvites as PendingInvite[];

// ─── Digital Twin data ────────────────────────────────────────────────
export const naraDigitalTwinData = {
  ...(naraOrgPlanJson.digitalTwinData as object),
  user: naraTeamMembers[0],
};
