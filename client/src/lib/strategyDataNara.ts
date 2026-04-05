/**
 * strategyDataNara.ts — SIMY PC UI
 * 奈良県立医科大学 第4期中期計画（R7〜R12）に基づく戦略データ
 * 出典: 第4期中期計画書・中期計画ハンドブック・将来像
 * 設計方針: 12課題を8戦略ドメインに整理し、指標・イニシアチブ・リスクが論理的に連鎖
 *
 * データはすべて /src/data/nara-strategy.json から読み込む
 * アイコンのみTSアダプターでマッピング
 */

import {
  Activity, DollarSign, Users, Microscope,
  GraduationCap, Heart, Building2, Cpu,
} from 'lucide-react';
import type { ElementType } from 'react';

import rawData from '../data/nara-strategy.json';

import type {
  StrategicDomain, PhaseData, PipelineEntry, KpiItem, RiskItem, DomainStatus, Initiative,
} from './strategyData';

// ─── Icon Map ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, ElementType> = {
  Activity,
  DollarSign,
  Users,
  Microscope,
  GraduationCap,
  Heart,
  Building2,
  Cpu,
};

// ─── Adapter: JSON → typed data with icon hydration ─────────────────────

function hydrateDomains(raw: typeof rawData.domains): StrategicDomain[] {
  return raw.map((d) => ({
    ...d,
    icon: ICON_MAP[d.iconKey] ?? Activity,
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

export const NARA_PHASES: PhaseData[] = rawData.phases.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as DomainStatus,
}));

export const NARA_PIPELINE: PipelineEntry[] = rawData.pipeline.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as PipelineEntry['status'],
  route: p.route as PipelineEntry['route'],
}));

export const NARA_KPIS: KpiItem[] = rawData.kpis.map((k) => ({
  ...k,
  phase: k.phase as 1 | 2 | 3,
  status: k.status as DomainStatus,
}));

export const NARA_RISKS: RiskItem[] = rawData.risks.map((r) => ({
  ...r,
  impact: r.impact as RiskItem['impact'],
  status: r.status as RiskItem['status'],
}));

export const NARA_DOMAINS: StrategicDomain[] = hydrateDomains(rawData.domains);

export const NARA_REVENUE_TIMELINE = rawData.revenueTimeline;
