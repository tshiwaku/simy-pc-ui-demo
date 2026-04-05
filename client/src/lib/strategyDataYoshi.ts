/**
 * strategyDataYoshi.ts — SIMY PC UI
 * Yoshi Tamura (CoreWeave) 戦略データ
 * データはすべて /src/data/yoshi-strategy.json から読み込む
 */

import {
  Activity, DollarSign, Users, Cpu,
} from 'lucide-react';
import type { ElementType } from 'react';

import rawData from '../data/yoshi-strategy.json';

import type {
  StrategicDomain, PhaseData, PipelineEntry, KpiItem, RiskItem, DomainStatus, Initiative,
} from './strategyData';

// ─── Icon Map ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, ElementType> = {
  Activity,
  DollarSign,
  Users,
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

export const YOSHI_PHASES: PhaseData[] = rawData.phases.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as DomainStatus,
}));

export const YOSHI_PIPELINE: PipelineEntry[] = rawData.pipeline.map((p) => ({
  ...p,
  phase: p.phase as 1 | 2 | 3,
  status: p.status as PipelineEntry['status'],
  route: p.route as PipelineEntry['route'],
}));

export const YOSHI_KPIS: KpiItem[] = rawData.kpis.map((k) => ({
  ...k,
  phase: k.phase as 1 | 2 | 3,
  status: k.status as DomainStatus,
}));

export const YOSHI_RISKS: RiskItem[] = rawData.risks.map((r) => ({
  ...r,
  impact: r.impact as RiskItem['impact'],
  status: r.status as RiskItem['status'],
}));

export const YOSHI_DOMAINS: StrategicDomain[] = hydrateDomains(rawData.domains);

export const YOSHI_REVENUE_TIMELINE = rawData.revenueTimeline;
