/**
 * MyActionsPage — Things 3ライクな設計
 * Design: Things 3 inspired — Today / Upcoming / Backlog / Logbook
 * Layout: Left sidebar (nav) | Center content (task list) | Right detail panel
 *
 * Design Philosophy:
 * - Clean white/light background with generous whitespace (Things 3 aesthetic)
 * - Circular checkboxes with smooth completion animation
 * - Grouped by time bucket: Today / Upcoming / Backlog / Logbook
 * - Minimal chrome — focus on the tasks themselves
 * - Subtle category color dots, AI badge, due date chips
 */

import { useState, useMemo, useEffect } from 'react';
import { Action, Category } from '../lib/mockData';
import { useUser } from '../contexts/UserContext';
import ActionDetail from '../components/ActionDetail';
import {
  Plus,
  Star,
  CalendarDays,
  Layers,
  BookOpen,
  Inbox,
  Search,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Zap,
  ArrowLeft,
  LayoutDashboard,
  ChevronRight as ChevronRightIcon,
  Tag,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DashboardContext } from '@/components/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Bucket = 'today' | 'upcoming' | 'backlog' | 'logbook';

interface ThingsAction extends Action {
  bucket: Bucket;
  dueDate?: string;
  isToday?: boolean;
  scheduledDate?: string;
}

// ─── Enrich mock data with Things-style buckets ───────────────────────────────

function enrichActions(rawActions: Action[]): ThingsAction[] {
  const today = new Date('2026-04-02');
  return rawActions.map((a, i) => {
    let bucket: Bucket = 'backlog';
    let dueDate: string | undefined;
    let scheduledDate: string | undefined;

    if (a.status === 'completed' || a.status === 'archived' || a.isArchived) {
      bucket = 'logbook';
    } else if (a.status === 'yours' || (a.stoppedDays && a.stoppedDays >= 3)) {
      bucket = 'today';
      dueDate = '今日';
    } else if (a.status === 'ai-running' || a.status === 'pending') {
      // Distribute across today/upcoming/backlog based on index for demo
      if (i % 3 === 0) {
        bucket = 'today';
        dueDate = '今日';
      } else if (i % 3 === 1) {
        bucket = 'upcoming';
        const d = new Date(today);
        d.setDate(d.getDate() + (i + 1) * 2);
        scheduledDate = `${d.getMonth() + 1}月${d.getDate()}日`;
        dueDate = scheduledDate;
      } else {
        bucket = 'backlog';
      }
    }

    return { ...a, bucket, dueDate, scheduledDate };
  });
}

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<Category, string> = {
  Engineering: '#6366f1',
  Sales: '#f59e0b',
  Executive: '#8b5cf6',
  Marketing: '#ec4899',
  HR: '#10b981',
  Finance: '#3b82f6',
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  'pending': { label: 'レビュー待ち', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
  'ai-running': { label: 'AI実行中', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  'yours': { label: 'あなたの番', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800' },
  'stopped': { label: '停止中', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
  'completed': { label: '完了', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800' },
  'archived': { label: 'アーカイブ', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/30', border: 'border-slate-200 dark:border-slate-700' },
};

// ─── Left Nav ─────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Bucket | 'inbox'; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-slate-500' },
  { id: 'today', label: 'Today', icon: Star, color: 'text-amber-400' },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarDays, color: 'text-blue-500' },
  { id: 'backlog', label: 'Backlog', icon: Layers, color: 'text-slate-500' },
  { id: 'logbook', label: 'Logbook', icon: BookOpen, color: 'text-slate-400' },
];

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  action,
  isSelected,
  onSelect,
  onComplete,
}: {
  action: ThingsAction;
  isSelected: boolean;
  onSelect: () => void;
  onComplete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isDone = action.status === 'completed' || action.isArchived;
  const catColor = CATEGORY_COLORS[action.category] ?? '#6366f1';
  const hasAI = action.agents.length > 0;
  const isStopped = action.stoppedDays && action.stoppedDays >= 3;
  const isYours = action.status === 'yours';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-150 select-none',
        isSelected ? 'bg-primary/8 dark:bg-primary/10' : 'hover:bg-muted/50',
      )}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className={cn(
          'w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 mt-[3px] transition-all duration-200 flex items-center justify-center',
          isDone
            ? 'bg-emerald-500 border-emerald-500'
            : isYours
            ? 'border-amber-400 hover:bg-amber-400/20'
            : isStopped
            ? 'border-red-400 hover:bg-red-400/20'
            : 'border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5'
        )}
      >
        {isDone && <CheckCircle2 size={10} className="text-white" strokeWidth={3} />}
        {!isDone && hovered && <div className="w-2 h-2 rounded-full bg-primary/40" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {/* Category dot */}
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
          <span className={cn(
            'text-[13.5px] font-medium leading-snug truncate',
            isDone ? 'line-through text-muted-foreground/60' : 'text-foreground'
          )}>
            {action.title}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1 pl-4">
          {/* AI badge */}
          {hasAI && (
            <span className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-1.5 py-0.5 rounded-md',
              action.status === 'ai-running'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                : 'bg-muted text-muted-foreground'
            )}>
              <Bot size={8} />
              {action.agents[0].name}
            </span>
          )}

          {/* Stopped warning */}
          {isStopped && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-md">
              <AlertCircle size={8} />
              {action.stoppedDays}日停止中
            </span>
          )}

          {/* Yours badge */}
          {isYours && !isStopped && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md">
              <User size={8} />
              あなたの番
            </span>
          )}

          {/* Due date */}
          {action.dueDate && !isDone && (
            <span className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-1.5 py-0.5 rounded-md',
              action.dueDate === '今日'
                ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                : 'text-muted-foreground bg-muted/60'
            )}>
              <Calendar size={8} />
              {action.dueDate}
            </span>
          )}

          {/* Related Issues */}
          {action.relatedIssues && action.relatedIssues.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {action.relatedIssues.map((issue) => (
                <span
                  key={issue.id}
                  className="inline-flex items-center gap-1 text-sm font-medium px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40"
                >
                  <Lightbulb size={8} />
                  <span className="max-w-[120px] truncate">{issue.title}</span>
                </span>
              ))}
            </div>
          )}
          {/* Category label */}
          <span className="text-sm text-muted-foreground/60 ml-auto">{action.category}</span>
        </div>
      </div>

      {/* More button */}
      <button
        onClick={(e) => { e.stopPropagation(); toast.info('Actions menu coming soon'); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center flex-shrink-0 mt-0.5"
      >
        <MoreHorizontal size={13} className="text-muted-foreground" />
      </button>
    </div>
  );
}

