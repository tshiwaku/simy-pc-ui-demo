/**
 * AgentsListPage — SIMY PC UI
 * Design: "GALACTIC COMMAND" — Star Wars inspired sci-fi dark UI
 * Philosophy:
 *   - Deep space black (#050A14) base with nebula gradients
 *   - Holographic cyan/teal scan-line aesthetics
 *   - Monospace + Sora typography for terminal feel
 *   - Each agent is a "droid unit" with classification codes
 *   - Hexagonal motifs, radar-scan animations, status indicators
 *   - Imperial data terminal aesthetic with rebel energy
 */

import { useState, useEffect } from 'react';
import {
  Code2, Globe, Brain, BarChart3, FileText,
  MessageSquare, Shield, Rocket, Search,
  Plus, Check, Zap, Activity, Cpu,
  Radio, Radar, Crosshair, Wifi,
  ChevronRight, X, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Agent catalog data ────────────────────────────────────────────────

type AgentCategory = 'all' | 'development' | 'research' | 'writing' | 'analysis' | 'communication';

interface RelatedIssueRef {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'done';
}

interface CatalogAgent {
  id: string;
  name: string;
  unitCode: string;       // e.g. "R2-PR1"
  classification: string; // e.g. "COMBAT DROID — CLASS IV"
  tagline: string;
  description: string;
  category: AgentCategory;
  icon: React.ElementType;
  droidImage: string;     // CDN URL for droid icon image
  glowColor: string;      // CSS color for glow effect
  accentColor: string;    // hex for inline styles
  scanColor: string;      // scan line color
  capabilities: string[];
  stats: { label: string; value: string }[];
  usedBy: string[];
  isOfficial: boolean;
  tier: 'standard' | 'pro' | 'enterprise';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  powerLevel: number; // 0-100
  relatedIssues?: RelatedIssueRef[];
}

const catalogAgents: CatalogAgent[] = [
  {
    id: 'ag-oneshot',
    name: 'One-shot PR',
    unitCode: 'R2-PR1',
    classification: 'COMBAT UNIT — CLASS IV ENGINEER',
    tagline: 'Write code, submit PRs. That simple.',
    description: 'Automatically analyzes codebases, generates and modifies code based on requirements, and auto-creates Pull Requests. Fully integrated with CI/CD pipelines, significantly reducing time to code review.',
    category: 'development',
    icon: Code2,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-oneshot-pr-frWJcrMT72bKd7UHrDtEh4.webp',
    glowColor: 'rgba(99,102,241,0.6)',
    accentColor: '#818CF8',
    scanColor: '#6366F1',
    capabilities: ['Code Generation', 'Auto PR Creation', 'CI/CD Integration', 'Code Review', 'Repository Analysis'],
    stats: [
      { label: 'AVG CYCLE', value: '8 MIN' },
      { label: 'ADOPTION', value: '87%' },
      { label: 'MISSIONS', value: '142' },
    ],
    usedBy: ['TS', 'KM', 'RN'],
    isOfficial: true,
    tier: 'pro',
    threatLevel: 'HIGH',
    powerLevel: 87,
    relatedIssues: [
      { id: 'iss-2', title: 'SIMYプロダクトの市場適合加速', status: 'active' },
    ],
  },
  {
    id: 'ag-manus',
    name: 'Manus',
    unitCode: 'MN-7X',
    classification: 'RECON UNIT — CLASS III SCOUT',
    tagline: 'Research, summarize, report. The all-purpose AI.',
    description: 'Web Research, information gathering, data organization, and report creation. A general-purpose AI Agent that autonomously breaks down and executes complex research tasks.',
    category: 'research',
    icon: Globe,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-manus-JojzVtek8SBjKJ6ut9dMFm.webp',
    glowColor: 'rgba(16,185,129,0.6)',
    accentColor: '#34D399',
    scanColor: '#10B981',
    capabilities: ['Web Research', 'Information Gathering', 'Report Generation', 'Data Organization', 'Multi-step Tasks'],
    stats: [
      { label: 'AVG CYCLE', value: '23 MIN' },
      { label: 'ADOPTION', value: '79%' },
      { label: 'MISSIONS', value: '98' },
    ],
    usedBy: ['TS', 'AY', 'HK'],
    isOfficial: true,
    tier: 'standard',
    threatLevel: 'MEDIUM',
    powerLevel: 79,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
      { id: 'iss-2', title: 'SIMYプロダクトの市場適合加速', status: 'active' },
    ],
  },
  {
    id: 'ag-claude',
    name: 'Claude Coworker',
    unitCode: 'CL-3PO',
    classification: 'PROTOCOL UNIT — CLASS V ANALYST',
    tagline: 'Read, think, write. Your thinking partner.',
    description: 'An AI agent specialized in tasks requiring deep thinking: code review, document generation, long-form analysis and summarization, and structuring complex problems.',
    category: 'writing',
    icon: Brain,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-claude-bU3wkbQ73Kp9iT6MHjCDWQ.webp',
    glowColor: 'rgba(245,158,11,0.6)',
    accentColor: '#FCD34D',
    scanColor: '#F59E0B',
    capabilities: ['Code Review', 'Document Generation', 'Long-form Analysis', 'Summarization', 'Structured Thinking'],
    stats: [
      { label: 'AVG CYCLE', value: '15 MIN' },
      { label: 'ADOPTION', value: '83%' },
      { label: 'MISSIONS', value: '76' },
    ],
    usedBy: ['TS', 'KM'],
    isOfficial: true,
    tier: 'pro',
    threatLevel: 'HIGH',
    powerLevel: 83,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
    ],
  },
  {
    id: 'ag-databot',
    name: 'DataBot',
    unitCode: 'DB-9',
    classification: 'INTELLIGENCE UNIT — CLASS II ORACLE',
    tagline: 'Let data speak. The translator of numbers.',
    description: 'Automatically analyzes CSV and spreadsheet data, extracts insights, and generates visualizations. Provides data-driven insights needed for management decisions.',
    category: 'analysis',
    icon: BarChart3,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-databot-XHinE7PQkJbWSkmQYbJpUg.webp',
    glowColor: 'rgba(6,182,212,0.6)',
    accentColor: '#22D3EE',
    scanColor: '#06B6D4',
    capabilities: ['Data Analysis', 'Chart Generation', 'KPI Tracking', 'Anomaly Detection', 'Report Automation'],
    stats: [
      { label: 'AVG CYCLE', value: '12 MIN' },
      { label: 'ADOPTION', value: '91%' },
      { label: 'MISSIONS', value: '54' },
    ],
    usedBy: ['HK', 'TS'],
    isOfficial: false,
    tier: 'enterprise',
    threatLevel: 'CRITICAL',
    powerLevel: 91,
  },
  {
    id: 'ag-scribe',
    name: 'Scribe',
    unitCode: 'SC-1B',
    classification: 'MEDICAL UNIT — CLASS I RECORDER',
    tagline: 'From meeting minutes to specs. Writing is the job.',
    description: 'Automatically generates meeting minutes from recordings and text, and extracts action items. Also excels at creating specs, proposals, and manuals.',
    category: 'writing',
    icon: FileText,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-scribe-StK5QrpZaqsBXeQdL2U2Yi.webp',
    glowColor: 'rgba(244,63,94,0.6)',
    accentColor: '#FB7185',
    scanColor: '#F43F5E',
    capabilities: ['Meeting Minutes Generation', 'Action Item Extraction', 'Spec Writing', 'Proposal Generation', 'Translation'],
    stats: [
      { label: 'AVG CYCLE', value: '5 MIN' },
      { label: 'ADOPTION', value: '94%' },
      { label: 'MISSIONS', value: '203' },
    ],
    usedBy: ['TS', 'AY', 'RN', 'HK'],
    isOfficial: false,
    tier: 'standard',
    threatLevel: 'LOW',
    powerLevel: 94,
  },
  {
    id: 'ag-relay',
    name: 'Relay',
    unitCode: 'RL-88',
    classification: 'COMM UNIT — CLASS III LIAISON',
    tagline: 'Connecting teams. The bridge of communication.',
    description: 'Handles message forwarding, summarization, and notification automation across Slack, email, Notion, and other tools. Eliminates information loss between teams.',
    category: 'communication',
    icon: MessageSquare,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-relay-8dxTVEntcx4VbfEWj6dDwc.webp',
    glowColor: 'rgba(139,92,246,0.6)',
    accentColor: '#A78BFA',
    scanColor: '#8B5CF6',
    capabilities: ['Slack Integration', 'Email Automation', 'Notion Sync', 'Notification Management', 'Summary Delivery'],
    stats: [
      { label: 'AVG CYCLE', value: '2 MIN' },
      { label: 'ADOPTION', value: '88%' },
      { label: 'MISSIONS', value: '312' },
    ],
    usedBy: ['RN', 'AY'],
    isOfficial: false,
    tier: 'standard',
    threatLevel: 'MEDIUM',
    powerLevel: 88,
  },
  {
    id: 'ag-sentinel',
    name: 'Sentinel',
    unitCode: 'ST-4K',
    classification: 'SECURITY UNIT — CLASS VI GUARDIAN',
    tagline: '24/7 monitoring. The guardian that misses nothing.',
    description: 'Continuously monitors system logs, error rates, and performance metrics, instantly issuing alerts when anomalies are detected. Also automates the initial response to incidents.',
    category: 'development',
    icon: Shield,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-sentinel-6xwDuUE8iE4Koz7quCFYhu.webp',
    glowColor: 'rgba(148,163,184,0.6)',
    accentColor: '#94A3B8',
    scanColor: '#64748B',
    capabilities: ['Log Monitoring', 'Anomaly Detection', 'Alert Issuance', 'Incident First Response', 'SLO Tracking'],
    stats: [
      { label: 'RESPONSE', value: '30 SEC' },
      { label: 'ACCURACY', value: '99.2%' },
      { label: 'WATCHING', value: '7 SYS' },
    ],
    usedBy: ['KM'],
    isOfficial: false,
    tier: 'enterprise',
    threatLevel: 'CRITICAL',
    powerLevel: 99,
  },
  {
    id: 'ag-launchpad',
    name: 'Launchpad',
    unitCode: 'LP-X1',
    classification: 'ASSAULT UNIT — CLASS V VANGUARD',
    tagline: 'From ideas to product. The driving force of planning.',
    description: 'Receives new feature ideas and automates competitive research, user story creation, and priority scoring. The accelerator of product management.',
    category: 'analysis',
    icon: Rocket,
    droidImage: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/agent-launchpad-C5ZYTk3QDiD3n3D9EfxPhp.webp',
    glowColor: 'rgba(249,115,22,0.6)',
    accentColor: '#FB923C',
    scanColor: '#F97316',
    capabilities: ['Competitive Research', 'User Story Generation', 'Priority Scoring', 'Roadmap Creation', 'Release Notes'],
    stats: [
      { label: 'AVG CYCLE', value: '35 MIN' },
      { label: 'ADOPTION', value: '72%' },
      { label: 'MISSIONS', value: '28' },
    ],
    usedBy: ['TS', 'RN'],
    isOfficial: false,
    tier: 'pro',
    threatLevel: 'HIGH',
    powerLevel: 72,
  },
];

