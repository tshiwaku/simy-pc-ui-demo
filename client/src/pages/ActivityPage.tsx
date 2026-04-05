/**
 * ActivityPage - SIMY PC UI
 * Design: "Executive Intelligence Dashboard"
 * Features:
 *   - Tab 1: Personal Activity (Heatmap & AI usage ranking)
 *   - Tab 2: Org Performance (Company-wide AI usage & dept analysis)
 *   - Tab 3: AI Insights (Weekly summary, trends & recommended actions)
 */

import { useState, useMemo } from 'react';
import {
  CheckSquare, Bot, Calendar, Users,
  Flame, TrendingUp, Award, BarChart3,
  ChevronLeft, ChevronRight, Zap, Star,
  Trophy, Medal, Crown, Activity, Brain,
  ArrowUpRight, ArrowDownRight, Minus,
  Target, Lightbulb, AlertTriangle, CheckCircle2,
  Clock, Eye, Layers, TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Generate mock heatmap data (365 days) ─────────────────────────────

function seededRandom(seed: number) {
  // Simple LCG pseudo-random
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateHeatmapData(seed = 42) {
  const data: { date: Date; count: number; actions: number; meetings: number; agents: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rand = seededRandom(seed);

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;

    const base = isWeekend ? 0.2 : 0.7;
    const r = rand();
    let count = 0;
    if (r < base * 0.15) count = 0;
    else if (r < base * 0.4) count = Math.floor(rand() * 2) + 1;
    else if (r < base * 0.7) count = Math.floor(rand() * 3) + 2;
    else if (r < base * 0.9) count = Math.floor(rand() * 4) + 4;
    else count = Math.floor(rand() * 5) + 7;

    const actions = Math.floor(count * 0.5);
    const meetings = Math.floor(count * 0.3);
    const agents = count - actions - meetings;

    data.push({ date, count, actions, meetings, agents: Math.max(0, agents) });
  }
  return data;
}

// Pre-generate heatmap data per member (seeded so it's stable)
const memberHeatmapData: Record<string, ReturnType<typeof generateHeatmapData>> = {
  'Tetsuo Shiwaku': generateHeatmapData(42),
  'Misaki Tanaka':   generateHeatmapData(137),
  'Kenta Suzuki':   generateHeatmapData(251),
  'Hanako Yamada':   generateHeatmapData(389),
  'Ichiro Sato':   generateHeatmapData(512),
  'Yumi Nakamura':   generateHeatmapData(673),
  'Masato Kasahara': generateHeatmapData(88),
  'Hiroshi Saito':   generateHeatmapData(201),
  'Yuki Mori':       generateHeatmapData(315),
  'Keiko Nakamura':  generateHeatmapData(447),
  'Takashi Okamoto': generateHeatmapData(562),
};

const heatmapData = memberHeatmapData['Tetsuo Shiwaku'];

const naraRankMembers: RankMember[] = [
  { name: 'Masato Kasahara', initials: 'MK', color: '#1D4ED8', role: '副理事長（経営責任者）', dept: '法人経営', isMe: true, aiUsageCount: 28, aiAdoptionRate: 82, aiAdoptedCount: 23, agentTypes: ['Manus', 'Claude Coworker'], topAgent: 'Manus', weeklyTrend: 18, productivity: 79 },
  { name: 'Hiroshi Saito', initials: 'HS', color: '#059669', role: '病院長', dept: '診療', aiUsageCount: 21, aiAdoptionRate: 71, aiAdoptedCount: 15, agentTypes: ['Manus'], topAgent: 'Manus', weeklyTrend: 5, productivity: 75 },
  { name: 'Yuki Mori', initials: 'YM', color: '#D97706', role: '事務局長', dept: '法人運営', aiUsageCount: 18, aiAdoptionRate: 65, aiAdoptedCount: 12, agentTypes: ['Claude Coworker'], topAgent: 'Claude Coworker', weeklyTrend: 8, productivity: 68 },
  { name: 'Keiko Nakamura', initials: 'KN', color: '#7C3AED', role: '教育研究部長', dept: '教育・研究', aiUsageCount: 24, aiAdoptionRate: 78, aiAdoptedCount: 19, agentTypes: ['Manus', 'Claude Coworker'], topAgent: 'Claude Coworker', weeklyTrend: 12, productivity: 81 },
  { name: 'Takashi Okamoto', initials: 'TO', color: '#DC2626', role: '財務部長', dept: '財務', aiUsageCount: 15, aiAdoptionRate: 88, aiAdoptedCount: 13, agentTypes: ['Manus'], topAgent: 'Manus', weeklyTrend: -2, productivity: 72 },
];

function getColor(count: number, isDark: boolean): string {
  if (isDark) {
    if (count === 0) return 'oklch(0.22 0.02 264)';
    if (count <= 2) return 'oklch(0.35 0.12 264)';
    if (count <= 4) return 'oklch(0.48 0.18 264)';
    if (count <= 7) return 'oklch(0.58 0.22 264)';
    return 'oklch(0.68 0.25 264)';
  } else {
    if (count === 0) return 'oklch(0.93 0.005 264)';
    if (count <= 2) return 'oklch(0.85 0.08 264)';
    if (count <= 4) return 'oklch(0.72 0.14 264)';
    if (count <= 7) return 'oklch(0.58 0.18 264)';
    return 'oklch(0.42 0.22 264)';
  }
}

function computeStats(data: ReturnType<typeof generateHeatmapData>) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const last30 = data.slice(-30).reduce((s, d) => s + d.count, 0);
  const last7 = data.slice(-7).reduce((s, d) => s + d.count, 0);
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) streak++;
    else break;
  }
  const maxDay = data.reduce((m, d) => (d.count > m.count ? d : m), data[0]);
  return { total, activeDays, last30, last7, streak, maxDay };
}

