/**
 * StrategyDashboardPage — 戦略ダッシュボード
 * 視点: 「今、どこにいるか？（Where we are）」
 * 事業執行計画書 2026年4月〜12月 に基づく
 * 目標: 9ヶ月で$10M USD 売上達成
 *
 * Design: Dark-slate professional dashboard, left-anchored layout
 * Color: Slate-900 bg, amber accent for revenue, emerald for on-track, rose for risk
 */

import { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock,
  ChevronRight, ChevronLeft, BarChart3, Shield,
} from 'lucide-react';
import { DOMAINS, PHASES, PIPELINE, RISKS, type StrategicDomain, type DomainStatus } from '@/lib/strategyData';
import { NARA_DOMAINS, NARA_PHASES, NARA_PIPELINE, NARA_RISKS } from '@/lib/strategyDataNara';
import { YOSHI_DOMAINS, YOSHI_PHASES, YOSHI_PIPELINE, YOSHI_RISKS } from '@/lib/strategyDataYoshi';
import { useUser } from '@/contexts/UserContext';

// ─── Helpers ─────────────────────────────────────────────────────────────

const statusBg: Record<DomainStatus, string> = {
  'on-track':   'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  'at-risk':    'bg-amber-500/15 border-amber-500/30 text-amber-400',
  'behind':     'bg-rose-500/15 border-rose-500/30 text-rose-400',
  'not-started':'bg-slate-500/15 border-slate-500/30 text-slate-400',
  'completed':  'bg-sky-500/15 border-sky-500/30 text-sky-400',
};
const statusLabel: Record<DomainStatus, string> = {
  'on-track': '順調', 'at-risk': 'リスクあり', 'behind': '遅延',
  'not-started': '未着手', 'completed': '完了',
};
const impactLabel: Record<string, string> = { critical: '最大', high: '大', medium: '中', low: '低' };
const urgencyLabel: Record<string, string> = { critical: '最高', high: '高', medium: '中', low: '低' };
const impactColor: Record<string, string> = {
  critical: 'text-rose-400', high: 'text-amber-400', medium: 'text-sky-400', low: 'text-slate-400',
};

function Bar({ value, color = 'bg-amber-400', thin = false }: { value: number; color?: string; thin?: boolean }) {
  return (
    <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${thin ? 'h-1' : 'h-2'}`}>
      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function Badge({ status }: { status: DomainStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium border ${statusBg[status]}`}>
      {(status === 'on-track' || status === 'completed') && <CheckCircle2 className="w-3 h-3" />}
      {(status === 'at-risk' || status === 'behind') && <AlertTriangle className="w-3 h-3" />}
      {status === 'not-started' && <Clock className="w-3 h-3" />}
      {statusLabel[status]}
    </span>
  );
}

// ─── L0: 全社概要 ────────────────────────────────────────────────────────

