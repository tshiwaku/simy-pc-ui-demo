/**
 * AgentRequestsPage (AI Agents) — SIMY PC UI
 * Design: "Warm Productivity"
 * Layout: Left agent list (340px) + Right pipeline detail (flex)
 * Pipeline reference: 9 steps, 3 states: completed/running/waiting
 */

import { useState, useEffect } from 'react';
import {
  Bot, Play, GitBranch, Zap, CheckCircle2,
  Circle, AlertTriangle, ChevronRight, Shield,
  TestTube, Rocket, GitMerge, Server, BarChart3,
  RefreshCw, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'approved' | 'running' | 'waiting' | 'failed';

interface SubItem {
  label: string;
  status: 'pass' | 'fail' | 'pending';
}

interface ProgressStage {
  label: string;
  pct: number;
}

interface PipelineStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  completedAt?: string;
  subItems?: SubItem[];
  note?: string;
  warningNote?: string;
  progressStages?: ProgressStage[];
}

interface Pipeline {
  agentId: string;
  agentName: string;
  actionTitle: string;
  requester: string;
  totalSteps: number;
  currentStep: number;
  steps: PipelineStep[];
}

// ─── Pipeline data ─────────────────────────────────────────────────────

const SIMY_PIPELINES: Pipeline[] = [
  {
    agentId: 'ag1',
    agentName: 'One-shot PR',
    actionTitle: 'Fix payment feature bug',
    requester: 'You',
    totalSteps: 9,
    currentStep: 4,
    steps: [
      {
        id: 1, title: 'Share Requirements',
        description: 'Share requirements with SIMY in meeting',
        status: 'completed', completedAt: 'Done · 2 days ago',
      },
      {
        id: 2, title: 'UI / Logic Review',
        description: 'Review completed by Responsibility & Accountability',
        status: 'completed', completedAt: 'Done · 1 day ago',
      },
      {
        id: 3, title: 'Human Feedback',
        description: 'Approved — proceeding to next step without changes',
        status: 'approved', completedAt: 'Done · 1 day ago',
        note: 'If changes needed, return to Step 2 (not required this time)',
      },
      {
        id: 4, title: 'Create PR & Auto-trigger CI',
        description: 'Waiting for all gates to pass',
        status: 'running',
        subItems: [
          { label: 'Security Scan (SAST / SCA / Secret)', status: 'pass' },
          { label: 'Unit Test (Coverage ≥ 80%)', status: 'pass' },
          { label: 'Integration Test', status: 'pending' },
          { label: 'E2E Smoke Test', status: 'pending' },
        ],
      },
      {
        id: 5, title: 'Merge to main & Deploy to Dev',
        description: 'Auto-executed after all CI gates pass',
        status: 'waiting',
      },
      {
        id: 6, title: 'Promotion Gate & Staging Deploy',
        description: 'Auto-promoted to Staging after Dev confirmation',
        status: 'waiting',
      },
      {
        id: 7, title: 'Staging Tests',
        description: 'E2E · Smoke · DAST · Performance',
        status: 'waiting',
      },
      {
        id: 8, title: 'Canary Release',
        description: 'Gradual release + SLO/SLI auto-ticketing',
        status: 'waiting',
        warningNote: 'Auto-rollback + incident ticket on anomaly detection',
        progressStages: [
          { label: 'Stage 0: Internal Canary (Responsibility decision)', pct: 0 },
          { label: 'Stage 1: External Canary (General users 5–10%)', pct: 0 },
        ],
      },
      {
        id: 9, title: 'Gradual Full Rollout',
        description: '25% → 50% → 100% + Continuous Observability monitoring',
        status: 'waiting',
        progressStages: [
          { label: '25%', pct: 0 },
          { label: '50%', pct: 0 },
          { label: '100%', pct: 0 },
        ],
      },
    ],
  },
  {
    agentId: 'ag2',
    agentName: 'Manus',
    actionTitle: 'Vimeo Standard Plan Research',
    requester: 'You',
    totalSteps: 5,
    currentStep: 4,
    steps: [
      { id: 1, title: 'Receive Task', description: 'Manus received and analyzed task', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 2, title: 'Web Research', description: 'Researched Vimeo official site and comparison sites', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 3, title: 'Data Collection', description: 'Collected pricing, features, and limitations', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 4, title: 'Generate Report', description: 'Organizing research results into Markdown report', status: 'running' },
      { id: 5, title: 'Share Report', description: 'Send report to assignee', status: 'waiting' },
    ],
  },
  {
    agentId: 'ag3',
    agentName: 'Claude Coworker',
    actionTitle: 'SIMY PR Improvement Feedback Collection',
    requester: 'You',
    totalSteps: 6,
    currentStep: 5,
    steps: [
      { id: 1, title: 'Start Task', description: 'Started FeedbackCollection task', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 2, title: 'Identify Data Sources', description: 'Identified data sources for collection', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 3, title: 'Feedback Collection', description: 'Collected and categorized user feedback', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 4, title: 'Analysis', description: 'Pattern analysis of feedback', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 5, title: 'Report Generation', description: 'Generating report with improvement proposals', status: 'running' },
      { id: 6, title: 'Sharing', description: 'Sharing with marketing team', status: 'waiting' },
    ],
  },
];