const stats = computeStats(heatmapData);

function getMonthLabels() {
  const labels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  const startDow = heatmapData[0].date.getDay();
  heatmapData.forEach((d, i) => {
    const month = d.date.getMonth();
    if (month !== lastMonth) {
      const colIndex = Math.floor((i + startDow) / 7);
      labels.push({ label: d.date.toLocaleDateString('ja-JP', { month: 'short' }), colIndex });
      lastMonth = month;
    }
  });
  return labels;
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildGrid(data: ReturnType<typeof generateHeatmapData>) {
  const startDow = data[0].date.getDay();
  const padded: (typeof data[0] | null)[] = [...Array(startDow).fill(null), ...data];
  const cols: (typeof data[0] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7));
  return cols;
}

const GRID_COLS = buildGrid(heatmapData);

// ─── Ranking data ──────────────────────────────────────────────────────

interface RankMember {
  name: string;
  initials: string;
  color: string;
  role: string;
  dept: string;
  isMe?: boolean;
  aiUsageCount: number;
  aiAdoptionRate: number;
  aiAdoptedCount: number;
  agentTypes: string[];
  topAgent: string;
  weeklyTrend: number; // % change from last week
  productivity: number; // 0-100 composite score
}

const rankMembers: RankMember[] = [
  { name: 'Tetsuo Shiwaku', initials: 'TS', color: '#4F46E5', role: 'Product Manager', dept: 'Product', isMe: true, aiUsageCount: 38, aiAdoptionRate: 87, aiAdoptedCount: 33, agentTypes: ['One-shot PR', 'Manus', 'Claude Coworker'], topAgent: 'One-shot PR', weeklyTrend: 12, productivity: 82 },
  { name: 'Misaki Tanaka', initials: 'TM', color: '#059669', role: 'Engineer', dept: 'Engineering', aiUsageCount: 52, aiAdoptionRate: 75, aiAdoptedCount: 39, agentTypes: ['One-shot PR', 'Claude Coworker'], topAgent: 'One-shot PR', weeklyTrend: 5, productivity: 88 },
  { name: 'Kenta Suzuki', initials: 'SK', color: '#D97706', role: 'Designer', dept: 'Design', aiUsageCount: 29, aiAdoptionRate: 93, aiAdoptedCount: 27, agentTypes: ['Manus', 'Claude Coworker'], topAgent: 'Manus', weeklyTrend: -3, productivity: 91 },
  { name: 'Hanako Yamada', initials: 'YH', color: '#DB2777', role: 'Marketing', dept: 'Marketing', aiUsageCount: 44, aiAdoptionRate: 68, aiAdoptedCount: 30, agentTypes: ['Manus', 'Claude Coworker'], topAgent: 'Claude Coworker', weeklyTrend: 8, productivity: 74 },
  { name: 'Ichiro Sato', initials: 'SI', color: '#0891B2', role: 'Sales', dept: 'Sales', aiUsageCount: 21, aiAdoptionRate: 81, aiAdoptedCount: 17, agentTypes: ['Manus'], topAgent: 'Manus', weeklyTrend: -8, productivity: 65 },
  { name: 'Yumi Nakamura', initials: 'NY', color: '#7C3AED', role: 'CS Manager', dept: 'CS', aiUsageCount: 35, aiAdoptionRate: 90, aiAdoptedCount: 31, agentTypes: ['Claude Coworker', 'Manus'], topAgent: 'Claude Coworker', weeklyTrend: 15, productivity: 86 },
];

const agentColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  'One-shot PR': { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'bg-violet-900/40', darkText: 'text-violet-300' },
  'Manus': { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/40', darkText: 'text-blue-300' },
  'Claude Coworker': { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'bg-amber-900/40', darkText: 'text-amber-300' },
};

function rankIcon(rank: number) {
  if (rank === 0) return <Crown size={14} className="text-amber-500" />;
  if (rank === 1) return <Trophy size={14} className="text-slate-400" />;
  if (rank === 2) return <Medal size={14} className="text-amber-700" />;
  return <span className="text-[12px] font-bold text-muted-foreground w-4 text-center">{rank + 1}</span>;
}

// ─── Personal Activity Tab ─────────────────────────────────────────────

function PersonalActivityTab() {
  const { theme } = useTheme();
  const activeRankMembers = rankMembers;
  const isDark = theme === 'dark';
  const [selectedMember, setSelectedMember] = useState<RankMember>(activeRankMembers[0]);
  const [hoveredDay, setHoveredDay] = useState<typeof heatmapData[0] | null>(null);
  const [rankTab, setRankTab] = useState<'usage' | 'adoption' | 'productivity'>('usage');

  const currentData = useMemo(() => memberHeatmapData[selectedMember.name] ?? heatmapData, [selectedMember]);
  const currentStats = useMemo(() => computeStats(currentData), [currentData]);
  const currentGrid = useMemo(() => buildGrid(currentData), [currentData]);
  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;
    const startDow = currentData[0].date.getDay();
    currentData.forEach((d, i) => {
      const month = d.date.getMonth();
      if (month !== lastMonth) {
        const colIndex = Math.floor((i + startDow) / 7);
        labels.push({ label: d.date.toLocaleDateString('ja-JP', { month: 'short' }), colIndex });
        lastMonth = month;
      }
    });
    return labels;
  }, [currentData]);

  const sortedMembers = useMemo(() => {
    if (rankTab === 'usage') return [...activeRankMembers].sort((a, b) => b.aiUsageCount - a.aiUsageCount);
    if (rankTab === 'adoption') return [...activeRankMembers].sort((a, b) => b.aiAdoptionRate - a.aiAdoptionRate);
    return [...activeRankMembers].sort((a, b) => b.productivity - a.productivity);
  }, [rankTab, activeRankMembers]);

  const maxUsage = Math.max(...activeRankMembers.map(m => m.aiUsageCount));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Member Selector */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users size={14} className="text-primary" />
            <span className="text-[12px] font-bold text-foreground">Select Member</span>
            <span className="text-sm text-muted-foreground ml-auto">Click to switch</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {activeRankMembers.map((member) => (
              <button
                key={member.name}
                onClick={() => { setSelectedMember(member); setHoveredDay(null); }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left',
                  selectedMember.name === member.name
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: member.color }}
                >
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <div className={cn('text-[12px] font-semibold leading-none', selectedMember.name === member.name ? 'text-primary' : 'text-foreground')}>
                    {member.name.split(' ')[0]}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{member.dept}</div>
                </div>
                {member.isMe && (
                  <span className="text-sm font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">You</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Personal KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Annual Activity', value: currentStats.total, unit: 'items', color: '#4F46E5', icon: Activity, sub: `Active days Count ${currentStats.activeDays} days` },
            { label: 'This Month', value: currentStats.last30, unit: 'items', color: '#059669', icon: Calendar, sub: 'vs last month +18%' },
            { label: 'This Week', value: currentStats.last7, unit: 'items', color: '#D97706', icon: Zap, sub: 'vs last week +12%' },
            { label: 'Streak', value: currentStats.streak, unit: 'days', color: '#DC2626', icon: Flame, sub: 'Currently ongoingMedium' },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${kpi.color}15` }}>
                  <KpiIcon size={18} style={{ color: kpi.color }} />
                </div>
                <div className="text-[28px] font-black leading-none mb-1" style={{ color: kpi.color, fontFamily: "'Sora', sans-serif" }}>
                  {kpi.value}<span className="text-[14px] font-bold ml-0.5">{kpi.unit}</span>
                </div>
                <div className="text-[12px] font-semibold text-foreground">{kpi.label}</div>
                <div className="text-sm text-muted-foreground">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Heatmap */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>ActivityHeatmap</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold" style={{ color: selectedMember.color }}>{selectedMember.name}</span>
                {' '}- Activity distribution over the past 365 days
              </p>
            </div>
            {hoveredDay && (
              <div className="text-right">
                <div className="text-[12px] font-semibold text-foreground">
                  {hoveredDay.date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                </div>
                <div className="text-sm text-muted-foreground">{hoveredDay.count} activities</div>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-4">
              <span>Less</span>
              {[0, 2, 4, 6, 9].map((v) => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{ background: getColor(v, isDark) }} />
              ))}
              <span>More</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex gap-0.5">
                {/* DOW labels */}
                <div className="flex flex-col gap-0.5 mr-1">
                  <div className="h-4" />
                  {DOW_LABELS.map((d, i) => (
                    <div key={i} className="w-5 h-3 flex items-center justify-end text-[8px] text-muted-foreground">
                      {i % 2 === 1 ? d : ''}
                    </div>
                  ))}
                </div>
                {/* Grid with month labels */}
                {currentGrid.map((col, ci) => {
                  const monthLabel = monthLabels.find(m => m.colIndex === ci);
                  return (
                    <div key={ci} className="flex flex-col gap-0.5">
                      {/* Month label above column */}
                      <div className="h-4 flex items-center justify-start text-sm text-muted-foreground">
                        {monthLabel ? monthLabel.label : ''}
                      </div>
                      {/* Day cells */}
                      {col.map((day, ri) => (
                        <div
                          key={ri}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 hover:ring-1 hover:ring-primary/50"
                          style={{ background: day ? getColor(day.count, isDark) : 'transparent' }}
                          onMouseEnter={() => day && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI Ranking */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>AI Usage Ranking</h3>
              <p className="text-sm text-muted-foreground">Team Member AI Usage Comparison</p>
            </div>
            <div className="flex gap-1">
              {([['usage', 'AI Runs'], ['adoption', 'Adoption Rate'], ['productivity', 'Productivity Score']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRankTab(key)}
                  className={cn('px-3 py-1.5 text-sm font-semibold rounded-lg transition-all', rankTab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {sortedMembers.map((member, rank) => {
              const val = rankTab === 'usage' ? member.aiUsageCount : rankTab === 'adoption' ? member.aiAdoptionRate : member.productivity;
              const maxVal = rankTab === 'usage' ? maxUsage : 100;
              const unit = rankTab === 'usage' ? ' times' : '%';
              const TrendIcon = member.weeklyTrend > 0 ? ArrowUpRight : member.weeklyTrend < 0 ? ArrowDownRight : Minus;
              const trendColor = member.weeklyTrend > 0 ? '#059669' : member.weeklyTrend < 0 ? '#DC2626' : '#9CA3AF';

              return (
                <div key={member.name} className={cn('flex items-center gap-3 p-3 rounded-xl transition-all', member.isMe ? 'bg-primary/8 border border-primary/20' : 'hover:bg-muted/30 border border-transparent')}>
                  <div className="w-5 flex items-center justify-center flex-shrink-0">{rankIcon(rank)}</div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: member.color }}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-[13px] font-medium', member.isMe && 'font-bold')}>{member.name}</span>
                        {member.isMe && <span className="text-sm font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">You</span>}
                        <span className="text-sm text-muted-foreground">{member.dept}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-sm font-semibold" style={{ color: trendColor }}>
                          <TrendIcon size={10} />
                          {Math.abs(member.weeklyTrend)}%
                        </div>
                        <span className="text-[13px] font-bold" style={{ color: member.color, fontFamily: "'Sora', sans-serif" }}>{val}{unit}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(val / maxVal) * 100}%`, background: member.color }} />
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {member.agentTypes.map((ag) => {
                        const c = agentColors[ag] ?? { bg: 'bg-muted', text: 'text-muted-foreground', darkBg: 'bg-muted', darkText: 'text-muted-foreground' };
                        return (
                          <span key={ag} className={cn('text-sm font-semibold px-1.5 py-0.5 rounded-full', isDark ? `${c.darkBg} ${c.darkText}` : `${c.bg} ${c.text}`)}>
                            {ag}
                          </span>
                        );
                      })}
                    </div>
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

// ─── Org Performance Tab ───────────────────────────────────────────────

function OrgPerformanceTab() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const deptData = [
    { name: 'Engineering', color: '#059669', aiUsage: 89, adoptionRate: 82, members: 8, topAgent: 'One-shot PR', trend: 15 },
    { name: 'Product', color: '#4F46E5', aiUsage: 72, adoptionRate: 87, members: 4, topAgent: 'Manus', trend: 12 },
    { name: 'CS', color: '#7C3AED', aiUsage: 68, adoptionRate: 90, members: 6, topAgent: 'Claude Coworker', trend: 18 },
    { name: 'Marketing', color: '#D97706', aiUsage: 55, adoptionRate: 71, members: 5, topAgent: 'Manus', trend: -5 },
    { name: 'Sales', color: '#0891B2', aiUsage: 48, adoptionRate: 78, members: 7, topAgent: 'Manus', trend: -8 },
    { name: 'HR', color: '#DB2777', aiUsage: 32, adoptionRate: 65, members: 3, topAgent: 'Claude Coworker', trend: 3 },
  ];

  const weeklyData = [
    { week: '4 weeks ago', actions: 142, meetings: 38, agents: 67, total: 247 },
    { week: '3 weeks ago', actions: 158, meetings: 42, agents: 78, total: 278 },
    { week: '2 weeks ago', actions: 171, meetings: 35, agents: 89, total: 295 },
    { week: 'Last Week', actions: 189, meetings: 44, agents: 102, total: 335 },
    { week: 'This Week', actions: 201, meetings: 48, agents: 118, total: 367 },
  ];

  const maxTotal = Math.max(...weeklyData.map(w => w.total));

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Org KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Company-wide AI Runs (This Month)', value: '1,847', sub: 'vs last month +23%', color: '#4F46E5', icon: Bot, up: true },
            { label: 'Average AI Adoption Rate', value: '79%', sub: 'Industry avg 52%', color: '#059669', icon: CheckCircle2, up: true },
            { label: 'AI Usage Member Rate', value: '94%', sub: '30 out of 32 company members', color: '#D97706', icon: Users, up: true },
            { label: 'Estimated Productivity Gain', value: '3.2×', sub: 'vs non-AI users', color: '#DC2626', icon: TrendingUp, up: true },
          ].map((kpi) => {
            const KpiIcon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                    <KpiIcon size={18} style={{ color: kpi.color }} />
                  </div>
                  <div className="flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-full text-emerald-600 bg-emerald-50">
                    <ArrowUpRight size={10} />vs last month
                  </div>
                </div>
                <div className="text-[28px] font-black leading-none mb-1" style={{ color: kpi.color, fontFamily: "'Sora', sans-serif" }}>{kpi.value}</div>
                <div className="text-[12px] font-semibold text-foreground">{kpi.label}</div>
                <div className="text-sm text-muted-foreground">{kpi.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Dept Performance + Weekly Trend */}
        <div className="grid grid-cols-5 gap-4">
          {/* Dept breakdown */}
          <div className="col-span-3 bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Department AI Usage Status</h3>
                <p className="text-sm text-muted-foreground">AI Runs · Adoption Rate · Productivity Score</p>
              </div>
            </div>
            <div className="space-y-3">
              {deptData.map((dept) => {
                const TrendIcon = dept.trend > 0 ? ArrowUpRight : dept.trend < 0 ? ArrowDownRight : Minus;
                const trendColor = dept.trend > 0 ? '#059669' : dept.trend < 0 ? '#DC2626' : '#9CA3AF';
                return (
                  <div key={dept.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: dept.color }}>
                      {dept.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{dept.name}</span>
                          <span className="text-sm text-muted-foreground">{dept.members} members</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-bold" style={{ color: dept.color }}>{dept.aiUsage} times</span>
                          <span className="text-muted-foreground">Adoption Rate <strong className="text-foreground">{dept.adoptionRate}%</strong></span>
                          <div className="flex items-center gap-0.5 font-semibold" style={{ color: trendColor }}>
                            <TrendIcon size={10} />
                            {Math.abs(dept.trend)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(dept.aiUsage / 100) * 100}%`, background: dept.color }} />
                        </div>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${dept.adoptionRate}%`, background: `${dept.color}80` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly trend */}
          <div className="col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}> Weekly Activity Trend</h3>
                <p className="text-sm text-muted-foreground">Company-wideTotal</p>
              </div>
            </div>
            <div className="space-y-3">
              {weeklyData.map((week, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn('font-semibold', i === weeklyData.length - 1 ? 'text-primary' : 'text-muted-foreground')}>{week.week}</span>
                    <span className="font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>{week.total} items</span>
                  </div>
                  <div className="h-5 bg-muted rounded-lg overflow-hidden flex">
                    <div className="h-full transition-all" style={{ width: `${(week.actions / maxTotal) * 100}%`, background: '#4F46E5' }} />
                    <div className="h-full transition-all" style={{ width: `${(week.meetings / maxTotal) * 100}%`, background: '#059669' }} />
                    <div className="h-full transition-all" style={{ width: `${(week.agents / maxTotal) * 100}%`, background: '#D97706' }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />Actions</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Meetings</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />AI Agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Usage Breakdown */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Agent by UsageStatus</h3>
              <p className="text-sm text-muted-foreground">This Month's Company-wide Agent Execution Stats</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'One-shot PR', color: '#7C3AED', executions: 487, adoption: 88, avgTime: '2.3min', topDept: 'Engineering', trend: 22 },
              { name: 'Manus', color: '#4F46E5', executions: 612, adoption: 76, avgTime: '4.8min', topDept: 'Sales', trend: 31 },
              { name: 'Claude Coworker', color: '#D97706', executions: 748, adoption: 82, avgTime: '6.2min', topDept: 'CS', trend: 18 },
            ].map((agent) => (
              <div key={agent.name} className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${agent.color}15` }}>
                    <Bot size={16} style={{ color: agent.color }} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-foreground">{agent.name}</div>
                    <div className="flex items-center gap-1 text-sm text-emerald-600">
                      <ArrowUpRight size={9} />
                      vs last month +{agent.trend}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Execution Count', value: `${agent.executions} times` },
                    { label: 'Adoption Rate', value: `${agent.adoption}%` },
                    { label: 'Avg Processing Time', value: agent.avgTime },
                    { label: 'Top Department', value: agent.topDept },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-card">
                      <div className="text-[13px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── AI Insights Tab ───────────────────────────────────────────────────

function AIInsightsTab() {
  const insights = [
    {
      type: 'opportunity',
      icon: Lightbulb,
      color: '#059669',
      title: 'Growth potential in Sales Department AI Usage',
      body: 'Sales Department AI Adoption Rate is 78%, but execution count is the lowest company-wide(48 times/month). By using Manus for sales prep and follow-up email creation, a 30%+ efficiency improvement is expected over the next few months.',
      action: 'Run AI Usage workshop for Sales Team',
      impact: 'High',
      effort: 'Low',
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      color: '#D97706',
      title: 'Marketing Department AI Adoption Rate declining',
      body: "Marketing Department AI Usage is the only department showing -5% negative growth vs last week.Content creation workflow review and , Claude Coworker's Usagepromotion is urgent.",
      action: 'Review Marketing Team AI workflow',
      impact: 'Medium',
      effort: 'Medium',
    },
    {
      type: 'achievement',
      icon: Award,
      color: '#4F46E5',
      title: 'CS Department achieved 90% Adoption Rate',
      body: 'CS Department achieved the company-wide highest AI Adoption Rate of 90%. Automation of support ticket handling using Claude Coworker is proving effective.It is recommended to roll out this practice to other departments.',
      action: 'Share CS Department best practices company-wide',
      impact: 'High',
      effort: 'Low',
    },
    {
      type: 'trend',
      icon: TrendingUp,
      color: '#7C3AED',
      title: 'AI Usage accelerating: maintaining +10% weekly growth',
      body: 'Over the past 5 weeks, Company-wide AI Agent execution count growing 10%+ every week. At this pace, by end of Q3 monthly executions are expected to exceed 3,000. Please consider scaling up the infrastructure.',
      action: 'Develop capacity plan for AI Usage infrastructure',
      impact: 'High',
      effort: 'High',
    },
  ];

  const weeklyHighlights = [
    { label: 'Most productive day', value: 'Tuesday', sub: 'Avg 12.4 items/person', icon: Calendar, color: '#4F46E5' },
    { label: 'Most used Agent', value: 'Claude Coworker', sub: '748 executions', icon: Bot, color: '#D97706' },
    { label: 'Highest AI Adoption Rate Member', value: 'Kenta Suzuki', sub: 'Adoption Rate 93%', icon: Crown, color: '#059669' },
    { label: 'Longest Streak', value: 'Misaki Tanaka', sub: '28 days consecutive', icon: Flame, color: '#DC2626' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Weekly Highlights */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-primary" />
            <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>This Week's Highlights</h3>
            <span className="text-sm text-muted-foreground ml-auto">AI-generated · Updated every Monday</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {weeklyHighlights.map((h) => {
              const HIcon = h.icon;
              return (
                <div key={h.label} className="text-center p-3 rounded-xl bg-muted/30">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${h.color}15` }}>
                    <HIcon size={16} style={{ color: h.color }} />
                  </div>
                  <div className="text-[13px] font-bold text-foreground leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>{h.value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{h.sub}</div>
                  <div className="text-sm text-muted-foreground mt-1">{h.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>AI Insights & Recommended Actions</h3>
          </div>
          {insights.map((insight, i) => {
            const InsightIcon = insight.icon;
            return (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${insight.color}15` }}>
                    <InsightIcon size={20} style={{ color: insight.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-[14px] font-bold text-foreground leading-snug" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={cn('text-sm font-bold px-2 py-0.5 rounded-full', insight.impact === 'High' ? 'text-red-600 bg-red-100' : insight.impact === 'Medium' ? 'text-amber-600 bg-amber-100' : 'text-emerald-600 bg-emerald-100')}>
                          impact {insight.impact}
                        </span>
                        <span className={cn('text-sm font-bold px-2 py-0.5 rounded-full', insight.effort === 'Low' ? 'text-emerald-600 bg-emerald-100' : insight.effort === 'Medium' ? 'text-amber-600 bg-amber-100' : 'text-red-600 bg-red-100')}>
                          Effort: {insight.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{insight.body}</p>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: `${insight.color}10`, border: `1px solid ${insight.color}25` }}>
                      <Target size={12} style={{ color: insight.color }} />
                      <span className="text-[12px] font-semibold" style={{ color: insight.color }}>{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

type TabId = 'personal' | 'org' | 'insights';

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'personal', label: 'Personal Activity', icon: Activity },
    { id: 'org', label: 'Org Performance', icon: Users },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[20px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>Activity</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">Personal & Organization AI Usage Status · Performance Analysis · Insightss</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">AI Executions This Month</div>
                <div className="text-[22px] font-black text-primary" style={{ fontFamily: "'Sora', sans-serif" }}>1,847<span className="text-[12px] font-bold ml-0.5"> times</span></div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-primary/30 flex items-center justify-center" style={{ background: 'oklch(0.5 0.2 264 / 0.1)' }}>
                <Bot size={20} className="text-primary" />
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-lg border-b-2 transition-all',
                    activeTab === tab.id ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
                  )}
                >
                  <TabIcon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'personal' && <PersonalActivityTab />}
        {activeTab === 'org' && <OrgPerformanceTab />}
        {activeTab === 'insights' && <AIInsightsTab />}
      </div>
    </div>
  );
}
