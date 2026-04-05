/**
 * TwinPage — SIMY Digital Twin
 * Design: ChatGPT-style — dark sidebar-less, centered content column,
 *         clean white/light background, minimal chrome.
 * Layout:
 *   - Empty state: centered greeting + quick reply grid above input bar
 *   - Active chat: scrollable message list + sticky bottom input bar
 *   - Input bar always centered, max-width 768px
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, Copy, ThumbsUp, ThumbsDown, Paperclip, Mic, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// ─── Quick Replies ────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  { label: '今週の優先タスクは？', icon: '🎯' },
  { label: 'ブロックされているアクションは？', icon: '🚧' },
  { label: 'チームの状況を教えて', icon: '👥' },
  { label: 'OKRの進捗は？', icon: '📊' },
  { label: '次に何をすべき？', icon: '⚡' },
  { label: 'リスクと憸念事項は？', icon: '⚠️' },
];

const NARA_QUICK_REPLIES = [
  { label: '今週の経営優先タスクは？', icon: '🎯' },
  { label: '病院収支の現状は？', icon: '🏥' },
  { label: 'チームの状況を教えて', icon: '👥' },
  { label: '中期計画の進捗は？', icon: '📊' },
  { label: '次に何をすべき？', icon: '⚡' },
  { label: 'リスクと憸念事項は？', icon: '⚠️' },
];

// ─── Simulated Responses ──────────────────────────────────────────────────────

const NARA_RESPONSES: Record<string, string> = {
  '今週の経営優先タスクは？': `今週の経営優先タスクをお伝えします。\n\n**🔴 高優先度（要対応）**\n1. **後発品切り替え未同意医師への個別説明** — 材料費削減の鍵。高橋診療部長と連携して今週中に実施\n2. **麻酔科医採用計画立案** — 手術件数増加のボトルネック。人事部との調整が必要\n\n**🟡 進行中**\n3. **AI診療記録支援 パイロット効果測定** — AI実行中\n4. **委託費競争入札プロセス開始** — 2025年1月末期限\n\n今日は1番と2番に取り組むことをお勧めします。高橋部長への連絡メッセージを下書きしましょうか？`,

  '病院収支の現状は？': `病院収支の現状をお伝えします。\n\n**財務サマリー**\n\n| 項目 | 現状 | 目標 | 進捗 |\n|---|---|---|---|\n| 病院収支 | ▲5億円 | 黒字転換 | 30% |\n| 診療収益 | 255億円 | 280億円 | 91% |\n| 材料費率 | 31% | 28%以下 | 要改善 |\n| 手術件数 | 3,200件 | 4,000件 | 80% |\n\n**ハイライト**\n- 診療収益は年間+3.2%で改善傾向\n- ボトルネック: 麻酔科医不足と材料費率高止まり\n\n特定の項目を詳しく見ますか？`,

  '中期計画の進捗は？': `第4期中期計画の進捗スナップショットです。\n\n**全体進捗: 38%**\n\n| イシュー | 進捗 | トレンド |\n|---|---|---|\n| 病院収益の黒字化 | 30% | ↑ 改善中 |\n| 高度専門医療強化 | 45% | → 進行中 |\n| 働き方改革 | 55% | ↑ 順調 |\n| DX推進 | 25% | ↑ 加速中 |\n| 研究力強化 | 40% | → 進行中 |\n\n最も進捗が遅れているのはDX推進です。RPA導入を加速する必要があります。\n\n特定のイシューを詳しく見ますか？`,

  default: `承知しました。第4期中期計画のデータを確認しています...\n\n笠原副理事長のイシュー、アクション、チームのコンテキストをもとにお答えします。詳細は各ページでご確認いただけます。\n\n他にご質問はありますか？`,
};

const RESPONSES: Record<string, string> = {
  '今週の優先タスクは？': `今週の優先タスクをお伝えします。\n\n**🔴 高優先度（要対応）**\n1. **ホームページデザインの更新** — 3日以上停止中、レビュー待ち\n2. **受け入れ基準の定義** — あなたの番です\n\n**🟡 進行中**\n3. **Q2営業戦略の準備** — レビュー中\n4. **Vimeo料金の問い合わせ** — AIエージェント稼働中\n\n今日は1番と2番に取り組むことをお勧めします。ホームページレビューのフォローアップメッセージを下書きしましょうか？`,

  'ブロックされているアクションは？': `現在 **1件のブロックされたアクション** があります。\n\n**ホームページデザインをよりホワイトなデザインに更新**\n- ステータス: レビュー待ち\n- 停止期間: **3日以上**\n- カテゴリ: エンジニアリング\n- 担当者: Tetsuo Shiwaku\n\n推奨アクション: レビュアーに確認メッセージを送るか、再アサインを検討してください。\n\nメッセージの下書きを作成しましょうか？`,

  'チームの状況を教えて': `チームの現在の状況です。\n\n**メンバー別アクション数**\n- Tetsuo Shiwaku（あなた）: 5件 進行中\n- Misaki Tanaka: 3件 進行中、1件 完了\n- Kenta Suzuki: 2件 進行中\n- Hanako Yamada: 4件 進行中\n\n**ハイライト**\n- チーム全体の完了率: **68%**（先週比 +5%）\n- 最も活発: Misaki Tanaka\n- フォローアップ推奨: Kenta Suzuki（2日間更新なし）\n\nKentaにリマインダーを送りますか？`,

  'OKRの進捗は？': `現在のOKRスナップショットです。\n\n**会社目標: 売上拡大 — 72%**\n\n| 部門 | 進捗 | トレンド |\n|---|---|---|\n| 営業 | 72% | ↑ 順調 |\n| プロダクト | 65% | → 要注意 |\n| カスタマーサクセス | 81% | ↑ 好調 |\n| 人事・組織 | 58% | ↓ 要対応 |\n\nあなたのQ2戦略プレゼンは営業OKRに直結しています。ホームページ刷新はプロダクトOKRに貢献しています。\n\n特定の部門を詳しく見ますか？`,

  '次に何をすべき？': `現在のデータをもとに、次のアクションをお勧めします。\n\n1. **ホームページデザインのブロック解除** — 3日間停止中。レビュアーへのメッセージで今日中に解決できます。\n\n2. **受け入れ基準の完成** — 2名のチームメンバーの作業がこれに依存しています。\n\n3. **Q2レビュー資料の確認** — 水曜14:00が会議です。AIが下書き中ですが、明日までにあなたのレビューが必要です。\n\nこれらのアクションを作成しましょうか？`,

  'リスクと懸念事項は？': `現在のリスクサマリーです。\n\n**🔴 高リスク**\n- ホームページデザイン 3日以上停止\n- 人事・組織OKR 58%（目標未達）\n\n**🟡 中リスク**\n- マーケティング部門のAI活用率が低下傾向（先週比 -5%）\n- Q2レビュー資料が未完成\n\n**推奨アクション:**\n1. ホームページのブロッカーを特定・解消する\n2. 採用加速 — 人事部門と連携する\n\n優先順位付けのアドバイスが必要ですか？`,

  default: `承知しました。現在のデータを確認しています...\n\nあなたのアクション、ミーティング、チームのコンテキストをもとにお答えします。詳細は各ページでご確認いただけます。\n\n他にご質問はありますか？`,
};

const YOSHI_QUICK_REPLIES = [
  { label: "What are this week's priorities?", icon: '🎯' },
  { label: 'CKS adoption status?', icon: '🚀' },
  { label: "How's the team doing?", icon: '👥' },
  { label: 'Product roadmap progress?', icon: '📊' },
  { label: 'What should I do next?', icon: '⚡' },
  { label: 'Risks and blockers?', icon: '⚠️' },
];

const YOSHI_RESPONSES: Record<string, string> = {
  "What are this week's priorities?": `Here are your top priorities this week at CoreWeave:\n\n**🔴 High Priority (Action Required)**\n1. **CKS v2.1 PRD Review** — Pending your sign-off for 2+ days. Engineering is blocked.\n2. **TAM Top-20 Account Assignment** — Strategic partnership expansion depends on this.\n\n**🟡 In Progress**\n3. **Competitor Analysis** — AI agent running, results expected by EOD\n4. **CKS Onboarding UX Feedback** — AI analysis in progress\n\nShall I draft a message to unblock the PRD review?`,
  'CKS adoption status?': `Here's the current CKS adoption snapshot:\n\n| Metric | Current | Target | Progress |\n|---|---|---|---|\n| CKS Adoption Rate | 8% | 15% | 53% |\n| CKS Customers | 12 | 25 | 48% |\n| GPU Utilization | 67% | 80% | 84% |\n| Enterprise ARR | $45M | $80M | 56% |\n\n**Highlights**\n- Top adopters: Mistral AI, Cohere, Inflection AI\n- Bottleneck: Onboarding complexity (avg 14 days to first workload)\n\nWant to see the detailed adoption funnel?`,
  "How's the team doing?": `Here's your CoreWeave team status:\n\n**Member Activity**\n- Yoshi Tamura (you): 3 actions in progress\n- Priya Nair (PM): 4 actions, 1 completed this week\n- Marcus Chen (Eng): 2 actions, on track\n- Sarah Kim (Design): 3 actions, 1 blocked\n- David Park (Data): 2 actions in progress\n\n**Highlights**\n- Team completion rate: **71%** (+8% vs last week)\n- Most active: Priya Nair\n- Follow-up recommended: Sarah Kim (blocked on UX spec approval)\n\nShall I send Sarah a check-in message?`,
  'Product roadmap progress?': `Here's the CKS & Compute Abstractions roadmap status:\n\n**Overall Progress: 42%**\n\n| Initiative | Progress | Trend |\n|---|---|---|\n| CKS v2.1 Feature Set | 55% | ↑ On track |\n| Compute Abstractions API | 38% | → In progress |\n| Enterprise Onboarding Redesign | 25% | ↑ Accelerating |\n| GPU Autoscaling | 60% | ↑ Strong |\n| Multi-cloud Support | 15% | ↓ At risk |\n\nMulti-cloud support is the most at-risk item. Recommend escalating resource allocation.`,
  'What should I do next?': `Based on your current data, here are the recommended next actions:\n\n1. **Unblock CKS v2.1 PRD** — 2 days stalled. A quick review today unblocks 3 engineers.\n\n2. **Finalize TAM account assignments** — 5 enterprise accounts waiting. Priya needs your input by EOD.\n\n3. **Review AI agent outputs** — Competitor analysis and UX feedback reports are ready for your review.\n\nShall I create these as action items?`,
  'Risks and blockers?': `Here's your current risk summary:\n\n**🔴 High Risk**\n- CKS v2.1 PRD blocked 2+ days (engineering dependency)\n- Multi-cloud support timeline slipping\n\n**🟡 Medium Risk**\n- CKS adoption rate 8% vs 15% Q2 target\n- Enterprise onboarding avg 14 days (industry benchmark: 7 days)\n\n**Recommended Actions:**\n1. Unblock PRD review today\n2. Schedule onboarding redesign sprint\n\nWant me to draft a risk summary for your next stakeholder sync?`,
  default: `Got it. Let me check your CoreWeave data...\n\nI'll answer based on your actions, meetings, and team context. You can find more details on each page.\n\nAnything else I can help with?`,
};

function getYoshiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('priority') || lower.includes('priorities') || lower.includes('week')) return YOSHI_RESPONSES["What are this week's priorities?"];
  if (lower.includes('cks') || lower.includes('adoption') || lower.includes('metric') || lower.includes('gpu')) return YOSHI_RESPONSES['CKS adoption status?'];
  if (lower.includes('team') || lower.includes('member') || lower.includes('doing')) return YOSHI_RESPONSES["How's the team doing?"];
  if (lower.includes('roadmap') || lower.includes('progress') || lower.includes('okr')) return YOSHI_RESPONSES['Product roadmap progress?'];
  if (lower.includes('next') || lower.includes('should') || lower.includes('do')) return YOSHI_RESPONSES['What should I do next?'];
  if (lower.includes('risk') || lower.includes('block') || lower.includes('concern')) return YOSHI_RESPONSES['Risks and blockers?'];
  return YOSHI_RESPONSES.default;
}

const YOSHI_INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: `Hi Yoshi! Here's your current snapshot at CoreWeave:\n\n- **Open Actions**: 3 (1 pending your review for 2+ days)\n- **Active AI Agents**: 3 (CKS PRD Draft, Competitor Analysis, UX Feedback)\n- **Upcoming Meetings**: 2 this week\n- **CKS Adoption Rate**: 8% → Target 15% by Q2\n\nWhat can I help you with today?`,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
];

function getNaraResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('優先') || lower.includes('タスク')) return NARA_RESPONSES['今週の経営優先タスクは？'];
  if (lower.includes('収支') || lower.includes('财務') || lower.includes('収益')) return NARA_RESPONSES['病院収支の現状は？'];
  if (lower.includes('チーム') || lower.includes('メンバー')) return RESPONSES['チームの状況を教えて'];
  if (lower.includes('中期計画') || lower.includes('進捗') || lower.includes('目標')) return NARA_RESPONSES['中期計画の進捗は？'];
  if (lower.includes('次') || lower.includes('何をすべき')) return NARA_RESPONSES['今週の経営優先タスクは？'];
  if (lower.includes('リスク') || lower.includes('憸念')) return RESPONSES['リスクと憸念事項は？'];
  return NARA_RESPONSES.default;
}

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('優先') || lower.includes('タスク') || lower.includes('priority') || lower.includes('task')) return RESPONSES['今週の優先タスクは？'];
  if (lower.includes('ブロック') || lower.includes('停止') || lower.includes('block') || lower.includes('stuck')) return RESPONSES['ブロックされているアクションは？'];
  if (lower.includes('チーム') || lower.includes('メンバー') || lower.includes('team')) return RESPONSES['チームの状況を教えて'];
  if (lower.includes('okr') || lower.includes('進捗') || lower.includes('目標') || lower.includes('progress')) return RESPONSES['OKRの進捗は？'];
  if (lower.includes('次') || lower.includes('何をすべき') || lower.includes('next') || lower.includes('should')) return RESPONSES['次に何をすべき？'];
  if (lower.includes('リスク') || lower.includes('懸念') || lower.includes('risk')) return RESPONSES['リスクと懸念事項は？'];
  for (const key of Object.keys(RESPONSES)) {
    if (key !== 'default' && lower.includes(key.slice(0, 6))) return RESPONSES[key];
  }
  return RESPONSES.default;
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function RenderContent({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0 leading-[1.75] text-[15px]">
      {lines.map((line, i) => {
        if (line.startsWith('| ') && line.endsWith(' |')) {
          const cells = line.split('|').filter(c => c.trim());
          return (
            <div key={i} className="flex gap-4 text-[14px] py-1">
              {cells.map((cell, j) => (
                <span key={j} className={cn('flex-1', j === 0 ? 'font-medium' : 'text-foreground/70')}>{cell.trim()}</span>
              ))}
            </div>
          );
        }
        if (line.startsWith('|---')) return null;
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line === '' ? 'mt-3 block' : 'mt-1.5 first:mt-0'}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold text-foreground">{part}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, onCopy }: { message: Message; onCopy: (t: string) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('group w-full', isUser ? 'flex justify-end' : 'flex justify-start')}>
      <div className={cn('flex gap-4 max-w-[720px] w-full', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            style={{ background: 'oklch(0.22 0.04 264)', border: '1px solid oklch(0.32 0.06 264)' }}>
            <Sparkles size={14} style={{ color: 'oklch(0.78 0.18 264)' }} />
          </div>
        )}

        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start', 'flex-1')}>
          {isUser ? (
            /* User bubble */
            <div className="px-4 py-3 rounded-2xl text-[15px] leading-7 max-w-[85%]"
              style={{ background: 'oklch(0.22 0.04 264)', color: 'oklch(0.95 0.01 264)' }}>
              {message.content}
            </div>
          ) : message.isStreaming ? (
            /* Streaming indicator */
            <div className="flex items-center gap-2 py-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'oklch(0.55 0.15 264)', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          ) : (
            /* Assistant message */
            <div className="text-foreground w-full">
              <RenderContent text={message.content} />
              {/* Action row */}
              <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onCopy(message.content)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors">
                  <Copy size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors">
                  <ThumbsUp size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors">
                  <ThumbsDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: `こんにちは、林社長。\n\n現在の状況をお伝えします:\n- **未完了アクション**: 5件（うち1件が3日以上停止中）\n- **稼働中AIエージェント**: 3件\n- **今週のミーティング**: 2件\n\n今日は何をお手伝いしましょうか？`,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
];

