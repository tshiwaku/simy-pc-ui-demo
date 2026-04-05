/**
 * StrategyExecutionPage — 戦略実行マネジメント
 * 視点: 「どうやって進めているか？ 遅れをどう取り戻すか？（How we move）」
 * 事業執行計画書 2026年4月〜12月 に基づく
 *
 * Design: Dark-slate professional dashboard
 * Color: Slate-900 bg, amber accent, emerald on-track, rose risk
 */

import { useState } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, XCircle, Circle,
  ChevronRight, TrendingUp, TrendingDown, Minus,
  Activity, Flag, Calendar, Target, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { DOMAINS, PHASES, PIPELINE, KPIS, type DomainStatus } from '@/lib/strategyData';
import { NARA_DOMAINS, NARA_PHASES, NARA_PIPELINE, NARA_KPIS } from '@/lib/strategyDataNara';
import { YOSHI_DOMAINS, YOSHI_PHASES, YOSHI_PIPELINE, YOSHI_KPIS } from '@/lib/strategyDataYoshi';
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

function VelocityCell({ val }: { val: number }) {
  return (
    <span className={`text-sm font-bold ${val > 0 ? 'text-emerald-400' : val < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
      {val > 0 ? '+' : ''}{val}%
    </span>
  );
}

// ─── Tab: 施策進捗 ────────────────────────────────────────────────────────

function InitiativesTab({ domains }: { domains: typeof DOMAINS }) {
  const [filterPhase, setFilterPhase] = useState<0 | 1 | 2 | 3>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | DomainStatus>('all');

  // Flatten all initiatives from all domains
  const allInitiatives = domains.flatMap(d =>
    d.initiatives.map(init => ({ ...init, domainId: d.id, domainLabelJa: d.labelJa, domainColor: d.color, domainIcon: d.icon }))
  );

  const filtered = allInitiatives.filter(init => {
    if (filterPhase !== 0 && init.phase !== filterPhase) return false;
    if (filterStatus !== 'all' && init.status !== filterStatus) return false;
    return true;
  });

  const onTrack = allInitiatives.filter(i => i.status === 'on-track' || i.status === 'completed').length;
  const atRisk = allInitiatives.filter(i => i.status === 'at-risk').length;
  const behind = allInitiatives.filter(i => i.status === 'behind').length;
  const notStarted = allInitiatives.filter(i => i.status === 'not-started').length;

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '順調', count: onTrack, color: 'text-emerald-400', bg: 'border-emerald-500/30', icon: CheckCircle2 },
          { label: 'リスクあり', count: atRisk, color: 'text-amber-400', bg: 'border-amber-500/30', icon: AlertTriangle },
          { label: '遅延', count: behind, color: 'text-rose-400', bg: 'border-rose-500/30', icon: XCircle },
          { label: '未着手', count: notStarted, color: 'text-slate-400', bg: 'border-slate-500/30', icon: Circle },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-slate-800 border ${kpi.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-sm text-slate-400">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.count}</p>
            <p className="text-sm text-slate-500">/ {allInitiatives.length} 施策</p>
          </div>
        ))}
      </div>

      {/* フィルター */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">フェーズ:</span>
        {([0, 1, 2, 3] as const).map(p => (
          <button key={p} onClick={() => setFilterPhase(p)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${filterPhase === p ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
            {p === 0 ? '全て' : `Phase ${p}`}
          </button>
        ))}
        <span className="text-sm text-slate-400 ml-4">ステータス:</span>
        {(['all', 'on-track', 'at-risk', 'behind', 'not-started'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${filterStatus === s ? 'bg-slate-600 text-slate-200 border border-slate-500' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'}`}>
            {s === 'all' ? '全て' : statusLabel[s]}
          </button>
        ))}
      </div>

      {/* 施策リスト */}
      <div className="space-y-3">
        {filtered.map(init => (
          <div key={init.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: init.domainColor + '22' }}>
                  <init.domainIcon className="w-4 h-4" style={{ color: init.domainColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{init.titleJa}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    <span className="text-slate-500">{init.domainLabelJa}</span>
                    {' · '}担当: {init.ownerJa}
                    {' · '}期限: {init.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  init.phase === 1 ? 'bg-amber-500/20 text-amber-400' :
                  init.phase === 2 ? 'bg-sky-500/20 text-sky-400' : 'bg-violet-500/20 text-violet-400'
                }`}>Phase {init.phase}</span>
                <Badge status={init.status} />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Bar value={init.progress} color={
                init.status === 'on-track' ? 'bg-emerald-500' :
                init.status === 'at-risk' ? 'bg-amber-400' :
                init.status === 'behind' ? 'bg-rose-400' : 'bg-slate-500'
              } />
              <span className="text-sm font-bold text-slate-300 w-10 text-right">{init.progress}%</span>
            </div>

            {/* ベロシティ */}
            <div className="flex items-center gap-6 bg-slate-700/40 rounded-lg px-4 py-2">
              <span className="text-sm text-slate-400">進捗ベロシティ</span>
              {[
                { label: '3M前', val: init.velocity.threeMonths },
                { label: '1M前', val: init.velocity.oneMonth },
                { label: '2W前', val: init.velocity.twoWeeks },
                { label: '1W前', val: init.velocity.oneWeek },
              ].map(v => (
                <div key={v.label} className="text-center">
                  <VelocityCell val={v.val} />
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
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Circle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">該当する施策がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: 進捗ベロシティ ──────────────────────────────────────────────────

function VelocityTab({ domains, kpis }: { domains: typeof DOMAINS; kpis: typeof KPIS }) {
  // KPIモニタリング
  const phase1KPIs = kpis.filter(k => k.phase === 1);
  const phase2KPIs = kpis.filter(k => k.phase === 2);
  const phase3KPIs = kpis.filter(k => k.phase === 3);

  // ドメイン別ベロシティ（施策の平均）
  const domainVelocity = domains.map(d => {
    const inits = d.initiatives;
    if (inits.length === 0) return { ...d, avgVel: { threeMonths: 0, oneMonth: 0, twoWeeks: 0, oneWeek: 0 } };
    const avg = (key: keyof typeof inits[0]['velocity']) =>
      Math.round(inits.reduce((s, i) => s + i.velocity[key], 0) / inits.length * 10) / 10;
    return {
      ...d,
      avgVel: {
        threeMonths: avg('threeMonths'),
        oneMonth: avg('oneMonth'),
        twoWeeks: avg('twoWeeks'),
        oneWeek: avg('oneWeek'),
      },
    };
  });

  return (
    <div className="space-y-6">
      {/* KPIモニタリング */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          KPIモニタリング（フェーズ別）
        </h3>
        {[
          { phase: 1, label: 'Phase 1: 種まき（4〜6月）', kpis: phase1KPIs, active: true },
          { phase: 2, label: 'Phase 2: 加速（7〜9月）', kpis: phase2KPIs, active: false },
          { phase: 3, label: 'Phase 3: スケール（10〜12月）', kpis: phase3KPIs, active: false },
        ].map(ph => (
          <div key={ph.phase} className={`mb-4 bg-slate-800 border rounded-xl p-4 ${ph.active ? 'border-amber-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${ph.active ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'}`}>
                {ph.active ? '▶ 実行中' : '未開始'}
              </span>
              <span className="text-sm font-semibold text-slate-200">{ph.label}</span>
            </div>
            <div className="space-y-3">
              {ph.kpis.map((kpi, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-slate-300">{kpi.labelJa}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">目標: <span className="text-slate-300">{kpi.target}</span></span>
                        <span className="text-sm text-slate-500">現在: <span className="text-slate-200 font-medium">{kpi.current}</span></span>
                        <Badge status={kpi.status} />
                      </div>
                    </div>
                    <Bar value={kpi.progress} color={
                      kpi.status === 'on-track' ? 'bg-emerald-500' :
                      kpi.status === 'at-risk' ? 'bg-amber-400' :
                      kpi.status === 'behind' ? 'bg-rose-400' : 'bg-slate-600'
                    } />
                  </div>
                  <span className="text-sm font-bold text-slate-300 w-10 text-right">{kpi.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ドメイン別ベロシティマトリックス */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          ドメイン別 進捗ベロシティ
        </h3>
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm text-slate-400 px-4 py-3">ドメイン</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">進捗</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">3M前</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">1M前</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">2W前</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">1W前</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">トレンド</th>
              </tr>
            </thead>
            <tbody>
              {domainVelocity.map((d, i) => {
                const trend = d.avgVel.oneWeek - d.avgVel.oneMonth;
                return (
                  <tr key={d.id} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-700/20'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: d.color + '22' }}>
                          <d.icon className="w-3 h-3" style={{ color: d.color }} />
                        </div>
                        <span className="text-sm text-slate-300">{d.labelJa}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-sm font-bold text-slate-200">{d.progress}%</span>
                    </td>
                    <td className="px-3 py-3 text-center"><VelocityCell val={d.avgVel.threeMonths} /></td>
                    <td className="px-3 py-3 text-center"><VelocityCell val={d.avgVel.oneMonth} /></td>
                    <td className="px-3 py-3 text-center"><VelocityCell val={d.avgVel.twoWeeks} /></td>
                    <td className="px-3 py-3 text-center"><VelocityCell val={d.avgVel.oneWeek} /></td>
                    <td className="px-3 py-3 text-center">
                      {trend > 0.5 ? (
                        <span className="flex items-center justify-center gap-1 text-sm text-emerald-400">
                          <TrendingUp className="w-3 h-3" />加速
                        </span>
                      ) : trend < -0.5 ? (
                        <span className="flex items-center justify-center gap-1 text-sm text-rose-400">
                          <TrendingDown className="w-3 h-3" />減速
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-sm text-slate-500">
                          <Minus className="w-3 h-3" />横ばい
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: ロードマップ ────────────────────────────────────────────────────

function RoadmapTab({ phases, pipeline }: { phases: typeof PHASES; pipeline: typeof PIPELINE }) {
  const months = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const phaseColors = ['bg-amber-500/20 border-amber-500/40 text-amber-400', 'bg-sky-500/20 border-sky-500/40 text-sky-400', 'bg-violet-500/20 border-violet-500/40 text-violet-400'];

  return (
    <div className="space-y-6">
      {/* 月次タイムライン */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          9ヶ月 マイルストーンロードマップ
        </h3>

        {/* フェーズバー */}
        <div className="flex mb-4 rounded-xl overflow-hidden border border-slate-700">
          {phases.map(ph => (
            <div key={ph.phase} className={`flex-1 px-3 py-2 text-center border-r border-slate-700 last:border-0 ${phaseColors[ph.phase - 1]}`}>
              <p className="text-sm font-bold">{ph.labelJa}</p>
              <p className="text-sm opacity-70">{ph.periodJa}</p>
              <p className="text-sm font-bold mt-0.5">{ph.revenueTarget}</p>
            </div>
          ))}
        </div>

        {/* マイルストーン一覧 */}
        <div className="space-y-4">
          {phases.map(ph => (
            <div key={ph.phase} className={`bg-slate-800 border rounded-xl p-4 ${ph.phase === 1 ? 'border-amber-500/40' : 'border-slate-700'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full border ${phaseColors[ph.phase - 1]}`}>
                    {ph.labelJa}
                  </span>
                  <span className="text-sm text-slate-400">{ph.periodJa} | 目標: <span className="text-amber-400 font-bold">{ph.revenueTarget}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">達成済み: <span className="text-slate-200 font-medium">{ph.revenueActual}</span></span>
                  <Badge status={ph.status} />
                </div>
              </div>

              <div className="mb-3">
                <Bar value={ph.revenueProgress} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ph.milestones.map((m, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${m.done ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/40 border border-slate-600'}`}>
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${m.done ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                      {m.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm ${m.done ? 'text-slate-300 line-through' : 'text-slate-300'}`}>{m.titleJa}</p>
                      <p className="text-sm text-slate-500">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* パイプライン詳細 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-400" />
          パイプライン詳細（10社 $10M）
        </h3>
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-sm text-slate-400 px-4 py-3">#</th>
                <th className="text-left text-sm text-slate-400 px-3 py-3">企業名</th>
                <th className="text-left text-sm text-slate-400 px-3 py-3">プラン</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">金額</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">目標時期</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">フェーズ</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">ルート</th>
                <th className="text-center text-sm text-slate-400 px-3 py-3">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.map((p, i) => (
                <tr key={p.rank} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-700/20'}`}>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.rank}</td>
                  <td className="px-3 py-3 text-sm text-slate-200 font-medium">{p.company}</td>
                  <td className="px-3 py-3 text-sm text-slate-400">{p.planJa}</td>
                  <td className="px-3 py-3 text-center text-sm font-bold text-amber-400">{p.amount}</td>
                  <td className="px-3 py-3 text-center text-sm text-slate-400">{p.targetDate}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      p.phase === 1 ? 'bg-amber-500/20 text-amber-400' :
                      p.phase === 2 ? 'bg-sky-500/20 text-sky-400' : 'bg-violet-500/20 text-violet-400'
                    }`}>P{p.phase}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      p.route === 'direct' ? 'bg-slate-600 text-slate-300' : 'bg-sky-500/20 text-sky-400'
                    }`}>{p.route === 'direct' ? '直販' : 'パートナー'}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      p.status === 'contracted' ? 'bg-emerald-500/20 text-emerald-400' :
                      p.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>{p.statusJa}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

type TabId = 'initiatives' | 'velocity' | 'roadmap';

export default function StrategyExecutionPage() {
  const { currentUserId } = useUser();
  const isNara = currentUserId === 'masato';
  const isYoshi = currentUserId === 'yoshi';
  const activeDomains = isNara ? NARA_DOMAINS : isYoshi ? YOSHI_DOMAINS : DOMAINS;
  const activePhases = isNara ? NARA_PHASES : isYoshi ? YOSHI_PHASES : PHASES;
  const activePipeline = isNara ? NARA_PIPELINE : isYoshi ? YOSHI_PIPELINE : PIPELINE;
  const activeKpis = isNara ? NARA_KPIS : isYoshi ? YOSHI_KPIS : KPIS;
  const [tab, setTab] = useState<TabId>('initiatives');

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'initiatives', label: '施策進捗', icon: BarChart3 },
    { id: 'velocity', label: '進捗ベロシティ', icon: Activity },
    { id: 'roadmap', label: 'ロードマップ', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ヘッダー */}
      <div className="border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              戦略実行マネジメント
              <span className="text-sm font-normal text-slate-400 ml-1">{isNara ? '— 第4期中期計画の実行管理' : isYoshi ? '— CKS & Compute Abstractions Execution' : '— どうやって進めているか？'}</span>
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
          </div>
        </div>
        {/* タブ */}
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="px-6 py-6">
        {tab === 'initiatives' && <InitiativesTab domains={activeDomains} />}
        {tab === 'velocity' && <VelocityTab domains={activeDomains} kpis={activeKpis} />}
        {tab === 'roadmap' && <RoadmapTab phases={activePhases} pipeline={activePipeline} />}
      </div>
    </div>
  );
}