function L0Overview({ onSelectDomain, domains, phases, pipeline, risks, isNara, isYoshi }: { onSelectDomain: (d: StrategicDomain) => void; domains: typeof DOMAINS; phases: typeof PHASES; pipeline: typeof PIPELINE; risks: typeof RISKS; isNara: boolean; isYoshi: boolean }) {
  const revProgress = isNara ? 68 : isYoshi ? Math.round((45 / 165) * 100) : Math.round((130000 / 10000000) * 100);
  const atRisk = domains.filter(d => d.status === 'at-risk' || d.status === 'behind');
  const onTrack = domains.filter(d => d.status === 'on-track');

  return (
    <div className="space-y-6">
      {/* サマリー */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">{isNara ? '経営目標達成率' : isYoshi ? 'ARR Progress' : '売上達成率'}</p>
          <p className="text-2xl font-bold text-amber-400">{revProgress}%</p>
          <p className="text-sm text-slate-500 mt-1">{isNara ? '経常収支比率 97.1% / 100%' : isYoshi ? '$45M / $165M ARR' : '$130K / $10M'}</p>
          <Bar value={revProgress} />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">現在フェーズ</p>
          <p className="text-lg font-bold text-slate-100">Phase 1</p>
          <p className="text-sm text-amber-400 mt-1">{isNara ? '基盤整備（R7）' : isYoshi ? 'Phase 2: Acceleration' : '種まき期（4～6月）'}</p>
          <p className="text-sm text-slate-500">{isNara ? '経常収支比率 98%目標' : isYoshi ? 'Target $60M ARR' : '目標 $1.0M'}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">要対応ドメイン</p>
          <p className="text-2xl font-bold text-rose-400">{atRisk.length}</p>
          <p className="text-sm text-slate-500 mt-1">リスク・遅延あり</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {atRisk.slice(0, 2).map(d => (
              <span key={d.id} className="text-sm bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">{d.labelJa}</span>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">順調ドメイン</p>
          <p className="text-2xl font-bold text-emerald-400">{onTrack.length}</p>
          <p className="text-sm text-slate-500 mt-1">/ {domains.length} ドメイン</p>
          <Bar value={(onTrack.length / domains.length) * 100} color="bg-emerald-500" />
        </div>
      </div>

      {/* リスクアラート */}
      {atRisk.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-300">要対応：リスク・遅延ドメイン</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {atRisk.map(d => (
              <button key={d.id} onClick={() => onSelectDomain(d)}
                className="flex items-start gap-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-lg p-3 text-left transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.color + '22' }}>
                  <d.icon className="w-4 h-4" style={{ color: d.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{d.labelJa}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{d.progress}% 完了</p>
                  <Bar value={d.progress} color="bg-rose-400" thin />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8ドメイン */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">8つの戦略ドメイン（MECE分解）</h3>
          <span className="text-sm text-slate-500">クリックで詳細を表示</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {domains.map(d => (
            <button key={d.id} onClick={() => onSelectDomain(d)}
              className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl p-4 text-left transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color + '22' }}>
                  <d.icon className="w-4 h-4" style={{ color: d.color }} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge status={d.status} />
                  {d.weeklyDelta !== 0 && (
                    <span className={`text-sm ${d.weeklyDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {d.weeklyDelta > 0 ? '+' : ''}{d.weeklyDelta}% 週次
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-200 mb-1 leading-tight">{d.labelJa}</p>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm text-slate-400">優先度: <span className={`font-medium ${impactColor[d.impact]}`}>{impactLabel[d.impact]}</span></span>
                <span className="text-sm text-slate-400">緊急度: <span className={`font-medium ${impactColor[d.urgency]}`}>{urgencyLabel[d.urgency]}</span></span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">進捗</span>
                <span className="text-sm font-bold" style={{ color: d.color }}>{d.progress}%</span>
              </div>
              <Bar value={d.progress} color="bg-slate-400" thin />
              <div className="mt-2 flex items-center gap-1 text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                <span>詳細を見る</span><ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* フェーズ */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">3フェーズ 売上ロードマップ</h3>
        <div className="grid grid-cols-3 gap-4">
          {phases.map(ph => (
            <div key={ph.phase} className={`bg-slate-800 border rounded-xl p-4 ${ph.phase === 1 ? 'border-amber-500/40' : 'border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${ph.phase === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                  {ph.phase === 1 ? '▶ 実行中' : ph.phase === 2 ? '次フェーズ' : '最終フェーズ'}
                </span>
                <Badge status={ph.status} />
              </div>
              <p className="text-sm font-bold text-slate-200">{ph.labelJa}</p>
              <p className="text-sm text-slate-400 mb-3">{ph.periodJa}</p>
              <div className="flex items-end justify-between mb-1">
                <span className="text-sm text-slate-400">売上目標</span>
                <span className="text-lg font-bold text-amber-400">{ph.revenueTarget}</span>
              </div>
              <Bar value={ph.revenueProgress} />
              <p className="text-sm text-slate-500 mt-1 text-right">{ph.revenueActual} 達成済み</p>
              <div className="mt-3 space-y-1">
                {ph.milestones.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${m.done ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                    <span className={`text-sm ${m.done ? 'text-slate-300 line-through' : 'text-slate-400'}`}>{m.titleJa}</span>
                  </div>
                ))}
                {ph.milestones.length > 3 && (
                  <p className="text-sm text-slate-500 pl-5">+{ph.milestones.length - 3}件のマイルストーン</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* パイプライン + リスク */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">{isNara ? '重点施策パイプライン' : isYoshi ? 'Enterprise Pipeline' : 'パイプライン（10社 $10M）'}</h3>
          <div className="space-y-2">
            {pipeline.slice(0, 5).map(p => (
              <div key={p.rank} className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-4">{p.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{p.company}</p>
                  <p className="text-sm text-slate-500">{p.targetDate} | {p.planJa}</p>
                </div>
                <span className="text-sm font-bold text-amber-400 flex-shrink-0">{p.amount}</span>
                <span className={`text-sm px-1.5 py-0.5 rounded flex-shrink-0 ${
                  p.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                  p.status === 'contracted' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{p.statusJa}</span>
              </div>
            ))}
            {!isNara && !isYoshi && <p className="text-sm text-slate-500 text-center pt-1">+5社（パートナー経由・直販）</p>}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">主要リスク（R1〜R5）</h3>
          <div className="space-y-2">
            {risks.map(r => (
              <div key={r.id} className="flex items-start gap-2 p-2 bg-slate-700/40 rounded-lg">
                <span className={`text-sm font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  r.impact === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>{r.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">{r.labelJa}</p>
                  <p className="text-sm text-slate-500 mt-0.5">対策: {r.mitigationJa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── L1: ドメイン詳細 ────────────────────────────────────────────────────

function L1DomainDetail({ domain, onBack }: { domain: StrategicDomain; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: domain.color + '22' }}>
          <domain.icon className="w-6 h-6" style={{ color: domain.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-100">{domain.labelJa}</h2>
            <Badge status={domain.status} />
          </div>
          <p className="text-sm text-slate-400">{domain.descriptionJa}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-slate-500">優先度: <span className={`font-medium ${impactColor[domain.impact]}`}>{impactLabel[domain.impact]}</span></span>
            <span className="text-sm text-slate-500">緊急度: <span className={`font-medium ${impactColor[domain.urgency]}`}>{urgencyLabel[domain.urgency]}</span></span>
            <span className="text-sm text-slate-500">週次変化: <span className={`font-medium ${domain.weeklyDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{domain.weeklyDelta >= 0 ? '+' : ''}{domain.weeklyDelta}%</span></span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: domain.color }}>{domain.progress}%</p>
          <p className="text-sm text-slate-400">全体進捗</p>
        </div>
      </div>

      <Bar value={domain.progress} />

      {/* KR */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">主要指標（Key Results）</h3>
        <div className="space-y-3">
          {domain.keyResults.map((kr, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-slate-200">{kr.titleJa}</p>
                <Badge status={kr.status} />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-slate-400">現在: <span className="text-slate-200 font-medium">{kr.current}</span></span>
                <span className="text-sm text-slate-400">目標: <span className="text-slate-200 font-medium">{kr.target}</span></span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  kr.phase === 1 ? 'bg-amber-500/20 text-amber-400' :
                  kr.phase === 2 ? 'bg-sky-500/20 text-sky-400' : 'bg-violet-500/20 text-violet-400'
                }`}>Phase {kr.phase}</span>
              </div>
              <div className="flex items-center gap-3">
                <Bar value={kr.progress} color={kr.status === 'on-track' ? 'bg-emerald-500' : kr.status === 'at-risk' ? 'bg-amber-400' : 'bg-rose-400'} />
                <span className="text-sm font-bold text-slate-300 w-10 text-right">{kr.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 施策 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">施策（Initiatives）</h3>
        <div className="space-y-3">
          {domain.initiatives.map(init => (
            <div key={init.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{init.titleJa}</p>
                  <p className="text-sm text-slate-400 mt-0.5">担当: {init.ownerJa} | 期限: {init.dueDate}</p>
                </div>
                <Badge status={init.status} />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Bar value={init.progress} color={init.status === 'on-track' ? 'bg-emerald-500' : init.status === 'at-risk' ? 'bg-amber-400' : 'bg-slate-500'} />
                <span className="text-sm font-bold text-slate-300 w-10 text-right">{init.progress}%</span>
              </div>
              <div className="flex items-center gap-6 bg-slate-700/40 rounded-lg px-4 py-2">
                <span className="text-sm text-slate-400 mr-2">進捗ベロシティ</span>
                {[
                  { label: '3M前', val: init.velocity.threeMonths },
                  { label: '1M前', val: init.velocity.oneMonth },
                  { label: '2W前', val: init.velocity.twoWeeks },
                  { label: '1W前', val: init.velocity.oneWeek },
                ].map(v => (
                  <div key={v.label} className="text-center">
                    <p className={`text-sm font-bold ${v.val > 0 ? 'text-emerald-400' : v.val < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {v.val > 0 ? '+' : ''}{v.val}%
                    </p>
                    <p className="text-sm text-slate-500">{v.label}</p>
                  </div>
                ))}
              </div>
              {init.blockers && init.blockers.length > 0 && (
                <div className="mt-2 flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-1.5">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span className="text-sm text-rose-300">{init.blockersJa?.join(', ')}</span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-slate-700">
                <p className="text-sm text-slate-500">Done State: <span className="text-slate-400">{init.doneStateJa}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* リスク */}
      {domain.risks && domain.risks.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> このドメインのリスク
          </h3>
          <div className="space-y-2">
            {domain.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/60 rounded-lg p-3">
                <span className={`text-sm font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  r.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>{r.severity === 'high' ? '高' : '中'}</span>
                <div>
                  <p className="text-sm text-slate-300">{r.labelJa}</p>
                  <p className="text-sm text-slate-500 mt-0.5">対策: {r.mitigationJa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function StrategyDashboardPage({ onNavigateToLeaderboard }: { onNavigateToLeaderboard?: () => void }) {
  const { currentUserId } = useUser();
  const isNara = currentUserId === 'masato';
  const isYoshi = currentUserId === 'yoshi';
  const activeDomains = isNara ? NARA_DOMAINS : isYoshi ? YOSHI_DOMAINS : DOMAINS;
  const activePhases = isNara ? NARA_PHASES : isYoshi ? YOSHI_PHASES : PHASES;
  const activePipeline = isNara ? NARA_PIPELINE : isYoshi ? YOSHI_PIPELINE : PIPELINE;
  const activeRisks = isNara ? NARA_RISKS : isYoshi ? YOSHI_RISKS : RISKS;
  const [level, setLevel] = useState<'l0' | 'l1'>('l0');
  const [selectedDomain, setSelectedDomain] = useState<StrategicDomain | null>(null);

  const handleSelectDomain = (d: StrategicDomain) => { setSelectedDomain(d); setLevel('l1'); };
  const handleBack = () => { setLevel('l0'); setSelectedDomain(null); };

  const breadcrumbs = [
    { label: '全社概要', onClick: handleBack },
    ...(selectedDomain ? [{ label: selectedDomain.labelJa, onClick: () => {} }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  <button onClick={b.onClick}
                    className={`hover:text-slate-300 transition-colors ${i === breadcrumbs.length - 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                    {b.label}
                  </button>
                </span>
              ))}
            </div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              戦略ダッシュボード
              <span className="text-sm font-normal text-slate-400 ml-1">{isNara ? '— 第4期中期計画の進捗' : isYoshi ? '— CoreWeave Product Strategy FY2026' : '— 今、どこにいるか？'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-400">{isNara ? '経営目標' : isYoshi ? 'ARR Target' : '売上目標'}</p>
              <p className="text-sm font-bold text-amber-400">{isNara ? '経常収支比率 100%以上' : isYoshi ? '$165M ARR by Dec 2026' : '$10M USD / 9ヶ月'}</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-right">
              <p className="text-sm text-slate-400">対象期間</p>
              <p className="text-sm font-semibold text-slate-300">{isNara ? 'R7～R12（2025～2031年）' : isYoshi ? '2026 Q1–Q4' : '2026年4月～12月'}</p>
            </div>
            {level !== 'l0' && (
              <button onClick={handleBack}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
                <ChevronLeft className="w-4 h-4" />戻る
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        {level === 'l0' && <L0Overview onSelectDomain={handleSelectDomain} domains={activeDomains} phases={activePhases} pipeline={activePipeline} risks={activeRisks} isNara={isNara} isYoshi={isYoshi} />}
        {level === 'l1' && selectedDomain && <L1DomainDetail domain={selectedDomain} onBack={handleBack} />}
      </div>
    </div>
  );
}
