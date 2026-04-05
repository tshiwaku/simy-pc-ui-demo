/**
 * IssuePage — マイイシュー
 * Design: Clean editorial, 3-pane layout with top tabs per issue
 *
 * Tabs per issue:
 *   1. イシューの概要  — 定義 + 期限/Done State
 *   2. 仮説検証シート  — Hypothesis × Verification table
 *   3. マイルストーン  — 1day / 1week timeline
 *   4. 関連アクション  — linked actions
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import demoIssuesRaw from '@/data/demo-issues.json';
import {
  Lightbulb,
  Plus,
  CheckCircle2,
  Circle,
  FlaskConical,
  Zap,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  Target,
  Flag,
  CheckSquare,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Bot,
  User,
  BarChart3,
  Brain,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type IssueStatus = 'active' | 'paused' | 'done';
type HypothesisVerdict = 'verified' | 'revised' | 'rejected' | 'pending';
type HvpAxis = 'sq' | 'cr' | 'ht';
type MilestoneUnit = '1day' | '1week';
type MilestoneStatus = 'done' | 'in_progress' | 'upcoming' | 'overdue';
type ResponsibilityType = 'AI' | '人間';
type IssueTab = 'overview' | 'hypothesis' | 'milestones';

interface DoneStateItem {
  condition: string;
  metric: string;
  current: string;
  target: string;
}

interface HypothesisRow {
  id: string;
  issue: string;
  hypothesis: string;
  verification: string;
  method: string;
  responsibility: ResponsibilityType;
  fact: string;
  decision: string;
  hvpAxis: HvpAxis;
  verdict: HypothesisVerdict;
}

interface MilestoneAction {
  id: string;
  title: string;
  done: boolean;
  owner: 'AI' | '人間';
  hvpAxis?: HvpAxis;
}

interface Milestone {
  id: string;
  label: string;
  unit: MilestoneUnit;
  offset: number;
  status: MilestoneStatus;
  owner: string;
  dueLabel: string;
  description?: string;
  actions?: MilestoneAction[];
}

interface RelatedAction {
  id: string;
  title: string;
  status: 'pending_review' | 'ai_running' | 'your_turn' | 'done';
  category: string;
  updatedAt: string;
  hvpAxis?: HvpAxis;
}

interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  definition: string;
  deadline: string;
  doneState: DoneStateItem[];
  hypotheses: HypothesisRow[];
  milestones: Milestone[];
  actions: RelatedAction[];
  updatedAt: string;
}

// ─── Data (loaded from JSON) ────────────────────────────────────────────────
const DEMO_ISSUES: Issue[] = demoIssuesRaw as unknown as Issue[];
function getIssuesByUser(_uid: string): Issue[] {
  return DEMO_ISSUES;
}

// ─── Legacy inline data removed — see src/data/simy-issues.json & nara-issues.json ───

// ─── Badge Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: IssueStatus }) {
  const map = {
    active: { label: '進行中', dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
    paused: { label: '一時停止', dot: 'bg-amber-500', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
    done: { label: '完了', dot: 'bg-blue-500', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  };
  const { label, dot, cls } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-md', cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: HypothesisVerdict }) {
  const map: Record<HypothesisVerdict, { label: string; dot: string; cls: string }> = {
    verified: { label: '検証済', dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
    revised: { label: '修正', dot: 'bg-amber-500', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
    rejected: { label: '棄却', dot: 'bg-red-500', cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' },
    pending: { label: '検証中', dot: 'bg-slate-400', cls: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20' },
  };
  const { label, dot, cls } = map[verdict];
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-md whitespace-nowrap', cls)}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  );
}

function HvpAxisBadge({ axis }: { axis: HvpAxis }) {
  const map: Record<HvpAxis, { label: string; cls: string }> = {
    sq: { label: 'Questioning', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    cr: { label: 'Responsibility', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    ht: { label: 'High-Touch', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  };
  const { label, cls } = map[axis];
  return <span className={cn('text-sm font-bold px-1.5 py-0.5 rounded whitespace-nowrap', cls)}>{label}</span>;
}

function ActionStatusBadge({ status }: { status: RelatedAction['status'] }) {
  const map = {
    pending_review: { label: 'レビュー待ち', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    ai_running: { label: 'AI実行中', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    your_turn: { label: 'あなたの番', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    done: { label: '完了', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  };
  const { label, cls } = map[status];
  return <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full', cls)}>{label}</span>;
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function TabOverview({ issue }: { issue: Issue }) {
  return (
    <div className="max-w-3xl mx-auto space-y-7 p-7">
      {/* イシューの定義 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
            <Lightbulb size={11} className="text-primary" />
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">イシューの定義</span>
        </div>
        <div className="relative pl-4 border-l-2 border-primary/40">
          <p className="text-[14.5px] text-foreground leading-[1.8] font-medium">{issue.definition}</p>
        </div>
      </section>

      {/* 期限と Done State */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
              <Target size={11} className="text-emerald-500" />
            </div>
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Done State</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
            <Calendar size={11} />
            <span className="font-medium">{issue.deadline}</span>
          </div>
        </div>
        <div className="space-y-3">
          {issue.doneState.map((d, i) => {
            const cur = parseFloat(d.current.replace(/[^0-9.]/g, ''));
            const tgt = parseFloat(d.target.replace(/[^0-9.]/g, ''));
            const pct = isNaN(cur) || isNaN(tgt) || tgt === 0 ? 0 : Math.min(100, Math.round((cur / tgt) * 100));
            const met = pct >= 100;
            return (
              <div key={i} className={cn(
                'group relative rounded-xl border p-4 transition-all hover:shadow-sm',
                met ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card hover:border-border/80'
              )}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {met
                      ? <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        </div>
                      : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 flex-shrink-0" />}
                    <span className="text-[13.5px] font-semibold text-foreground">{d.condition}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] text-muted-foreground">{d.current}</span>
                    <span className="text-sm text-muted-foreground">→</span>
                    <span className="text-[12px] font-bold text-foreground">{d.target}</span>
                    <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">{d.metric}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', met ? 'bg-emerald-500' : 'bg-primary')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">進捗</span>
                    <span className={cn('text-sm font-bold', met ? 'text-emerald-500' : 'text-primary')}>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Tab: Hypothesis Sheet ────────────────────────────────────────────────────

// MECE analysis helpers
function computeMeceScore(hypotheses: HypothesisRow[]) {
  // Mutually Exclusive: check for duplicate hvpAxis within same issue group
  const groups: Record<string, HypothesisRow[]> = {};
  for (const h of hypotheses) {
    if (!groups[h.issue]) groups[h.issue] = [];
    groups[h.issue].push(h);
  }

  let meScore = 100;
  let ceScore = 0;

  for (const rows of Object.values(groups)) {
    // ME: penalize if same hvpAxis appears multiple times in same group
    const axisCount: Record<string, number> = {};
    for (const r of rows) {
      axisCount[r.hvpAxis] = (axisCount[r.hvpAxis] ?? 0) + 1;
    }
    const duplicates = Object.values(axisCount).filter((c) => c > 1).length;
    if (duplicates > 0) meScore = Math.max(0, meScore - duplicates * 20);
  }

  // CE: coverage of all 3 HVP axes across all hypotheses
  const coveredAxes = new Set(hypotheses.map((h) => h.hvpAxis));
  ceScore = Math.round((coveredAxes.size / 3) * 100);

  // Verdict coverage: how many are not 'pending'
  const resolved = hypotheses.filter((h) => h.verdict !== 'pending').length;
  const progressScore = hypotheses.length > 0 ? Math.round((resolved / hypotheses.length) * 100) : 0;

  return { meScore, ceScore, progressScore, groups, coveredAxes };
}

function MeceSummaryPanel({ hypotheses, onAddHypotheses }: { hypotheses: HypothesisRow[]; onAddHypotheses?: (rows: HypothesisRow[]) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAiGenerate = useCallback(async () => {
    if (!onAddHypotheses) return;
    setIsGenerating(true);
    setJustAdded(false);
    const axisCount: Record<HvpAxis, number> = { sq: 0, cr: 0, ht: 0 };
    for (const h of hypotheses) axisCount[h.hvpAxis]++;
    const missingAxes = (['sq', 'cr', 'ht'] as HvpAxis[]).filter(k => axisCount[k] === 0);
    const templates: Record<HvpAxis, Omit<HypothesisRow, 'id'>> = {
      sq: {
        issue: hypotheses[0]?.issue ?? 'イシュー',
        hypothesis: 'データ品質の改善（Insight Quality）分析精度を高めることで、意思決定の速度と正確性を30%向上できる',
        verification: '現在の意思決定に使われているデータの精度・鮮度・網羅性を測定できるか',
        method: 'AIによるデータパイプライン監査・ログ分析・ダッシュボード精度評価',
        responsibility: 'AI',
        fact: '未検証：データ品質スコアの計測基盤を構築中',
        decision: '保留：計測基盤完成後に再評価',
        hvpAxis: 'sq',
        verdict: 'pending',
      },
      cr: {
        issue: hypotheses[0]?.issue ?? 'イシュー',
        hypothesis: '意思決定の大胆化（Bold Decisions）週次レビューをAI主導にすることで、重要な判断を2倍速で下せる',
        verification: '現在の意思決定プロセスのボトルネックはどこか（情報収集・合意形成・承認）',
        method: 'AIによる会議録分析・意思決定ログのタイムライン可視化',
        responsibility: 'AI',
        fact: '未検証：意思決定ログの収集を開始予定',
        decision: '保留：ログ収集後に分析',
        hvpAxis: 'cr',
        verdict: 'pending',
      },
      ht: {
        issue: hypotheses[0]?.issue ?? 'イシュー',
        hypothesis: '人間的つながりの強化（Human Connection）顧客との関係性スコアを可視化することで、解約率を15%削減できる',
        verification: '顧客担当者との接触頻度・満足度・関係性の深さを定量化できるか',
        method: 'CRMデータ分析・AIによる顧客感情スコアリング・NPS相関分析',
        responsibility: '人間',
        fact: '未検証：顧客関係性スコアの定義が未確定',
        decision: '保留：スコア定義のワークショップを実施予定',
        hvpAxis: 'ht',
        verdict: 'pending',
      },
    };
    await new Promise(res => setTimeout(res, 1800));
    const newRows: HypothesisRow[] = missingAxes.map((axis, i) => ({
      ...templates[axis],
      id: `ai-gen-${axis}-${Date.now()}-${i}`,
    }));
    onAddHypotheses(newRows);
    setIsGenerating(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 4000);
  }, [hypotheses, onAddHypotheses]);

  const { meScore, ceScore, progressScore, coveredAxes } = computeMeceScore(hypotheses);

  const HVP_AXES: { key: HvpAxis; label: string; color: string; bg: string }[] = [
    { key: 'sq', label: 'Insight Quality', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500' },
    { key: 'cr', label: 'Bold Decisions', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
    { key: 'ht', label: 'Human Connection', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
  ];

  const axisCount: Record<HvpAxis, number> = { sq: 0, cr: 0, ht: 0 };
  for (const h of hypotheses) axisCount[h.hvpAxis]++;
  const maxCount = Math.max(...Object.values(axisCount), 1);

  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Layers size={13} className="text-muted-foreground" />
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">MECE チェック</span>
        <span className="text-sm text-muted-foreground ml-1">— 仮説の網羅性・重複を確認</span>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4">
        {/* ME Score */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Mutually Exclusive</span>
            <span className={cn(
              'text-[13px] font-black',
              meScore >= 80 ? 'text-emerald-500' : meScore >= 50 ? 'text-amber-500' : 'text-red-500'
            )}>{meScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', meScore >= 80 ? 'bg-emerald-500' : meScore >= 50 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${meScore}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            {meScore >= 80 ? '✓ 仮説間の重複は少ない' : meScore >= 50 ? '△ 一部の軸で仮説が重複している' : '✗ 同じ軸に仮説が集中している'}
          </p>
        </div>

        {/* CE Score */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Collectively Exhaustive</span>
            <span className={cn(
              'text-[13px] font-black',
              ceScore >= 100 ? 'text-emerald-500' : ceScore >= 67 ? 'text-amber-500' : 'text-red-500'
            )}>{ceScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', ceScore >= 100 ? 'bg-emerald-500' : ceScore >= 67 ? 'bg-amber-500' : 'bg-red-500')}
              style={{ width: `${ceScore}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {HVP_AXES.map(({ key, label, bg }) => (
              <div key={key} className="flex items-center gap-1">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', coveredAxes.has(key) ? bg : 'bg-muted-foreground/20')} />
                <span className={cn('text-sm', coveredAxes.has(key) ? 'text-foreground' : 'text-muted-foreground/50')}>{label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">検証進捗</span>
            <span className={cn(
              'text-[13px] font-black',
              progressScore >= 80 ? 'text-emerald-500' : progressScore >= 40 ? 'text-amber-500' : 'text-muted-foreground'
            )}>{progressScore}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressScore}%` }} />
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            {hypotheses.filter(h => h.verdict !== 'pending').length}/{hypotheses.length} 件の仮説が検証済み
          </p>
        </div>
      </div>

      {/* HVP Axis Coverage Bar */}
      <div className="px-4 pb-4">
        <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">HVP 軸カバレッジ（偏りの確認）</div>
        <div className="flex flex-col gap-2">
          {HVP_AXES.map(({ key, label, color, bg }) => {
            const count = axisCount[key];
            const pct = Math.round((count / maxCount) * 100);
            const isLow = count === 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className={cn('text-sm font-semibold w-28 flex-shrink-0', color)}>{label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', bg)} style={{ width: `${pct}%` }} />
                </div>
                <span className={cn('text-sm font-bold w-8 text-right flex-shrink-0', isLow ? 'text-red-500' : 'text-foreground')}>
                  {count}件{isLow ? ' ⚠' : ''}
                </span>
              </div>
            );
          })}
        </div>
        {Object.values(axisCount).some(c => c === 0) && (
          <div className="mt-2.5 flex items-center justify-between gap-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg px-3 py-2">
            <div className="flex items-start gap-1.5">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              <span>カバーされていない軸があります。仮説を追加してMECEを完成させましょう。</span>
            </div>
            {onAddHypotheses && (
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 flex-shrink-0 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-3 py-1 rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                    AI生成中…
                  </>
                ) : (
                  <>
                    <Bot size={12} />
                    AIが自動生成
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {justAdded && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-2">
            <CheckCircle2 size={13} className="flex-shrink-0" />
            <span>AIが不足していた仮説を自動生成しました。MECEが完成しました！</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TabHypothesis({ hypotheses, onAddHypotheses }: { hypotheses: HypothesisRow[]; onAddHypotheses?: (rows: HypothesisRow[]) => void }) {
  // Group rows by issue label
  const groups: { issue: string; rows: HypothesisRow[] }[] = [];
  for (const row of hypotheses) {
    const last = groups[groups.length - 1];
    if (last && last.issue === row.issue) {
      last.rows.push(row);
    } else {
      groups.push({ issue: row.issue, rows: [row] });
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center">
            <FlaskConical size={11} className="text-amber-500" />
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">仮説検証シート</span>
          <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{hypotheses.length}件</span>
        </div>
        <button className="flex items-center gap-1.5 text-[12px] font-medium text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={12} /> 仮説を追加
        </button>
      </div>

      {/* MECE Summary Panel */}
      <MeceSummaryPanel hypotheses={hypotheses} onAddHypotheses={onAddHypotheses} />

      <div className="space-y-3">
        {groups.map((group) =>
          group.rows.map((row, ri) => (
            <div
              key={row.id}
              className="group relative rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden"
            >
              {/* Left accent bar */}
              <div className={cn(
                'absolute left-0 top-0 bottom-0 w-[3px]',
                row.verdict === 'verified' ? 'bg-emerald-500' :
                row.verdict === 'rejected' ? 'bg-red-500' :
                row.verdict === 'revised' ? 'bg-amber-500' : 'bg-muted-foreground/30'
              )} />

              <div className="pl-5 pr-4 pt-4 pb-3">
                {/* Top row: issue label (only first in group) + verdict + hvpAxis */}
                {ri === 0 && group.rows.length > 1 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground font-medium">{group.issue}</span>
                    <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{group.rows.length}仮説</span>
                  </div>
                )}

                {/* Hypothesis title */}
                <p className="text-[13.5px] font-semibold text-foreground leading-snug mb-3 line-clamp-3">{row.hypothesis}</p>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">検証事項</span>
                    <p className="text-[12px] text-foreground/80 leading-snug line-clamp-2">{row.verification}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">検証方法</span>
                    <p className="text-[12px] text-foreground/70 leading-snug line-clamp-2">{row.method}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">状況 / Fact</span>
                    <p className="text-[12px] text-foreground/80 leading-snug line-clamp-2">{row.fact}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">最終判断</span>
                    <p className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2">{row.decision}</p>
                  </div>
                </div>

                {/* Footer badges */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <span className={cn(
                    'inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-md',
                    row.responsibility === 'AI'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                  )}>
                    {row.responsibility === 'AI' ? <Bot size={9} /> : <User size={9} />}
                    {row.responsibility}
                  </span>
                  <HvpAxisBadge axis={row.hvpAxis} />
                  <div className="ml-auto">
                    <VerdictBadge verdict={row.verdict} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Tab: Milestones ──────────────────────────────────────────────────────────

const MS_CFG: Record<MilestoneStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  done: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', icon: CheckCircle2, label: '完了' },
  in_progress: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', icon: Clock, label: '進行中' },
  upcoming: { color: 'text-slate-400', bg: 'bg-slate-300 dark:bg-slate-600', icon: Circle, label: '予定' },
  overdue: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500', icon: AlertTriangle, label: '遅延' },
};

const HVP_AXIS_LABEL: Record<HvpAxis, string> = {
  sq: 'Insight Quality',
  cr: 'Bold Decisions',
  ht: 'Human Connection',
};

const HVP_BORDER: Record<HvpAxis, string> = {
  sq: 'border-l-indigo-400',
  cr: 'border-l-amber-400',
  ht: 'border-l-emerald-400',
};

function MilestoneActionItem({ action, onToggle }: { action: MilestoneAction; onToggle: (id: string) => void }) {
  const borderColor = action.hvpAxis ? HVP_BORDER[action.hvpAxis] : (action.done ? 'border-l-emerald-400' : 'border-l-primary/40');
  return (
    <button
      onClick={() => onToggle(action.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-l-[3px] rounded-r-lg border border-border transition-all duration-150 group',
        borderColor,
        action.done ? 'bg-muted/30 opacity-70' : 'bg-card hover:bg-accent/30'
      )}
    >
      <div className="flex items-center gap-2.5">
        {action.done
          ? <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
          : <Circle size={14} className="text-muted-foreground/40 flex-shrink-0 group-hover:text-primary/50 transition-colors" />}
        <span className={cn('text-[12.5px] font-medium flex-1 leading-snug', action.done ? 'line-through text-muted-foreground' : 'text-foreground')}>{action.title}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {action.owner === 'AI' ? (
            <span className="text-sm font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'oklch(0.18 0.06 264 / 0.8)', color: 'oklch(0.78 0.18 264)', border: '1px solid oklch(0.40 0.15 264 / 0.5)' }}>
              <Bot size={9} />AI
            </span>
          ) : (
            <span className="text-sm font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 bg-muted text-muted-foreground border border-border">
              <User size={9} />Human
            </span>
          )}
          {action.hvpAxis && (
            <span className="text-sm font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
              {HVP_AXIS_LABEL[action.hvpAxis]}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function TabMilestones({ milestones }: { milestones: Milestone[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {};
    milestones.forEach((ms) => {
      if (ms.actions) {
        init[ms.id] = {};
        ms.actions.forEach((a) => { init[ms.id][a.id] = a.done; });
      }
    });
    return init;
  });

  const toggleAction = (msId: string, actionId: string) => {
    setActionStates((prev) => ({
      ...prev,
      [msId]: { ...prev[msId], [actionId]: !prev[msId]?.[actionId] },
    }));
  };

  const getProgress = (ms: Milestone) => {
    if (!ms.actions || ms.actions.length === 0) return ms.status === 'done' ? 100 : 0;
    const states = actionStates[ms.id] ?? {};
    const done = ms.actions.filter((a) => states[a.id] ?? a.done).length;
    return Math.round((done / ms.actions.length) * 100);
  };

  // Summary stats
  const totalActions = useMemo(() => milestones.reduce((s, ms) => s + (ms.actions?.length ?? 0), 0), [milestones]);
  const doneActions = useMemo(() => milestones.reduce((s, ms) => {
    if (!ms.actions) return s;
    const states = actionStates[ms.id] ?? {};
    return s + ms.actions.filter((a) => states[a.id] ?? a.done).length;
  }, 0), [milestones, actionStates]);
  const overallPct = totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-muted-foreground" />
          <span className="text-[13px] font-bold text-foreground">マイルストーン</span>
          <span className="text-[12px] text-muted-foreground ml-1">（{milestones.length}件）</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 size={12} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">アクション完了率</span>
            <span className="text-sm font-bold text-foreground">{doneActions}/{totalActions}</span>
            <span className="text-sm font-bold text-primary">{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-5 p-3 bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">全体アクション進捗</span>
          <span className="text-sm font-bold text-foreground">{overallPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-border" />
        <div className="space-y-3">
          {milestones.map((ms) => {
            const cfg = MS_CFG[ms.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === ms.id;
            const progress = getProgress(ms);
            const hasActions = ms.actions && ms.actions.length > 0;
            const states = actionStates[ms.id] ?? {};
            return (
              <div key={ms.id} className="relative flex items-start gap-4">
                <div className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-background',
                  ms.status === 'done' ? 'bg-primary' :
                  ms.status === 'in_progress' ? 'bg-primary/60' :
                  ms.status === 'overdue' ? 'bg-destructive' :
                  'bg-muted'
                )}>
                  <Icon size={16} className={ms.status === 'upcoming' ? 'text-muted-foreground' : 'text-white'} />
                </div>
                <div className="flex-1 rounded-xl border border-border bg-card overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-accent/20 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-sm font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex-shrink-0">
                        {ms.dueLabel}
                      </span>
                      <span className={cn(
                        'text-[13px] font-semibold truncate',
                        ms.status === 'done' ? 'text-foreground/50 line-through' : 'text-foreground'
                      )}>
                        {ms.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {hasActions && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-sm font-bold text-foreground w-7 text-right">{progress}%</span>
                        </div>
                      )}
                      <span className={cn('text-sm font-medium', cfg.color)}>{cfg.label}</span>
                      {hasActions && (isExpanded
                        ? <ChevronUp size={12} className="text-muted-foreground" />
                        : <ChevronDown size={12} className="text-muted-foreground" />)}
                    </div>
                  </div>

                  {/* Expanded: description + actions */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border">
                      {ms.description && (
                        <p className="text-[12px] text-muted-foreground leading-relaxed py-3">{ms.description}</p>
                      )}
                      {hasActions && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">アクション</span>
                            <span className="text-sm text-muted-foreground">
                              {ms.actions!.filter((a) => states[a.id] ?? a.done).length}/{ms.actions!.length} 完了
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {ms.actions!.map((action) => (
                              <MilestoneActionItem
                                key={action.id}
                                action={{ ...action, done: states[action.id] ?? action.done }}
                                onToggle={(aid) => toggleAction(ms.id, aid)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Related Actions ─────────────────────────────────────────────────────

function TabActions({ actions }: { actions: RelatedAction[] }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare size={14} className="text-primary" />
          <span className="text-[13px] font-bold text-foreground">関連アクション</span>
          <span className="text-[12px] text-muted-foreground ml-1">（{actions.length}件）</span>
        </div>
        <button className="flex items-center gap-1 text-[12px] text-primary hover:underline">
          <Plus size={12} /> アクションを追加
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Zap size={28} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">関連アクションがまだありません</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actions.map((action) => (
            <div
              key={action.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[13px] text-foreground font-medium leading-snug flex-1">{action.title}</p>
                <ArrowRight size={14} className="text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <ActionStatusBadge status={action.status} />
                {action.hvpAxis && <HvpAxisBadge axis={action.hvpAxis} />}
                <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{action.category}</span>
                <span className="text-sm text-muted-foreground ml-auto">{action.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <button className="w-full text-[12px] text-primary hover:underline flex items-center justify-center gap-1">
          マイアクションで全て見る <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: IssueTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'イシューの概要', icon: FileText },
  { id: 'hypothesis', label: '仮説検証シート', icon: FlaskConical },
  { id: 'milestones', label: 'マイルストーン', icon: Flag },
];


export default function IssuePage() {
  const { currentUserId } = useUser();
  const initialIssues = getIssuesByUser(currentUserId);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [selectedId, setSelectedId] = useState<string>(initialIssues[0].id);
  const [activeTab, setActiveTab] = useState<IssueTab>('overview');
  const selectedIssue = issues.find((i) => i.id === selectedId) ?? issues[0];

  // ユーザー切り替え時にデータをリセットする
  useEffect(() => {
    const newIssues = getIssuesByUser(currentUserId);
    setIssues(newIssues);
    setSelectedId(newIssues[0].id);
    setActiveTab('overview');
  }, [currentUserId]);

  const handleSelectIssue = (id: string) => {
    setSelectedId(id);
    setActiveTab('overview');
  };

  const handleAddHypotheses = useCallback((newRows: HypothesisRow[]) => {
    setIssues(prev => prev.map(issue =>
      issue.id === selectedId
        ? { ...issue, hypotheses: [...issue.hypotheses, ...newRows] }
        : issue
    ));
  }, [selectedId]);

  return (
    <div className="flex h-full overflow-hidden bg-background">

      {/* Left: Issue List */}
      <div className="w-[230px] flex-shrink-0 border-r border-border flex flex-col h-full bg-muted/20">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-primary" />
            <span className="text-[12px] font-semibold text-foreground tracking-wide">マイイシュー</span>
          </div>
          <button className="w-6 h-6 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors border border-primary/20">
            <Plus size={12} className="text-primary" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {issues.map((issue) => {
            const isSelected = selectedId === issue.id;
            const accentColor = issue.status === 'active' ? 'bg-emerald-500' : issue.status === 'paused' ? 'bg-amber-500' : 'bg-blue-500';
            return (
            <button
              key={issue.id}
              onClick={() => handleSelectIssue(issue.id)}
              className={cn(
                'w-full text-left px-3 py-3 rounded-lg transition-all relative overflow-hidden group',
                isSelected
                  ? 'bg-background shadow-sm border border-border'
                  : 'hover:bg-background/60 text-foreground'
              )}
            >
              {/* Left accent */}
              {isSelected && <div className={cn('absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full', accentColor)} />}
              <div className="flex items-start justify-between gap-1 mb-2 pl-1">
                <span className={cn('text-[12.5px] font-semibold leading-snug line-clamp-2', isSelected ? 'text-foreground' : 'text-foreground/80')}>{issue.title}</span>
                <MoreHorizontal size={12} className="text-muted-foreground/40 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center justify-between gap-1 pl-1">
                <StatusBadge status={issue.status} />
                <span className="text-sm text-muted-foreground">{issue.updatedAt}</span>
              </div>
            </button>
          );
          })}
        </div>
      </div>

      {/* Right: Issue Detail with Tabs */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-[17px] font-bold text-foreground leading-tight flex-1">{selectedIssue.title}</h1>
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              <StatusBadge status={selectedIssue.status} />
              <button className="w-7 h-7 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
              <Calendar size={11} />
              <span>{selectedIssue.deadline}</span>
            </div>
            <span className="text-sm text-muted-foreground">更新: {selectedIssue.updatedAt}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-shrink-0 bg-background px-5 py-2.5 border-b border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon size={12} />
                {tab.label}
                {tab.id === 'hypothesis' && selectedIssue.hypotheses.length > 0 && (
                  <span className={cn(
                    'text-sm font-bold px-1.5 py-0.5 rounded-md ml-0.5',
                    isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {selectedIssue.hypotheses.length}
                  </span>
                )}
              </button>
          );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <TabOverview issue={selectedIssue} />}
          {activeTab === 'hypothesis' && <TabHypothesis hypotheses={selectedIssue.hypotheses} onAddHypotheses={handleAddHypotheses} />}
          {activeTab === 'milestones' && <TabMilestones milestones={selectedIssue.milestones} />}
        </div>

      </div>
    </div>
  );
}