// ─── Section Group ────────────────────────────────────────────────────────────

function SectionGroup({
  title,
  subtitle,
  items,
  selectedId,
  onSelect,
  onComplete,
  defaultOpen = true,
  accent,
}: {
  title: string;
  subtitle?: string;
  items: ThingsAction[];
  selectedId: string | null;
  onSelect: (a: ThingsAction) => void;
  onComplete: (id: string) => void;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-1.5 text-left group"
      >
        <div className={cn('transition-transform duration-200', open ? 'rotate-0' : '-rotate-90')}>
          <ChevronDown size={13} className="text-muted-foreground/50" />
        </div>
        <span className={cn('text-sm font-bold uppercase tracking-wider', accent ?? 'text-muted-foreground/70')}>
          {title}
        </span>
        {subtitle && <span className="text-sm text-muted-foreground/50 ml-1">{subtitle}</span>}
        <span className="text-sm text-muted-foreground/40 ml-auto">{items.length}</span>
      </button>

      {open && (
        <div className="space-y-0.5">
          {items.map((action) => (
            <TaskRow
              key={action.id}
              action={action}
              isSelected={selectedId === action.id}
              onSelect={() => onSelect(action)}
              onComplete={() => onComplete(action.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Calendar View ───────────────────────────────────────────────────

function UpcomingView({
  items,
  selectedId,
  onSelect,
  onComplete,
}: {
  items: ThingsAction[];
  selectedId: string | null;
  onSelect: (a: ThingsAction) => void;
  onComplete: (id: string) => void;
}) {
  // Group by scheduledDate
  const groups: { label: string; items: ThingsAction[] }[] = [];
  const seen = new Map<string, ThingsAction[]>();

  items.forEach((a) => {
    const key = a.scheduledDate ?? '日付未定';
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(a);
  });

  seen.forEach((v, k) => groups.push({ label: k, items: v }));

  return (
    <div>
      {groups.map((g) => (
        <SectionGroup
          key={g.label}
          title={g.label}
          items={g.items}
          selectedId={selectedId}
          onSelect={onSelect}
          onComplete={onComplete}
          defaultOpen
          accent="text-blue-500"
        />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ bucket }: { bucket: Bucket | 'inbox' }) {
  const msgs: Record<string, { icon: React.ElementType; title: string; sub: string }> = {
    inbox: { icon: Inbox, title: 'Inboxは空です', sub: '新しいアクションを追加してください' },
    today: { icon: Star, title: '今日のタスクはありません', sub: 'ゆっくり休んでください！' },
    upcoming: { icon: CalendarDays, title: '予定はありません', sub: 'スケジュールを設定してください' },
    backlog: { icon: Layers, title: 'バックログは空です', sub: 'アイデアをここに追加しましょう' },
    logbook: { icon: BookOpen, title: '完了したタスクはありません', sub: 'タスクを完了するとここに表示されます' },
  };
  const { icon: Icon, title, sub } = msgs[bucket] ?? msgs.inbox;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
        <Icon size={22} className="text-muted-foreground/40" />
      </div>
      <p className="text-[14px] font-semibold text-foreground/60 mb-1">{title}</p>
      <p className="text-[12px] text-muted-foreground/50">{sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface MyActionsPageProps {
  onOpenPipeline?: (agentId: string) => void;
  dashboardContext?: DashboardContext | null;
  onClearContext?: () => void;
  onBackToDashboard?: () => void;
  actionsList?: Action[];
}

export default function MyActionsPage({
  onOpenPipeline,
  dashboardContext,
  onClearContext,
  onBackToDashboard,
  actionsList: actionsListProp,
}: MyActionsPageProps) {
  const { userData } = useUser();
  const rawActions = actionsListProp ?? userData.actions;
  const { t } = useLanguage();

  const enriched = useMemo(() => enrichActions(rawActions), [rawActions]);

  const [activeBucket, setActiveBucket] = useState<Bucket | 'inbox'>('today');
  const [selectedAction, setSelectedAction] = useState<ThingsAction | null>(enriched[0] ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  // ユーザー切り替え時に selectedAction をリセット
  useEffect(() => {
    const e = enrichActions(rawActions);
    setSelectedAction(e[0] ?? null);
    setActiveBucket('today');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawActions]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Counts per bucket
  const counts = useMemo(() => {
    const c: Record<string, number> = { inbox: 0, today: 0, upcoming: 0, backlog: 0, logbook: 0 };
    enriched.forEach((a) => {
      if (a.bucket === 'logbook' || a.status === 'completed' || a.isArchived) c.logbook++;
      else c[a.bucket] = (c[a.bucket] ?? 0) + 1;
    });
    c.inbox = c.today + c.upcoming + c.backlog; // inbox = all non-done
    return c;
  }, [enriched]);

  // Filtered items for current bucket
  const bucketItems = useMemo(() => {
    let items: ThingsAction[];
    if (activeBucket === 'inbox') {
      items = enriched.filter((a) => a.bucket !== 'logbook' && a.status !== 'completed' && !a.isArchived);
    } else if (activeBucket === 'logbook') {
      items = enriched.filter((a) => a.bucket === 'logbook' || a.status === 'completed' || a.isArchived);
    } else {
      items = enriched.filter((a) => a.bucket === activeBucket && a.status !== 'completed' && !a.isArchived);
    }

    if (searchQuery) {
      items = items.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return items;
  }, [enriched, activeBucket, searchQuery]);

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    toast.success('アクションを完了しました');
  };

  // Bucket-specific grouping
  const todayItems = bucketItems.filter((a) => a.bucket === 'today' || a.dueDate === '今日');
  const thisWeekItems = bucketItems.filter((a) => a.bucket === 'upcoming' && a.scheduledDate);

  const ctxColor = dashboardContext?.color ?? '#6366f1';

  return (
    <div className="flex h-full overflow-hidden bg-background">

      {/* ── Left Sidebar (Things-style nav) ── */}
      <div className="w-[200px] flex-shrink-0 border-r border-border flex flex-col h-full bg-muted/20">
        {/* Search */}
        <div className="px-3 pt-4 pb-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-[12px] bg-background/60 rounded-lg border border-border/60 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeBucket === item.id;
            const count = counts[item.id] ?? 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveBucket(item.id as Bucket | 'inbox')}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all',
                  isActive
                    ? 'bg-background shadow-sm border border-border/60 text-foreground'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-foreground'
                )}
              >
                <Icon size={15} className={cn(isActive ? item.color : 'text-muted-foreground/60')} />
                <span className="text-[13px] font-medium flex-1">{item.label}</span>
                {count > 0 && (
                  <span className={cn(
                    'text-sm font-bold min-w-[16px] text-center',
                    isActive ? 'text-foreground/70' : 'text-muted-foreground/50'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-2 border-t border-border/40" />

          {/* New Action */}
          <button
            onClick={() => toast.info('新しいアクションを作成 (coming soon)')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all"
          >
            <Plus size={14} className="text-muted-foreground/50" />
            <span className="text-[13px] font-medium">新しいアクション</span>
          </button>
        </nav>

        {/* Footer stats */}
        <div className="px-3 py-3 border-t border-border/40">
          <div className="text-sm text-muted-foreground/50 space-y-0.5">
            <div className="flex justify-between">
              <span>AI実行中</span>
              <span className="font-semibold text-blue-500">{enriched.filter(a => a.status === 'ai-running').length}</span>
            </div>
            <div className="flex justify-between">
              <span>完了 (今月)</span>
              <span className="font-semibold text-emerald-500">{enriched.filter(a => a.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Center: Task List ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-border min-w-0">

        {/* Dashboard Context Banner */}
        {dashboardContext && (
          <div
            className="flex items-center gap-3 px-5 py-2.5 border-b text-[12px] flex-shrink-0"
            style={{ background: `${ctxColor}0F`, borderColor: `${ctxColor}30` }}
          >
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-70"
              style={{ color: ctxColor }}
            >
              <ArrowLeft size={13} />
              <LayoutDashboard size={13} />
              <span>Dashboard</span>
            </button>
            <ChevronRightIcon size={11} className="text-muted-foreground" />
            <span className="text-muted-foreground">{dashboardContext.sublabel}</span>
            <ChevronRightIcon size={11} className="text-muted-foreground" />
            <span className="font-bold" style={{ color: ctxColor }}>{dashboardContext.label}</span>
            <button onClick={onClearContext} className="ml-auto text-muted-foreground hover:text-foreground text-sm underline">
              すべて表示
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeBucket === 'today' && <Star size={20} className="text-amber-400 fill-amber-400" />}
            {activeBucket === 'upcoming' && <CalendarDays size={20} className="text-blue-500" />}
            {activeBucket === 'backlog' && <Layers size={20} className="text-slate-500" />}
            {activeBucket === 'logbook' && <BookOpen size={20} className="text-slate-400" />}
            {activeBucket === 'inbox' && <Inbox size={20} className="text-slate-500" />}
            <h1 className="text-[22px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              {NAV_ITEMS.find(n => n.id === activeBucket)?.label ?? 'Today'}
            </h1>
            {activeBucket === 'today' && (
              <span className="text-[13px] text-muted-foreground font-normal ml-1">
                {new Date('2026-04-02').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {bucketItems.length === 0 ? (
            <EmptyState bucket={activeBucket} />
          ) : activeBucket === 'today' || activeBucket === 'inbox' ? (
            <div>
              {/* Yours / Urgent first */}
              <SectionGroup
                title="あなたの番"
                items={bucketItems.filter(a => a.status === 'yours' || (a.stoppedDays && a.stoppedDays >= 3))}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
                accent="text-amber-500"
              />
              {/* AI Running */}
              <SectionGroup
                title="AI実行中"
                items={bucketItems.filter(a => a.status === 'ai-running')}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
                accent="text-blue-500"
              />
              {/* Pending */}
              <SectionGroup
                title="レビュー待ち"
                items={bucketItems.filter(a => a.status === 'pending')}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
                accent="text-purple-500"
              />
              {/* This Evening (if any) */}
              <SectionGroup
                title="今夜"
                items={[]}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
              />
            </div>
          ) : activeBucket === 'upcoming' ? (
            <UpcomingView
              items={bucketItems}
              selectedId={selectedAction?.id ?? null}
              onSelect={setSelectedAction}
              onComplete={handleComplete}
            />
          ) : activeBucket === 'backlog' ? (
            <SectionGroup
              title="バックログ"
              items={bucketItems}
              selectedId={selectedAction?.id ?? null}
              onSelect={setSelectedAction}
              onComplete={handleComplete}
              accent="text-slate-500"
            />
          ) : (
            /* Logbook */
            <div>
              <SectionGroup
                title="完了"
                items={bucketItems.filter(a => a.status === 'completed')}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
                accent="text-emerald-500"
              />
              <SectionGroup
                title="アーカイブ"
                items={bucketItems.filter(a => a.isArchived)}
                selectedId={selectedAction?.id ?? null}
                onSelect={setSelectedAction}
                onComplete={handleComplete}
                defaultOpen={false}
                accent="text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Bottom: Quick Add */}
        <div className="px-4 py-3 border-t border-border/60 flex-shrink-0">
          <button
            onClick={() => toast.info('クイック追加 (coming soon)')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed border-border/60 text-muted-foreground/50 hover:border-primary/30 hover:text-muted-foreground transition-all text-[13px]"
          >
            <Plus size={14} />
            <span>新しいアクションを追加...</span>
          </button>
        </div>
      </div>

      {/* ── Right: Detail Panel ── */}
      <div className="w-[420px] flex-shrink-0 h-full overflow-hidden">
        {selectedAction ? (
          <ActionDetail
            action={selectedAction as Action}
            onOpenPipeline={onOpenPipeline}
            onClose={() => setSelectedAction(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Zap size={24} className="text-muted-foreground/30" />
            </div>
            <p className="text-[14px] font-semibold text-foreground/50 mb-1">アクションを選択</p>
            <p className="text-[12px] text-muted-foreground/40">左のリストからアクションを選択してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
