/**
 * SettingsPage — SIMY PC UI
 * Design: Clean, structured settings panel with card-based sections.
 * Dark background (bg-background), card surfaces (bg-card), muted separators.
 * No excessive color — only primary accent for interactive elements.
 * Sub-pages slide in via local state (no routing needed).
 */

import { useState } from "react";
import {
  User, Globe, BarChart2, Archive, Coins, Bot, Mail,
  LogOut, Trash2, Link2, ChevronRight, ChevronLeft,
  Plus, Star, Unlink, Check, X, AlertTriangle, Info,
  Zap, Clock, TrendingUp, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubPage =
  | null
  | "usage"
  | "purchase"
  | "ai-actions"
  | "email-blacklist"
  | "apps"
  | "about";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, { name: string; email: string; role: string; avatar: string; tokenBalance: number; language: string }> = {
  tetsuo: {
    name: "Tetsuo Shiwaku",
    email: "tetsuo@simy.one",
    role: "Product Manager",
    avatar: "TS",
    tokenBalance: 4000,
    language: "English",
  },
  masato: {
    name: "Masato Kasahara",
    email: "kasahara@naramed-u.ac.jp",
    role: "経営責任者（副理事長）",
    avatar: "MK",
    tokenBalance: 8500,
    language: "日本語",
  },
  yoshi: {
    name: "Yoshi Tamura",
    email: "yoshi.tamura@coreweave.com",
    role: "Principal Product Manager",
    avatar: "YT",
    tokenBalance: 6200,
    language: "English",
  },
};

const TOKEN_PACKAGES = [
  { id: "p1", tokens: 400_000_000, label: "400M SIMY Tokens", price: "¥16,000", popular: true },
  { id: "p2", tokens: 200_000_000, label: "200M SIMY Tokens", price: "¥8,000", popular: false },
  { id: "p3", tokens: 100_000_000, label: "100M SIMY Tokens", price: "¥4,000", popular: false },
  { id: "p4", tokens: 50_000_000, label: "50M SIMY Tokens", price: "¥2,000", popular: false },
];

const USAGE_HISTORY = [
  { date: "Apr 1, 2026", action: "AI Agent: One-shot PR", tokens: -1_200, type: "debit" },
  { date: "Mar 30, 2026", action: "AI Agent: Meeting Summary", tokens: -340, type: "debit" },
  { date: "Mar 28, 2026", action: "Token Purchase (200M)", tokens: +200_000_000, type: "credit" },
  { date: "Mar 27, 2026", action: "AI Agent: Research Digest", tokens: -780, type: "debit" },
];

const CONNECTED_APPS = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Search and refer to emails in your inbox",
    connected: true,
    accounts: [
      { email: "tetsuo@simy.one", primary: true },
      { email: "t.shiwaku@specialist-doctor.com", primary: false },
    ],
    color: "#EA4335",
    icon: "G",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Generate actions from your Slack workspace",
    connected: false,
    accounts: [],
    color: "#4A154B",
    icon: "S",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Connect your Microsoft Account",
    connected: false,
    accounts: [],
    color: "#6264A7",
    icon: "T",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub account to sync repositories and PRs",
    connected: false,
    accounts: [],
    color: "#24292F",
    icon: "GH",
  },
];

const BLACKLISTED_EMAILS: string[] = [];

const AI_ACTIONS_CONFIG = [
  { id: "meeting-summary", label: "Meeting Summary", description: "Auto-generate summaries after meetings", enabled: true },
  { id: "action-suggest", label: "Action Suggestions", description: "Suggest next actions from conversations", enabled: true },
  { id: "email-draft", label: "Email Drafting", description: "Draft follow-up emails automatically", enabled: false },
  { id: "insight-digest", label: "Weekly Insight Digest", description: "Send weekly HVP insights every Monday", enabled: true },
  { id: "risk-alert", label: "Risk Alerts", description: "Alert when KR progress drops below threshold", enabled: false },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function SubPageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
      <button
        onClick={onBack}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/30 transition-colors text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={18} />
      </button>
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  danger = false,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-accent/20 transition-colors text-left group",
        className
      )}
    >
      <Icon
        size={17}
        className={cn(
          "flex-shrink-0",
          danger ? "text-red-500" : "text-muted-foreground group-hover:text-foreground transition-colors"
        )}
      />
      <span className={cn("flex-1 text-[13.5px] font-medium", danger ? "text-red-500" : "text-foreground")}>
        {label}
      </span>
      {value && <span className="text-[12.5px] text-muted-foreground mr-1">{value}</span>}
      <ChevronRight size={14} className="text-muted-foreground/50 flex-shrink-0" />
    </button>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border mx-5" />;
}

