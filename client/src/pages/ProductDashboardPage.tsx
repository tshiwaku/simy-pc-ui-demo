/**
 * 成長ダッシュボード — ゼロベース再設計
 * Design Philosophy: "Numbers speak. Less is more."
 * - L0: ノーススター（1指標を大きく）
 * - L1: ドライバー6指標（コンパクト横並び、高さ固定）
 * - L2: 選択中ドライバーの詳細（ボトルネック + 優先アクション）
 * - L3: 実験パルス（横スクロールカード）
 * Color rule: green=順調, red=critical, amber=要注意, blue=action only, gray=default
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import demoDashRaw from '@/data/demo-dashboard.json';
import {
  TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Zap,
  ArrowRight, Lightbulb, FlaskConical,
  ChevronRight, BarChart3, Users, Repeat,
  DollarSign, Share2, Activity, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type DriverStatus = 'good' | 'warning' | 'critical';
type DriverKey = 'acquisition' | 'activation' | 'engagement' | 'retention' | 'monetization' | 'referral';

interface Driver {
  key: DriverKey;
  label: string;
  icon: React.ElementType;
  value: string;
  delta: string;
  deltaPositive: boolean;
  goal: string;
  goalPct: number;
  status: DriverStatus;
}

interface BottleneckFactor {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium';
  affectedCount: number;
  delta: string;
  summary: string;
}

interface PriorityAction {
  id: string;
  title: string;
  driver: string;
  driverColorClass: string;
  priority: 'critical' | 'high' | 'medium';
  dueDate: string;
  assignee: string;
}

interface Experiment {
  id: string;
  type: string;
  status: 'running' | 'completed' | 'planned';
  title: string;
  metric: string;
  metricDelta: string;
  confidence: number;
  score: number;
  daysLeft?: number;
  driver: DriverKey;
}

// ─── Icon Mapping Adapter ────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Users, Zap, Activity, Repeat, DollarSign, Share2, BarChart3, TrendingUp, TrendingDown,
};

function hydrateDrivers(raw: typeof simyDashRaw.drivers): Driver[] {
  return raw.map(d => ({ ...d, icon: ICON_MAP[d.iconKey] ?? Users })) as unknown as Driver[];
}

// ─── Data (loaded from JSON) ────────────────────────────────────────────────

const DRIVERS: Driver[] = hydrateDrivers(demoDashRaw.drivers);
const BOTTLENECKS = demoDashRaw.bottlenecks as unknown as Record<DriverKey, BottleneckFactor[]>;
const PRIORITY_ACTIONS = demoDashRaw.priorityActions as PriorityAction[];
const EXPERIMENTS = demoDashRaw.experiments as Experiment[];

// ─── Legacy inline data removed — see src/data/simy-dashboard.json & nara-dashboard.json ───

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: DriverStatus }) {
  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full flex-shrink-0',
        status === 'good' ? 'bg-emerald-500' :
        status === 'warning' ? 'bg-amber-500' :
        'bg-red-500'
      )}
    />
  );
}

function StatusLabel({ status }: { status: DriverStatus }) {
  const map = {
    good:     { label: '順調',         cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    warning:  { label: '要注意',       cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    critical: { label: 'クリティカル', cls: 'text-red-600 bg-red-50 border-red-200' },
  };
  const { label, cls } = map[status];
  return (
    <span className={cn('text-sm font-medium px-2 py-0.5 rounded-md border', cls)}>
      {label}
    </span>
  );
}

function DeltaBadge({ delta, positive }: { delta: string; positive: boolean }) {
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span className={cn(
      'flex items-center gap-0.5 text-sm font-semibold',
      positive ? 'text-emerald-600' : 'text-red-500'
    )}>
      <Icon size={12} />
      {delta}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: 'critical' | 'high' | 'medium' }) {
  const map = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high:     'bg-amber-100 text-amber-700 border-amber-200',
    medium:   'bg-blue-100 text-blue-700 border-blue-200',
  };
  const labels = { critical: 'Critical', high: 'High', medium: 'Medium' };
  return (
    <span className={cn('text-sm font-semibold px-2 py-0.5 rounded border', map[severity])}>
      {labels[severity]}
    </span>
  );
}

function PriorityDot({ priority }: { priority: 'critical' | 'high' | 'medium' }) {
  const cls = {
    critical: 'bg-red-500',
    high:     'bg-amber-500',
    medium:   'bg-blue-400',
  };
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', cls[priority])} />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDashboardPage() {
  const [, navigate] = useLocation();
  const activeDrivers = DRIVERS;
  const activeBottlenecks = BOTTLENECKS;
  const activePriorityActions = PRIORITY_ACTIONS;
  const activeExperiments = EXPERIMENTS;
  const [selectedDriver, setSelectedDriver] = useState<DriverKey>('retention');

  const driver = activeDrivers.find(d => d.key === selectedDriver)!;
  const bottlenecks = activeBottlenecks[selectedDriver] ?? [];
  const criticalCount = activeDrivers.filter(d => d.status === 'critical').length;
  const warningCount = activeDrivers.filter(d => d.status === 'warning').length;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">成長ダッシュボード</h1>
            <p className="text-sm text-muted-foreground mt-0.5">月次売上 ・ 林商事株式会社</p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <AlertTriangle size={13} />
                {criticalCount} クリティカル
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <Minus size={13} />
                {warningCount} 要注意
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ライブ · 2分前に更新
            </span>
          </div>
        </div>

        {/* ── L0: North Star ── */}
        <div className="bg-card border border-border rounded-xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">North Star</p>
                <p className="text-sm text-muted-foreground">月次売上</p>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-4xl font-bold text-foreground tracking-tight">3,820万円</span>
                  <DeltaBadge delta="+8.2%" positive={true} />
                  <span className="text-sm text-muted-foreground">目標：5,000万円</span>
                </div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">目標</p>
                <p className="text-lg font-semibold text-foreground">5,000万円</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '76%' }} />
                  </div>
                  <span className="text-sm font-semibold text-primary">76%</span>
                </div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">先月比</p>
                  <p className="text-lg font-semibold text-emerald-600">+8.2%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">四半期目標</p>
                  <p className="text-lg font-semibold text-foreground">Q2: 4,200万円</p>
                </div>
              </div>
            </div>
            {/* Sparkline */}
            <svg width="160" height="48" viewBox="0 0 160 48" className="opacity-60">
              <polyline
                points="0,40 20,36 40,30 60,28 80,22 100,18 120,14 140,10 160,6"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="160" cy="6" r="3" fill="#10b981" />
            </svg>
          </div>
        </div>

        {/* ── L1: Drivers ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">成長ドライバー</span>
            <span className="text-sm text-muted-foreground">— クリックで詳細を表示</span>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {activeDrivers.map((d) => {
              const Icon = d.icon;
              const isSelected = selectedDriver === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDriver(d.key)}
                  className={cn(
                    'relative text-left rounded-xl border px-4 py-3.5 transition-all group',
                    isSelected
                      ? 'bg-card border-primary shadow-sm ring-1 ring-primary/30'
                      : 'bg-card border-border hover:border-primary/40 hover:shadow-sm'
                  )}
                >
                  {/* Status accent top bar */}
                  <div
                    className={cn(
                      'absolute top-0 left-4 right-4 h-0.5 rounded-full transition-all',
                      d.status === 'good' ? 'bg-emerald-500' :
                      d.status === 'warning' ? 'bg-amber-500' : 'bg-red-500',
                      isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                    )}
                  />
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={d.status} />
                      <span className="text-sm font-medium text-muted-foreground truncate">{d.label}</span>
                    </div>
                    <Icon size={12} className="text-muted-foreground/50 flex-shrink-0" />
                  </div>
                  <p className="text-base font-bold text-foreground leading-tight truncate">{d.value}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <DeltaBadge delta={d.delta} positive={d.deltaPositive} />
                    <span className="text-sm text-muted-foreground">{d.goalPct}%</span>
                  </div>
                  {/* Goal progress bar */}
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        d.status === 'good' ? 'bg-emerald-500' :
                        d.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${d.goalPct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── L2: Detail + Actions ── */}
        <div className="grid grid-cols-[1fr_320px] gap-4">

          {/* Left: Bottleneck */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <StatusDot status={driver.status} />
                <span className="text-base font-semibold text-foreground">{driver.label}</span>
                <StatusLabel status={driver.status} />
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{driver.value}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <DeltaBadge delta={driver.delta} positive={driver.deltaPositive} />
                    <span className="text-sm text-muted-foreground">先週比</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">目標: {driver.goal}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          driver.status === 'critical' ? 'bg-red-500' :
                          driver.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                        style={{ width: `${driver.goalPct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{driver.goalPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottlenecks */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">ボトルネック要因</span>
                <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{bottlenecks.length}</span>
              </div>
              {bottlenecks.length === 0 ? (
                <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm">ボトルネックなし — 順調に推移中</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {bottlenecks.map((bn, idx) => (
                    <div
                      key={bn.id}
                      className={cn(
                        'rounded-lg border px-4 py-3.5',
                        bn.severity === 'critical'
                          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50'
                          : bn.severity === 'high'
                          ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/50'
                          : 'border-border bg-muted/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold text-muted-foreground/50 flex-shrink-0">#{idx + 1}</span>
                          <SeverityBadge severity={bn.severity} />
                          <span className="text-sm font-semibold text-foreground truncate">{bn.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm text-muted-foreground">
                            影響: <strong className="text-foreground">{bn.affectedCount}</strong>組織
                          </span>
                          <DeltaBadge delta={bn.delta} positive={false} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bn.summary}</p>
                      <button
                        onClick={() => navigate('/issues')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Lightbulb size={12} />
                        イシュー化
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Priority Actions */}
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">優先アクション</span>
              </div>
              <button
                onClick={() => navigate('/actions')}
                className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                すべて
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="px-4 py-3 space-y-2 flex-1">
              {activePriorityActions.map((action, idx) => (
                <div
                  key={action.id}
                  className="rounded-lg border border-border bg-background px-3.5 py-3 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigate('/actions')}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-sm font-bold text-muted-foreground/40 flex-shrink-0 mt-0.5">#{idx + 1}</span>
                    <PriorityDot priority={action.priority} />
                    <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{action.title}</p>
                  </div>
                  <div className="flex items-center justify-between pl-7">
                    <span className={cn('text-sm font-medium', action.driverColorClass)}>{action.driver}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{action.dueDate}</span>
                      <span>·</span>
                      <span className="truncate max-w-[80px]">{action.assignee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Stats footer */}
            <div className="border-t border-border px-5 py-3 flex items-center justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">実行中</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">完了</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">1</p>
                <p className="text-sm text-muted-foreground">予定</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── L3: Experiment Pulse ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">実験パルス</span>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {activeExperiments.filter(e => e.status === 'running').length} 実行中
              </span>
            </div>
            <span className="text-sm text-muted-foreground">インパクト × 信頼度でソート</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {activeExperiments.map((exp) => {
              const statusMap = {
                running:   { label: '実行中', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                completed: { label: '完了',   cls: 'text-blue-600 bg-blue-50 border-blue-200' },
                planned:   { label: '予定',   cls: 'text-muted-foreground bg-muted border-border' },
              };
              const { label, cls } = statusMap[exp.status];
              const driverLabel = activeDrivers.find(d => d.key === exp.driver)?.label ?? '';
              const driverStatus = activeDrivers.find(d => d.key === exp.driver)?.status ?? 'good';
              const isPositive = exp.metricDelta.startsWith('+');
              const circumference = 2 * Math.PI * 16;
              const dashArray = `${(exp.score / 100) * circumference} ${circumference}`;
              const scoreColor = exp.score >= 70 ? '#10b981' : exp.score >= 50 ? '#f59e0b' : '#6b7280';
              return (
                <div key={exp.id} className="bg-card border border-border rounded-xl px-4 py-4 hover:shadow-sm hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-muted-foreground">{exp.type}</span>
                      {exp.daysLeft && (
                        <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{exp.daysLeft}d</span>
                      )}
                    </div>
                    <span className={cn('text-sm font-medium px-2 py-0.5 rounded border', cls)}>{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-3">{exp.title}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{exp.metric}</p>
                      <p className={cn('text-base font-bold', isPositive ? 'text-emerald-600' : 'text-red-500')}>
                        {exp.metricDelta}
                      </p>
                    </div>
                    {/* Score circle */}
                    <div className="relative w-10 h-10">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle
                          cx="20" cy="20" r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-muted/50"
                        />
                        <circle
                          cx="20" cy="20" r="16"
                          fill="none"
                          stroke={scoreColor}
                          strokeWidth="3"
                          strokeDasharray={dashArray}
                          strokeLinecap="round"
                          transform="rotate(-90 20 20)"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                        {exp.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={driverStatus} />
                      <span className="text-sm text-muted-foreground">{driverLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>信頼度</span>
                      <span className="font-semibold text-foreground">{exp.confidence}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </div>
  );
}
