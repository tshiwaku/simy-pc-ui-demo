/**
 * OrgPlanPage — SIMY PC UI
 * Design: "Executive Strategy Command Center"
 * Features:
 *   - Tab 1: Strategy Dashboard (default overview) → click to drill down to Matrix Strategy
 *   - Tab 2: Matrix Strategy (3×3 grid) + OKR 4-layer drill-down
 *   - Tab 3: Progress Velocity (speed visualization vs. last week)
 *   - Tab 4: Mid-Term Plan Roadmap
 */

import { useState } from 'react';
import {
  Target, TrendingUp, Users, Zap, Globe, Shield,
  Heart, Lightbulb, BarChart3, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Circle,
  ArrowRight, Building2, User,
  Activity, Map, Calendar, Flame, ArrowUpRight,
  ArrowDownRight, Minus,
  Award, Layers, Flag, Clock, ChevronDown,
  Zap as BoltIcon, TrendingDown, Gauge,
  MessageSquare, Video, Github, Mail, Play, Pause, CheckSquare,
  Stethoscope, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import demoOrgPlanDomainsJson from '@/data/demo-org-plan-domains.json';
// ─── Typess ─────────────────────────────────────────────────────────────

type OKRStatus = 'on-track' | 'at-risk' | 'behind' | 'completed' | 'not-started';
type TabId = 'dashboard' | 'mandala' | 'velocity' | 'roadmap';

// Action source captures (Slack/Zoom etc.)
interface ActionCapture {
  source: 'slack' | 'zoom' | 'teams' | 'github' | 'email';
  actor: string;
  message: string;
  timestamp: string;
  status: 'done' | 'in-progress' | 'blocked';
}

// Actions linked to KR (for Personal OKR)
interface KRAction {
  title: string;
  owner: string;
  status: 'done' | 'in-progress' | 'not-started' | 'blocked';
  progress: number;
  captures: ActionCapture[];
}

// For Team OKR: Estimated Action Completion Rate summary
interface ActionSummary {
  total: number;        // Total estimated actions
  done: number;         // Done count
  inProgress: number;   // In Progress count
  blocked: number;      // Blocked count
  actionListUrl?: string; // Link to action list (for future expansion)
}

// KR Growth Rate (progress change from each point in time)
interface KRGrowth {
  threeMonths: number;  // Change from 3 months ago +/-pt
  oneMonth: number;     // Change from 1 month ago +/-pt
  twoWeeks: number;     // Change from 2 weeks ago +/-pt
  oneWeek: number;      // Change from 1 week ago +/-pt
}

// Time-series data of weekly action execution count (for Progress Velocity)
interface ActionVelocityData {
  // Weekly execution count: [12W ago, 10W ago, 8W ago, 6W ago, 4W ago, 3W ago, 2W ago, 1W ago, This Week]
  weeklyCount: number[];
  labels: string[];
}

interface KeyResult {
  title: string;
  current: string;
  target: string;
  progress: number;
  growth: KRGrowth;
  // Set on Team OKR KR (Estimated Action Completion Rate)
  actionSummary?: ActionSummary;
  // Set on Personal OKR KR (specific action list)
  actions?: KRAction[];
  // For Progress Velocity (set on Team/Personal OKR KR)
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

interface MandalaDomain {
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
  quarterlyData: number[]; // Q1, Q2, Q3, Q4 progress
  riskLevel: 'low' | 'medium' | 'high';
  strategicWeight: number; // 1-10
  // Velocity data vs. last week
  weeklyDelta: {
    company: number;   // Change vs. last week +/-
    dept: number;
    team: number;
    personal: number;
  };
}

// ─── Data ──────────────────────────────────────────────────────────────
// Icon map for JSON → Lucide icon
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>> = {
  TrendingUp, Zap, Heart, Users, Star: Award, Building2, Lightbulb, Shield,
  Stethoscope, BookOpen, Activity,
};

function hydrateDomain(raw: Record<string, unknown>): MandalaDomain {
  return {
    ...raw,
    icon: ICON_MAP[raw.iconKey as string] ?? TrendingUp,
  } as MandalaDomain;
}

const DOMAINS: MandalaDomain[] = (demoOrgPlanDomainsJson as { domains: Record<string, unknown>[] }).domains.map(hydrateDomain);

// ─── Helpers ───────────────────────────────────────────────────────────

function statusConfig(status: OKRStatus) {
  const map: Record<OKRStatus, { label: string; icon: React.ElementType; cls: string; barColor: string }> = {
    'on-track': { label: 'On Track', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', barColor: '#059669' },
    'at-risk': { label: 'At Risk', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200', barColor: '#D97706' },
    'behind': { label: 'Behind', icon: XCircle, cls: 'text-red-600 bg-red-50 border-red-200', barColor: '#DC2626' },
    'completed': { label: 'Completed', icon: CheckCircle2, cls: 'text-blue-600 bg-blue-50 border-blue-200', barColor: '#4F46E5' },
    'not-started': { label: 'Not Started', icon: Circle, cls: 'text-muted-foreground bg-muted border-border', barColor: '#9CA3AF' },
  };
  return map[status];
}

function ProgressBar({ progress, color, height = 'h-1.5' }: { progress: number; color: string; height?: string }) {
  return (
    <div className={cn('w-full bg-muted rounded-full overflow-hidden', height)}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: color }} />
    </div>
  );
}

// ─── OKR Layer Card ────────────────────────────────────────────────────

const LAYER_CONFIG = [
  { key: 'companyOKR', label: 'Company OKR', icon: Building2, color: '#4F46E5' },
  { key: 'deptOKR', label: 'Division OKR', icon: BarChart3, color: '#0284C7' },
  { key: 'teamOKR', label: 'Team OKR', icon: Users, color: '#059669' },
  { key: 'personalOKR', label: 'Personal OKR', icon: User, color: '#D97706' },
] as const;

// ─── Source Icon ──────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    slack:  { label: 'Slack',  color: '#4A154B', bg: '#F4EDF4' },
    zoom:   { label: 'Zoom',   color: '#0B5CFF', bg: '#EEF3FF' },
    teams:  { label: 'Teams',  color: "#5059C9", bg: '#EEEFFE' },
    github: { label: 'GitHub', color: '#24292F', bg: '#F0F0F0' },
    email:  { label: 'Email',  color: '#EA4335', bg: '#FEF0EF' },
  };
  const c = cfg[source] ?? { label: source, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-bold px-1.5 py-0.5 rounded" style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

// ─── Growth Badge ──────────────────────────────────────────────────────
function GrowthBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn(
        'text-sm font-bold',
        isZero ? 'text-muted-foreground' : isPositive ? 'text-emerald-600' : 'text-red-500'
      )}>
        {isZero ? '±0' : isPositive ? `+${value}%` : `${value}%`}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Velocity Sparkline ──────────────────────────────────────────────
function VelocitySparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const w = 80; const h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(' ');
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (v / max) * (h - 4)} r={i === data.length - 1 ? 2.5 : 1.5}
          fill={i === data.length - 1 ? color : 'white'} stroke={color} strokeWidth="1" />
      ))}
    </svg>
  );
}