const NARA_INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'assistant',
    content: `こんにちは、笠原副理事長。\n\n第4期中期計画の現状をお伝えします:\n- **進行中イシュー**: 5件（病院収益・高度専門医療・働き方改革・DX推進・研究力強化）\n- **稼働中AIエージェント**: 4件\n- **今週のミーティング**: 3件\n- **要対応アクション**: 6件（うち2件が高優先度）\n\n今日は何をお手伝いしましょうか？`,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
];

export default function TwinPage() {
  const activeQuickReplies = QUICK_REPLIES;
  const activeInitialMessages = INITIAL_MESSAGES;
  const [messages, setMessages] = useState<Message[]>(activeInitialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isEmptyState = messages.length <= 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    const streamingMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, streamingMsg]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    setMessages(prev =>
      prev.map(m =>
        m.id === streamingMsg.id
          ? { ...m, content: getResponse(text), isStreaming: false }
          : m
      )
    );
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('コピーしました');
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInput('');
    setIsLoading(false);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  return (
    <div className="flex flex-col h-full bg-background relative">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'oklch(0.18 0.04 264)', border: '1px solid oklch(0.30 0.08 264)' }}>
            <Sparkles size={13} style={{ color: 'oklch(0.78 0.18 264)' }} />
          </div>
          <span className="text-[14px] font-semibold text-foreground">Digital Twin</span>
          <span className="text-sm text-muted-foreground hidden sm:inline">— あなたのAIアシスタント</span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <RotateCcw size={12} />
          新しいチャット
        </button>
      </div>

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto">
        {isEmptyState ? (
          /* ── Empty / greeting state ── */
          <div className="flex flex-col items-center justify-center h-full px-4 pb-4">
            <div className="w-full max-w-[680px] flex flex-col items-center gap-8">
              {/* Greeting */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'oklch(0.18 0.04 264)', border: '1px solid oklch(0.30 0.08 264)' }}>
                  <Sparkles size={24} style={{ color: 'oklch(0.78 0.18 264)' }} />
                </div>
                <h2 className="text-[22px] font-bold text-foreground mb-1">こんにちは、林社長</h2>
                <p className="text-[14px] text-muted-foreground">何でも聴いてください</p>
              </div>

              {/* Quick reply grid */}
              <div className="w-full grid grid-cols-2 gap-2.5">
                {activeQuickReplies.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => sendMessage(qr.label)}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-border bg-card text-left hover:bg-accent/20 hover:border-primary/30 transition-all group"
                  >
                    <span className="text-[18px] flex-shrink-0 mt-0.5">{qr.icon}</span>
                    <span className="text-[13px] text-foreground/80 group-hover:text-foreground leading-snug">{qr.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Active chat ── */
          <div className="flex flex-col items-center py-8 px-4 gap-6">
            <div className="w-full max-w-[720px] flex flex-col gap-8">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} onCopy={handleCopy} />
              ))}
            </div>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom input bar ── */}
      <div className="flex-shrink-0 px-4 pb-5 pt-3">
        <div className="w-full max-w-[720px] mx-auto flex flex-col gap-3">

          {/* Quick reply chips — shown in active chat */}
          {!isEmptyState && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {activeQuickReplies.map((qr) => (
                <button
                  key={qr.label}
                  onClick={() => sendMessage(qr.label)}
                  disabled={isLoading}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-card text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-accent/20 hover:border-primary/30 transition-all disabled:opacity-40"
                >
                  <span>{qr.icon}</span>
                  <span className="whitespace-nowrap">{qr.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input box — ChatGPT style */}
          <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors flex-shrink-0 mb-0.5">
              <Paperclip size={16} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digital Twinに何でも聞いてください..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none leading-7 min-h-[28px] max-h-[200px] disabled:opacity-50 py-0.5"
              style={{ height: '28px' }}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0 mb-0.5">
              <button className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors">
                <Mic size={16} />
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-xl transition-all',
                  input.trim() && !isLoading
                    ? 'text-white shadow-sm hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
                style={input.trim() && !isLoading ? { background: 'oklch(0.55 0.20 264)' } : {}}
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground/50 text-center">
            Enterで送信 · Shift+Enterで改行 · Digital Twinはあなたのアクション・ミーティング・チームデータを参照します
          </p>
        </div>
      </div>
    </div>
  );
}
