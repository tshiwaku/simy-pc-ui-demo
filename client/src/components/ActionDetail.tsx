/**
 * ActionDetail — SIMY PC UI
 * Design: "Warm Productivity" — right detail panel with full action info
 * Features: status, agents, members, change history, archive
 */

import { useState } from 'react';
import { Action } from '../lib/mockData';
import { cn } from '@/lib/utils';
import {
  X,
  Bot,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Circle,
  Archive,
  Plus,
  MoreHorizontal,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionDetailProps {
  action: Action;
  onClose: () => void;
  onOpenPipeline?: (agentId: string) => void;
}

function AgentStatusBadge({ status }: { status: string }) {
  if (status === 'running') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.15 0.06 195 / 0.8)', color: 'oklch(0.75 0.20 195)', border: '1px solid oklch(0.45 0.20 195 / 0.5)' }}>
        <span className="w-1.5 h-1.5 rounded-full ai-pulse-dot" style={{ background: 'oklch(0.62 0.20 195)' }} />
        Generating
      </span>
    );
  }
  if (status === 'queued') {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.16 0.06 55 / 0.8)', color: 'oklch(0.78 0.18 55)', border: '1px solid oklch(0.45 0.18 55 / 0.5)' }}>
        Waiting
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
      Standby
    </span>
  );
}

