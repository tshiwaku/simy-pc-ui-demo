/**
 * TeamPage — SIMY PC UI
 * Design: "Dodgers Spirit" — Dark navy × Royal blue × White
 * Layout: Hero banner (full team) + Team goals + Member card grid
 * Concept: Unity toward a common goal, baseball team roster feel
 */

import { useState, useEffect } from 'react';
import {
  Target, Trophy, Zap, Users, CheckCircle2,
  TrendingUp, Star, ChevronRight, Bot,
  Activity, Award, Flame, Shield, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

// ─── CDN URLs ───────────────────────────────────────────────────────────
const MEMBER_IMAGES = {
  member1: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/member1_de91f851.png',
  member2: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/member2_db16226e.png',
  member3: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/member3_be654a16.png',
  member4: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/member4_281b9994.png',
  member5: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663370063462/SSsyDBzDHHVsxofYK5pCGp/member5_49795894.png',
};

// ─── Team Data ─────────────────────────────────────────────────────────
interface RelatedIssueRef {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'done';
}

interface TeamMember {
  id: string;
  nameJa: string;
  nameEn: string;
  role: string;
  number: number;
  image: string;
  department: string;
  bio: string;
  strengths: string[];
  stats: { label: string; value: string; icon: React.ElementType }[];
  currentActions: number;
  completedActions: number;
  aiUsage: number;
  aiAdoptionRate: number;
  agents: string[];
  isOnline: boolean;
  isMvp?: boolean;
  relatedIssues?: RelatedIssueRef[];
}

const teamMembers: TeamMember[] = [
  {
    id: 'ts',
    nameJa: 'Robert Callahan',
    nameEn: 'Robert Callahan',
    role: 'Product Manager',
    number: 1,
    image: MEMBER_IMAGES.member1,
    department: 'Leadership',
    bio: 'The team compass. Defines the product vision and ensures everyone rows in the same direction.',
    strengths: ['Strategy', 'Stakeholder Mgmt', 'Product Design'],
    stats: [
      { label: 'Actions', value: '38', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '87%', icon: Bot },
      { label: 'Completion', value: '94%', icon: Trophy },
    ],
    currentActions: 5,
    completedActions: 38,
    aiUsage: 142,
    aiAdoptionRate: 87,
    agents: ['One-shot PR', 'Manus', 'Claude'],
    isOnline: true,
    isMvp: true,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
      { id: 'iss-2', title: 'SIMYプロダクトの市場適合加速', status: 'active' },
    ],
  },
  {
    id: 'km',
    nameJa: 'Marcus Webb',
    nameEn: 'Marcus Webb',
    role: 'Engineering Lead',
    number: 7,
    image: MEMBER_IMAGES.member2,
    department: 'Engineering',
    bio: 'A craftsman who solves problems with code. Drives technical decisions and engineering culture.',
    strengths: ['System Design', 'Code Review', 'CI/CD'],
    stats: [
      { label: 'Actions', value: '29', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '83%', icon: Bot },
      { label: 'Completion', value: '91%', icon: Trophy },
    ],
    currentActions: 3,
    completedActions: 29,
    aiUsage: 98,
    aiAdoptionRate: 83,
    agents: ['One-shot PR', 'Sentinel'],
    isOnline: true,
    relatedIssues: [
      { id: 'iss-2', title: 'SIMYプロダクトの市場適合加速', status: 'active' },
    ],
  },
  {
    id: 'ay',
    nameJa: 'Danielle Brooks',
    nameEn: 'Danielle Brooks',
    role: 'Marketing Manager',
    number: 23,
    image: MEMBER_IMAGES.member3,
    department: 'Marketing',
    bio: 'Crafts the brand voice and brings it to market. A strategist who moves markets with data and instinct.',
    strengths: ['Content Strategy', 'Data Analysis', 'Branding'],
    stats: [
      { label: 'Actions', value: '22', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '79%', icon: Bot },
      { label: 'Completion', value: '88%', icon: Trophy },
    ],
    currentActions: 4,
    completedActions: 22,
    aiUsage: 76,
    aiAdoptionRate: 79,
    agents: ['Manus', 'Relay'],
    isOnline: false,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
    ],
  },
  {
    id: 'rn',
    nameJa: 'Sophia Reyes',
    nameEn: 'Sophia Reyes',
    role: 'Sales Manager',
    number: 11,
    image: MEMBER_IMAGES.member4,
    department: 'Sales',
    bio: "Builds trust with customers and drives the business growth engine. The team's energy booster.",
    strengths: ['Business Dev', 'Presentations', 'Team Building'],
    stats: [
      { label: 'Actions', value: '31', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '91%', icon: Bot },
      { label: 'Completion', value: '96%', icon: Trophy },
    ],
    currentActions: 2,
    completedActions: 31,
    aiUsage: 112,
    aiAdoptionRate: 91,
    agents: ['Scribe', 'Launchpad', 'Relay'],
    isOnline: true,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
    ],
  },
  {
    id: 'hk',
    nameJa: 'Derek Fontaine',
    nameEn: 'Derek Fontaine',
    role: 'Data Analyst',
    number: 44,
    image: MEMBER_IMAGES.member5,
    department: 'Strategy',
    bio: "Uncovers the truth hidden in numbers. Raises the team's win rate through data-driven decisions.",
    strengths: ['Data Viz', 'KPI Design', 'Predictive Analytics'],
    stats: [
      { label: 'Actions', value: '18', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '94%', icon: Bot },
      { label: 'Completion', value: '89%', icon: Trophy },
    ],
    currentActions: 1,
    completedActions: 18,
    aiUsage: 54,
    aiAdoptionRate: 94,
    agents: ['DataBot', 'Manus'],
    isOnline: true,
    relatedIssues: [
      { id: 'iss-1', title: '今年度10ミリオンUSDの売上達成', status: 'active' },
      { id: 'iss-2', title: 'SIMYプロダクトの市場適合加速', status: 'active' },
    ],
  },
];

