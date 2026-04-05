/**
 * orgPlanDataNara.ts — 奈良県立医科大学 第4期中期計画 OrgPlan データ
 * Masato Kasahara（笠原 雅人）/ 経営責任者（副理事長）
 * 計画期間: R7〜R12（2025〜2031年）
 *
 * ⚠️ データは src/data/nara-org-plan-domains.json で管理
 */
import {
  TrendingUp, BookOpen, Stethoscope, Users, Building2,
  Heart, Lightbulb, Shield, type LucideIcon,
} from 'lucide-react';
import React from 'react';
import rawData from '../data/nara-org-plan-domains.json';

// ─── 型定義 ──────────────────────────────────────────────────────────────
type OKRStatus = 'on-track' | 'at-risk' | 'behind' | 'completed' | 'not-started';
interface ActionCapture {
  source: 'slack' | 'zoom' | 'teams' | 'github' | 'email';
  actor: string;
  message: string;
  timestamp: string;
  status: 'done' | 'in-progress' | 'blocked';
}
interface KRAction {
  title: string;
  owner: string;
  status: 'done' | 'in-progress' | 'not-started' | 'blocked';
  progress: number;
  captures: ActionCapture[];
}
interface ActionSummary {
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  actionListUrl?: string;
}
interface KRGrowth {
  threeMonths: number;
  oneMonth: number;
  twoWeeks: number;
  oneWeek: number;
}
interface ActionVelocityData {
  weeklyCount: number[];
  labels: string[];
}
interface KeyResult {
  title: string;
  current: string;
  target: string;
  progress: number;
  growth: KRGrowth;
  actionSummary?: ActionSummary;
  actions?: KRAction[];
  velocityData?: ActionVelocityData;
}
interface OKRItem {
  id: string;
  title: string;
  progress: number;
  status: OKRStatus;
  owner: string;
  keyResults: KeyResult[];
}
export interface NaraMandalaDomain {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  companyOKR: OKRItem;
  deptOKR: OKRItem;
  teamOKR: OKRItem;
  personalOKR: OKRItem;
  trend: 'up' | 'down' | 'flat';
  trendValue: string;
  quarterlyData: number[];
  riskLevel: 'low' | 'medium' | 'high';
  strategicWeight: number;
  weeklyDelta: {
    company: number;
    dept: number;
    team: number;
    personal: number;
  };
}

// ─── アイコンマッピング ───────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  BookOpen,
  Stethoscope,
  Users,
  Building2,
  Heart,
  Lightbulb,
  Shield,
};

// ─── JSON → NaraMandalaDomain[] に変換 ──────────────────────────────────
export const NARA_DOMAINS: NaraMandalaDomain[] = (rawData.domains as Array<Record<string, unknown>>).map((d) => ({
  ...(d as Omit<NaraMandalaDomain, 'icon'>),
  icon: ICON_MAP[d.iconKey as string] ?? Shield,
}));