const categoryLabels: { id: AgentCategory; label: string; code: string }[] = [
  { id: 'all', label: 'ALL UNITS', code: 'SYS-00' },
  { id: 'development', label: 'ENGINEERING', code: 'ENG-01' },
  { id: 'research', label: 'RECON', code: 'RCN-02' },
  { id: 'writing', label: 'PROTOCOL', code: 'PRT-03' },
  { id: 'analysis', label: 'INTEL', code: 'INT-04' },
  { id: 'communication', label: 'COMMS', code: 'COM-05' },
];

const tierConfig = {
  standard: { label: 'STD', color: '#64748B' },
  pro: { label: 'PRO', color: '#818CF8' },
  enterprise: { label: 'ENT', color: '#FCD34D' },
};

const threatConfig = {
  LOW: { label: 'LOW', color: '#34D399', blink: false },
  MEDIUM: { label: 'MED', color: '#FCD34D', blink: false },
  HIGH: { label: 'HIGH', color: '#FB923C', blink: true },
  CRITICAL: { label: 'CRIT', color: '#F43F5E', blink: true },
};

// ─── Scanline overlay component ────────────────────────────────────────

function ScanLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.015) 2px, rgba(0,255,200,0.015) 4px)',
      }}
    />
  );
}

// ─── Power bar ─────────────────────────────────────────────────────────

