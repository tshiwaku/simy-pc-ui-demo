/**
 * ActionList — SIMY PC UI
 * Design: "Warm Productivity" — card list with left border accent
 * Features: status color coding, agent badges, timestamps
 */

import { useState } from 'react';
import { Action } from '../lib/mockData';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Clock, Bot } from 'lucide-react';

interface ActionListProps {
  actions: Action[];
  completedActions: Action[];
  archivedActions: Action[];
  selectedId: string | null;
  onSelect: (action: Action) => void;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date('2026-03-27T17:00:00');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}

function StatusBadge({ status, stoppedDays }: { status: Action['status']; stoppedDays?: number }) {
  if (status === 'pending') {
    return (
      <span className="badge-pending text-sm font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        Pending Review
      </span>
    );
  }
  if (status === 'ai-running') {
    return (
      <span className="badge-ai-running text-sm font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse-dot" />
        AI Running
      </span>
    );
  }
  if (status === 'yours') {
    return (
      <span className="badge-yours text-sm font-medium px-2 py-0.5 rounded-full">
        Your Turn
      </span>
    );
  }
  if (status === 'completed') {
    return (
      <span className="badge-completed text-sm font-medium px-2 py-0.5 rounded-full">
        Completed
      </span>
    );
  }
  return null;
}

function StoppedBadge({ days }: { days: number }) {
  return (
    <span className="badge-stopped text-sm font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
      <Clock size={10} />
      {days}Paused
    </span>
  );
}

function AgentBadge({ name }: { name: string }) {
  return (
    <span className="text-sm font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'oklch(0.18 0.06 264 / 0.8)', color: 'oklch(0.78 0.18 264)', border: '1px solid oklch(0.40 0.15 264 / 0.5)' }}>
      <Bot size={10} />
      {name}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, { bg: string; color: string; border: string }> = {
    'Engineering': { bg: 'oklch(0.14 0.05 240 / 0.8)', color: 'oklch(0.70 0.18 240)', border: 'oklch(0.40 0.15 240 / 0.5)' },
    'Sales':      { bg: 'oklch(0.16 0.06 55 / 0.8)',  color: 'oklch(0.78 0.18 55)',  border: 'oklch(0.45 0.18 55 / 0.5)' },
    'Executive':  { bg: 'oklch(0.15 0.06 290 / 0.8)', color: 'oklch(0.72 0.18 290)', border: 'oklch(0.42 0.15 290 / 0.5)' },
    'Marketing':  { bg: 'oklch(0.14 0.05 145 / 0.8)', color: 'oklch(0.70 0.18 145)', border: 'oklch(0.40 0.15 145 / 0.5)' },
    'HR':         { bg: 'oklch(0.15 0.06 330 / 0.8)', color: 'oklch(0.72 0.18 330)', border: 'oklch(0.42 0.15 330 / 0.5)' },
    'Finance':    { bg: 'oklch(0.15 0.06 27 / 0.8)',  color: 'oklch(0.72 0.20 27)',  border: 'oklch(0.42 0.18 27 / 0.5)' },
  };
  const c = colorMap[category];
  return (
    <span
      className="text-sm font-medium px-2 py-0.5 rounded-full"
      style={c ? { background: c.bg, color: c.color, border: `1px solid ${c.border}` } : {}}
    >
      {category}
    </span>
  );
}

function ActionCard({ action, isSelected, onClick }: { action: Action; isSelected: boolean; onClick: () => void }) {
  const borderColorMap: Record<string, string> = {
    'pending': 'border-l-amber-400',
    'ai-running': 'border-l-emerald-500',
    'yours': 'border-l-indigo-500',
    'stopped': 'border-l-red-400',
    'completed': 'border-l-emerald-400',
    'archived': 'border-l-gray-300',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3.5 border-l-[3px] transition-all duration-150',
        borderColorMap[action.status] ?? 'border-l-gray-300',
        isSelected
          ? 'bg-accent/60'
          : 'bg-card hover:bg-muted/50',
        'border-b border-border'
      )}
    >
      {/* Top row: avatar + time */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: action.assignee.color }}
        >
          {action.assignee.avatar}
        </div>
        <span className="text-sm text-muted-foreground">
          {getRelativeTime(action.updatedAt)}
        </span>
      </div>

      {/* Title */}
      <div className="text-[13.5px] font-semibold text-foreground leading-snug mb-1.5 line-clamp-2" style={{ fontFamily: "'Sora', sans-serif" }}>
        {action.title}
      </div>

      {/* Description */}
      <div className="text-[12px] text-muted-foreground leading-relaxed mb-2.5 line-clamp-1">
        {action.description}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <StatusBadge status={action.status} />
        {action.stoppedDays && <StoppedBadge days={action.stoppedDays} />}
        <CategoryBadge category={action.category} />
        {action.agents.map((agent) => (
          <AgentBadge key={agent.id} name={agent.name} />
        ))}
      </div>
    </button>
  );
}

export default function ActionList({ actions, completedActions, archivedActions, selectedId, onSelect }: ActionListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <div>
      {/* Active actions */}
      {actions.map((action, i) => (
        <div key={action.id} className="fade-up" style={{ animationDelay: `${i * 30}ms` }}>
          <ActionCard
            action={action}
            isSelected={selectedId === action.id}
            onClick={() => onSelect(action)}
          />
        </div>
      ))}

      {/* Archived section */}
      {archivedActions.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full flex items-center gap-2 px-4 py-3 text-[12px] text-muted-foreground hover:bg-muted/50 transition-colors border-b border-border"
          >
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span className="font-medium">Archived ({archivedActions.length})</span>
            {showArchived ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
          </button>
          {showArchived && archivedActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isSelected={selectedId === action.id}
              onClick={() => onSelect(action)}
            />
          ))}
        </div>
      )}

      {/* Completed section */}
      {completedActions.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center gap-2 px-4 py-3 text-[12px] text-muted-foreground hover:bg-muted/50 transition-colors border-b border-border"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Completed ({completedActions.length})</span>
            {showCompleted ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
          </button>
          {showCompleted && completedActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isSelected={selectedId === action.id}
              onClick={() => onSelect(action)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