const YOSHI_PIPELINES: Pipeline[] = [
  {
    agentId: 'yag1',
    agentName: 'One-shot PR',
    actionTitle: 'CKS v2.1 PRD Draft — Auto-generate Sections',
    requester: 'You',
    totalSteps: 9,
    currentStep: 5,
    steps: [
      { id: 1, title: 'Share Requirements', description: 'Shared PRD scope with One-shot PR agent in Slack', status: 'completed', completedAt: 'Done · 3 days ago' },
      { id: 2, title: 'Template Selection', description: 'Selected CoreWeave PRD template v3', status: 'completed', completedAt: 'Done · 3 days ago' },
      { id: 3, title: 'Section Drafting', description: 'Drafted Problem Statement, Goals, and Non-Goals', status: 'completed', completedAt: 'Done · 2 days ago' },
      { id: 4, title: 'Human Feedback', description: 'Approved — proceeding with technical requirements section', status: 'approved', completedAt: 'Done · 1 day ago', note: 'If changes needed, return to Section Drafting' },
      {
        id: 5, title: 'Technical Requirements & API Spec',
        description: 'Generating API spec and integration requirements',
        status: 'running',
        subItems: [
          { label: 'KubeAPI compatibility check', status: 'pass' },
          { label: 'GPU scheduling spec', status: 'pass' },
          { label: 'Multi-tenant isolation requirements', status: 'pending' },
          { label: 'SLA/SLO definition', status: 'pending' },
        ],
      },
      { id: 6, title: 'Stakeholder Review Draft', description: 'Prepare review-ready version for Eng & Design leads', status: 'waiting' },
      { id: 7, title: 'Internal Review', description: 'Review by CKS Engineering, Platform, and Design', status: 'waiting' },
      { id: 8, title: 'Final Approval Gate', description: 'VP Product sign-off required', status: 'waiting', warningNote: 'Auto-escalate if no response within 48h' },
      { id: 9, title: 'Publish to Confluence', description: 'Auto-publish to CKS PRD space and notify stakeholders', status: 'waiting' },
    ],
  },
  {
    agentId: 'yag2',
    agentName: 'Manus',
    actionTitle: 'CoreWeave Competitor Analysis — H1 2026',
    requester: 'You',
    totalSteps: 5,
    currentStep: 4,
    steps: [
      { id: 1, title: 'Receive Task', description: 'Manus received competitor analysis scope', status: 'completed', completedAt: 'Done · 5 days ago' },
      { id: 2, title: 'Data Collection', description: 'Scraped pricing, feature pages for AWS, GCP, Lambda Labs, Crusoe', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 3, title: 'Benchmarking', description: 'Compared GPU SKUs, pricing tiers, and SLA commitments', status: 'completed', completedAt: 'Done · 3 days ago' },
      { id: 4, title: 'Generate Report', description: 'Compiling findings into competitive positioning report', status: 'running' },
      { id: 5, title: 'Share Report', description: 'Deliver report to Yoshi and PM Slack channel', status: 'waiting' },
    ],
  },
  {
    agentId: 'yag3',
    agentName: 'Claude Coworker',
    actionTitle: 'CKS Onboarding Flow — UX Feedback Analysis',
    requester: 'You',
    totalSteps: 6,
    currentStep: 5,
    steps: [
      { id: 1, title: 'Start Task', description: 'Loaded 142 onboarding session recordings and NPS comments', status: 'completed', completedAt: 'Done · 6 days ago' },
      { id: 2, title: 'Identify Pain Points', description: 'Categorized friction points by onboarding stage', status: 'completed', completedAt: 'Done · 5 days ago' },
      { id: 3, title: 'Sentiment Analysis', description: 'Analyzed NPS verbatims for CKS setup experience', status: 'completed', completedAt: 'Done · 4 days ago' },
      { id: 4, title: 'Pattern Analysis', description: 'Identified top 5 drop-off points in Setup Wizard flow', status: 'completed', completedAt: 'Done · 2 days ago' },
      { id: 5, title: 'Report Generation', description: 'Generating improvement proposals with priority matrix', status: 'running' },
      { id: 6, title: 'Share with Design', description: 'Share findings with CKS Design and Eng leads', status: 'waiting' },
    ],
  },
];