export default function ActionDetail({ action, onClose, onOpenPipeline }: ActionDetailProps) {
  const [historyFilter, setHistoryFilter] = useState<'all' | 'changes'>('all');
  const [showAgentLogs, setShowAgentLogs] = useState<Record<string, boolean>>({});

  const toggleAgentLogs = (agentId: string) => {
    setShowAgentLogs((prev) => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const statusLabel: Record<string, string> = {
    'pending': 'Pending Review',
    'ai-running': 'AI Running',
    'yours': 'Your Turn',
    'stopped': 'Stopped',
    'completed': 'Completed',
    'archived': 'Archived',
  };

  return (
    <div className="h-full flex flex-col bg-card slide-in-right">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'text-sm font-semibold px-2 py-0.5 rounded-full',
                action.status === 'pending' ? 'badge-pending' :
                action.status === 'ai-running' ? 'badge-ai-running' :
                action.status === 'yours' ? 'badge-yours' :
                action.status === 'completed' ? 'badge-completed' :
                'bg-muted text-muted-foreground'
              )}
            >
              {statusLabel[action.status] ?? action.status}
            </span>
            {action.stoppedDays && (
              <span className="badge-stopped text-sm font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Clock size={10} />
                Stopped for {action.stoppedDays}+ days
              </span>
            )}
          </div>
          <h2 className="text-[16px] font-bold text-foreground leading-snug line-clamp-3" style={{ fontFamily: "'Sora', sans-serif" }}>
            {action.title}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-[12px] text-muted-foreground">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: action.assignee.color }}
            >
              {action.assignee.avatar}
            </div>
            <span>Assignee: <strong className="text-foreground">{action.assignee.name}</strong></span>
            <span>·</span>
            <span>Updated: {new Date(action.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => toast.info('Open menu (coming soon)')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* Related Issues */}
        {action.relatedIssues && action.relatedIssues.length > 0 && (
          <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Lightbulb size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">関連イシュー</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {action.relatedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50"
                >
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    issue.status === 'active' ? 'bg-emerald-500' :
                    issue.status === 'paused' ? 'bg-amber-500' : 'bg-blue-500'
                  )} />
                  <span className="text-[12px] font-medium text-amber-800 dark:text-amber-300 leading-snug">{issue.title}</span>
                  <span className={cn(
                    'ml-auto text-sm font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0',
                    issue.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    issue.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  )}>
                    {issue.status === 'active' ? '進行中' : issue.status === 'paused' ? '一時停止' : '完了'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done State */}
        {action.doneState && (
          <div className="bg-accent/40 rounded-lg p-4 border border-accent">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-[12px] font-semibold text-primary uppercase tracking-wide">Done State</span>
            </div>
            <p className="text-[13px] text-foreground leading-relaxed">{action.doneState}</p>
          </div>
        )}

        {/* AI Execution Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-muted-foreground" />
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">AI Execution</span>
            </div>
            <button
              onClick={() => toast.info('Add agent (coming soon)')}
              className="text-[12px] text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Plus size={12} />
              Add Agent
            </button>
          </div>

          {action.agents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-[13px] text-muted-foreground">
              No agent assigned
            </div>
          ) : (
            <div className="space-y-3">
              {action.agents.map((agent) => (
                <div key={agent.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.18 0.06 264 / 0.8)', border: '1px solid oklch(0.40 0.15 264 / 0.4)' }}>
                        <Bot size={15} style={{ color: 'oklch(0.72 0.18 264)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-foreground">{agent.name}</span>
                          {agent.isAuto && (
                            <span className="text-sm font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">AUTO</span>
                          )}
                          <AgentStatusBadge status={agent.status} />
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">{agent.description}</div>
                      </div>
                    </div>
                    {agent.status === 'idle' && (
                      <button
                        onClick={() => toast.info(`Launching ${agent.name}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-primary border border-primary/30 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Play size={11} />
                        Launch
                      </button>
                    )}
                  </div>

                  {/* Auto selection reason */}
                  {agent.isAuto && (
                    <div className="px-4 py-2 border-t text-sm" style={{ background: 'oklch(0.14 0.05 240 / 0.6)', borderColor: 'oklch(0.30 0.10 240 / 0.4)', color: 'oklch(0.72 0.18 240)' }}>
                      Auto-selected because Action includes code changes
                    </div>
                  )}

                  {/* Repositories */}
                  {agent.repositories && agent.repositories.length > 0 && (
                    <div className="px-4 py-2 border-t border-border">
                      <div className="text-sm font-semibold text-muted-foreground mb-1.5">Target Repository</div>
                      <div className="space-y-1">
                        {agent.repositories.map((repo) => (
                          <div key={repo.name} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-1.5 text-foreground">
                              <GitBranch size={12} className="text-muted-foreground" />
                              {repo.name}
                            </div>
                            <span className="text-sm text-muted-foreground">{repo.access}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logs */}
                  {agent.logs && agent.logs.length > 0 && (
                    <div className="border-t border-border">
                      <button
                        onClick={() => toggleAgentLogs(agent.id)}
                        className="w-full px-4 py-2 flex items-center justify-between text-[12px] text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span>View detailed logs</span>
                        {showAgentLogs[agent.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      {showAgentLogs[agent.id] && (
                        <div className="px-4 pb-3 space-y-1">
                          {agent.logs.map((log, i) => (
                            <div key={i} className="text-sm font-mono text-muted-foreground">
                              {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pipeline button */}
                  {agent.status === 'running' && (
                    <div className="px-4 py-2 border-t border-border flex gap-2">
                      <button
                        onClick={() => {
                          if (onOpenPipeline) {
                            onOpenPipeline(agent.id);
                          } else {
                            toast.info('Showing pipeline progress');
                          }
                        }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline transition-colors"
                      >
                        <ExternalLink size={11} />
                        View Pipeline Progress
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Status */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={15} className="text-muted-foreground" />
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Completion Status</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.info('Set to Incomplete')}
              className={cn(
                'flex-1 py-2 text-[13px] font-medium rounded-lg border transition-all',
                action.status !== 'completed'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              )}
            >
              Incomplete
            </button>
            <button
              onClick={() => toast.info('Set to Completed')}
              className={cn(
                'flex-1 py-2 text-[13px] font-medium rounded-lg border transition-all',
                action.status === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              )}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-muted-foreground" />
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Members</span>
            </div>
            <button
              onClick={() => toast.info('Add member (coming soon)')}
              className="text-[12px] text-primary font-medium hover:underline flex items-center gap-1"
            >
              <Plus size={12} />
              Add Member
            </button>
          </div>
          <div className="space-y-2">
            {action.members.map(({ member, role }) => (
              <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{role}</div>
                  </div>
                </div>
                <button
                  onClick={() => toast.info('Change (coming soon)')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change
                </button>
              </div>
            ))}
            {action.members.length < 2 && (
              <button
                onClick={() => toast.info('Add Responsibility (coming soon)')}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-border text-[12px] text-muted-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
              >
                <Circle size={12} />
                Add Responsibility
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Details</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-muted-foreground">Status</span>
              <span className="text-[12px] font-medium text-foreground">{statusLabel[action.status]}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-muted-foreground">Category</span>
              <span className="text-[12px] font-medium text-foreground">{action.category}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-muted-foreground">Created</span>
              <span className="text-[12px] font-medium text-foreground">
                {new Date(action.createdAt).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-[12px] text-muted-foreground">Attachments</span>
              <span className="text-[12px] text-muted-foreground">None</span>
            </div>
          </div>
        </div>

        {/* Change History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">ChangeHistory</div>
            <div className="flex gap-1">
              {(['changes', 'all'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={cn(
                    'px-2.5 py-1 text-sm rounded-md transition-colors',
                    historyFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {f === 'changes' ? 'Changes only' : 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {action.changeHistory.map((h) => (
              <div key={h.version} className="flex gap-3 text-[12px]">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground flex-shrink-0">
                    v{h.version}
                  </div>
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>
                <div className="pb-3">
                  <div className="text-foreground leading-relaxed">{h.description}</div>
                  <div className="text-muted-foreground mt-0.5">{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Archive */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Archive size={14} className="text-muted-foreground" />
            <span className="text-[13px] font-semibold text-foreground">Archive</span>
          </div>
          <p className="text-[12px] text-muted-foreground mb-3">
            Archive completed or unnecessary actions. You can restore them at any time.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">
              Archived: <strong>{action.isArchived ? 'Yes' : 'No'}</strong>
            </span>
            <button
              onClick={() => toast.info('Archive (coming soon)')}
              className="px-3 py-1.5 text-[12px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