// ─── KR With Actions ───────────────────────────────────────────────────
function KRWithActions({ kr, index, domainColor, layerKey }: { kr: KeyResult; index: number; domainColor: string; layerKey: string }) {
  const [showActions, setShowActions] = useState(false);
  const hasActions = kr.actions && kr.actions.length > 0;
  const hasActionSummary = kr.actionSummary != null;
  const hasVelocity = kr.velocityData != null;
  const isPersonal = layerKey === 'personalOKR';
  return (
    <div className="rounded-lg bg-muted/30 overflow-hidden">
      {/* KR Header */}
      <div className="flex items-start gap-2.5 p-2.5">
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5" style={{ background: domainColor }}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground leading-snug mb-1">{kr.title}</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1"><ProgressBar progress={kr.progress} color={domainColor} height="h-1" /></div>
            <span className="text-sm font-bold flex-shrink-0" style={{ color: domainColor }}>{kr.progress}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Current: <strong className="text-foreground">{kr.current}</strong></span>
            <ArrowRight size={9} />
            <span>Target: <strong className="text-foreground">{kr.target}</strong></span>
          </div>
          {/* Growth Rate Badge */}
          {kr.growth && (
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">Growth</span>
              <div className="flex items-center gap-3">
                <GrowthBadge value={kr.growth.threeMonths} label="3M ago" />
                <GrowthBadge value={kr.growth.oneMonth} label="1M ago" />
                <GrowthBadge value={kr.growth.twoWeeks} label="2W ago" />
                <GrowthBadge value={kr.growth.oneWeek} label="1W ago" />
              </div>
            </div>
          )}
          {/* Action Execution Pace (Sparkline) */}
          {hasVelocity && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">Action Execution Pace (weekly count)</div>
                  <div className="flex items-end gap-1">
                    {kr.velocityData!.weeklyCount.map((v, i) => {
                      const isLast = i === kr.velocityData!.weeklyCount.length - 1;
                      const max = Math.max(...kr.velocityData!.weeklyCount, 1);
                      const height = Math.max(4, Math.round((v / max) * 20));
                      return (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className="w-4 rounded-sm transition-all" style={{ height: `${height}px`, background: isLast ? domainColor : `${domainColor}50` }} />
                          {isLast && <span className="text-[8px] font-bold" style={{ color: domainColor }}>{v}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[8px] text-muted-foreground">12W ago</span>
                    <span className="text-[8px] font-semibold" style={{ color: domainColor }}>This Week</span>
                  </div>
                </div>
                <VelocitySparkline data={kr.velocityData!.weeklyCount} color={domainColor} />
              </div>
            </div>
          )}
          {/* Team OKR: Action Execution Rate Summary */}
          {hasActionSummary && !isPersonal && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">Action Execution Rate</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold" style={{ color: domainColor }}>
                      {Math.round((kr.actionSummary!.done / kr.actionSummary!.total) * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {kr.actionSummary!.done}/{kr.actionSummary!.total} done
                    </span>
                    {kr.actionSummary!.blocked > 0 && (
                      <span className="text-sm font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600">
                        Blocked {kr.actionSummary!.blocked}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: kr.actionSummary!.total }).map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full" style={{
                        background: i < kr.actionSummary!.done ? domainColor
                          : i < kr.actionSummary!.done + kr.actionSummary!.inProgress ? `${domainColor}50`
                          : '#E5E7EB'
                      }} />
                    ))}
                  </div>
                </div>
                <button
                  className="text-sm font-semibold flex items-center gap-0.5 hover:underline"
                  style={{ color: domainColor }}
                  onClick={() => window.alert('Navigate to Action list page (planned)')}
                >
                  View Action List <ArrowRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Personal OKR: Action List */}
      {hasActions && isPersonal && (
        <div className="border-t border-border/40">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold hover:bg-muted/40 transition-colors text-left"
            style={{ color: domainColor }}
          >
            <Zap size={10} />
            <span>Actions ({kr.actions!.length})</span>
            <ChevronDown size={10} className={cn('ml-auto transition-transform', showActions && 'rotate-180')} />
          </button>
          {showActions && (
            <div className="px-2.5 pb-2.5 space-y-1.5">
              {kr.actions!.map((action, ai) => (
                <KRActionItem key={ai} action={action} domainColor={domainColor} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── KR Action Item ────────────────────────────────────────────────────
function KRActionItem({ action, domainColor }: { action: NonNullable<KeyResult['actions']>[number]; domainColor: string }) {
  const [open, setOpen] = useState(false);
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    'done':         { label: 'Completed',   color: '#059669', bg: '#ECFDF5' },
    'in-progress':  { label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
    'not-started':  { label: 'Not Started', color: '#6B7280', bg: '#F3F4F6' },
    'blocked':      { label: 'Blocked', color: '#DC2626', bg: '#FEF2F2' },
  };
  const s = statusMap[action.status] ?? statusMap['not-started'];
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: domainColor, opacity: 0.6 }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground leading-snug truncate">{action.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-semibold px-1.5 py-0.5 rounded" style={{ color: s.color, background: s.bg }}>{s.label}</span>
            <span className="text-sm text-muted-foreground">{action.owner}</span>
            <div className="flex-1 max-w-[60px]"><ProgressBar progress={action.progress} color={domainColor} height="h-0.5" /></div>
            <span className="text-sm font-bold" style={{ color: domainColor }}>{action.progress}%</span>
          </div>
        </div>
        <ChevronDown size={11} className={cn('text-muted-foreground flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && action.captures.length > 0 && (
        <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-border/40 pt-2">
          {action.captures.map((cap, ci) => (
            <div key={ci} className="flex items-start gap-1.5 text-sm">
              <SourceBadge source={cap.source} />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground">{cap.actor}</span>
                <span className="text-muted-foreground ml-1">{cap.message}</span>
              </div>
              <span className="text-sm text-muted-foreground flex-shrink-0">{cap.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OKRLayerCard({
  layer, okr, domainColor, isLast,
}: {
  layer: typeof LAYER_CONFIG[number];
  okr: OKRItem;
  domainColor: string;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const { label: statusLabel, icon: StatusIcon, cls: statusCls } = statusConfig(okr.status);
  const LayerIcon = layer.icon;

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[19px] top-full w-0.5 h-4 z-10" style={{ background: layer.color, opacity: 0.3 }} />
      )}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-4">
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider"
          style={{ background: `${layer.color}15`, borderBottom: `1px solid ${layer.color}25` }}
        >
          <LayerIcon size={12} style={{ color: layer.color }} />
          <span style={{ color: layer.color }}>{layer.label}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${domainColor}15` }}>
            <Target size={14} style={{ color: domainColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-[13px] font-bold text-foreground leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>
                {okr.title}
              </span>
              <span className={cn('inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full border flex-shrink-0', statusCls)}>
                <StatusIcon size={9} />
                {statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar progress={okr.progress} color={domainColor} />
              </div>
              <span className="text-[12px] font-bold flex-shrink-0" style={{ color: domainColor, fontFamily: "'Sora', sans-serif" }}>
                {okr.progress}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Owner: {okr.owner}</div>
          </div>
          <div className="flex-shrink-0 mt-1">
            <ChevronDown size={13} className={cn('text-muted-foreground transition-transform', expanded && 'rotate-180')} />
          </div>
        </button>
        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key Results</div>
            {okr.keyResults.map((kr, i) => (
              <KRWithActions key={i} kr={kr} index={i} domainColor={domainColor} layerKey={layer.key} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mandala Grid ──────────────────────────────────────────────────────

const GRID_ORDER = [0, 1, 2, 3, -1, 4, 5, 6, 7];

function MandalaCell({ domain, isSelected, onClick }: { domain: MandalaDomain; isSelected: boolean; onClick: () => void }) {
  const Icon = domain.icon;
  const avg = Math.round((domain.companyOKR.progress + domain.deptOKR.progress + domain.teamOKR.progress + domain.personalOKR.progress) / 4);
  const TrendIcon = domain.trend === 'up' ? ArrowUpRight : domain.trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = domain.trend === 'up' ? '#059669' : domain.trend === 'down' ? '#DC2626' : '#9CA3AF';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all duration-200 group',
        isSelected ? 'shadow-lg scale-[1.03]' : 'hover:scale-[1.02] hover:shadow-md border-border bg-card'
      )}
      style={isSelected ? {
        borderColor: domain.color,
        background: `${domain.color}12`,
        boxShadow: `0 0 0 3px ${domain.color}30, 0 4px 20px ${domain.color}25`,
      } : {}}
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${domain.color}08` }} />
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10" style={{ background: `${domain.color}18` }}>
        <Icon size={16} style={{ color: domain.color }} />
      </div>
      <div className="text-sm font-bold text-foreground text-center leading-tight z-10" style={{ fontFamily: "'Sora', sans-serif" }}>
        {domain.label}
      </div>
      <div className="w-full px-1 z-10">
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${avg}%`, background: domain.color }} />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-bold" style={{ color: domain.color }}>{avg}%</span>
          <div className="flex items-center gap-0.5">
            <TrendIcon size={8} style={{ color: trendColor }} />
            <span className="text-[8px] font-semibold" style={{ color: trendColor }}>{domain.trendValue}</span>
          </div>
        </div>
      </div>
      {/* Risk indicator */}
      <div className={cn(
        'absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full z-10',
        domain.riskLevel === 'high' ? 'bg-red-500' : domain.riskLevel === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
      )} />
    </button>
  );
}

function MandalaCenter({ domains }: { domains: MandalaDomain[] }) {
  const overallAvg = Math.round(domains.reduce((s, d) => {
    return s + (d.companyOKR.progress + d.deptOKR.progress + d.teamOKR.progress + d.personalOKR.progress) / 4;
  }, 0) / domains.length);

  return (
    <div
      className="w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 p-2"
      style={{
        background: 'linear-gradient(135deg, oklch(0.3 0.15 264), oklch(0.2 0.1 264))',
        borderColor: 'oklch(0.5 0.2 264)',
        boxShadow: '0 0 0 3px oklch(0.5 0.2 264 / 0.2), 0 4px 20px oklch(0.3 0.15 264 / 0.4)',
      }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.5 0.2 264 / 0.3)' }}>
        <Target size={16} className="text-white" />
      </div>
      <div className="text-sm font-bold text-white text-center leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
        Company<br />Core Goal
      </div>
      <div className="text-[14px] font-black text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{overallAvg}%</div>
      <div className="text-[8px] text-white/60 text-center">Overall Avg</div>
    </div>
  );
}

// ─── Strategy Dashboard ────────────────────────────────────────────────

function StrategyDashboard({ onDrillDown, domains }: { onDrillDown: (domainId: string) => void; domains: MandalaDomain[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const overallAvg = Math.round(domains.reduce((s, d) => {
    return s + (d.companyOKR.progress + d.deptOKR.progress + d.teamOKR.progress + d.personalOKR.progress) / 4;
  }, 0) / domains.length);

  const onTrackCount = domains.filter(d =>
    [d.companyOKR, d.deptOKR, d.teamOKR, d.personalOKR].every(o => o.status === 'on-track' || o.status === 'completed')
  ).length;

  const highRiskCount = domains.filter(d => d.riskLevel === 'high').length;
  const atRiskDomains = domains.filter(d =>
    [d.companyOKR, d.deptOKR, d.teamOKR, d.personalOKR].some(o => o.status === 'at-risk' || o.status === 'behind')
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Overall OKR Progress', value: `${overallAvg}%`, sub: '8 Domain Avg', color: '#4F46E5', icon: Target, trend: '+3.2%', up: true },
            { label: 'On-Track Domains', value: `${onTrackCount}/8`, sub: 'All OKRs On Track', color: '#059669', icon: CheckCircle2, trend: '+1', up: true },
            { label: 'At RiskDomain', value: `${atRiskDomains.length}`, sub: 'Immediate action needed', color: '#D97706', icon: AlertTriangle, trend: '-1', up: false },
            { label: 'High-Risk Domains', value: `${highRiskCount}`, sub: 'Strategic intervention needed', color: '#DC2626', icon: Flame, trend: '±0', up: null },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                    <KpiIcon size={18} style={{ color: kpi.color }} />
                  </div>
                  <div className={cn(
                    'flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-full',
                    kpi.up === true ? 'text-emerald-600 bg-emerald-50' : kpi.up === false ? 'text-red-600 bg-red-50' : 'text-muted-foreground bg-muted'
                  )}>
                    {kpi.up === true ? <ArrowUpRight size={10} /> : kpi.up === false ? <ArrowDownRight size={10} /> : <Minus size={10} />}
                    {kpi.trend}
                  </div>
                </div>
                <div className="text-[28px] font-black text-foreground leading-none mb-1" style={{ fontFamily: "'Sora', sans-serif", color: kpi.color }}>
                  {kpi.value}
                </div>
                <div className="text-[12px] font-semibold text-foreground">{kpi.label}</div>
                <div className="text-sm text-muted-foreground">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* OKR Heat Map + Risk Panel */}
        <div className="grid grid-cols-5 gap-4">
          {/* Heat Map — click to drill down */}
          <div className="col-span-3 bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>OKRProgressHeatmap</h3>
                <p className="text-sm text-muted-foreground">Click a cell to drill down to detailed OKR</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />Behind</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />At Risk</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400 inline-block" />On Track</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-muted-foreground font-medium pb-2 pr-3 w-24">Domain</th>
                    {LAYER_CONFIG.map(l => (
                      <th key={l.key} className="text-center text-muted-foreground font-medium pb-2 px-1">{l.label}</th>
                    ))}
                    <th className="text-center text-muted-foreground font-medium pb-2 px-1">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((domain) => {
                    const layers = [domain.companyOKR, domain.deptOKR, domain.teamOKR, domain.personalOKR];
                    const avg = Math.round(layers.reduce((s, o) => s + o.progress, 0) / 4);
                    const Icon = domain.icon;
                    return (
                      <tr
                        key={domain.id}
                        className="border-t border-border/50 hover:bg-muted/20 cursor-pointer transition-colors group"
                        onClick={() => onDrillDown(domain.id)}
                        title={`${domain.label} — View Detailed OKR`}
                      >
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            <Icon size={11} style={{ color: domain.color }} />
                            <span className="font-medium text-foreground truncate group-hover:underline" style={{ maxWidth: '70px' }}>{domain.label}</span>
                            <ChevronRight size={9} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        </td>
                        {layers.map((okr, i) => {
                          const bg = okr.status === 'on-track' || okr.status === 'completed'
                            ? `${okr.progress >= 80 ? '#059669' : '#34D399'}22`
                            : okr.status === 'at-risk'
                            ? '#D9770622'
                            : '#DC262622';
                          const textColor = okr.status === 'on-track' || okr.status === 'completed'
                            ? '#059669'
                            : okr.status === 'at-risk'
                            ? '#D97706'
                            : '#DC2626';
                          return (
                            <td key={i} className="px-1 py-1.5 text-center">
                              <div className="inline-flex items-center justify-center w-12 h-7 rounded-lg text-sm font-bold" style={{ background: bg, color: textColor }}>
                                {okr.progress}%
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-1 py-1.5 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-7 rounded-lg text-sm font-black" style={{ background: `${domain.color}20`, color: domain.color }}>
                            {avg}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk & Priority Panel */}
          <div className="col-span-2 space-y-4">
            {/* Risk Alerts — click to drill down */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-amber-500" />
                <h3 className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Risk Alerts</h3>
                <span className="ml-auto text-sm text-muted-foreground">Click for details</span>
              </div>
              <div className="space-y-2">
                {domains.filter(d => d.riskLevel !== 'low').map((domain) => {
                  const Icon = domain.icon;
                  const atRiskOKRs = [domain.companyOKR, domain.deptOKR, domain.teamOKR, domain.personalOKR]
                    .filter(o => o.status === 'at-risk' || o.status === 'behind');
                  return (
                    <button
                      key={domain.id}
                      onClick={() => onDrillDown(domain.id)}
                      className={cn(
                        'w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] hover:shadow-sm',
                        domain.riskLevel === 'high' ? 'border-red-200 bg-red-50 hover:border-red-300' : 'border-amber-200 bg-amber-50 hover:border-amber-300'
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${domain.color}20` }}>
                        <Icon size={11} style={{ color: domain.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground">{domain.label}</span>
                          <span className={cn('text-sm font-bold px-1.5 py-0.5 rounded-full', domain.riskLevel === 'high' ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-100')}>
                            {domain.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {atRiskOKRs.length} OKRs need attention → View details
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strategic Priority */}
            <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Award size={14} className="text-primary" />
                <h3 className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Strategic Priority</h3>
              </div>
              <div className="space-y-2">
                {[...domains].sort((a, b) => b.strategicWeight - a.strategicWeight).slice(0, 5).map((domain) => {
                  const Icon = domain.icon;
                  const avg = Math.round([domain.companyOKR, domain.deptOKR, domain.teamOKR, domain.personalOKR].reduce((s, o) => s + o.progress, 0) / 4);
                  return (
                    <button
                      key={domain.id}
                      onClick={() => onDrillDown(domain.id)}
                      className="w-full flex items-center gap-2 hover:bg-muted/30 rounded-lg px-1 py-0.5 transition-colors"
                    >
                      <Icon size={11} style={{ color: domain.color }} />
                      <span className="text-sm text-foreground font-medium flex-1 truncate text-left">{domain.label}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-1.5 h-3 rounded-sm" style={{ background: i < Math.round(domain.strategicWeight / 2) ? domain.color : isDark ? '#334155' : '#E2E8F0' }} />
                        ))}
                      </div>
                      <span className="text-sm font-bold w-8 text-right" style={{ color: domain.color }}>{avg}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Progress Trend */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Quarterly OKR Progress Trend</h3>
              <p className="text-sm text-muted-foreground">Progress trend for each domain from Q1 to Q4</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={12} />
              <span>FY2025</span>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-3">
            {domains.map((domain) => {
              const Icon = domain.icon;
              const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
              return (
                <button
                  key={domain.id}
                  onClick={() => onDrillDown(domain.id)}
                  className="space-y-2 hover:bg-muted/30 rounded-xl p-2 transition-colors text-left"
                >
                  <div className="flex items-center gap-1">
                    <Icon size={10} style={{ color: domain.color }} />
                    <span className="text-sm font-semibold text-muted-foreground truncate">{domain.label.length > 6 ? domain.label.slice(0, 5) + '…' : domain.label}</span>
                  </div>
                  <div className="flex items-end gap-0.5 h-16">
                    {domain.quarterlyData.map((val, qi) => (
                      <div key={qi} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full rounded-t-sm transition-all"
                          style={{
                            height: `${(val / 100) * 56}px`,
                            background: qi === 3 ? domain.color : `${domain.color}50`,
                            minHeight: '2px',
                          }}
                        />
                        <span className="text-[8px] text-muted-foreground">{quarters[qi]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-center" style={{ color: domain.color }}>
                    {domain.quarterlyData[3]}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* All OKR Status Summary */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>All OKR Status Summary</h3>
              <p className="text-sm text-muted-foreground">Current status of 32 OKRs (8 Domains × 4 Layers)</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(['on-track', 'at-risk', 'behind', 'completed'] as OKRStatus[]).map((status) => {
              const allOKRs = domains.flatMap(d => [d.companyOKR, d.deptOKR, d.teamOKR, d.personalOKR]);
              const count = allOKRs.filter(o => o.status === status).length;
              const pct = Math.round((count / allOKRs.length) * 100);
              const cfg = statusConfig(status);
              const StatusIcon = cfg.icon;
              return (
                <div key={status} className={cn('rounded-xl p-3 border', cfg.cls.includes('emerald') ? 'border-emerald-200 bg-emerald-50' : cfg.cls.includes('amber') ? 'border-amber-200 bg-amber-50' : cfg.cls.includes('red') ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50')}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <StatusIcon size={13} style={{ color: cfg.barColor }} />
                    <span className="text-sm font-semibold" style={{ color: cfg.barColor }}>{cfg.label}</span>
                  </div>
                  <div className="text-[24px] font-black" style={{ color: cfg.barColor, fontFamily: "'Sora', sans-serif" }}>{count}</div>
                  <div className="text-sm text-muted-foreground">{pct}% ({count}/32)</div>
                  <div className="mt-2 h-1 bg-white/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Velocity Tab ──────────────────────────────────────────────────────

function VelocityView({ onDrillDown, domains }: { onDrillDown: (domainId: string) => void; domains: MandalaDomain[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Sorted by absolute value of delta vs last week (largest movement first)
  const domainsByMovement = [...domains].sort((a, b) => {
    const aMax = Math.max(Math.abs(a.weeklyDelta.company), Math.abs(a.weeklyDelta.dept), Math.abs(a.weeklyDelta.team), Math.abs(a.weeklyDelta.personal));
    const bMax = Math.max(Math.abs(b.weeklyDelta.company), Math.abs(b.weeklyDelta.dept), Math.abs(b.weeklyDelta.team), Math.abs(b.weeklyDelta.personal));
    return bMax - aMax;
  });

  // Aggregate last week comparison across all layers
  const allDeltas = domains.flatMap(d => [d.weeklyDelta.company, d.weeklyDelta.dept, d.weeklyDelta.team, d.weeklyDelta.personal]);
  const accelerating = allDeltas.filter(v => v > 1.0).length;
  const stalling = allDeltas.filter(v => v >= -0.5 && v <= 1.0).length;
  const declining = allDeltas.filter(v => v < -0.5).length;

  const layerKeys: Array<{ key: keyof MandalaDomain['weeklyDelta']; label: string; icon: React.ElementType; color: string }> = [
    { key: 'company', label: 'Company', icon: Building2, color: '#4F46E5' },
    { key: 'dept', label: 'Department', icon: BarChart3, color: '#0284C7' },
    { key: 'team', label: 'Team', icon: Users, color: '#059669' },
    { key: 'personal', label: 'Individual', icon: User, color: '#D97706' },
  ];

  function DeltaBadge({ value }: { value: number }) {
    const isUp = value > 0.5;
    const isDown = value < -0.5;
    const formatted = value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
    return (
      <span className={cn(
        'inline-flex items-center gap-0.5 text-sm font-bold px-1.5 py-0.5 rounded-full',
        isUp ? 'text-emerald-700 bg-emerald-100' : isDown ? 'text-red-600 bg-red-100' : 'text-slate-500 bg-slate-100'
      )}>
        {isUp ? <ArrowUpRight size={9} /> : isDown ? <ArrowDownRight size={9} /> : <Minus size={9} />}
        {formatted}
      </span>
    );
  }

  // Sparkline-style weekly trend (past 5 weeks)
  function WeeklySparkline({ domain }: { domain: MandalaDomain }) {
    // Past 5 weeks data back-calculated from current value (simulation)
    const avg = Math.round([domain.companyOKR, domain.deptOKR, domain.teamOKR, domain.personalOKR].reduce((s, o) => s + o.progress, 0) / 4);
    const avgDelta = (domain.weeklyDelta.company + domain.weeklyDelta.dept + domain.weeklyDelta.team + domain.weeklyDelta.personal) / 4;
    const weeks = Array.from({ length: 5 }, (_, i) => {
      const weeksAgo = 4 - i;
      return Math.max(0, Math.min(100, avg - avgDelta * weeksAgo + (Math.sin(i * 1.3 + domain.id.charCodeAt(0)) * 1.5)));
    });
    const minV = Math.min(...weeks);
    const maxV = Math.max(...weeks);
    const range = maxV - minV || 1;
    const height = 28;
    const width = 80;
    const points = weeks.map((v, i) => `${(i / 4) * width},${height - ((v - minV) / range) * height}`).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={domain.color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
        {weeks.map((v, i) => (
          <circle
            key={i}
            cx={(i / 4) * width}
            cy={height - ((v - minV) / range) * height}
            r={i === 4 ? 3 : 1.5}
            fill={i === 4 ? domain.color : `${domain.color}80`}
          />
        ))}
      </svg>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Header KPI */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Accelerating', value: accelerating, sub: 'Last week +1% or more', color: '#059669', icon: ArrowUpRight, bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Stalling', value: stalling, sub: 'Last week ±1% or less', color: '#6B7280', icon: Minus, bg: 'bg-slate-50 border-slate-200' },
            { label: 'Decelerating', value: declining, sub: 'Last week -0.5% or less', color: '#DC2626', icon: ArrowDownRight, bg: 'bg-red-50 border-red-200' },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className={cn('rounded-2xl border p-4 shadow-sm', kpi.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                    <KpiIcon size={16} style={{ color: kpi.color }} />
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: kpi.color }}>{kpi.label}</span>
                </div>
                <div className="text-[32px] font-black leading-none" style={{ color: kpi.color, fontFamily: "'Sora', sans-serif" }}>{kpi.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{kpi.sub}  OKRs</div>
              </div>
            );
          })}
        </div>

        {/* Domain Velocity Matrix */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                Domain × Layer Velocity Matrix
              </h3>
              <p className="text-sm text-muted-foreground">Progress change vs last week (+: Accelerating, −: Declining) · Click row for details</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-600"><ArrowUpRight size={10} />Accelerating</span>
              <span className="flex items-center gap-1 text-slate-400"><Minus size={10} />Stalling</span>
              <span className="flex items-center gap-1 text-red-500"><ArrowDownRight size={10} />Declining</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium pb-2 pr-3 w-28">Domain</th>
                {layerKeys.map(l => (
                  <th key={l.key} className="text-center text-muted-foreground font-medium pb-2 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <l.icon size={10} style={{ color: l.color }} />
                      {l.label}
                    </div>
                  </th>
                ))}
                <th className="text-center text-muted-foreground font-medium pb-2 px-2">Weekly Trend</th>
                <th className="text-center text-muted-foreground font-medium pb-2 px-2">Avg Change</th>
              </tr>
            </thead>
            <tbody>
              {domainsByMovement.map((domain) => {
                const Icon = domain.icon;
                const avgDelta = (domain.weeklyDelta.company + domain.weeklyDelta.dept + domain.weeklyDelta.team + domain.weeklyDelta.personal) / 4;
                return (
                  <tr
                    key={domain.id}
                    className="border-t border-border/50 hover:bg-muted/20 cursor-pointer transition-colors group"
                    onClick={() => onDrillDown(domain.id)}
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} style={{ color: domain.color }} />
                        <span className="font-semibold text-foreground group-hover:underline">{domain.label}</span>
                      </div>
                    </td>
                    {layerKeys.map(l => (
                      <td key={l.key} className="px-2 py-3 text-center">
                        <DeltaBadge value={domain.weeklyDelta[l.key]} />
                      </td>
                    ))}
                    <td className="px-2 py-3 text-center">
                      <div className="flex justify-center">
                        <WeeklySparkline domain={domain} />
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <DeltaBadge value={avgDelta} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top 5 Most Active Personal OKRs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Top Accelerating */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <ArrowUpRight size={14} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Accelerating OKRs</h3>
                <p className="text-sm text-muted-foreground">Most advanced vs last week</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { domain: domains[1] || domains[0], layer: domains[1]?.deptOKR?.owner || '', okr: (domains[1] || domains[0]).teamOKR, delta: (domains[1] || domains[0]).weeklyDelta.team },
                { domain: domains[2] || domains[0], layer: domains[2]?.personalOKR?.owner || '', okr: (domains[2] || domains[0]).personalOKR, delta: (domains[2] || domains[0]).weeklyDelta.personal },
                { domain: domains[1] || domains[0], layer: domains[1]?.deptOKR?.owner || '', okr: (domains[1] || domains[0]).deptOKR, delta: (domains[1] || domains[0]).weeklyDelta.dept },
              ].map((item, i) => {
                const Icon = item.domain.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onDrillDown(item.domain.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.domain.color}15` }}>
                      <Icon size={12} style={{ color: item.domain.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{item.okr.title}</div>
                      <div className="text-sm text-muted-foreground">{item.layer} · {item.domain.label}</div>
                    </div>
                    <DeltaBadge value={item.delta} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Declining / At Risk */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                <ArrowDownRight size={14} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Declining / Stalling OKRs</h3>
                <p className="text-sm text-muted-foreground">Most behind vs last week</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { domain: domains[4] || domains[0], layer: (domains[4] || domains[0]).personalOKR?.owner || '', okr: (domains[4] || domains[0]).personalOKR, delta: (domains[4] || domains[0]).weeklyDelta.personal },
                { domain: domains[Math.min(6, domains.length-1)], layer: (domains[Math.min(6, domains.length-1)]).deptOKR?.owner || '', okr: (domains[Math.min(6, domains.length-1)]).deptOKR, delta: (domains[Math.min(6, domains.length-1)]).weeklyDelta.dept },
                { domain: domains[4] || domains[0], layer: (domains[4] || domains[0]).deptOKR?.owner || '', okr: (domains[4] || domains[0]).deptOKR, delta: (domains[4] || domains[0]).weeklyDelta.dept },
              ].map((item, i) => {
                const Icon = item.domain.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onDrillDown(item.domain.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.domain.color}15` }}>
                      <Icon size={12} style={{ color: item.domain.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{item.okr.title}</div>
                      <div className="text-sm text-muted-foreground">{item.layer} · {item.domain.label}</div>
                    </div>
                    <DeltaBadge value={item.delta} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Weekly Commentary */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gauge size={14} className="text-primary" />
            </div>
            <h3 className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>This Week's Velocity Analysis</h3>
            <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">AI Generated · vs Last Week</span>
          </div>
          <div className="space-y-3">
            {[
              {
                type: 'accelerate',
                color: '#059669',
                bg: 'bg-emerald-50 border-emerald-200',
                icon: ArrowUpRight,
                text: 'Product domain accelerating across all 4 layers. Development team sprint completion rate up +4.1pt vs last week, the largest gain. AI feature development momentum is high.',
              },
              {
                type: 'warning',
                color: '#D97706',
                bg: 'bg-amber-50 border-amber-200',
                icon: AlertTriangle,
                text: 'Brand & Awareness domain declining across all layers (avg -2.9pt). Sophia Reyes Personal OKR has the largest drop at -4.1pt. PR activity stagnation is the estimated cause.',
              },
              {
                type: 'insight',
                color: '#4F46E5',
                bg: 'bg-indigo-50 border-indigo-200',
                icon: BoltIcon,
                text: 'Innovation domain declining at department and team level, but individual (Derek Fontaine) is up +0.7pt, going against the trend. Possible lack of organizational support.',
              },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl border', item.bg)}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${item.color}20` }}>
                    <ItemIcon size={12} style={{ color: item.color }} />
                  </div>
                  <p className="text-[12px] text-foreground leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Roadmap Tab ────────────────────────────────────────────────────────

function RoadmapView() {
  const milestones = [
    { quarter: 'Q1 2025', label: 'Completed', items: ['ARR ¥1.5B Achieved', 'SOC2 Type II Obtained', '3 Engineers Hired'], status: 'completed' as OKRStatus },
    { quarter: 'Q2 2025', label: 'In Progress', items: ['ARR ¥1.86B Reached', 'AI Feature Beta Released', 'LinkedIn 2,100 Followers'], status: 'on-track' as OKRStatus },
    { quarter: 'Q3 2025', label: 'Planned', items: ['ARR ¥2.1B Target', 'NPS 55+', '5 Engineers Total Hired'], status: 'at-risk' as OKRStatus },
    { quarter: 'Q4 2025', label: 'Planned', items: ['ARR ¥2.4B Target', 'NPS 60+', 'Brand Awareness Top 5', 'EBITDA 15% Achieved'], status: 'not-started' as OKRStatus },
  ];

  const initiatives = [
    { name: 'AI-First Product Strategy', owner: 'Product Dept', deadline: 'Q3 2025', progress: 60, color: '#7C3AED', priority: 'HIGH' },
    { name: 'Enterprise Go-to-Market', owner: 'Sales Dept', deadline: 'Q2 2025', progress: 45, color: '#059669', priority: 'HIGH' },
    { name: 'Brand Awareness Campaign', owner: 'Marketing Dept', deadline: 'Q4 2025', progress: 30, color: '#D97706', priority: 'MED' },
    { name: 'Zero-Trust Security Migration', owner: 'Infrastructure Team', deadline: 'Q3 2025', progress: 70, color: '#4F46E5', priority: 'HIGH' },
    { name: 'Global Talent Acquisition', owner: 'HR Dept', deadline: 'Q2 2025', progress: 40, color: '#0284C7', priority: 'MED' },
    { name: 'LLM Integration Platform', owner: 'Engineering Dept', deadline: 'Q4 2025', progress: 25, color: '#0891B2', priority: 'HIGH' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quarterly Timeline */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-primary" />
            <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Quarterly Milestones — FY2025</h3>
          </div>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="grid grid-cols-4 gap-4 relative">
              {milestones.map((m, i) => {
                const cfg = statusConfig(m.status);
                const StatusIcon = cfg.icon;
                return (
                  <div key={i} className="relative">
                    <div className="flex flex-col items-center mb-3">
                      <div className={cn('w-10 h-10 rounded-full border-2 flex items-center justify-center bg-card z-10 relative', cfg.cls.includes('emerald') ? 'border-emerald-400' : cfg.cls.includes('amber') ? 'border-amber-400' : cfg.cls.includes('red') ? 'border-red-400' : 'border-border')}>
                        <StatusIcon size={16} style={{ color: cfg.barColor }} />
                      </div>
                    </div>
                    <div className="text-center mb-2">
                      <div className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>{m.quarter}</div>
                      <div className={cn('text-sm font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5', cfg.cls)}>
                        {m.label}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {m.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strategic Initiatives */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Flag size={16} className="text-primary" />
            <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Strategic Initiatives</h3>
          </div>
          <div className="space-y-3">
            {initiatives.map((init, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: init.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-foreground">{init.name}</span>
                    <span className={cn('text-sm font-bold px-1.5 py-0.5 rounded-full', init.priority === 'HIGH' ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-100')}>
                      {init.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{init.owner}</span>
                    <span>·</span>
                    <span>Deadline: {init.deadline}</span>
                  </div>
                </div>
                <div className="w-32 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-[12px] font-bold" style={{ color: init.color }}>{init.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${init.progress}%`, background: init.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function OrgPlanPage() {
  const activeDomains = DOMAINS as MandalaDomain[];
  const [selectedDomain, setSelectedDomain] = useState<MandalaDomain>(activeDomains[0]);
  // Default is Strategy Dashboard (overview)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Drill-down from Dashboard to Matrix Strategy
  function handleDrillDown(domainId: string) {
    const domain = activeDomains.find(d => d.id === domainId);
    if (domain) {
      setSelectedDomain(domain);
      setActiveTab('mandala');
    }
  }

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Strategy Dashboard', icon: Activity },
    { id: 'mandala', label: 'Matrix Strategy', icon: Layers },
    { id: 'velocity', label: 'Progress Velocity', icon: Gauge },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Header with Tabs */}
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[20px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                Org Plan
              </h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Overview in Strategy Dashboard → Click domain for OKR drill-down · Check weekly speed in Progress Velocity
              </p>
            </div>
            {/* Overall progress badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Overall OKR Progress</div>
                <div className="text-[22px] font-black text-primary" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {Math.round(activeDomains.reduce((s, d) => s + (d.companyOKR.progress + d.deptOKR.progress + d.teamOKR.progress + d.personalOKR.progress) / 4, 0) / activeDomains.length)}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 flex items-center justify-center" style={{ background: 'oklch(0.5 0.2 264 / 0.1)' }}>
                <Target size={20} className="text-primary" />
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-lg border-b-2 transition-all',
                    activeTab === tab.id
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  <TabIcon size={14} />
                  {tab.label}
                  {tab.id === 'velocity' && (
                    <span className="text-sm font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary ml-0.5">NEW</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && <StrategyDashboard onDrillDown={handleDrillDown} domains={activeDomains} />}

        {activeTab === 'mandala' && (
          <div className="h-full flex overflow-hidden">
            {/* Left: Mandala + summary */}
            <div className="w-[480px] flex-shrink-0 border-r border-border overflow-y-auto">
              {/* Drill-down origin banner */}
              {selectedDomain && (
                <div
                  className="mx-6 mt-4 mb-0 px-3 py-2 rounded-xl border text-sm flex items-center gap-2"
                  style={{ borderColor: `${selectedDomain.color}40`, background: `${selectedDomain.color}08`, color: selectedDomain.color }}
                >
                  <ChevronRight size={11} />
                  <span className="font-semibold">Drilling down from Dashboard to "{selectedDomain.label}"</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="ml-auto text-sm underline opacity-70 hover:opacity-100"
                  >
                    ← Back
                  </button>
                </div>
              )}
              {/* Mandala Chart */}
              <div className="px-6 py-5">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Matrix Strategy — 8 Target Domains
                  <span className="ml-auto flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />High Risk</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Medium Risk</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Low Risk</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GRID_ORDER.map((domainIdx, cellIdx) => {
                    if (domainIdx === -1) return <MandalaCenter key="center" domains={activeDomains} />;
                    const domain = activeDomains[domainIdx < activeDomains.length ? domainIdx : 0];
                    return (
                      <MandalaCell
                        key={domain.id}
                        domain={domain}
                        isSelected={selectedDomain.id === domain.id}
                        onClick={() => setSelectedDomain(domain)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Domain summary stats */}
              <div className="px-6 pb-6">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: selectedDomain.color }} />
                  {selectedDomain.label} — Progress Summary by Layer
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LAYER_CONFIG.map((l) => {
                    const okr = selectedDomain[l.key];
                    const LayerIcon = l.icon;
                    const { barColor } = statusConfig(okr.status);
                    return (
                      <div key={l.key} className="bg-card rounded-xl border border-border p-3 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-2">
                          <LayerIcon size={11} style={{ color: l.color }} />
                          <span className="text-sm font-semibold text-muted-foreground">{l.label}</span>
                        </div>
                        <div className="text-[18px] font-bold mb-1" style={{ color: barColor, fontFamily: "'Sora', sans-serif" }}>
                          {okr.progress}%
                        </div>
                        <ProgressBar progress={okr.progress} color={barColor} />
                        <div className="text-sm text-muted-foreground mt-1.5 leading-snug line-clamp-2">{okr.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: OKR hierarchy drill-down */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="px-6 py-5 border-b border-border sticky top-0 z-10 bg-background"
                style={{ borderLeft: `4px solid ${selectedDomain.color}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${selectedDomain.color}18` }}>
                    <selectedDomain.icon size={20} style={{ color: selectedDomain.color }} />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                      {selectedDomain.label}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-muted-foreground">
                      <span>OKR Layer Drill-down</span>
                      <span>·</span>
                      <span>Company → Department → Team → Individual</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className={cn('flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full border',
                      selectedDomain.riskLevel === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
                      selectedDomain.riskLevel === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                      'text-emerald-600 bg-emerald-50 border-emerald-200'
                    )}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', selectedDomain.riskLevel === 'high' ? 'bg-red-500' : selectedDomain.riskLevel === 'medium' ? 'bg-amber-400' : 'bg-emerald-400')} />
                      {selectedDomain.riskLevel === 'high' ? 'High Risk' : selectedDomain.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                  {LAYER_CONFIG.map((l, i) => {
                    const okr = selectedDomain[l.key];
                    const LayerIcon = l.icon;
                    return (
                      <div key={l.key} className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm font-semibold" style={{ borderColor: `${l.color}40`, background: `${l.color}10`, color: l.color }}>
                          <LayerIcon size={11} />
                          <span>{l.label}</span>
                          <span className="font-bold">{okr.progress}%</span>
                        </div>
                        {i < LAYER_CONFIG.length - 1 && <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-5 space-y-0">
                {LAYER_CONFIG.map((l, i) => (
                  <OKRLayerCard key={l.key} layer={l} okr={selectedDomain[l.key]} domainColor={selectedDomain.color} isLast={i === LAYER_CONFIG.length - 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'velocity' && <VelocityView onDrillDown={handleDrillDown} domains={activeDomains} />}
        {activeTab === 'roadmap' && <RoadmapView />}
      </div>
    </div>
  );
}