const teamGoal = {
  title: 'Q2 Product Growth × ARR 150% Achievement',
  deadline: 'June 30, 2026',
  progress: 62,
  milestones: [
    { label: 'New Feature Release', done: true },
    { label: 'User Acquisition +2,000', done: true },
    { label: 'ARR 120% Achievement', done: false },
    { label: 'International Expansion Prep', done: false },
  ],
};

// ─── Member Detail Panel ────────────────────────────────────────────────
function MemberDetailPanel({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[400px] rounded-2xl overflow-hidden shadow-2xl border"
        style={{ background: isDark ? 'oklch(0.13 0.03 264)' : 'oklch(1.00 0 0)', borderColor: isDark ? 'oklch(0.28 0.1 264)' : 'oklch(0.88 0.02 264)' }}
      >
        {/* Header with photo */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0" style={{
            background: isDark ? 'linear-gradient(135deg, oklch(0.32 0.14 264), oklch(0.18 0.06 264))' : 'linear-gradient(135deg, oklch(0.82 0.10 264), oklch(0.92 0.05 264))'
          }} />
          {/* Jersey number watermark */}
          <div className="absolute top-2 left-4 text-[80px] font-black leading-none select-none"
            style={{ color: 'oklch(1 0 0 / 7%)', fontFamily: "'Sora', sans-serif" }}>
            #{member.number}
          </div>
          <img
            src={member.image}
            alt={member.nameEn}
            className="absolute bottom-0 right-4 w-[52%] object-contain object-bottom"
            style={{ maxHeight: '260px' }}
          />
          <div className="absolute bottom-4 left-5">
            {member.isMvp && (
              <span className="inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full mb-2 text-amber-900"
                style={{ background: 'oklch(0.85 0.15 80)' }}>
                <Star size={9} fill="currentColor" /> MVP
              </span>
            )}
               <div className="text-[20px] font-bold" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.15 0.04 264)" }}>
            {member.nameEn}
          </div>
          <div className="text-[12px]" style={{ color: 'oklch(0.7 0.1 264)' }}>{member.role}</div>
          </div>
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: isDark ? 'oklch(0.72 0.05 264)' : 'oklch(0.35 0.05 264)' }}>
            {member.bio}
          </p>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {member.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl p-3 text-center border"
                  style={{ background: isDark ? 'oklch(0.19 0.05 264)' : 'oklch(0.95 0.03 264)', borderColor: isDark ? 'oklch(0.28 0.08 264)' : 'oklch(0.85 0.05 264)' }}>
                  <Icon size={13} className="mx-auto mb-1" style={{ color: 'oklch(0.62 0.16 264)' }} />
                  <div className="text-[15px] font-bold" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.15 0.04 264)" }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: isDark ? 'oklch(0.52 0.05 264)' : 'oklch(0.45 0.06 264)' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
          {/* Strengths */}
          <div className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? 'oklch(0.48 0.08 264)' : 'oklch(0.40 0.10 264)' }}>
              Expertise
            </div>
            <div className="flex flex-wrap gap-1.5">
              {member.strengths.map((s) => (
                <span key={s} className="text-[12px] px-2.5 py-1 rounded-full border"
                  style={{ borderColor: isDark ? 'oklch(0.32 0.1 264)' : 'oklch(0.75 0.12 264)', background: isDark ? 'oklch(0.2 0.06 264)' : 'oklch(0.93 0.05 264)', color: isDark ? 'oklch(0.78 0.08 264)' : 'oklch(0.35 0.12 264)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          {/* Agents */}
          <div className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? 'oklch(0.48 0.08 264)' : 'oklch(0.40 0.10 264)' }}>
              Agents in Use
            </div>
            <div className="flex flex-wrap gap-1.5">
              {member.agents.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 text-sm px-2 py-0.5 rounded-full"
                  style={{ background: isDark ? 'oklch(0.28 0.12 264)' : 'oklch(0.88 0.08 264)', color: isDark ? 'oklch(0.78 0.12 264)' : 'oklch(0.35 0.14 264)' }}>
                  <Bot size={9} /> {a}
                </span>
              ))}
            </div>
          </div>
          {/* Related Issues */}
          {member.relatedIssues && member.relatedIssues.length > 0 && (
            <div>
              <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? 'oklch(0.48 0.08 264)' : 'oklch(0.40 0.10 264)' }}>
                取り組んでいるイシュー
              </div>
              <div className="flex flex-col gap-1.5">
                {member.relatedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ background: isDark ? 'oklch(0.19 0.06 80 / 0.4)' : 'oklch(0.97 0.04 80)', borderColor: isDark ? 'oklch(0.30 0.08 80 / 0.5)' : 'oklch(0.86 0.08 80)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[12px] font-medium flex-1" style={{ color: isDark ? 'oklch(0.80 0.10 80)' : 'oklch(0.38 0.12 80)' }}>{issue.title}</span>
                    <span className="text-sm font-semibold px-1.5 py-0.5 rounded-md" style={{ background: isDark ? 'oklch(0.25 0.10 145 / 0.5)' : 'oklch(0.92 0.08 145)', color: isDark ? 'oklch(0.72 0.16 145)' : 'oklch(0.38 0.16 145)' }}>
                      進行中
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Member Card ────────────────────────────────────────────────────────
function MemberCard({ member, onSelect }: { member: TeamMember; onSelect: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_oklch(0_0_0/0.3)]"
      style={{ background: isDark ? 'oklch(0.14 0.04 264)' : 'oklch(1.00 0 0)', border: `1px solid ${isDark ? 'oklch(0.24 0.08 264)' : 'oklch(0.88 0.04 264)'}` }}
    >
      {/* Jersey number watermark */}
      <div className="absolute top-1 right-2 text-[56px] font-black leading-none select-none pointer-events-none"
        style={{ color: 'oklch(1 0 0 / 5%)', fontFamily: "'Sora', sans-serif" }}>
        {member.number}
      </div>

      {/* Photo area */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: isDark ? 'linear-gradient(160deg, oklch(0.26 0.12 264) 0%, oklch(0.16 0.05 264) 100%)' : 'linear-gradient(160deg, oklch(0.84 0.10 264) 0%, oklch(0.92 0.05 264) 100%)'
        }} />
        {/* Upper-body crop: head to chest, pulled back for natural framing */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={member.image}
            alt={member.nameEn}
            className="absolute w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ height: '360px', top: '0px', objectPosition: 'center 8%' }}
          />
        </div>
        {/* Online indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className={cn(
            'w-2 h-2 rounded-full',
            member.isOnline
              ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
              : 'bg-slate-500'
          )} />
            <span className="text-sm font-bold text-white/60">
            {member.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        {/* MVP badge */}
      {member.isMvp && (
              <div className="absolute top-3 right-3 z-20">
                <span className="inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full text-amber-900"
                  style={{ background: 'oklch(0.85 0.15 80)' }}>
                  <Star size={9} fill="currentColor" /> MVP
                </span>
              </div>
            )}
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: isDark ? 'linear-gradient(to top, oklch(0.14 0.04 264), transparent)' : 'linear-gradient(to top, oklch(1.00 0 0), transparent)' }} />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-start justify-between mb-1">
          <div>
      <div className="text-[14px] font-bold leading-tight" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.04 264)" }}>
          {member.nameEn}
        </div>
        <div className="text-sm mt-0.5" style={{ color: isDark ? 'oklch(0.6 0.1 264)' : 'oklch(0.40 0.10 264)' }}>{member.role}</div>
          </div>
          <span className="text-sm px-2 py-0.5 rounded-full border mt-0.5 flex-shrink-0 truncate max-w-[80px]"
            style={{ borderColor: isDark ? 'oklch(0.32 0.1 264)' : 'oklch(0.78 0.08 264)', color: isDark ? 'oklch(0.65 0.08 264)' : 'oklch(0.38 0.10 264)', background: isDark ? 'oklch(0.19 0.06 264)' : 'oklch(0.93 0.04 264)' }}>
            {member.department}
          </span>
        </div>

        {/* AI adoption bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm" style={{ color: isDark ? 'oklch(0.5 0.05 264)' : 'oklch(0.42 0.05 264)' }}>AI Adoption</span>
            <span className="text-sm font-bold" style={{ color: isDark ? 'oklch(0.72 0.16 264)' : 'oklch(0.45 0.20 264)' }}>{member.aiAdoptionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'oklch(0.22 0.05 264)' : 'oklch(0.88 0.04 264)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${member.aiAdoptionRate}%`,
                background: 'linear-gradient(to right, oklch(0.52 0.22 264), oklch(0.68 0.16 220))'
              }}
            />
          </div>
        </div>

        {/* Related Issues */}
        {member.relatedIssues && member.relatedIssues.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {member.relatedIssues.map((issue) => (
              <span
                key={issue.id}
                className="inline-flex items-center gap-1 text-sm font-semibold px-1.5 py-0.5 rounded-md"
                style={{ background: isDark ? 'oklch(0.22 0.08 80 / 0.5)' : 'oklch(0.96 0.06 80)', color: isDark ? 'oklch(0.78 0.12 80)' : 'oklch(0.42 0.14 80)', border: `1px solid ${isDark ? 'oklch(0.35 0.10 80 / 0.5)' : 'oklch(0.82 0.10 80)'}` }}
              >
                <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                {issue.title.length > 16 ? issue.title.slice(0, 16) + '…' : issue.title}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: `1px solid ${isDark ? 'oklch(0.22 0.05 264)' : 'oklch(0.88 0.04 264)'}` }}>
          <div className="flex items-center gap-1 text-sm" style={{ color: isDark ? 'oklch(0.55 0.06 264)' : 'oklch(0.42 0.06 264)' }}>
            <Activity size={10} />
            <span>{member.currentActions} active</span>
          </div>
          <div className="flex items-center gap-1 text-sm" style={{ color: isDark ? 'oklch(0.55 0.06 264)' : 'oklch(0.42 0.06 264)' }}>
            <CheckCircle2 size={10} />
            <span>{member.completedActions} done</span>
          </div>
          <ChevronRight size={12} className="transition-transform group-hover:translate-x-1"
            style={{ color: isDark ? 'oklch(0.45 0.1 264)' : 'oklch(0.50 0.14 264)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Nara Medical University Team Data ─────────────────────────────────
const naraTeamMembersLocal: TeamMember[] = [
  {
    id: 'mk',
    nameJa: '笠原 雅人',
    nameEn: 'Masato Kasahara',
    role: '経営責任者（副理事長）',
    number: 1,
    image: MEMBER_IMAGES.member1,
    department: '経営企画',
    bio: '奈良県立医大の経営全般を統括。第4期中期計画の策定・推進責任者。財務健全化と地域医療の両立を牽引する。',
    strengths: ['経営戦略', '財務管理', 'ステークホルダー調整'],
    stats: [
      { label: 'アクション', value: '42', icon: CheckCircle2 },
      { label: 'AI活用率', value: '78%', icon: Bot },
      { label: '完了率', value: '91%', icon: Trophy },
    ],
    currentActions: 6,
    completedActions: 42,
    aiUsage: 138,
    aiAdoptionRate: 78,
    agents: ['Manus', 'Claude', 'Gemini'],
    isOnline: true,
    isMvp: true,
    relatedIssues: [
      { id: 'nara-1', title: '病院収益の黒字化', status: 'active' },
      { id: 'nara-2', title: '高度専門医療の強化', status: 'active' },
    ],
  },
  {
    id: 'ht',
    nameJa: '高橋 弘明',
    nameEn: 'Hiroaki Takahashi',
    role: '診療部長（外科系）',
    number: 7,
    image: MEMBER_IMAGES.member2,
    department: '診療部門',
    bio: '外科系診療の統括責任者。高度専門医療の質向上と手術件数増加を推進。ロボット手術導入を主導。',
    strengths: ['外科手術', '医療品質管理', 'チーム医療'],
    stats: [
      { label: 'アクション', value: '28', icon: CheckCircle2 },
      { label: 'AI活用率', value: '65%', icon: Bot },
      { label: '完了率', value: '88%', icon: Trophy },
    ],
    currentActions: 4,
    completedActions: 28,
    aiUsage: 82,
    aiAdoptionRate: 65,
    agents: ['Manus', 'Claude'],
    isOnline: true,
    relatedIssues: [
      { id: 'nara-2', title: '高度専門医療の強化', status: 'active' },
    ],
  },
  {
    id: 'ms',
    nameJa: '鈴木 美穂',
    nameEn: 'Miho Suzuki',
    role: '看護部長',
    number: 23,
    image: MEMBER_IMAGES.member3,
    department: '看護部門',
    bio: '看護部門全体の人材育成と業務改善を統括。特定行為研修の拡大と夜間看護体制の強化を推進。',
    strengths: ['人材育成', '業務改善', 'チームビルディング'],
    stats: [
      { label: 'アクション', value: '35', icon: CheckCircle2 },
      { label: 'AI活用率', value: '72%', icon: Bot },
      { label: '完了率', value: '93%', icon: Trophy },
    ],
    currentActions: 5,
    completedActions: 35,
    aiUsage: 96,
    aiAdoptionRate: 72,
    agents: ['Manus', 'Relay'],
    isOnline: false,
    relatedIssues: [
      { id: 'nara-3', title: '医師・看護師の働き方改革', status: 'active' },
    ],
  },
  {
    id: 'ko',
    nameJa: '小川 健太',
    nameEn: 'Kenta Ogawa',
    role: '経営企画課長',
    number: 11,
    image: MEMBER_IMAGES.member4,
    department: '経営企画',
    bio: '中期計画の進捗管理と財務分析を担当。DX推進プロジェクトの事務局長として全部門横断の改革を推進。',
    strengths: ['財務分析', 'プロジェクト管理', 'データ活用'],
    stats: [
      { label: 'アクション', value: '31', icon: CheckCircle2 },
      { label: 'AI活用率', value: '89%', icon: Bot },
      { label: '完了率', value: '95%', icon: Trophy },
    ],
    currentActions: 3,
    completedActions: 31,
    aiUsage: 124,
    aiAdoptionRate: 89,
    agents: ['Manus', 'Claude', 'DataBot'],
    isOnline: true,
    relatedIssues: [
      { id: 'nara-1', title: '病院収益の黒字化', status: 'active' },
      { id: 'nara-4', title: 'DX・業務効率化の推進', status: 'active' },
    ],
  },
  {
    id: 'yn',
    nameJa: '中村 裕子',
    nameEn: 'Yuko Nakamura',
    role: '研究推進部長',
    number: 44,
    image: MEMBER_IMAGES.member5,
    department: '研究部門',
    bio: '研究費獲得と産学連携を統括。科研費採択率向上と医師主導治験の推進で研究力強化を牽引。',
    strengths: ['研究戦略', '産学連携', 'グラント獲得'],
    stats: [
      { label: 'アクション', value: '22', icon: CheckCircle2 },
      { label: 'AI活用率', value: '82%', icon: Bot },
      { label: '完了率', value: '86%', icon: Trophy },
    ],
    currentActions: 2,
    completedActions: 22,
    aiUsage: 68,
    aiAdoptionRate: 82,
    agents: ['Manus', 'Claude'],
    isOnline: true,
    relatedIssues: [
      { id: 'nara-5', title: '研究力・教育力の強化', status: 'active' },
    ],
  },
];

const yoshiTeamMembers: TeamMember[] = [
  {
    id: 'yt',
    nameJa: 'Yoshi Tamura',
    nameEn: 'Yoshi Tamura',
    role: 'Principal Product Manager',
    number: 1,
    image: MEMBER_IMAGES.member1,
    department: 'Product',
    bio: 'Leading product strategy for CoreWeave Kubernetes Service (CKS) and Compute Abstractions. Drives AI workload platform adoption across enterprise AI labs and global customers.',
    strengths: ['Product Strategy', 'AI Infrastructure', 'Customer Discovery'],
    stats: [
      { label: 'Actions', value: '5', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '94%', icon: Bot },
      { label: 'Completion', value: '88%', icon: Trophy },
    ],
    currentActions: 5,
    completedActions: 38,
    aiUsage: 142,
    aiAdoptionRate: 94,
    agents: ['Manus', 'Claude', 'Doc Writer'],
    isOnline: true,
    isMvp: true,
    relatedIssues: [
      { id: 'cks-1', title: 'CKS Adoption Rate: 0→30% in 6 months', status: 'active' },
      { id: 'cks-2', title: 'Compute Abstractions: GPU Quota UX', status: 'active' },
    ],
  },
  {
    id: 'sc',
    nameJa: 'Sarah Chen',
    nameEn: 'Sarah Chen',
    role: 'Engineering Lead — CKS',
    number: 7,
    image: MEMBER_IMAGES.member2,
    department: 'Engineering',
    bio: 'Leads the CKS platform engineering team. Drives Kubernetes-native GPU scheduling improvements and API reliability for enterprise customers.',
    strengths: ['Kubernetes', 'GPU Infrastructure', 'API Design'],
    stats: [
      { label: 'Actions', value: '8', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '87%', icon: Bot },
      { label: 'Completion', value: '92%', icon: Trophy },
    ],
    currentActions: 8,
    completedActions: 52,
    aiUsage: 178,
    aiAdoptionRate: 87,
    agents: ['Manus', 'Claude', 'CodeBot'],
    isOnline: true,
    relatedIssues: [
      { id: 'cks-1', title: 'CKS Adoption Rate: 0→30% in 6 months', status: 'active' },
    ],
  },
  {
    id: 'mw',
    nameJa: 'Marcus Webb',
    nameEn: 'Marcus Webb',
    role: 'Chief Product Officer',
    number: 23,
    image: MEMBER_IMAGES.member3,
    department: 'Product',
    bio: 'CPO overseeing all CoreWeave product lines. Sets the long-term vision for the AI cloud platform and aligns product roadmap with strategic customer needs.',
    strengths: ['Product Vision', 'Executive Alignment', 'Go-to-Market'],
    stats: [
      { label: 'Actions', value: '3', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '79%', icon: Bot },
      { label: 'Completion', value: '95%', icon: Trophy },
    ],
    currentActions: 3,
    completedActions: 28,
    aiUsage: 96,
    aiAdoptionRate: 79,
    agents: ['Manus', 'Claude'],
    isOnline: false,
    relatedIssues: [
      { id: 'cks-3', title: 'Enterprise AI Labs Strategic Partnership', status: 'active' },
    ],
  },
  {
    id: 'pn',
    nameJa: 'Priya Nair',
    nameEn: 'Priya Nair',
    role: 'Technical Account Manager',
    number: 11,
    image: MEMBER_IMAGES.member4,
    department: 'Customer Success',
    bio: 'Manages strategic accounts for top AI labs. Drives CKS onboarding, GPU quota expansion, and customer health scores for enterprise tier.',
    strengths: ['Customer Success', 'Technical Consulting', 'Relationship Management'],
    stats: [
      { label: 'Actions', value: '6', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '91%', icon: Bot },
      { label: 'Completion', value: '89%', icon: Trophy },
    ],
    currentActions: 6,
    completedActions: 44,
    aiUsage: 132,
    aiAdoptionRate: 91,
    agents: ['Manus', 'Relay'],
    isOnline: true,
    relatedIssues: [
      { id: 'cks-1', title: 'CKS Adoption Rate: 0→30% in 6 months', status: 'active' },
    ],
  },
  {
    id: 'jp',
    nameJa: 'Jordan Park',
    nameEn: 'Jordan Park',
    role: 'Product Design Lead',
    number: 44,
    image: MEMBER_IMAGES.member5,
    department: 'Design',
    bio: 'Leads UX/UI design for CKS console and Compute Abstractions. Focuses on reducing GPU quota friction and improving developer experience for AI workloads.',
    strengths: ['UX Design', 'Developer Experience', 'Prototyping'],
    stats: [
      { label: 'Actions', value: '4', icon: CheckCircle2 },
      { label: 'AI Adoption', value: '83%', icon: Bot },
      { label: 'Completion', value: '91%', icon: Trophy },
    ],
    currentActions: 4,
    completedActions: 31,
    aiUsage: 108,
    aiAdoptionRate: 83,
    agents: ['Manus', 'Claude'],
    isOnline: true,
    relatedIssues: [
      { id: 'cks-2', title: 'Compute Abstractions: GPU Quota UX', status: 'active' },
    ],
  },
];
const yoshiTeamGoal = {
  title: 'CKS v2.1 Launch × ARR $50M by Q4 2026',
  deadline: 'December 31, 2026',
  progress: 27,
  milestones: [
    { label: 'CKS v2.0 GA', done: true },
    { label: 'PRD v2.1 Approved', done: false },
    { label: 'Top 20 TAM Assigned', done: false },
    { label: 'ARR $50M Achieved', done: false },
  ],
};
const naraTeamGoal = {
  title: '第4期中期計画 — 病院経営の黒字化と地域医療の拠点化',
  deadline: '2028年3月31日',
  progress: 38,
  milestones: [
    { label: '経営改善計画策定', done: true },
    { label: 'DX基盤整備', done: true },
    { label: '病院収支改善（▲5億円縮小）', done: false },
    { label: '高度専門医療センター開設', done: false },
  ],
};

// ─── Main Page ─────────────────────────────────────────────────────────
export default function TeamPage() {
  const { currentUserId } = useUser();
  const isNara = currentUserId === 'masato';
  const isYoshi = currentUserId === 'yoshi';
  const activeTeamMembers = isNara ? naraTeamMembersLocal : isYoshi ? yoshiTeamMembers : teamMembers;
  const activeTeamGoal = isNara ? naraTeamGoal : isYoshi ? yoshiTeamGoal : teamGoal;
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // ユーザー切り替え時に選択中のメンバーをリセットする
  useEffect(() => {
    setSelectedMember(null);
  }, [currentUserId]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const totalActions = activeTeamMembers.reduce((s, m) => s + m.completedActions, 0);
  const avgAiAdoption = Math.round(activeTeamMembers.reduce((s, m) => s + m.aiAdoptionRate, 0) / activeTeamMembers.length);
  const totalAiUsage = activeTeamMembers.reduce((s, m) => s + m.aiUsage, 0);
  const onlineCount = activeTeamMembers.filter(m => m.isOnline).length;

  return (
    <div className="h-full overflow-y-auto" style={{ background: isDark ? 'oklch(0.1 0.025 264)' : 'oklch(0.97 0.008 240)' }}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ minHeight: '300px' }}>
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: isDark ? 'linear-gradient(135deg, oklch(0.16 0.09 264) 0%, oklch(0.1 0.04 240) 60%, oklch(0.08 0.02 264) 100%)' : 'linear-gradient(135deg, oklch(0.88 0.08 264) 0%, oklch(0.93 0.04 240) 60%, oklch(0.95 0.02 264) 100%)'
        }} />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(oklch(1 0 0) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }} />
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[80px] opacity-20"
          style={{ background: 'oklch(0.55 0.22 264)' }} />

        {/* Title */}
        <div className="relative z-10 px-8 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={13} style={{ color: 'oklch(0.6 0.15 264)' }} />
                 <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.1 264)' }}>
            {isNara ? '奈良県立医大 チームロスター — 2026' : isYoshi ? 'COREWEAVE PRODUCT TEAM — 2026' : 'SIMY TEAM ROSTER — Season 2026'}
          </span>
          </div>
          <h1 className="text-[30px] font-black leading-tight" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.06 264)" }}>
            {isNara ? '奈良県立医大 経営チーム' : isYoshi ? 'Team CoreWeave' : 'Team SIMY'}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: isDark ? 'oklch(0.6 0.08 264)' : 'oklch(0.35 0.08 264)' }}>
            {isNara ? '地域医療の拠点として、チーム一丸で第4期中期計画を推進する。' : isYoshi ? 'Building the essential cloud for AI — together.' : "Everyone moving toward the same goal. That is SIMY's strength."}
          </p>
        </div>

        {/* Members silhouette row */}
        <div className="absolute bottom-0 right-0 left-0 flex items-end justify-center gap-0 px-4">
          {activeTeamMembers.map((member, i) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="relative cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:z-20 group"
              style={{
                zIndex: i === 2 ? 6 : i === 0 || i === 4 ? 4 : 5,
                marginLeft: i > 0 ? '-16px' : '0',
              }}
            >
              <img
                src={member.image}
                alt={member.nameJa}
                className="h-[190px] w-auto object-contain object-bottom transition-all duration-300 group-hover:brightness-110"
                style={{ filter: 'drop-shadow(0 8px 20px oklch(0 0 0 / 0.7))' }}
              />
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                <span className="text-sm font-bold text-white px-2.5 py-1 rounded-lg shadow-lg"
                  style={{ background: 'oklch(0.38 0.16 264)' }}>
                  #{member.number} {member.nameEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Team Goal ── */}
      <div className="mx-6 mt-4 mb-5 rounded-2xl border overflow-hidden"
        style={{ background: isDark ? 'oklch(0.16 0.06 264)' : 'oklch(1.00 0 0)', borderColor: isDark ? 'oklch(0.28 0.1 264)' : 'oklch(0.88 0.04 264)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={15} style={{ color: 'oklch(0.68 0.18 264)' }} />
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: isDark ? 'oklch(0.5 0.1 264)' : 'oklch(0.40 0.12 264)' }}>
                Team goals
              </span>
            </div>
            <span className="text-sm" style={{ color: isDark ? 'oklch(0.45 0.06 264)' : 'oklch(0.40 0.06 264)' }}>
              Deadline: {activeTeamGoal.deadline}
            </span>
          </div>
          <div className="text-[16px] font-bold mb-3" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.04 264)" }}>
            {activeTeamGoal.title}
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px]" style={{ color: isDark ? 'oklch(0.6 0.07 264)' : 'oklch(0.40 0.07 264)' }}>Overall Progress</span>
              <span className="text-[14px] font-bold" style={{ color: isDark ? 'oklch(0.76 0.18 264)' : 'oklch(0.45 0.20 264)' }}>{activeTeamGoal.progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'oklch(0.22 0.05 264)' : 'oklch(0.88 0.04 264)' }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${activeTeamGoal.progress}%`,
                  background: 'linear-gradient(to right, oklch(0.52 0.22 264), oklch(0.7 0.18 220))'
                }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeTeamGoal.milestones.map((m) => (
              <span key={m.label}
                className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full border"
                style={m.done
                  ? { background: isDark ? 'oklch(0.22 0.1 160)' : 'oklch(0.92 0.08 160)', borderColor: isDark ? 'oklch(0.38 0.15 160)' : 'oklch(0.65 0.15 160)', color: isDark ? 'oklch(0.72 0.15 160)' : 'oklch(0.35 0.15 160)' }
                  : { background: isDark ? 'oklch(0.17 0.04 264)' : 'oklch(0.94 0.02 264)', borderColor: isDark ? 'oklch(0.28 0.07 264)' : 'oklch(0.82 0.05 264)', color: isDark ? 'oklch(0.5 0.06 264)' : 'oklch(0.40 0.06 264)' }
                }>
                {m.done
                  ? <CheckCircle2 size={10} />
                  : <div className="w-2 h-2 rounded-full border border-current opacity-60" />
                }
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team Stats ── */}
      <div className="grid grid-cols-4 gap-3 px-6 mb-5">
        {[
         { label: 'Members', value: `${activeTeamMembers.length}`, icon: Users, sub: `${onlineCount} online` },
          { label: 'Actions Done', value: `${totalActions}`, icon: CheckCircle2, sub: 'cumulative' },
          { label: 'AI Usage', value: `${totalAiUsage}`, icon: Zap, sub: 'this month' },
          { label: 'Avg AI Adoption', value: `${avgAiAdoption}%`, icon: TrendingUp, sub: 'team average' },       ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-4 border"
              style={{ background: isDark ? 'oklch(0.15 0.04 264)' : 'oklch(1.00 0 0)', borderColor: isDark ? 'oklch(0.24 0.08 264)' : 'oklch(0.88 0.04 264)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} style={{ color: 'oklch(0.62 0.15 264)' }} />
                <span className="text-sm" style={{ color: 'oklch(0.48 0.06 264)' }}>{stat.label}</span>
              </div>
              <div className="text-[22px] font-black" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.04 264)" }}>
                {stat.value}
              </div>
              <div className="text-sm mt-0.5" style={{ color: isDark ? 'oklch(0.42 0.05 264)' : 'oklch(0.45 0.05 264)' }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Roster header ── */}
      <div className="px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={14} style={{ color: 'oklch(0.72 0.18 50)' }} />
          <span className="text-[13px] font-bold" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.04 264)" }}>
            Roster — {activeTeamMembers.length} Players
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-sm" style={{ color: isDark ? 'oklch(0.5 0.06 264)' : 'oklch(0.40 0.06 264)' }}>{onlineCount} online now</span>
        </div>
      </div>

      {/* ── Member Cards Grid ── */}
      <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {activeTeamMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onSelect={() => setSelectedMember(member)}
          />
        ))}
      </div>

      {/* ── Team Spirit Footer ── */}
      <div className="mx-6 mb-8 rounded-2xl overflow-hidden border"
        style={{ background: isDark ? 'linear-gradient(135deg, oklch(0.2 0.1 264), oklch(0.14 0.05 240))' : 'linear-gradient(135deg, oklch(0.92 0.06 264), oklch(0.96 0.03 240))', borderColor: isDark ? 'oklch(0.3 0.12 264)' : 'oklch(0.82 0.08 264)' }}>
        <div className="px-6 py-5 flex items-center gap-4">
          <Award size={26} style={{ color: 'oklch(0.72 0.18 264)', flexShrink: 0 }} />
          <div>
          <div className="text-[14px] font-bold mb-0.5" style={{ fontFamily: "'Sora', sans-serif', color: isDark ? 'oklch(1 0 0)' : 'oklch(0.12 0.04 264)" }}>
            {isNara ? '「地域医療の未来を、チームで創る。」' : isYoshi ? '"Ship fast. Scale further. Win the AI cloud."' : '"We win together."'}
          </div>
          <div className="text-[12px]" style={{ color: isDark ? 'oklch(0.58 0.08 264)' : 'oklch(0.38 0.08 264)' }}>
            {isNara ? 'AIで個人の力を増幅し、チームの総力で中期計画を超達成する。それが奈良県立医大の流儀。' : isYoshi ? 'CoreWeave is the essential cloud for AI. Every feature we ship accelerates the frontier.' : "Amplify individual strengths with AI. Exceed goals through collective team power. That's the SIMY way."}
          </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedMember && (
        <MemberDetailPanel
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