// ─── Sub Pages ────────────────────────────────────────────────────────────────

function UsagePage({ onBack }: { onBack: () => void }) {
  const { currentUserId } = useUser();
  const MOCK_USER = MOCK_USERS[currentUserId] ?? MOCK_USERS.tetsuo;
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SubPageHeader title="Usage" onBack={onBack} />
      <div className="p-5 space-y-4">
        {/* Balance */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Current Balance
          </p>
          <SectionCard>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-foreground mb-0.5">SIMY Tokens</p>
                <p className="text-sm text-muted-foreground">Tokens are consumed when you use AI agents.</p>
              </div>
              <span className="text-3xl font-black text-primary">
                {(MOCK_USER.tokenBalance / 1000).toFixed(0)}K
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, label: "This Month", value: "2,320", sub: "tokens used" },
            { icon: Zap, label: "AI Runs", value: "47", sub: "this month" },
            { icon: Clock, label: "Avg / Run", value: "49", sub: "tokens" },
          ].map((s) => (
            <SectionCard key={s.label}>
              <div className="p-3.5 text-center">
                <s.icon size={14} className="text-muted-foreground mx-auto mb-1.5" />
                <p className="text-[18px] font-black text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.sub}</p>
              </div>
            </SectionCard>
          ))}
        </div>

        {/* Usage Details link */}
        <SectionCard>
          <SettingsRow icon={BarChart2} label="Usage Details" onClick={() => {}} />
        </SectionCard>

        {/* Transaction History */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Transaction History
          </p>
          <SectionCard>
            {USAGE_HISTORY.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-muted-foreground">No top-up history yet</p>
              </div>
            ) : (
              <div>
                {USAGE_HISTORY.map((tx, i) => (
                  <div key={i}>
                    {i > 0 && <Divider />}
                    <div className="px-5 py-3.5 flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                        tx.type === "credit" ? "bg-emerald-500/15" : "bg-muted"
                      )}>
                        {tx.type === "credit"
                          ? <Plus size={12} className="text-emerald-500" />
                          : <Zap size={12} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium text-foreground truncate">{tx.action}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                      <span className={cn(
                        "text-[12.5px] font-bold flex-shrink-0",
                        tx.type === "credit" ? "text-emerald-500" : "text-muted-foreground"
                      )}>
                        {tx.type === "credit" ? "+" : ""}{tx.tokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function PurchasePage({ onBack }: { onBack: () => void }) {
  const { currentUserId } = useUser();
  const MOCK_USER = MOCK_USERS[currentUserId] ?? MOCK_USERS.tetsuo;
  const [purchased, setPurchased] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SubPageHeader title="Purchase Tokens" onBack={onBack} />
      <div className="p-5 space-y-4">
        {/* Balance */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Current Balance
          </p>
          <SectionCard>
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-foreground">SIMY Tokens</span>
              <span className="text-xl font-black text-primary">
                {(MOCK_USER.tokenBalance / 1000).toFixed(0)}K
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Packages */}
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Available Packages
          </p>
          <div className="space-y-3">
            {TOKEN_PACKAGES.map((pkg) => (
              <SectionCard key={pkg.id} className={pkg.popular ? "border-primary/40" : ""}>
                <div className="p-5">
                  {pkg.popular && (
                    <span className="inline-block text-sm font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full mb-3">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-[13.5px] font-bold text-foreground">{pkg.label}</p>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Token Amount</p>
                      <p className="text-2xl font-black text-primary">
                        {(pkg.tokens / 1_000_000).toFixed(0)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-0.5">Price</p>
                      <p className="text-xl font-black text-foreground">{pkg.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPurchased(pkg.id)}
                    className={cn(
                      "w-full py-3 rounded-xl text-[13.5px] font-bold transition-all",
                      purchased === pkg.id
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {purchased === pkg.id ? "✓ Purchased" : "Purchase"}
                  </button>
                </div>
              </SectionCard>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 px-1 pb-2">
          <Info size={12} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tokens are non-refundable and expire after 12 months from purchase date.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailBlacklistPage({ onBack }: { onBack: () => void }) {
  const [emails, setEmails] = useState<string[]>(BLACKLISTED_EMAILS);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);

  const addEmail = () => {
    if (input.trim() && !emails.includes(input.trim())) {
      setEmails([...emails, input.trim()]);
      setInput("");
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/30 transition-colors text-muted-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-[15px] font-bold text-foreground flex-1">Email Blacklist</h2>
        <button
          onClick={() => setAdding(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/30 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Plus size={18} />
        </button>
      </div>

      {adding && (
        <div className="px-5 py-3 border-b border-border bg-card">
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
              placeholder="email@example.com"
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button onClick={addEmail} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-bold hover:bg-primary/90 transition-colors">
              Add
            </button>
            <button onClick={() => { setAdding(false); setInput(""); }} className="px-3 py-2 bg-muted text-muted-foreground rounded-lg text-[12px] hover:bg-accent/30 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-5">
        {emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
              <X size={24} className="text-muted-foreground/40" />
            </div>
            <p className="text-[14px] font-semibold text-foreground">No blacklisted emails</p>
            <p className="text-[12px] text-muted-foreground text-center max-w-[220px] leading-relaxed">
              Blacklisted emails will not receive meeting summary emails
            </p>
          </div>
        ) : (
          <SectionCard>
            {emails.map((email, i) => (
              <div key={email}>
                {i > 0 && <Divider />}
                <div className="px-5 py-3.5 flex items-center gap-3">
                  <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-[13px] text-foreground">{email}</span>
                  <button
                    onClick={() => setEmails(emails.filter((e) => e !== email))}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/10 transition-colors"
                  >
                    <X size={13} className="text-muted-foreground hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function AppsPage({ onBack }: { onBack: () => void }) {
  const [apps, setApps] = useState(CONNECTED_APPS);

  const toggleConnect = (id: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, connected: !a.connected } : a))
    );
  };

  // App icon SVG representations
  const AppIcon = ({ app }: { app: typeof CONNECTED_APPS[0] }) => {
    if (app.id === "gmail") {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <path fill="#EA4335" d="M6 40h8V24L4 16v20c0 2.2 1.8 4 4 4z" />
            <path fill="#34A853" d="M34 40h8c2.2 0 4-1.8 4-4V16l-12 8z" />
            <path fill="#FBBC05" d="M34 8H14L24 16l10-8z" />
            <path fill="#4285F4" d="M14 24V8L4 16z" />
            <path fill="#C5221F" d="M4 16l10 8 10-8-10-8z" />
          </svg>
        </div>
      );
    }
    if (app.id === "slack") {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" width="44" height="44">
            <path fill="#E01E5A" d="M13 24a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4h4v4z" />
            <path fill="#E01E5A" d="M15 24a4 4 0 0 1 4-4 4 4 0 0 1 4 4v10a4 4 0 0 1-4 4 4 4 0 0 1-4-4V24z" />
            <path fill="#36C5F0" d="M19 13a4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4v4h-4z" />
            <path fill="#36C5F0" d="M19 15a4 4 0 0 1 4 4 4 4 0 0 1-4 4H9a4 4 0 0 1-4-4 4 4 0 0 1 4-4h10z" />
            <path fill="#2EB67D" d="M30 19a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4h-4v-4z" />
            <path fill="#2EB67D" d="M28 19a4 4 0 0 1-4 4 4 4 0 0 1-4-4V9a4 4 0 0 1 4-4 4 4 0 0 1 4 4v10z" />
            <path fill="#ECB22E" d="M24 30a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4v-4h4z" />
            <path fill="#ECB22E" d="M24 28a4 4 0 0 1-4-4 4 4 0 0 1 4-4h10a4 4 0 0 1 4 4 4 4 0 0 1-4 4H24z" />
          </svg>
        </div>
      );
    }
    if (app.id === "teams") {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" width="44" height="44">
            <path fill="#5059C9" d="M44 22a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
            <path fill="#5059C9" d="M32 28h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-10c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z" />
            <path fill="#7B83EB" d="M28 18a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
            <path fill="#7B83EB" d="M8 30h24c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V32c0-1.1.9-2 2-2z" />
            <path fill="white" d="M20 26v12M14 32h12" strokeWidth="2" stroke="white" />
          </svg>
        </div>
      );
    }
    if (app.id === "github") {
      return (
        <div className="w-12 h-12 flex items-center justify-center">
          <svg viewBox="0 0 48 48" width="44" height="44">
            <path fill="currentColor" className="text-foreground" d="M24 4C12.95 4 4 12.95 4 24c0 8.84 5.73 16.33 13.68 18.98.99.18 1.37-.43 1.37-.96 0-.47-.02-2.03-.02-3.68-5.54 1.2-6.71-2.38-6.71-2.38-.91-2.3-2.22-2.91-2.22-2.91-1.81-1.24.14-1.21.14-1.21 2 .14 3.05 2.05 3.05 2.05 1.78 3.04 4.66 2.16 5.8 1.65.18-1.28.7-2.16 1.27-2.66-4.42-.5-9.07-2.21-9.07-9.84 0-2.17.78-3.95 2.05-5.34-.21-.5-.89-2.53.19-5.27 0 0 1.67-.53 5.47 2.04A19.05 19.05 0 0 1 24 14.8c1.69.01 3.39.23 4.98.67 3.79-2.57 5.46-2.04 5.46-2.04 1.09 2.74.4 4.77.2 5.27 1.28 1.39 2.05 3.17 2.05 5.34 0 7.65-4.66 9.33-9.1 9.82.72.62 1.36 1.83 1.36 3.7 0 2.66-.02 4.81-.02 5.47 0 .53.37 1.15 1.38.96C38.28 40.32 44 32.84 44 24c0-11.05-8.95-20-20-20z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: app.color }}>
        {app.icon}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SubPageHeader title="Apps and Connectors" onBack={onBack} />
      <div className="p-5 space-y-4">
        {apps.map((app) => (
          <SectionCard key={app.id}>
            <div className="p-5">
              <div className="flex flex-col items-center text-center mb-4">
                <AppIcon app={app} />
                <h3 className="text-[15px] font-bold text-foreground mt-2">{app.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">{app.description}</p>
              </div>

              {app.connected && app.accounts.length > 0 && (
                <div className="mb-4 space-y-2">
                  {app.accounts.map((acc) => (
                    <div key={acc.email} className="flex items-center gap-2.5 px-3 py-2 bg-background rounded-lg border border-border">
                      <span className="flex-1 text-[12.5px] text-foreground">{acc.email}</span>
                      {acc.primary ? (
                        <Star size={13} className="text-primary fill-primary flex-shrink-0" />
                      ) : (
                        <Unlink size={13} className="text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-border rounded-lg text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                    <Plus size={12} />
                    Add Account
                  </button>
                </div>
              )}

              <button
                onClick={() => toggleConnect(app.id)}
                className={cn(
                  "w-full py-2.5 rounded-xl text-[13.5px] font-bold transition-all",
                  app.connected
                    ? "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500 border border-border"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {app.connected ? "Disconnect" : "Connect"}
              </button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function AiActionsPage({ onBack }: { onBack: () => void }) {
  const [actions, setActions] = useState(AI_ACTIONS_CONFIG);

  const toggle = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SubPageHeader title="AI Actions" onBack={onBack} />
      <div className="p-5 space-y-3">
        <p className="text-[12px] text-muted-foreground px-1 leading-relaxed">
          Control which AI-powered actions are active. Disabled actions will not run automatically.
        </p>
        <SectionCard>
          {actions.map((action, i) => (
            <div key={action.id}>
              {i > 0 && <Divider />}
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-foreground">{action.label}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <button
                  onClick={() => toggle(action.id)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0",
                    action.enabled ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
                    action.enabled ? "left-[22px]" : "left-0.5"
                  )} />
                </button>
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}

function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <SubPageHeader title="About This App" onBack={onBack} />
      <div className="p-5 space-y-4">
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-2xl font-black text-primary">S</span>
          </div>
          <div className="text-center">
            <h2 className="text-[17px] font-black text-foreground">SIMY</h2>
            <p className="text-[12px] text-muted-foreground">Action Intelligence Platform</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-bold text-foreground">3.0.0</span>
            <span className="text-sm text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded-full">AI Powered</span>
          </div>
        </div>

        <SectionCard>
          {[
            { label: "Terms of Service", icon: Shield },
            { label: "Privacy Policy", icon: Shield },
            { label: "Open Source Licenses", icon: Info },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <Divider />}
              <SettingsRow icon={item.icon} label={item.label} onClick={() => {}} />
            </div>
          ))}
        </SectionCard>

        <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
          © 2026 SIMY Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { currentUserId } = useUser();
  const MOCK_USER = MOCK_USERS[currentUserId] ?? MOCK_USERS.tetsuo;
  const [subPage, setSubPage] = useState<SubPage>(null);

  if (subPage === "usage") return <UsagePage onBack={() => setSubPage(null)} />;
  if (subPage === "purchase") return <PurchasePage onBack={() => setSubPage(null)} />;
  if (subPage === "email-blacklist") return <EmailBlacklistPage onBack={() => setSubPage(null)} />;
  if (subPage === "apps") return <AppsPage onBack={() => setSubPage(null)} />;
  if (subPage === "ai-actions") return <AiActionsPage onBack={() => setSubPage(null)} />;
  if (subPage === "about") return <AboutPage onBack={() => setSubPage(null)} />;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-[17px] font-black text-foreground">Settings</h1>
      </div>

      <div className="p-5 space-y-4">
        {/* Profile Card */}
        <SectionCard>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[15px] font-black text-primary">{MOCK_USER.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-bold text-foreground">{MOCK_USER.name}</p>
              <p className="text-[12px] text-muted-foreground">{MOCK_USER.email}</p>
            </div>
          </div>
          <Divider />
          <SettingsRow icon={Globe} label="Language" value={MOCK_USER.language} onClick={() => {}} />
        </SectionCard>

        {/* Account Section */}
        <SectionCard>
          <SettingsRow icon={BarChart2} label="Usage" onClick={() => setSubPage("usage")} />
          <Divider />
          <SettingsRow icon={Archive} label="Action Archive" value="14 days" onClick={() => {}} />
          <Divider />
          <SettingsRow icon={Coins} label="Purchase Tokens" onClick={() => setSubPage("purchase")} />
          <Divider />
          <SettingsRow icon={Bot} label="AI Actions" onClick={() => setSubPage("ai-actions")} />
          <Divider />
          <SettingsRow icon={Mail} label="Email Blacklist" onClick={() => setSubPage("email-blacklist")} />
        </SectionCard>

        {/* Auth Section */}
        <SectionCard>
          <SettingsRow icon={LogOut} label="Sign out" onClick={() => {}} />
          <Divider />
          <SettingsRow icon={Trash2} label="Delete account" onClick={() => {}} danger />
        </SectionCard>

        {/* Integrations */}
        <SectionCard>
          <SettingsRow icon={Link2} label="Apps and Connectors" onClick={() => setSubPage("apps")} />
        </SectionCard>

        {/* About */}
        <SectionCard>
          <SettingsRow icon={Info} label="About This App" onClick={() => setSubPage("about")} />
        </SectionCard>

        {/* Version */}
        <p className="text-sm text-muted-foreground text-center pb-2">
          SIMY v3.0 · AI Powered
        </p>
      </div>
    </div>
  );
}
