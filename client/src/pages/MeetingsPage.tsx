/**
 * MeetingsPage — SIMY PC UI (Enhanced)
 * Design: "Warm Productivity"
 * Features:
 *   - List of issues discussed in past meetings
 *   - Decisions that must be made at this meeting
 *   - Agenda, participants, and related actions
 *   - Meeting notes and summary
 */

import { useState } from 'react';
import { Meeting, MeetingIssue, MeetingDecision } from '../lib/mockData';
import { useUser } from '../contexts/UserContext';
import {
  Calendar, Clock, MapPin, Users, ChevronRight, Plus,
  AlertTriangle, CheckCircle2, Circle, AlertCircle,
  MessageSquare, FileText, Link2, ChevronDown, ChevronUp,
  Sparkles, Zap, Brain, TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Status helpers ────────────────────────────────────────────────────

function MeetingStatusBadge({ status }: { status: Meeting['status'] }) {
  if (status === 'upcoming') {
    return (
      <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.14 0.05 240 / 0.8)', color: 'oklch(0.70 0.18 240)', border: '1px solid oklch(0.40 0.15 240 / 0.5)' }}>
        Scheduled
      </span>
    );
  }
  if (status === 'ongoing') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.15 0.06 195 / 0.8)', color: 'oklch(0.75 0.20 195)', border: '1px solid oklch(0.45 0.20 195 / 0.5)' }}>
        <span className="w-1.5 h-1.5 rounded-full ai-pulse-dot" style={{ background: 'oklch(0.62 0.20 195)' }} />
        In Progress
      </span>
    );
  }
  return (
    <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
      Completed
    </span>
  );
}

function IssuePriorityBadge({ priority }: { priority: MeetingIssue['priority'] }) {
  const cls: Record<string, string> = {
    high:   'bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/50',
    medium: 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50',
    low:    'bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-600/50',
  };
  const labels: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
  return (
    <span className={cn('text-sm font-bold px-1.5 py-0.5 rounded', cls[priority])}>{labels[priority]}</span>
  );
}

function IssueStatusIcon({ status }: { status: MeetingIssue['status'] }) {
  if (status === 'resolved') return <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-500" />;
  if (status === 'deferred') return <Circle size={14} className="text-muted-foreground flex-shrink-0" />;
  return <AlertCircle size={14} className="flex-shrink-0 text-rose-500" />;
}

function DecisionStatusBadge({ status }: { status: MeetingDecision['status'] }) {
  if (status === 'decided') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/50">
        <CheckCircle2 size={10} />
        Decided
      </span>
    );
  }
  if (status === 'must-decide') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white border border-rose-700 dark:bg-rose-700 dark:border-rose-600">
        <AlertTriangle size={10} />
        Must Decide
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50">
      <Clock size={10} />
      Pending
    </span>
  );
}

// ─── AI Briefing Card ─────────────────────────────────────────────────

function AIBriefingCard({ meeting }: { meeting: Meeting }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expanded, setExpanded] = useState(false);

  const briefings = [
    { icon: Brain, color: 'oklch(0.55 0.20 264)', label: 'Open Issues from Last Meeting', value: `${meeting.issues?.filter(i => i.status === 'open').length ?? 0} issues carried over` },
    { icon: AlertTriangle, color: 'oklch(0.62 0.22 27)', label: 'Items to Decide', value: `${meeting.decisions?.filter(d => d.status === 'must-decide').length ?? 0} decisions needed` },
    { icon: TrendingUp, color: 'oklch(0.55 0.18 145)', label: 'Related Actions', value: `${meeting.actions.length} actions affected` },
  ];

  return (
    <div
      className="rounded-xl border p-4 mb-4"
      style={{
        background: isDark ? 'oklch(0.14 0.06 264 / 0.3)' : 'oklch(0.96 0.02 264 / 0.5)',
        borderColor: isDark ? 'oklch(0.35 0.15 264 / 0.4)' : 'oklch(0.75 0.12 264 / 0.4)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.48 0.22 264)' }}>
          <Sparkles size={12} className="text-white" />
        </div>
        <span className="text-[12px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>AI Briefing</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? 'Close' : 'View Details'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {briefings.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="text-center">
              <Icon size={14} className="mx-auto mb-1" style={{ color: b.color }} />
              <div className="text-sm font-semibold text-foreground leading-tight">{b.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{b.label}</div>
            </div>
          );
        })}
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            This meeting requires resolving issues carried over from last time and making key decisions on Q2 strategy.
            All participants are recommended to review the agenda in advance and update the status of related actions.
          </p>
          <button
            onClick={() => toast.success('AI generated meeting summary (demo)')}
            className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-medium text-white transition-all hover:opacity-90"
            style={{ background: 'oklch(0.48 0.22 264)' }}
          >
            <Zap size={12} />
            Auto-generate Actions with AI
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Meeting Card ──────────────────────────────────────────────────────