function PowerBar({ value, color }: { value: number; color: string }) {
  const segments = 10;
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="h-2 w-2.5 rounded-sm transition-all duration-300"
          style={{
            background: i < filled ? color : 'rgba(255,255,255,0.08)',
            boxShadow: i < filled ? `0 0 4px ${color}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─── Hex badge ─────────────────────────────────────────────────────────

function HexBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center text-sm font-mono font-bold px-2 py-0.5 rounded"
      style={{
        color,
        border: `1px solid ${color}60`,
        background: `${color}15`,
        letterSpacing: '0.1em',
      }}
    >
      {label}
    </span>
  );
}

// ─── Agent Detail Modal ─────────────────────────────────────────────────

function AgentDetailModal({
  agent,
  isAdded,
  onAdd,
  onClose,
}: {
  agent: CatalogAgent;
  isAdded: boolean;
  onAdd: () => void;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const threat = threatConfig[agent.threatLevel];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-[620px] overflow-hidden rounded-2xl"
        style={{
          background: isDark ? 'linear-gradient(135deg, #0A0F1E 0%, #050A14 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)',
          border: `1px solid ${agent.accentColor}40`,
          boxShadow: isDark ? `0 0 60px ${agent.glowColor}, 0 0 120px ${agent.glowColor}50, inset 0 1px 0 ${agent.accentColor}30` : `0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 ${agent.accentColor}30`,
        }}
      >
        <ScanLines />

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${agent.accentColor}, transparent)` }} />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: agent.accentColor }} />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: agent.accentColor }} />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: agent.accentColor }} />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: agent.accentColor }} />

        <div className="relative z-10 p-7">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            {/* Droid image */}
            <div
              className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                border: `1px solid ${agent.accentColor}50`,
                boxShadow: `0 0 24px ${agent.glowColor}`,
                background: `radial-gradient(circle at 40% 40%, ${agent.accentColor}20, rgba(5,10,20,0.9))`,
              }}
            >
              <img
                src={agent.droidImage}
                alt={agent.name}
                className="w-full h-full object-cover"
                style={{ mixBlendMode: 'screen', opacity: 0.95 }}
              />
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ border: `1px solid ${agent.accentColor}` }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm mb-1" style={{ color: agent.accentColor, letterSpacing: '0.15em', opacity: isDark ? 1 : 0.85 }}>
                UNIT ID: {agent.unitCode}
              </div>
              <h2 className="text-[22px] font-bold mb-0.5" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'white' : '#0f172a" }}>
                {agent.name}
              </h2>
              <div className="font-mono text-sm mb-2" style={{ letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                {agent.classification}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {agent.isOfficial && (
                  <HexBadge label="◆ OFFICIAL" color={agent.accentColor} />
                )}
                <HexBadge label={tierConfig[agent.tier].label} color={tierConfig[agent.tier].color} />
                <HexBadge label={`THREAT: ${threat.label}`} color={threat.color} />
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Power level */}
          <div className="mb-5 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm" style={{ letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>POWER LEVEL</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: agent.accentColor }}>{agent.powerLevel}%</span>
            </div>
            <PowerBar value={agent.powerLevel} color={agent.accentColor} />
          </div>

          {/* Tagline */}
          <div
            className="mb-5 p-4 rounded-xl"
            style={{ background: `${agent.accentColor}08`, border: `1px solid ${agent.accentColor}25` }}
          >
            <p className="text-[13px] italic leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)' }}>"{agent.tagline}"</p>
          </div>

          {/* Description */}
          <p className="text-[13px] leading-relaxed mb-5 line-clamp-3" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{agent.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {agent.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${agent.accentColor}25` }}
              >
                <div className="font-mono text-[16px] font-bold mb-0.5" style={{ color: agent.accentColor }}>
                  {stat.value}
                </div>
                <div className="font-mono text-sm" style={{ letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div className="mb-6">
            <div className="font-mono text-sm mb-2" style={{ letterSpacing: '0.15em', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>
              ▸ CAPABILITIES
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-sm px-2.5 py-1 rounded font-mono"
                  style={{ color: agent.accentColor, background: `${agent.accentColor}12`, border: `1px solid ${agent.accentColor}30` }}
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Related Issues */}
          {agent.relatedIssues && agent.relatedIssues.length > 0 && (
            <div className="mb-6">
              <div className="font-mono text-sm mb-2" style={{ letterSpacing: '0.15em', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>
                ▸ RELATED ISSUES
              </div>
              <div className="flex flex-col gap-1.5">
                {agent.relatedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: `${agent.accentColor}08`, border: `1px solid ${agent.accentColor}20` }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${issue.status === 'active' ? 'bg-emerald-500' : issue.status === 'paused' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-[12px] font-medium flex-1" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)' }}>{issue.title}</span>
                    <span
                      className="text-sm font-mono px-1.5 py-0.5 rounded"
                      style={{ color: agent.accentColor, background: `${agent.accentColor}15`, border: `1px solid ${agent.accentColor}30` }}
                    >
                      {issue.status === 'active' ? '進行中' : issue.status === 'paused' ? '一時停止' : '完了'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => { onAdd(); onClose(); }}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-200 flex items-center justify-center gap-2 font-mono"
            style={isAdded ? {
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.4)',
              color: '#34D399',
              letterSpacing: '0.1em',
            } : {
              background: `linear-gradient(135deg, ${agent.accentColor}30, ${agent.accentColor}15)`,
              border: `1px solid ${agent.accentColor}60`,
              color: agent.accentColor,
              boxShadow: `0 0 20px ${agent.glowColor}`,
              letterSpacing: '0.1em',
            }}
          >
            {isAdded ? (
              <><Check size={15} /> UNIT DEPLOYED — CLICK TO RECALL</>
            ) : (
              <><Plus size={15} /> DEPLOY TO MY AGENTS</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Card ─────────────────────────────────────────────────────────

function AgentCard({
  agent,
  isAdded,
  onAdd,
  onOpenDetail,
}: {
  agent: CatalogAgent;
  isAdded: boolean;
  onAdd: () => void;
  onOpenDetail: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const threat = threatConfig[agent.threatLevel];

  return (
    <div
      className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300"
      style={{
        background: isDark ? 'linear-gradient(135deg, #0D1526 0%, #080D1A 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        border: isAdded
          ? `1px solid ${agent.accentColor}70`
          : isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isAdded
          ? `0 0 20px ${agent.glowColor}, inset 0 0 20px ${agent.accentColor}05`
          : isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      onClick={onOpenDetail}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${agent.glowColor}, inset 0 0 30px ${agent.accentColor}08`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.accentColor}60`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (!isAdded) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)';
          (e.currentTarget as HTMLDivElement).style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
        } else {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${agent.glowColor}, inset 0 0 20px ${agent.accentColor}05`;
          (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.accentColor}70`;
        }
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      <ScanLines />

      {/* Top glow line */}
      <div
        className="h-px w-full"
        style={{ background: `linear-gradient(90deg, transparent 10%, ${agent.accentColor}80 50%, transparent 90%)` }}
      />

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-full h-full"
          style={{
            background: `linear-gradient(225deg, ${agent.accentColor}30 0%, transparent 60%)`,
          }}
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Unit code + threat */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm" style={{ color: agent.accentColor, letterSpacing: '0.15em', opacity: 0.7 }}>
            {agent.unitCode}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: threat.color,
                boxShadow: `0 0 4px ${threat.color}`,
                animation: threat.blink ? 'pulse 1.5s infinite' : 'none',
              }}
            />
            <span className="font-mono text-sm" style={{ color: threat.color, letterSpacing: '0.1em' }}>
              {threat.label}
            </span>
          </div>
        </div>

        {/* Droid image + name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
            style={{
              border: `1px solid ${agent.accentColor}40`,
              boxShadow: `0 0 12px ${agent.glowColor}`,
              background: `radial-gradient(circle at 40% 40%, ${agent.accentColor}20, rgba(5,10,20,0.9))`,
            }}
          >
            <img
              src={agent.droidImage}
              alt={agent.name}
              className="w-full h-full object-cover"
              style={{ mixBlendMode: 'screen', opacity: 0.95 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold mb-0.5" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'white' : '#0f172a" }}>
              {agent.name}
            </div>
            <div className="font-mono text-sm leading-snug" style={{ letterSpacing: '0.08em', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)' }}>
              {agent.classification}
            </div>
          </div>
          {/* Deploy button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={isAdded ? {
              background: 'rgba(52,211,153,0.15)',
              border: '1px solid rgba(52,211,153,0.4)',
              color: '#34D399',
            } : {
              background: `${agent.accentColor}10`,
              border: `1px solid ${agent.accentColor}30`,
              color: agent.accentColor,
            }}
            title={isAdded ? 'Remove from My Agents' : 'Add to My Agents'}
          >
            {isAdded ? <Check size={13} /> : <Plus size={13} />}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-sm leading-snug mb-3 italic" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)' }}>
          {agent.tagline}
        </p>

        {/* Power bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-sm" style={{ letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)' }}>PWR</span>
            <span className="font-mono text-sm font-bold" style={{ color: agent.accentColor }}>{agent.powerLevel}%</span>
          </div>
          <PowerBar value={agent.powerLevel} color={agent.accentColor} />
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-sm px-2 py-0.5 rounded font-mono"
              style={{ color: agent.accentColor, background: `${agent.accentColor}10`, border: `1px solid ${agent.accentColor}25` }}
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-sm px-2 py-0.5 rounded font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>

        {/* Related Issues */}
        {agent.relatedIssues && agent.relatedIssues.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {agent.relatedIssues.map((issue) => (
              <span
                key={issue.id}
                className="inline-flex items-center gap-1 text-sm font-mono px-1.5 py-0.5 rounded"
                style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                ● {issue.title.length > 18 ? issue.title.slice(0, 18) + '…' : issue.title}
              </span>
            ))}
          </div>
        )}

        {/* Stats footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-3">
            {agent.stats.slice(0, 2).map((stat) => (
              <div key={stat.label} className="flex items-center gap-1">
                <span className="font-mono text-sm" style={{ letterSpacing: '0.08em', color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)' }}>{stat.label}:</span>
                <span className="font-mono text-sm font-bold" style={{ color: agent.accentColor }}>{stat.value}</span>
              </div>
            ))}
          </div>
          <ChevronRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: `${agent.accentColor}60` }}
          />
        </div>
      </div>

      {/* Deployed badge */}
      {isAdded && (
        <div
          className="absolute top-2.5 left-1/2 -translate-x-1/2 font-mono text-[8px] font-bold px-2 py-0.5 rounded"
          style={{
            background: 'rgba(52,211,153,0.15)',
            border: '1px solid rgba(52,211,153,0.4)',
            color: '#34D399',
            letterSpacing: '0.15em',
          }}
        >
          ◆ DEPLOYED
        </div>
      )}
    </div>
  );
}

// ─── Ticker component ──────────────────────────────────────────────────

function DataTicker() {
  const items = [
    'GALACTIC COMMAND NETWORK — ONLINE',
    'AGENT REGISTRY v4.2.1 — LOADED',
    'ENCRYPTION: AES-256 — ACTIVE',
    'UPLINK STATUS: NOMINAL',
    'THREAT ASSESSMENT: ELEVATED',
    'FORCE SENSITIVITY: DETECTED',
  ];
  return (
    <div
      className="overflow-hidden font-mono text-sm py-1.5 px-4"
      style={{
        background: 'rgba(0,255,200,0.04)',
        borderBottom: '1px solid rgba(0,255,200,0.1)',
        color: 'rgba(0,255,200,0.5)',
        letterSpacing: '0.12em',
      }}
    >
      <div className="flex items-center gap-8 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            <span style={{ color: 'rgba(0,255,200,0.3)' }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function AgentsListPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [categoryFilter, setCategoryFilter] = useState<AgentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [myAgentIds, setMyAgentIds] = useState<Set<string>>(
    new Set(['ag-oneshot', 'ag-manus', 'ag-claude'])
  );
  const [selectedAgent, setSelectedAgent] = useState<CatalogAgent | null>(null);
  const [tick, setTick] = useState(0);

  // Simulate live data
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const filteredAgents = catalogAgents.filter((a) => {
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.tagline.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.capabilities.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  const toggleAgent = (agentId: string, agentName: string) => {
    setMyAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
        toast.info(`${agentName} — UNIT RECALLED FROM DEPLOYMENT`);
      } else {
        next.add(agentId);
        toast.success(`${agentName} — UNIT DEPLOYED SUCCESSFULLY`);
      }
      return next;
    });
  };

  return (
    <div
      className="h-full overflow-y-auto relative"
      style={{ background: isDark ? 'linear-gradient(160deg, #050A14 0%, #080D1A 50%, #050A14 100%)' : 'linear-gradient(160deg, #f0f4ff 0%, #f8faff 50%, #f0f4ff 100%)' }}
    >
      {/* Global scan lines */}
      <ScanLines />

      {/* Star field background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 60%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.1) 0%, transparent 100%),
            radial-gradient(2px 2px at 35% 15%, rgba(255,255,255,0.2) 0%, transparent 100%),
            radial-gradient(2px 2px at 65% 85%, rgba(255,255,255,0.15) 0%, transparent 100%)
          `,
        }}
      />

      {/* Nebula glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-20%', left: '-10%', width: '60%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-20%', right: '-10%', width: '60%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Ticker */}
      <div className="relative z-10">
        <DataTicker />
      </div>

      {/* Page Header */}
      <div
        className="sticky top-0 z-20 px-8 py-5"
        style={{
          background: isDark ? 'rgba(5,10,20,0.92)' : 'rgba(240,244,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: isDark ? '1px solid rgba(0,255,200,0.08)' : '1px solid rgba(99,102,241,0.12)',
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {/* System label */}
            <div
              className="font-mono text-sm mb-2 flex items-center gap-2"
              style={{ color: isDark ? 'rgba(0,255,200,0.5)' : 'rgba(99,102,241,0.8)', letterSpacing: '0.2em' }}
            >
              <Radio size={10} />
              GALACTIC COMMAND — AGENT REGISTRY
            </div>
            <h1
              className="text-[26px] font-bold mb-1"
              style={{ fontFamily: "'Sora', sans-serif", color: isDark ? 'white' : '#0f172a', textShadow: isDark ? '0 0 30px rgba(99,102,241,0.5)' : 'none' }}
            >
              AGENTS LIST
            </h1>
            <p className="text-[12px] font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)', letterSpacing: '0.08em' }}>
              AI units deployed in the organization — select a unit to deploy
            </p>
          </div>

          {/* Deployed count */}
          <div
            className="flex-shrink-0 px-5 py-3 rounded-xl font-mono"
            style={{
              background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              boxShadow: isDark ? '0 0 20px rgba(52,211,153,0.1)' : 'none',
            }}
          >
            <div className="text-sm mb-1" style={{ color: 'rgba(52,211,153,0.6)', letterSpacing: '0.15em' }}>
              DEPLOYED UNITS
            </div>
            <div className="text-[22px] font-bold text-center" style={{ color: '#34D399', textShadow: '0 0 10px rgba(52,211,153,0.5)' }}>
              {myAgentIds.size}
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,255,200,0.4)' }} />
            <input
              type="text"
              placeholder="SEARCH UNITS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] font-mono outline-none transition-all"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
                border: isDark ? '1px solid rgba(0,255,200,0.15)' : '1px solid rgba(99,102,241,0.2)',
                borderRadius: '8px',
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                letterSpacing: '0.08em',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = isDark ? 'rgba(0,255,200,0.4)' : 'rgba(99,102,241,0.5)'; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = isDark ? 'rgba(0,255,200,0.15)' : 'rgba(99,102,241,0.2)'; }}
            />
          </div>

          {/* Category filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categoryLabels.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className="px-3 py-1.5 rounded text-sm font-mono font-bold transition-all duration-200"
                style={categoryFilter === cat.id ? {
                  background: isDark ? 'rgba(0,255,200,0.12)' : 'rgba(99,102,241,0.12)',
                  border: isDark ? '1px solid rgba(0,255,200,0.4)' : '1px solid rgba(99,102,241,0.4)',
                  color: isDark ? 'rgba(0,255,200,0.9)' : 'rgba(79,70,229,0.9)',
                  letterSpacing: '0.12em',
                  boxShadow: isDark ? '0 0 10px rgba(0,255,200,0.15)' : 'none',
                } : {
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                  color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.45)',
                  letterSpacing: '0.12em',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="relative z-10 px-8 py-3 flex items-center gap-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        {[
          { icon: Cpu, label: `${catalogAgents.length} TOTAL UNITS`, color: 'rgba(255,255,255,0.3)' },
          { icon: Zap, label: `${catalogAgents.filter(a => a.isOfficial).length} OFFICIAL`, color: '#818CF8' },
          { icon: Activity, label: `${myAgentIds.size} DEPLOYED`, color: '#34D399' },
          { icon: Crosshair, label: `${filteredAgents.length} VISIBLE`, color: 'rgba(0,255,200,0.6)' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon size={11} style={{ color }} />
            <span className="font-mono text-sm" style={{ color, letterSpacing: '0.1em' }}>{label}</span>
          </div>
        ))}

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#34D399', boxShadow: '0 0 6px #34D399', animation: 'pulse 2s infinite' }}
          />
          <span className="font-mono text-sm" style={{ color: 'rgba(52,211,153,0.6)', letterSpacing: '0.12em' }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="relative z-10 px-8 py-6">
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertTriangle size={36} className="mb-3" style={{ color: 'rgba(0,255,200,0.2)' }} />
            <div className="font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              NO UNITS FOUND — ADJUST SEARCH PARAMETERS
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isAdded={myAgentIds.has(agent.id)}
                onAdd={() => toggleAgent(agent.id, agent.name)}
                onOpenDetail={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          isAdded={myAgentIds.has(selectedAgent.id)}
          onAdd={() => toggleAgent(selectedAgent.id, selectedAgent.name)}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
