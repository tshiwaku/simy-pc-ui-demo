/**
 * LeaderboardPage — HVP (Human Value Performance) Ranking
 * Design: Unified with app background (bg-background), minimal color usage
 * Color rule: primary accent only for active states; muted/foreground for all else
 *
 * Tabs: 総合 / 問いの質(SQ) / 決断の胆力(CR) / 共感の熱量(HT)
 * Bottom: GitHub-style issue activity heatmap
 */

import { useState, useMemo } from "react";
import {
  Brain,
  Zap,
  Heart,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Users,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RankTab = "overall" | "sq" | "cr" | "ht";
type ActivityType = "issue_created" | "hypothesis_verified" | "milestone_done" | "done_state" | "decision_made" | "none";

interface HvpScore { sq: number; cr: number; ht: number; }

interface HvpEvidence {
  axis: "sq" | "cr" | "ht";
  title: string;
  doneState: string;
  impact: string;
  status: "verified" | "in_progress" | "pending";
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  scores: HvpScore;
  prevScores: HvpScore;
  streak: number;
  evidences: HvpEvidence[];
  isMe?: boolean;
}

interface DayActivity {
  date: string;
  count: number;
  type: ActivityType;
   label?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SIMY_MEMBERS: Member[] = [
  {
    id: "1", name: "白木 哲夫", role: "Product Manager", avatar: "TS", department: "プロダクト",
    scores: { sq: 91, cr: 78, ht: 85 }, prevScores: { sq: 85, cr: 72, ht: 80 },
    streak: 6, isMe: true,
    evidences: [
      { axis: "sq", title: "製造業セグメント特化の仮説検証", doneState: "製造業CPAが他業種の0.7倍と確認。北極星KPIに有意なインパクト確認済み", impact: "パイプライン+¥2.3M", status: "verified" },
      { axis: "cr", title: "オンプレ対応 Go/No-Go 決断", doneState: "対象5社のうち4社が「オンプレ必須」と明言。開発リソースを最優先配分", impact: "フェーズ移行完了", status: "verified" },
      { axis: "ht", title: "キャピタルアセットプラニング 経営層との関係構築", doneState: "CTO・CFOとの信頼関係を構築。次回提案の場を確保", impact: "商談継続確定", status: "in_progress" },
    ],
  },
  {
    id: "2", name: "田中 美咲", role: "Sales Lead", avatar: "TM", department: "セールス",
    scores: { sq: 72, cr: 88, ht: 92 }, prevScores: { sq: 70, cr: 85, ht: 88 },
    streak: 4,
    evidences: [
      { axis: "ht", title: "ソフトバンク 担当役員との合意形成", doneState: "提携条件について担当役員と口頭合意。契約書ドラフト段階へ移行", impact: "契約締結見込み ¥4M", status: "in_progress" },
      { axis: "cr", title: "独占契約 vs 複数社並行の戦略決断", doneState: "複数社並行戦略を採択。パイプライン3社同時進行を開始", impact: "リスク分散・機会最大化", status: "verified" },
      { axis: "sq", title: "パートナー経由売上40%仮説の設計", doneState: "パートナーサクセスAIによる活動量分析でROIシミュレーション完了", impact: "Q3以降 ¥4M パイプライン", status: "pending" },
    ],
  },
  {
    id: "3", name: "鈴木 健一", role: "Engineering Lead", avatar: "SK", department: "エンジニアリング",
    scores: { sq: 80, cr: 82, ht: 68 }, prevScores: { sq: 78, cr: 80, ht: 68 },
    streak: 8,
    evidences: [
      { axis: "cr", title: "6月オンプレ対応完了の技術判断", doneState: "金融機関5社（見込額¥3M）の成約条件を満たすロードマップを確定", impact: "開発完了期限確定", status: "in_progress" },
      { axis: "sq", title: "アップセル予兆検知モデルの設計", doneState: "予兆検知精度85%を達成。特定アクション後の提案タイミングを特定", impact: "LTV +30% 見込み", status: "verified" },
    ],
  },
  {
    id: "4", name: "山本 花子", role: "Customer Success", avatar: "YH", department: "CS",
    scores: { sq: 65, cr: 70, ht: 88 }, prevScores: { sq: 62, cr: 68, ht: 84 },
    streak: 3,
    evidences: [
      { axis: "ht", title: "トランスコスモス 現場担当者の不安払拭", doneState: "AI導入に懸念を持つ現場担当者5名との個別面談を実施。全員が導入推進派に転換", impact: "組織エンゲージメント向上", status: "verified" },
    ],
  },
  {
    id: "5", name: "伊藤 大輔", role: "Marketing", avatar: "ID", department: "マーケティング",
    scores: { sq: 75, cr: 58, ht: 72 }, prevScores: { sq: 72, cr: 60, ht: 70 },
    streak: 2,
    evidences: [
      { axis: "sq", title: "製造業特化コンテンツ戦略の仮説", doneState: "製造業向けケーススタディ3本公開。リード獲得単価が他業種比40%低下", impact: "MQL +35%", status: "in_progress" },
    ],
  },
];

const YOSHI_MEMBERS: Member[] = [
  {
    id: "y1", name: "Yoshi Tamura", role: "Principal Product Manager", avatar: "YT", department: "Product",
    scores: { sq: 88, cr: 82, ht: 76 }, prevScores: { sq: 83, cr: 78, ht: 72 },
    streak: 5, isMe: true,
    evidences: [
      { axis: "sq", title: "CKS Adoption bottleneck hypothesis", doneState: "Identified Setup Wizard drop-off at step 3 as #1 adoption blocker. Validated with 142 session recordings", impact: "Adoption +8pt projected", status: "verified" },
      { axis: "cr", title: "Migration CLI GA date decision", doneState: "Decided Apr 22 GA with 1-week buffer. Aligned Eng, Design, and Infra leads", impact: "On-time delivery confirmed", status: "in_progress" },
      { axis: "ht", title: "Mistral AI QBR relationship", doneState: "Built trust with Mistral AI VP Eng. Secured expansion conversation for Q3", impact: "ARR expansion +$2M pipeline", status: "in_progress" },
    ],
  },
  {
    id: "y2", name: "Priya Nair", role: "Senior Software Engineer", avatar: "PN", department: "Engineering",
    scores: { sq: 82, cr: 75, ht: 70 }, prevScores: { sq: 78, cr: 72, ht: 68 },
    streak: 7,
    evidences: [
      { axis: "sq", title: "Cost Forecast accuracy hypothesis", doneState: "Validated that GPU cost forecast error <5% is achievable. Shipped to 3 beta customers", impact: "Churn risk -2 accounts", status: "verified" },
      { axis: "cr", title: "vLLM vs Triton backend decision", doneState: "Chose Triton for inference backend. Performance 23% better in p99 latency benchmarks", impact: "SLA compliance secured", status: "verified" },
    ],
  },
  {
    id: "y3", name: "Marcus Chen", role: "Product Designer", avatar: "MC", department: "Design",
    scores: { sq: 74, cr: 68, ht: 85 }, prevScores: { sq: 70, cr: 65, ht: 82 },
    streak: 4,
    evidences: [
      { axis: "ht", title: "CKS onboarding UX co-design with customers", doneState: "Ran 8 co-design sessions with enterprise customers. Redesigned Setup Wizard with 40% fewer steps", impact: "Onboarding NPS +12pt", status: "in_progress" },
    ],
  },
  {
    id: "y4", name: "Sarah Kim", role: "Technical Program Manager", avatar: "SK", department: "TPM",
    scores: { sq: 70, cr: 79, ht: 72 }, prevScores: { sq: 67, cr: 75, ht: 70 },
    streak: 3,
    evidences: [
      { axis: "cr", title: "Q2 roadmap scope cut decision", doneState: "Cut 3 features from Q2 scope to protect Migration CLI GA. Aligned 6 stakeholders in 1 meeting", impact: "On-time delivery risk eliminated", status: "verified" },
    ],
  },
  {
    id: "y5", name: "Alex Rivera", role: "Solutions Engineer", avatar: "AR", department: "Sales",
    scores: { sq: 68, cr: 62, ht: 80 }, prevScores: { sq: 65, cr: 60, ht: 76 },
    streak: 2,
    evidences: [
      { axis: "ht", title: "OpenAI enterprise account trust building", doneState: "Resolved GPU quota escalation for OpenAI. Converted complaint into expansion opportunity", impact: "Account retention secured", status: "verified" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function overallScore(s: HvpScore): number {
  return Math.round(s.sq * 0.35 + s.cr * 0.35 + s.ht * 0.30);
}
function getScore(m: Member, tab: RankTab): number {
  return tab === "overall" ? overallScore(m.scores) : m.scores[tab];
}
function getPrevScore(m: Member, tab: RankTab): number {
  return tab === "overall" ? overallScore(m.prevScores) : m.prevScores[tab];
}

// ─── Heatmap Data ─────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ActivityType, string> = {
  issue_created: "イシュー作成", hypothesis_verified: "仮説検証完了",
  milestone_done: "マイルストーン達成", done_state: "Done State到達",
  decision_made: "意思決定（Go/No-Go）", none: "",
};

function generateHeatmapData(): DayActivity[] {
  const data: DayActivity[] = [];
  const today = new Date();
  const types: ActivityType[] = ["issue_created", "hypothesis_verified", "milestone_done", "done_state", "decision_made"];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const rand = Math.random();
    let count = 0; let type: ActivityType = "none";
    if (rand > 0.52) { count = Math.floor(Math.random() * 4) + 1; type = types[Math.floor(Math.random() * types.length)]; }
    if (i < 21 && Math.random() > 0.35) { count = Math.max(count, Math.floor(Math.random() * 5) + 1); type = types[Math.floor(Math.random() * types.length)]; }
    data.push({ date: dateStr, count, type, label: count > 0 ? TYPE_LABELS[type] : undefined });
  }
  return data;
}
const HEATMAP_DATA = generateHeatmapData();

// ─── Axis Config (simplified: 2 accent colors max) ────────────────────────────
// SQ → primary (indigo), CR → muted-foreground, HT → muted-foreground
// Active tab gets primary highlight; inactive stays neutral

const AXIS_CONFIG = {
  sq: {
    label: "Insight Quality", sublabel: "Strategic Questioning", icon: Brain,
    description: "Did you frame the right question that moves the needle on your North Star KPI — driving non-linear growth, not incremental improvement?",
    doneState: "The hypothesis has been validated and a measurable impact on the North Star metric is confirmed.",
  },
  cr: {
    label: "Bold Decisions", sublabel: "Critical Responsibility", icon: Zap,
    description: "In the zone where AI freezes — incomplete data, high risk — did you commit to a clear Go/No-Go and move the team forward?",
    doneState: "A decision was made and the previously stalled project has physically moved to the next phase.",
  },
  ht: {
    label: "Human Connection", sublabel: "Human-Centric High-Touch", icon: Heart,
    description: "Did you ignite trust and build relationships that no algorithm can replicate — winning hearts, not just arguments?",
    doneState: "A deal closed, a partnership agreed, or organizational engagement measurably improved — a human handshake achieved.",
  },
};

const STATUS_CONFIG = {
  verified: { label: "Done State 達成", icon: CheckCircle2 },
  in_progress: { label: "検証中", icon: Clock },
  pending: { label: "未着手", icon: Target },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreDelta({ cur, prev }: { cur: number; prev: number }) {
  const d = cur - prev;
  if (d > 0) return <span className="flex items-center gap-0.5 text-primary text-sm font-medium"><TrendingUp size={11} />+{d}pt</span>;
  if (d < 0) return <span className="flex items-center gap-0.5 text-destructive text-sm font-medium"><TrendingDown size={11} />{d}pt</span>;
  return <span className="text-muted-foreground text-sm"><Minus size={11} /></span>;
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-mono font-semibold w-7 text-right text-foreground">{value}</span>
    </div>
  );
}

function MemberCard({ member, rank, score, prevScore, activeTab }: {
  member: Member; rank: number; score: number; prevScore: number; activeTab: RankTab;
}) {
  const [expanded, setExpanded] = useState(false);
  const medals = ["🥇", "🥈", "🥉"];
  const filteredEvidences = activeTab === "overall" ? member.evidences : member.evidences.filter(e => e.axis === activeTab);

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card transition-all duration-200 overflow-hidden",
      member.isMe && "ring-1 ring-primary/50",
    )}>
      <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => setExpanded(!expanded)}>
        {/* Rank */}
        <div className="w-8 flex-shrink-0 text-center">
          {rank <= 3
            ? <span className="text-xl">{medals[rank - 1]}</span>
            : <span className="text-sm font-bold text-muted-foreground">{rank}</span>}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
          {member.avatar}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{member.name}</span>
            {member.isMe && <span className="text-sm font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 flex-shrink-0">あなた</span>}
          </div>
          <div className="text-sm text-muted-foreground truncate">{member.role} · {member.department}</div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className="text-xl font-black text-foreground">{score}</span>
          <ScoreDelta cur={score} prev={prevScore} />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 flex-shrink-0 w-12">
          <Flame size={13} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{member.streak}w</span>
        </div>

        {expanded ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border">
          {/* Score bars */}
          <div className="grid grid-cols-3 gap-3 my-3">
            {(["sq", "cr", "ht"] as const).map((axis) => {
              const cfg = AXIS_CONFIG[axis];
              const Icon = cfg.icon;
              return (
                <div key={axis} className={cn("rounded-lg p-3 border border-border bg-muted/30", activeTab === axis && "border-primary/40 bg-primary/5")}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} className="text-muted-foreground" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{axis.toUpperCase()}</span>
                  </div>
                  <ScoreBar value={member.scores[axis]} />
                </div>
              );
            })}
          </div>

          {/* Evidences */}
          {filteredEvidences.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Done State エビデンス</p>
              {filteredEvidences.map((ev, i) => {
                const axisCfg = AXIS_CONFIG[ev.axis];
                const statusCfg = STATUS_CONFIG[ev.status];
                const StatusIcon = statusCfg.icon;
                const AxisIcon = axisCfg.icon;
                return (
                  <div key={i} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <AxisIcon size={12} className="text-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground flex-shrink-0">
                        <StatusIcon size={10} />
                        {statusCfg.label}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">{ev.doneState}</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={11} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">{ev.impact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HVP Definition Panel ─────────────────────────────────────────────────────

function HvpDefinitionPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-card hover:bg-accent/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Info size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">HVP（Human Value Performance）とは</span>
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-muted/20 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border">
          {(["sq", "cr", "ht"] as const).map((axis) => {
            const cfg = AXIS_CONFIG[axis];
            const Icon = cfg.icon;
            return (
              <div key={axis} className="rounded-lg p-4 border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={15} className="text-muted-foreground" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{axis.toUpperCase()}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{cfg.label}</p>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{cfg.description}</p>
                <div className="border-t border-border pt-2.5">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Done State</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{cfg.doneState}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

// Single accent color (primary) with varying opacity for all activity types
// Differentiate by intensity only — simpler and cleaner

function ActivityHeatmap({ members }: { members: Member[] }) {
  const [tooltip, setTooltip] = useState<{ day: DayActivity; x: number; y: number } | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("1");

  const weeks = useMemo(() => {
    const grid: DayActivity[][] = [];
    let week: DayActivity[] = [];
    const firstDay = new Date(HEATMAP_DATA[0].date);
    const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let p = 0; p < startPad; p++) week.push({ date: "", count: 0, type: "none" });
    HEATMAP_DATA.forEach((day) => {
      week.push(day);
      if (week.length === 7) { grid.push(week); week = []; }
    });
    if (week.length > 0) {
      while (week.length < 7) week.push({ date: "", count: 0, type: "none" });
      grid.push(week);
    }
    return grid;
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const first = week.find((d) => d.date);
      if (!first) return;
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) { labels.push({ label: `${m + 1}月`, col: wi }); lastMonth = m; }
    });
    return labels;
  }, [weeks]);

  const currentMember = members.find((m) => m.id === selectedMember) ?? members[0];

  // Intensity classes using primary color
  const intensityClass = ["opacity-0", "opacity-20", "opacity-40", "opacity-65", "opacity-100"];

  return (
    <div className="border border-border rounded-xl bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className="text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">イシュー取り組みアクティビティ</span>
          <span className="text-sm text-muted-foreground">過去1年間</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">メンバー：</span>
          <div className="flex gap-1.5">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m.id)}
                title={m.name}
                className={cn(
                  "w-8 h-8 rounded-full bg-muted border text-sm font-bold text-foreground transition-all",
                  selectedMember === m.id ? "border-primary ring-1 ring-primary/40 scale-110" : "border-border opacity-60 hover:opacity-90"
                )}
              >
                {m.avatar}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member stats */}
      <div className="flex items-center gap-4 mb-5 px-4 py-2.5 bg-muted/30 border border-border rounded-lg">
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground">
          {currentMember.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{currentMember.name}</div>
          <div className="text-sm text-muted-foreground">{currentMember.role}</div>
        </div>
        <div className="flex items-center gap-4 ml-auto text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">Done State</span>
            <strong className="text-foreground ml-1">{currentMember.evidences.filter(e => e.status === "verified").length}件</strong>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">イシュー</span>
            <strong className="text-foreground ml-1">{currentMember.evidences.length}件</strong>
          </div>
          <div className="flex items-center gap-1">
            <Flame size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground">ストリーク</span>
            <strong className="text-foreground ml-1">{currentMember.streak}週</strong>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="flex ml-8 mb-1">
          {weeks.map((_, wi) => {
            const lbl = monthLabels.find((l) => l.col === wi);
            return (
              <div key={wi} className="w-[14px] flex-shrink-0">
                {lbl && <span className="text-sm text-muted-foreground whitespace-nowrap">{lbl.label}</span>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 mr-1 mt-0.5">
            {["月", "", "水", "", "金", "", ""].map((d, i) => (
              <div key={i} className="h-[14px] w-6 flex items-center justify-end">
                {d && <span className="text-sm text-muted-foreground">{d}</span>}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                if (!day.date) return <div key={di} className="w-[14px] h-[14px]" />;
                const idx = Math.min(day.count, 4);
                return (
                  <div
                    key={di}
                    className={cn(
                      "w-[14px] h-[14px] rounded-[2px] cursor-pointer transition-transform hover:scale-125 bg-primary",
                      day.count === 0 ? "bg-muted opacity-100" : intensityClass[idx],
                    )}
                    onMouseEnter={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ day, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {tooltip && tooltip.day.count > 0 && (
          <div
            className="fixed z-50 pointer-events-none bg-popover border border-border rounded-lg px-3 py-2 shadow-xl text-sm"
            style={{ left: tooltip.x + 18, top: tooltip.y - 8 }}
          >
            <div className="font-semibold text-foreground mb-0.5">{tooltip.day.date}</div>
            <div className="text-muted-foreground">{tooltip.day.label}</div>
            <div className="text-foreground font-medium">{tooltip.day.count}件のアクティビティ</div>
          </div>
        )}
      </div>

      {/* Legend: intensity only */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm text-muted-foreground">少ない</span>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn("w-3 h-3 rounded-[2px] bg-primary", intensityClass[i])} />
        ))}
        <span className="text-sm text-muted-foreground">多い</span>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { id: RankTab; label: string; icon: React.ElementType }[] = [
  { id: "overall", label: "Overall", icon: Trophy },
  { id: "sq", label: "Insight Quality", icon: Brain },
  { id: "cr", label: "Bold Decisions", icon: Zap },
  { id: "ht", label: "Human Connection", icon: Heart },
];

const TAB_DESC: Record<RankTab, string> = {
  overall: "Weighted average: Insight Quality × 0.35 + Bold Decisions × 0.35 + Human Connection × 0.30. Calculated by Done State achievement across all three axes.",
  sq: "Ranks members by their ability to frame the right strategic questions that drive non-linear growth — not just incremental improvement.",
  cr: "Ranks members by their willingness to make clear Go/No-Go calls in high-uncertainty situations where AI cannot decide.",
  ht: "Ranks members by their ability to build trust, win hearts, and forge partnerships that no algorithm can replicate.",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const MEMBERS = SIMY_MEMBERS;
  const [activeTab, setActiveTab] = useState<RankTab>("overall");

  const ranked = useMemo(() => {
    return [...MEMBERS]
      .map((m) => ({ member: m, score: getScore(m, activeTab), prevScore: getPrevScore(m, activeTab) }))
      .sort((a, b) => b.score - a.score);
  }, [activeTab]);

  const top3 = ranked.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={18} className="text-foreground" />
            <h1 className="text-xl font-black text-foreground">HVP Ranking</h1>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In an AI-first world, human value is measured by three axes.<br />
            <strong className="text-foreground">Insight Quality</strong> · <strong className="text-foreground">Bold Decisions</strong> · <strong className="text-foreground">Human Connection</strong> — scored by Done State achievement.
          </p>
        </div>

        {/* HVP Definition */}
        <HvpDefinitionPanel />

        {/* Tabs */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
                  isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed px-1">{TAB_DESC[activeTab]}</p>

        {/* Podium */}
        <div className="flex items-end justify-center gap-3 h-44">
          {top3[1] && (
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-center">
                <p className="text-sm text-muted-foreground truncate">{top3[1].member.name}</p>
                <p className="text-lg font-black text-foreground">{top3[1].score}</p>
              </div>
              <div className="w-full bg-muted border border-border rounded-t-lg flex items-center justify-center" style={{ height: "72px" }}>
                <span className="text-2xl">🥈</span>
              </div>
            </div>
          )}
          {top3[0] && (
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-center">
                <p className="text-sm text-muted-foreground truncate">{top3[0].member.name}</p>
                <p className="text-xl font-black text-foreground">{top3[0].score}</p>
              </div>
              <div className="w-full bg-primary/10 border border-primary/30 rounded-t-lg flex items-center justify-center" style={{ height: "108px" }}>
                <span className="text-3xl">🥇</span>
              </div>
            </div>
          )}
          {top3[2] && (
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="text-center">
                <p className="text-sm text-muted-foreground truncate">{top3[2].member.name}</p>
                <p className="text-lg font-black text-foreground">{top3[2].score}</p>
              </div>
              <div className="w-full bg-muted border border-border rounded-t-lg flex items-center justify-center" style={{ height: "56px" }}>
                <span className="text-2xl">🥉</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "参加メンバー", value: `${MEMBERS.length}名`, sub: "全チーム", icon: Users },
            { label: "Done State 達成", value: `${MEMBERS.reduce((s, m) => s + m.evidences.filter(e => e.status === "verified").length, 0)}件`, sub: "今月累計", icon: CheckCircle2 },
            { label: "最長ストリーク", value: `${Math.max(...MEMBERS.map(m => m.streak))}週`, sub: MEMBERS.find(m => m.streak === Math.max(...MEMBERS.map(x => x.streak)))?.name ?? '', icon: Flame },          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={13} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-xl font-black text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Ranking list */}
        <div className="flex flex-col gap-2.5">
          {ranked.map(({ member, score, prevScore }, i) => (
            <MemberCard key={member.id} member={member} rank={i + 1} score={score} prevScore={prevScore} activeTab={activeTab} />
          ))}
        </div>

        {/* Score formula */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">スコア算出方法</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["sq", "cr", "ht"] as const).map((axis) => {
              const cfg = AXIS_CONFIG[axis];
              const Icon = cfg.icon;
              return (
                <div key={axis} className="flex items-start gap-2.5">
                  <Icon size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">Done State達成数 × インパクト係数 × 検証速度</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-3">総合スコア = SQ × 0.35 + CR × 0.35 + HT × 0.30</p>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap members={MEMBERS} />

      </div>
    </div>
  );
}