function MeetingCard({ meeting, isSelected, onClick }: { meeting: Meeting; isSelected: boolean; onClick: () => void }) {
  const dateObj = new Date(meeting.date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('ja-JP', { weekday: 'short' });

  const mustDecideCount = meeting.decisions?.filter((d) => d.status === 'must-decide').length ?? 0;
  const openIssueCount = meeting.issues?.filter((i) => i.status === 'open').length ?? 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border transition-all duration-150 overflow-hidden',
        isSelected
          ? 'border-primary/40 bg-accent/40 shadow-sm'
          : 'border-border bg-card hover:border-primary/20 hover:bg-muted/30'
      )}
    >
      <div className="flex items-stretch">
        {/* Date column */}
        <div
          className={cn(
            'w-16 flex flex-col items-center justify-center py-4 flex-shrink-0',
            meeting.status === 'upcoming' ? 'bg-accent/60' : 'bg-muted/50'
          )}
        >
          <div className="text-sm font-medium text-muted-foreground">{month}</div>
          <div className="text-[22px] font-bold text-foreground leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
            {day}
          </div>
          <div className="text-sm text-muted-foreground">({weekday})</div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              {meeting.title}
            </div>
            <MeetingStatusBadge status={meeting.status} />
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {meeting.time} ({meeting.duration})
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {meeting.location}
            </span>
          </div>

          {/* Alert badges */}
          {(mustDecideCount > 0 || openIssueCount > 0) && (
            <div className="flex gap-1.5 flex-wrap">
              {mustDecideCount > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-bold px-1.5 py-0.5 rounded" style={{ background: 'oklch(0.16 0.06 27 / 0.8)', color: 'oklch(0.75 0.22 27)', border: '1px solid oklch(0.48 0.22 27 / 0.5)' }}>
                  <AlertTriangle size={9} />
                  Must Decide {mustDecideCount}
                </span>
              )}
              {openIssueCount > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-bold px-1.5 py-0.5 rounded" style={{ background: 'oklch(0.16 0.06 55 / 0.8)', color: 'oklch(0.78 0.18 55)', border: '1px solid oklch(0.45 0.18 55 / 0.5)' }}>
                  <AlertCircle size={9} />
                  Issues {openIssueCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center pr-3">
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}

// ─── Collapsible Section ───────────────────────────────────────────────

function Section({ title, icon: Icon, count, badge, badgeCls, defaultOpen = true, children }: {
  title: string;
  icon: React.ElementType;
  count?: number;
  badge?: string;
  badgeCls?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-primary" />
          <span className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            {title}
          </span>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">({count})</span>
          )}
          {badge && (
            <span className={cn('text-sm font-bold px-1.5 py-0.5 rounded border', badgeCls)}>{badge}</span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const { userData } = useUser();
  const { meetings, actions } = userData;
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(meetings[0]);

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = meetings.filter((m) => m.status === 'completed');

  const mustDecideItems = selectedMeeting?.decisions?.filter((d) => d.status === 'must-decide') ?? [];
  const otherDecisions = selectedMeeting?.decisions?.filter((d) => d.status !== 'must-decide') ?? [];
  const openIssues = selectedMeeting?.issues?.filter((i) => i.status === 'open') ?? [];
  const otherIssues = selectedMeeting?.issues?.filter((i) => i.status !== 'open') ?? [];

  return (
    <div className="flex h-full">
      {/* ─── Left: Meeting List ─── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-border h-full">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-0.5">
            <h1 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              Meetings
            </h1>
            <button
              onClick={() => toast.info('Create new meeting (coming soon)')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ background: 'oklch(0.48 0.22 264)' }}
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {upcomingMeetings.length} Scheduled · {completedMeetings.length} Completed
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {upcomingMeetings.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Scheduled ({upcomingMeetings.length})
              </div>
              <div className="space-y-2">
                {upcomingMeetings.map((m) => (
                  <MeetingCard key={m.id} meeting={m} isSelected={selectedMeeting?.id === m.id} onClick={() => setSelectedMeeting(m)} />
                ))}
              </div>
            </div>
          )}

          {completedMeetings.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                Completed ({completedMeetings.length})
              </div>
              <div className="space-y-2">
                {completedMeetings.map((m) => (
                  <MeetingCard key={m.id} meeting={m} isSelected={selectedMeeting?.id === m.id} onClick={() => setSelectedMeeting(m)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right: Meeting Detail ─── */}
      <div className="flex-1 overflow-y-auto">
        {selectedMeeting ? (
          <div className="px-7 py-6 space-y-4">

            {/* Header */}
            <div className="pb-2 border-b border-border">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-[20px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {selectedMeeting.title}
                </h2>
                <MeetingStatusBadge status={selectedMeeting.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-primary" />
                  {new Date(selectedMeeting.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" />
                  {selectedMeeting.time} ({selectedMeeting.duration})
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-primary" />
                  {selectedMeeting.location}
                </span>
              </div>
            </div>

            {/* AI Briefing */}
            <AIBriefingCard meeting={selectedMeeting} />

            {/* ── Must-decide items for this meeting ── */}
            {mustDecideItems.length > 0 && (
              <div className="rounded-xl p-4 border bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-[13px] font-bold text-rose-700 dark:text-rose-300" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Must Decide This Meeting ({mustDecideItems.length})
                  </span>
                </div>
                <div className="space-y-2.5">
                  {mustDecideItems.map((d) => (
                    <div key={d.id} className="bg-card rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-foreground">{d.title}</span>
                        <DecisionStatusBadge status={d.status} />
                      </div>
                      {d.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-1.5 line-clamp-3">{d.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {d.owner && <span>Owner: {d.owner}</span>}
                        {d.dueBy && <span className="font-medium text-rose-600 dark:text-rose-400">Due: {d.dueBy}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Issues discussed in past meetings ── */}
            {(openIssues.length > 0 || otherIssues.length > 0) && (
              <Section
                title="Issues from Past Meetings"
                icon={AlertCircle}
                count={(selectedMeeting.issues ?? []).length}
                badge={openIssues.length > 0 ? `Open ${openIssues.length}` : undefined}
                badgeCls="text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-700/50"
              >
                <div className="space-y-2.5 pt-1">
                  {/* Open issues first */}
                  {openIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40">
                      <IssueStatusIcon status={issue.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <span className="text-[13px] font-semibold text-foreground flex-1 line-clamp-2">{issue.title}</span>
                          <IssuePriorityBadge priority={issue.priority} />
                        </div>
                        {issue.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">{issue.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Link2 size={10} />
                          <span>{issue.source}</span>
                          <span>·</span>
                          <span>{issue.sourceDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Deferred / resolved */}
                  {otherIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <IssueStatusIcon status={issue.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-0.5 flex-wrap">
                          <span className={cn('text-[13px] font-medium flex-1 line-clamp-2', issue.status === 'resolved' ? 'line-through text-muted-foreground' : 'text-foreground')}>
                            {issue.title}
                          </span>
                          <span className={cn('text-sm font-semibold px-1.5 py-0.5 rounded border',
                            issue.status === 'resolved' ? 'text-emerald-600 border-emerald-400' : 'bg-muted text-muted-foreground border-border'
                          )}>
                            {issue.status === 'resolved' ? 'Resolved' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Link2 size={10} />
                          <span>{issue.source} · {issue.sourceDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Other Decisions ── */}
            {otherDecisions.length > 0 && (
              <Section title="Decisions" icon={CheckCircle2} count={otherDecisions.length} defaultOpen={true}>
                <div className="space-y-2 pt-1">
                  {otherDecisions.map((d) => (
                    <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <div className="mt-0.5">
                        <DecisionStatusBadge status={d.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground mb-0.5 line-clamp-2">{d.title}</div>
                        {d.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{d.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {d.owner && <span>Owner: {d.owner}</span>}
                          {d.decidedAt && <span style={{ color: 'oklch(0.55 0.18 145)' }}>Decided: {d.decidedAt}</span>}
                          {d.dueBy && d.status !== 'decided' && <span style={{ color: 'oklch(0.62 0.18 55)' }}>Due: {d.dueBy}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Agenda ── */}
            <Section title="Agenda" icon={FileText} count={selectedMeeting.agenda.length}>
              <div className="space-y-2 pt-1">
                {selectedMeeting.agenda.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: 'oklch(0.48 0.22 264)' }}
                    >
                      {i + 1}
                    </div>
                    <div className="text-[13px] text-foreground leading-relaxed line-clamp-2">{item}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Participants ── */}
            <Section title="Participants" icon={Users} count={selectedMeeting.participants.length}>
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedMeeting.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: p.color }}
                    >
                      {p.avatar}
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-foreground">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── Related meeting links ── */}
            {selectedMeeting.relatedMeetings && selectedMeeting.relatedMeetings.length > 0 && (
              <Section title="Related Meetings" icon={Link2} count={selectedMeeting.relatedMeetings.length} defaultOpen={false}>
                <div className="space-y-2 pt-1">
                  {selectedMeeting.relatedMeetings.map((rm) => {
                    const relMeeting = meetings.find((m) => m.id === rm.id);
                    return (
                      <button
                        key={rm.id}
                        onClick={() => relMeeting && setSelectedMeeting(relMeeting)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <Calendar size={12} className="text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-foreground truncate">{rm.title}</div>
                          <div className="text-sm text-muted-foreground">{new Date(rm.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}</div>
                        </div>
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Related Actions ── */}
            {selectedMeeting.actions.length > 0 && (
              <Section title="Related Actions" icon={Link2} count={selectedMeeting.actions.length} defaultOpen={false}>
                <div className="space-y-2 pt-1">
                  {selectedMeeting.actions.map((actionId) => {
                    const relatedAction = actions.find((a) => a.id === actionId);
                    if (!relatedAction) return null;
                    return (
                      <button
                        key={actionId}
                        onClick={() => toast.info('Show Related Actions (coming soon)')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-[12px] text-foreground flex-1">{relatedAction.title}</span>
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Meeting Notes ── */}
            {selectedMeeting.notes && selectedMeeting.notes.length > 0 && (
              <Section title="Meeting Notes" icon={MessageSquare} count={selectedMeeting.notes.length} defaultOpen={false}>
                <div className="space-y-3 pt-1">
                  {selectedMeeting.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-[13px] text-foreground leading-relaxed mb-2">{note.content}</p>
                      <div className="text-sm text-muted-foreground">{note.author} · {note.timestamp}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── Summary (Completed meetings only) ── */}
            {selectedMeeting.summary && (
              <Section title="Meeting Summary" icon={FileText} defaultOpen={true}>
                <p className="text-[13px] text-foreground leading-relaxed pt-1">{selectedMeeting.summary}</p>
              </Section>
            )}

            {/* Actions */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => toast.info('Edit meeting (coming soon)')}
                className="flex-1 py-2.5 text-[13px] font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Edit
              </button>
              {selectedMeeting.status === 'upcoming' && (
                <>
                  <button
                    onClick={() => toast.success('AI auto-generated actions (demo)')}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium rounded-lg border border-border hover:bg-muted transition-colors text-foreground"
                  >
                    <Zap size={14} className="text-primary" />
                    Auto-generate Actions
                  </button>
                  <button
                    onClick={() => toast.info('Start meeting (coming soon)')}
                    className="flex-1 py-2.5 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
                    style={{ background: 'oklch(0.48 0.22 264)' }}
                  >
                    Start Meeting
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-[14px]">Please select a meeting</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