// ─── Agent color map ────────────────────────────────────────────────────

const agentColors: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  'One-shot PR': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', hex: '#6D28D9' },
  'Manus':       { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   hex: '#1D4ED8' },
  'Claude Coworker': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#B45309' },
};

// ─── Step icon ─────────────────────────────────────────────────────────

const stepIconMap: Record<number, React.ElementType> = {
  1: GitBranch, 2: Shield, 3: CheckCircle2, 4: GitMerge,
  5: Server, 6: Rocket, 7: TestTube, 8: BarChart3, 9: Rocket,
};

function StepIcon({ status, stepId }: { status: StepStatus; stepId: number }) {
  const Icon = stepIconMap[stepId] ?? Circle;

  if (status === 'completed' || status === 'approved') {
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-emerald-100">
        <CheckCircle2 size={16} className="text-white" />
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 bg-white shadow-sm ring-4 ring-primary/10">
        <RefreshCw size={14} className="text-primary animate-spin" />
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <XCircle size={16} className="text-white" />
      </div>
    );
  }
  // waiting
  return (
    <div className="w-9 h-9 rounded-full border-2 border-border bg-background flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-muted-foreground" />
    </div>
  );
}

// ─── Pipeline Detail Panel ─────────────────────────────────────────────

function PipelineDetail({ pipeline }: { pipeline: Pipeline }) {
  const colors = agentColors[pipeline.agentName] ?? { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', hex: '#6B7280' };
  const progressPct = Math.round((pipeline.currentStep / pipeline.totalSteps) * 100);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Dark header */}
      <div className="px-6 py-5 flex-shrink-0" style={{ background: 'oklch(0.18 0.025 264)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-widest text-white/50">
            SIMY ACTION STATUS
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            In Progress
          </span>
        </div>
        <h2 className="text-[20px] font-bold text-white leading-tight mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
          {pipeline.actionTitle}
        </h2>
        <div className="text-[12px] text-white/50 mb-4">
          Requester: {pipeline.requester} · Agent: {pipeline.agentName}
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-sm text-white/50 text-right">
          Step {pipeline.currentStep} / {pipeline.totalSteps} — {progressPct}% Done
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Pipeline Progress
        </div>

        <div className="relative">
          {/* Vertical connector */}
          <div
            className="absolute top-4 bottom-4 w-0.5 bg-border"
            style={{ left: '17px' }}
          />

          <div className="space-y-3">
            {pipeline.steps.map((step) => {
              const isDone = step.status === 'completed' || step.status === 'approved';
              const isRunning = step.status === 'running';
              const isWaiting = step.status === 'waiting';

              return (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Icon (sits on top of line) */}
                  <div className="z-10 flex-shrink-0 mt-0.5">
                    <StepIcon status={step.status} stepId={step.id} />
                  </div>

                  {/* Card */}
                  <div
                    className={cn(
                      'flex-1 rounded-xl border p-4 transition-all',
                      isRunning
                        ? 'border-primary/40 bg-accent/20 shadow-md'
                        : isDone
                          ? 'border-emerald-500/30 bg-emerald-950/20'
                          : 'border-border bg-muted/10 opacity-55'
                    )}
                  >
                    {/* Step header */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                          STEP {step.id}
                        </div>
                        <div
                          className={cn(
                            'text-[14px] font-bold leading-snug truncate',
                            isWaiting ? 'text-muted-foreground' : 'text-foreground'
                          )}
                          style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                          {step.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {step.description}
                        </div>
                      </div>
                      <div className="flex-shrink-0 pt-0.5">
                        {isDone && (
                          <span className="text-sm font-semibold" style={{ color: 'oklch(0.72 0.18 145)' }}>
                            {step.status === 'approved' ? '✓ Approval' : '✓ Done'}
                          </span>
                        )}
                        {isRunning && (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                            <RefreshCw size={10} className="animate-spin" />
                            Running
                          </span>
                        )}
                        {isWaiting && (
                          <span className="text-sm text-muted-foreground">Waiting</span>
                        )}
                      </div>
                    </div>

                    {/* Completed time */}
                    {step.completedAt && (
                      <div className="text-sm text-muted-foreground mt-1">{step.completedAt}</div>
                    )}

                    {/* Diff-back note */}
                    {step.note && (
                      <div className="mt-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-dashed border-border text-sm text-muted-foreground">
                        ← {step.note}
                      </div>
                    )}

                    {/* CI sub-items */}
                    {step.subItems && step.subItems.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {step.subItems.map((sub, i) => (
                          <div key={i} className="flex items-center gap-2 text-[12px]">
                            {sub.status === 'pass' ? (
                              <CheckCircle2 size={13} className="flex-shrink-0" style={{ color: 'oklch(0.62 0.18 145)' }} />
                            ) : sub.status === 'fail' ? (
                              <XCircle size={13} className="text-red-500 flex-shrink-0" />
                            ) : (
                              <Circle size={13} className="text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={sub.status === 'pass' ? 'text-foreground' : 'text-muted-foreground'}>
                              {sub.label}
                            </span>
                            {sub.status === 'pass' && (
                              <span className="text-sm font-bold ml-auto" style={{ color: 'oklch(0.72 0.18 145)' }}>Pass</span>
                            )}
                            {sub.status === 'pending' && (
                              <span className="text-sm text-muted-foreground ml-auto">Waiting</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warning */}
                    {step.warningNote && (
                      <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: 'oklch(0.16 0.06 55 / 0.6)', border: '1px solid oklch(0.45 0.18 55 / 0.4)', color: 'oklch(0.78 0.18 55)' }}>
                        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                        {step.warningNote}
                      </div>
                    )}

                    {/* Progress stages */}
                    {step.progressStages && step.progressStages.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {step.progressStages.map((stage, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                              <span>{stage.label}</span>
                              <span>{stage.pct}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/40"
                                style={{ width: `${stage.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA for step 4 */}
        {pipeline.agentId === 'ag1' && pipeline.currentStep === 4 && (
          <div className="mt-5 space-y-2">
            <div className="text-[12px] font-semibold text-muted-foreground mb-2">Action required</div>
            <button
              onClick={() => toast.success('Confirmed Integration Test completion')}
              className="w-full py-3 text-[13px] font-bold text-white rounded-xl shadow-sm hover:opacity-90 transition-all"
              style={{ background: 'oklch(0.48 0.22 264)' }}
            >
              ✓ Confirm Integration Test completion
            </button>
            <button
              onClick={() => toast.info('Send comment (coming soon)')}
              className="w-full py-2.5 text-[13px] font-medium text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
            >
              Send additional comment to SIMY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agent Card (left list) ────────────────────────────────────────────

function AgentCard({
  pipeline,
  isSelected,
  onClick,
}: {
  pipeline: Pipeline;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = agentColors[pipeline.agentName] ?? { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', hex: '#6B7280' };
  const pct = Math.round((pipeline.currentStep / pipeline.totalSteps) * 100);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border transition-all duration-150 overflow-hidden',
        isSelected
          ? 'border-primary/40 bg-accent/30 shadow-sm'
          : 'border-border bg-card hover:border-primary/20 hover:bg-muted/20'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
            <Bot size={16} className={colors.text} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                {pipeline.agentName}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'oklch(0.15 0.06 195 / 0.8)', color: 'oklch(0.75 0.20 195)', border: '1px solid oklch(0.45 0.20 195 / 0.5)' }}>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'oklch(0.62 0.20 195)' }} />
                Running
              </span>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-1">{pipeline.actionTitle}</div>
          </div>
          <ChevronRight size={14} className={cn('text-muted-foreground flex-shrink-0 mt-1 transition-transform', isSelected && 'rotate-90')} />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Step {pipeline.currentStep} / {pipeline.totalSteps}</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: colors.hex }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

interface AgentRequestsPageProps {
  initialAgentId?: string;
}

export default function AgentRequestsPage({ initialAgentId }: AgentRequestsPageProps) {
  const pipelines = SIMY_PIPELINES;
  const [selectedId, setSelectedId] = useState<string>(initialAgentId ?? pipelines[0].agentId);
  const selectedPipeline = pipelines.find((p) => p.agentId === selectedId) ?? pipelines[0];
  // Auto-select when initialAgentId changes externally (e.g., navigating from My Actions)
  useEffect(() => {
    if (initialAgentId && pipelines.some((p) => p.agentId === initialAgentId)) {
      setSelectedId(initialAgentId);
    }
  }, [initialAgentId, pipelines]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── Left: Agent List ─── */}
      <div
        className="w-[340px] flex-shrink-0 flex flex-col border-r border-border h-full overflow-hidden bg-card"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-0.5">
            <h1 className="text-[18px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              My Agents
            </h1>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'oklch(0.15 0.06 195 / 0.8)', color: 'oklch(0.75 0.20 195)', border: '1px solid oklch(0.45 0.20 195 / 0.5)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'oklch(0.62 0.20 195)' }} />
              {pipelines.length} Running
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">Progress of tasks delegated to AI Agents</p>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Running agents */}
          <div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Running ({pipelines.length})
            </div>
            <div className="space-y-2">
              {pipelines.map((p) => (
                <AgentCard
                  key={p.agentId}
                  pipeline={p}
                  isSelected={selectedId === p.agentId}
                  onClick={() => setSelectedId(p.agentId)}
                />
              ))}
            </div>
          </div>

          {/* Available agents */}
          <div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1 flex items-center gap-2">
              <Zap size={11} />
              Available Agents
            </div>
            <div className="space-y-2">
              {[
                { name: 'One-shot PR', desc: 'AI code generation & auto PR creation', stats: 'Done 12', color: agentColors['One-shot PR'] },
                { name: 'Manus', desc: 'Research, information collection & general tasks', stats: 'Done 8', color: agentColors['Manus'] },
                { name: 'Claude Coworker', desc: 'Code review & document generation', stats: 'Done 5', color: agentColors['Claude Coworker'] },
              ].map((ag) => (
                <button
                  key={ag.name}
                  onClick={() => toast.info(`Request new task to ${ag.name} (coming soon)`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:bg-muted/20 transition-all text-left"
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', ag.color.bg)}>
                    <Bot size={14} className={ag.color.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-foreground">{ag.name}</div>
                    <div className="text-sm text-muted-foreground">{ag.desc}</div>
                  </div>
                  <div className="text-sm text-muted-foreground flex-shrink-0">{ag.stats}</div>
                  <Play size={12} className="text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Pipeline Detail ─── */}
      <div className="flex-1 overflow-hidden bg-background">
        <PipelineDetail pipeline={selectedPipeline} />
      </div>
    </div>
  );
}
