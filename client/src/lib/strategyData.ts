/**
 * strategyData.ts — SIMY PC UI
 * 事業執行計画書 2026年4月〜12月 に基づく戦略データ
 * 目標: 9ヶ月で$10M USD 売上達成
 * 「組織の自動運転」を実現するAIプラットフォーム
 *
 * データはすべて /src/data/simy-strategy.json から読み込む
 * アイコンのみTSアダプターでマッピング
 */

import {
  Package, TrendingUp, DollarSign, Star,
  Handshake, HeartHandshake, Users, Megaphone,
} from 'lucide-react';
import type { ElementType } from 'react';

import rawData from '../data/simy-strategy.json';

// ─── Types ──────────────────────────────────────────────────────────────

export type DomainStatus = 'on-track' | 'at-risk' | 'behind' | 'not-started' | 'completed';

// Legacy alias for compatibility with OrgPlanPage
export type OKRStatus = DomainStatus;

export interface Initiative {
  id: string;
  title: string;
  titleJa: string;
  owner: string;
  ownerJa: string;
  status: DomainStatus;
  progress: number;
  dueDate: string;
  phase: 1 | 2 | 3;
  priority: 'critical' | 'high' | 'medium' | 'low';
  velocity: { threeMonths: number; oneMonth: number; twoWeeks: number; oneWeek: number };
  blockers?: string[];
  blockersJa?: string[];
  doneState: string;
  doneStateJa: string;
}

export interface StrategicDomain {
  id: string;
  label: string;
  labelJa: string;
  icon: ElementType;
  color: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: DomainStatus;
  progress: number;
  weeklyDelta: number;
  description: string;
  descriptionJa: string;
  keyResults: {
    title: string;
    titleJa: string;
    target: string;
    current: string;
    progress: number;
    status: DomainStatus;
    phase: 1 | 2 | 3;
  }[];
  initiatives: Initiative[];
  risks?: { label: string; labelJa: string; severity: 'high' | 'medium' | 'low'; mitigation: string; mitigationJa: string }[];
}

export interface PhaseData {
  phase: 1 | 2 | 3;
  label: string;
  labelJa: string;
  period: string;
  periodJa: string;
  revenueTarget: string;
  revenueActual: string;
  revenueProgress: number;
  status: DomainStatus;
  milestones: { title: string; titleJa: string; done: boolean; date: string }[];
}

export interface PipelineEntry {
  rank: number;
  company: string;
  plan: string;
  planJa: string;
  amount: string;
  amountUSD: number;
  targetDate: string;
  status: 'contracted' | 'in-progress' | 'not-started';
  statusJa: string;
  phase: 1 | 2 | 3;
  route: 'direct' | 'partner';
}

export interface KpiItem {
  phase: 1 | 2 | 3;
  label: string;
  labelJa: string;
  target: string;
  current: string;
  progress: number;
  status: DomainStatus;
  frequency: string;
  frequencyJa: string;
}

export interface RiskItem {
  id: string;
  label: string;
  labelJa: string;
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
  mitigationJa: string;
  alternativeRoute: string;
  alternativeRouteJa: string;
  trigger: string;
  triggerJa: string;
  status: 'active' | 'mitigated' | 'triggered';
}

// ─── Icon Map ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, ElementType> = {
  Package,
  TrendingUp,
  DollarSign,
  Star,
  Handshake,
  HeartHandshake,
  Users,
  Megaphone,
};

// ─── Adapter: JSON → typed data with icon hydration ─────────────────────

function hydrateDomains(raw: typeof rawData.domains): StrategicDomain[] {
  return raw.map((d) => ({
    ...d,
    icon: ICON_MAP[d.iconKey] ?? Package,
    impact: d.impact as StrategicDomain['impact'],
    urgency: d.urgency as StrategicDomain['urgency'],
    status: d.status as DomainStatus,
    keyResults: d.keyResults.map((kr) => ({
      ...kr,
      status: kr.status as DomainStatus,
      phase: kr.phase as 1 | 2 | 3,
    })),
    initiatives: d.initiatives.map((i) => ({
      ...i,
      status: i.status as DomainStatus,
      phase: i.phase as 1 | 2 | 3,
      priority: i.priority as Initiative['priority'],
    })),
    risks: d.risks?.map((r) => ({
      ...r,
      severity: r.severity as 'high' | 'medium' | 'low',
    })),
  }));
}

// ─── Exports ─────────────────────────────────────────────────────────────

export const PHASES: PhaseData[] = rawData.phases.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as DomainStatus,
}));

export const PIPELINE: PipelineEntry[] = rawData.pipeline.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as PipelineEntry['status'],
  route: p.route as PipelineEntry['route'],
}));

export const KPIS: KpiItem[] = rawData.kpis.map((k) => ({
  ...k,
  phase: k.phase as 1 | 2 | 3,
  status: k.status as DomainStatus,
}));

export const RISKS: RiskItem[] = rawData.risks.map((r) => ({
  ...r,
  impact: r.impact as RiskItem['impact'],
  status: r.status as RiskItem['status'],
}));

export const DOMAINS: StrategicDomain[] = hydrateDomains(rawData.domains);

export const REVENUE_TIMELINE = rawData.revenueTimeline;

// ─── Legacy compatibility (OrgPlanPage uses MandalaDomain type) ──────────
// OrgPlanPage still references MandalaDomain — keep a minimal re-export
export type MandalaDomain = StrategicDomain & {
  bgColor?: string;
  borderColor?: string;
  companyOKR?: unknown;
  deptOKR?: unknown;
  teamOKR?: unknown;
  personalOKR?: unknown;
  trend?: string;
  trendValue?: string;
  quarterlyData?: number[];
  riskLevel?: string;
  strategicWeight?: number;
  weeklyDelta: number | { company: number; dept: number; team: number; personal: number };
};

export type OKRItem = {
  id: string;
  title: string;
  progress: number;
  status: OKRStatus;
  owner: string;
  keyResults: KeyResult[];
};

export type KeyResult = {
  title: string;
  current: string;
  target: string;
  progress: number;
  growth: { threeMonths: number; oneMonth: number; twoWeeks: number; oneWeek: number };
  actionSummary?: { total: number; done: number; inProgress: number; blocked: number; actionListUrl?: string };
  actions?: KRAction[];
  velocityData?: { weeklyCount: number[]; labels: string[] };
};

export type KRAction = {
  title: string;
  owner: string;
  status: 'done' | 'in-progress' | 'not-started' | 'blocked';
  progress: number;
  captures: { source: string; actor: string; message: string; timestamp: string; status: string }[];
};
