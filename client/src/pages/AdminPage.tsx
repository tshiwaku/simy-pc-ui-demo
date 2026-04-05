/**
 * AdminPage — SIMY PC UI
 * Design: "Warm Productivity"
 * Features:
 *   - Billing & plan management (current plan, billing history)
 *   - Team member management (invite, change permissions, delete)
 *   - Organization settings
 */

import { useState } from 'react';
import {
  BillingPlan, Invoice, PendingInvite,
} from '../lib/mockData';
import { useUser } from '../contexts/UserContext';
import {
  CreditCard, Users, Settings, Check, Download,
  Mail, Shield, Trash2, Crown, Eye, ChevronRight,
  Building2, Bell, Lock, Plus, AlertCircle, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Types ─────────────────────────────────────────────────────────────

type AdminTab = 'billing' | 'members' | 'settings';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-50 text-violet-600 border-violet-200',
  member: 'bg-blue-50 text-blue-600 border-blue-200',
  viewer: 'bg-muted text-muted-foreground border-border',
};

// ─── Billing Tab ───────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: BillingPlan }) {
  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all',
        plan.isCurrent
          ? 'border-primary/40 bg-accent/30 shadow-md'
          : 'border-border bg-card hover:border-primary/20'
      )}
    >
      {plan.isCurrent && (
        <div
          className="absolute -top-2.5 left-4 text-sm font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: 'oklch(0.48 0.22 264)' }}
        >
          Current Plan
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[16px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            {plan.name}
          </div>
          <div className="text-[13px] text-muted-foreground mt-0.5">
            {plan.id === 'enterprise' ? (
              <span className="text-foreground font-medium">Contact Sales</span>
            ) : plan.price === 0 ? (
              <span className="text-foreground font-medium">Free</span>
            ) : (
              <>
                <span className="text-[20px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                  ¥{plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> /{plan.period}</span>
              </>
            )}
          </div>
        </div>
        {plan.isCurrent && <Crown size={18} className="text-amber-500" />}
      </div>
      <ul className="space-y-1.5 mb-4">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[12px] text-foreground">
            <Check size={12} className="text-emerald-500 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {!plan.isCurrent && (
        <button
          onClick={() => toast.info(`${plan.name}plan change: please contact Admin`)}
          className={cn(
            'w-full py-2 text-[12px] font-medium rounded-lg border transition-colors',
            plan.id === 'enterprise'
              ? 'text-white border-transparent'
              : 'text-foreground border-border hover:bg-muted'
          )}
          style={plan.id === 'enterprise' ? { background: 'oklch(0.48 0.22 264)' } : {}}
        >
          {plan.id === 'enterprise' ? 'Contact Sales' : 'Switch to this plan'}
        </button>
      )}
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const statusMap = {
    paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    failed: { label: 'Failed', cls: 'bg-red-50 text-red-600 border-red-200' },
  };
  const { label, cls } = statusMap[invoice.status];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground">{invoice.description}</div>
        <div className="text-sm text-muted-foreground mt-0.5">
          {new Date(invoice.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <div className="text-[13px] font-semibold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
        ¥{invoice.amount.toLocaleString()}
      </div>
      <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full border', cls)}>
        {label}
      </span>
      <button
        onClick={() => toast.info('Downloading invoice (Coming Soon)')}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <Download size={13} />
      </button>
    </div>
  );
}

function BillingTab() {
  const { userData } = useUser();
  const { billingPlans, invoices } = userData;
  return (
    <div className="space-y-6">
      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
            Plan
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {billingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          Payment Method
        </h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <CreditCard size={14} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground">Visa •••• 4242</div>
              <div className="text-sm text-muted-foreground">Expires: 12/28</div>
            </div>
          </div>
          <button
            onClick={() => toast.info('Change Payment Method (Coming Soon)')}
            className="text-[12px] font-medium text-primary hover:underline"
          >
            Change
          </button>
        </div>
        <button
          onClick={() => toast.info('Add Payment Method (Coming Soon)')}
          className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={12} />
          Add Payment Method
        </button>
      </div>

      {/* Invoices */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
          Billing History
        </h3>
        <div>
          {invoices.map((inv) => (
            <InvoiceRow key={inv.id} invoice={inv} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Members Tab ───────────────────────────────────────────────────────

function MembersTab() {
  const { userData } = useUser();
  const { teamMembers, pendingInvites } = userData;
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success(`Invitation email sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Invite section */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              Invite Member
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {teamMembers.length} / 20 members (Team Plan)
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
            style={{ background: 'oklch(0.48 0.22 264)' }}
          >
            <Plus size={14} />
            Send Invite
          </button>
        </div>

        {showInviteForm && (
          <div className="p-4 rounded-lg bg-accent/30 border border-border space-y-3">
            <div>
              <label className="text-[12px] font-medium text-foreground mb-1 block">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground mb-1 block">Permissions</label>
              <div className="flex gap-2">
                {(['admin', 'member', 'viewer'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setInviteRole(role)}
                    className={cn(
                      'flex-1 py-2 text-[12px] font-medium rounded-lg border transition-all',
                      inviteRole === role
                        ? 'text-white border-transparent shadow-sm'
                        : 'text-foreground border-border hover:bg-muted'
                    )}
                    style={inviteRole === role ? { background: 'oklch(0.48 0.22 264)' } : {}}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {inviteRole === 'admin' && 'Admin: Full access to Settings, Billing, and Member Management'}
                {inviteRole === 'member' && 'Member: Can create and edit actions and meetings'}
                {inviteRole === 'viewer' && 'Viewer: Read-only. Can only comment'}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowInviteForm(false)}
                className="flex-1 py-2 text-[13px] font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
                style={{ background: 'oklch(0.48 0.22 264)' }}
              >
                Send Invitation Email
              </button>
            </div>
          </div>
        )}

        {/* Pending invites */}
        {pendingInvites.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              InviteMedium ({pendingInvites.length})
            </div>
            <div className="space-y-2">
              {pendingInvites.map((invite: PendingInvite) => (
                <div key={invite.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground">{invite.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invite.invitedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} by {invite.invitedBy}
                    </div>
                  </div>
                  <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full border', ROLE_COLORS[invite.role])}>
                    {ROLE_LABELS[invite.role]}
                  </span>
                  <button
                    onClick={() => toast.info('Invitation cancelled')}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current members */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          Members ({teamMembers.length})
        </h3>
        <div className="space-y-1">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/30 transition-colors group">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: member.color }}
              >
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">{member.name}</span>
                  {member.isAdmin && (
                    <Crown size={12} className="text-amber-500" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{member.email} · {member.role}</div>
              </div>
              <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full border', member.isAdmin ? ROLE_COLORS.admin : ROLE_COLORS.member)}>
                {member.isAdmin ? ROLE_LABELS.admin : ROLE_LABELS.member}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toast.info(`Change permissions for ${member.name} (Coming Soon)`)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Change Permissions"
                >
                  <Shield size={13} />
                </button>
                {!member.isAdmin && (
                  <button
                    onClick={() => toast.info(`Removing ${member.name} from the team (Coming Soon)`)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────

function SettingsTab() {
  const [orgName, setOrgName] = useState('SIMY Inc.');
  const [orgDomain, setOrgDomain] = useState('simy.ai');
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-5">

      {/* ── Appearance / Theme ── */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
          AppearanceTheme
        </h3>
        <p className="text-[12px] text-muted-foreground mb-4">Switch the app color scheme. Settings are saved in your browser.</p>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {/* Dark card */}
          <button
            onClick={() => { setTheme('dark'); toast.success('Switched to dark mode'); }}
            className={cn(
              'relative rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden',
              theme === 'dark'
                ? 'border-primary shadow-lg'
                : 'border-border hover:border-primary/40'
            )}
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, oklch(0.12 0.04 264), oklch(0.08 0.025 260))'
                : 'oklch(0.97 0.005 240)',
            }}
          >
            {/* Mini preview */}
            <div className="w-full h-14 rounded-lg mb-3 overflow-hidden" style={{ background: 'linear-gradient(135deg, #050A14 0%, #080D1A 100%)' }}>
              <div className="flex gap-1 p-1.5">
                <div className="w-6 h-full rounded" style={{ background: 'oklch(0.08 0.025 260)', minHeight: '36px' }}>
                  <div className="w-2 h-2 rounded-full mx-auto mt-1" style={{ background: 'oklch(0.60 0.22 264)' }} />
                  <div className="w-2 h-1 rounded mx-auto mt-1" style={{ background: 'oklch(0.25 0.04 264)' }} />
                  <div className="w-2 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.20 0.04 264)' }} />
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded mb-1" style={{ background: 'oklch(0.13 0.025 260)' }} />
                  <div className="h-1.5 rounded mb-0.5 w-3/4" style={{ background: 'oklch(0.16 0.025 260)' }} />
                  <div className="h-1.5 rounded w-1/2" style={{ background: 'oklch(0.16 0.025 260)' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Moon size={13} className={theme === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
              <span className={cn('text-[13px] font-semibold', theme === 'dark' ? 'text-foreground' : 'text-muted-foreground')}>
                Dark Mode
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Deep Space Black × Neon Indigo</p>
            {theme === 'dark' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.48 0.22 264)' }}>
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>

          {/* Light card */}
          <button
            onClick={() => { setTheme('light'); toast.success('Switched to light mode'); }}
            className={cn(
              'relative rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden',
              theme === 'light'
                ? 'border-primary shadow-lg'
                : 'border-border hover:border-primary/40'
            )}
            style={{
              background: theme === 'light'
                ? 'linear-gradient(135deg, oklch(0.96 0.03 264), oklch(0.98 0.005 240))'
                : 'oklch(0.97 0.005 240)',
            }}
          >
            {/* Mini preview */}
            <div className="w-full h-14 rounded-lg mb-3 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0F4FF 0%, #E8F0FE 100%)' }}>
              <div className="flex gap-1 p-1.5">
                <div className="w-6 h-full rounded" style={{ background: 'oklch(0.97 0.008 240)', minHeight: '36px' }}>
                  <div className="w-2 h-2 rounded-full mx-auto mt-1" style={{ background: 'oklch(0.48 0.22 264)' }} />
                  <div className="w-2 h-1 rounded mx-auto mt-1" style={{ background: 'oklch(0.88 0.02 264)' }} />
                  <div className="w-2 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.88 0.02 264)' }} />
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded mb-1" style={{ background: 'oklch(1.00 0 0)' }} />
                  <div className="h-1.5 rounded mb-0.5 w-3/4" style={{ background: 'oklch(0.95 0.008 240)' }} />
                  <div className="h-1.5 rounded w-1/2" style={{ background: 'oklch(0.95 0.008 240)' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun size={13} className={theme === 'light' ? 'text-primary' : 'text-muted-foreground'} />
              <span className={cn('text-[13px] font-semibold', theme === 'light' ? 'text-foreground' : 'text-muted-foreground')}>
                Light Mode
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Clean White × Indigo</p>
            {theme === 'light' && (
              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.48 0.22 264)' }}>
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Organization info */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          Organization Info
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full max-w-sm px-3 py-2 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Domain</label>
            <input
              type="text"
              value={orgDomain}
              onChange={(e) => setOrgDomain(e.target.value)}
              className="w-full max-w-sm px-3 py-2 text-[13px] rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => toast.success('Organization info saved')}
            className="px-4 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
            style={{ background: 'oklch(0.48 0.22 264)' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          Security
        </h3>
        <div className="space-y-3">
          {[
            { icon: Lock, title: 'Two-Factor Authentication (2FA)', desc: 'Require 2FA for all members', enabled: false },
            { icon: Shield, title: 'SSO / SAML', desc: 'Available on Enterprise Plan', enabled: false, locked: true },
            { icon: Eye, title: 'Session Management', desc: 'View and disable active sessions', enabled: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <item.icon size={15} className="text-muted-foreground" />
                <div>
                  <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                    {item.title}
                    {item.locked && (
                      <span className="text-sm font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        Enterprise
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
              <button
                onClick={() => item.locked ? toast.info('Upgrade to Enterprise Plan required') : toast.info('Change settings (Coming Soon)')}
                className={cn(
                  'relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0',
                  item.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{ height: '22px' }}
              >
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
          NotificationsSettings
        </h3>
        <div className="space-y-3">
          {[
            { title: 'When a new member joins', enabled: true },
            { title: 'When a member leaves', enabled: true },
            { title: 'Billing-related alerts', enabled: true },
            { title: 'Security alerts', enabled: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-[13px] text-foreground">{item.title}</span>
              <button
                onClick={() => toast.info('Notification settings will be updated (Coming Soon)')}
                className={cn(
                  'relative w-10 rounded-full transition-colors flex-shrink-0',
                  item.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{ height: '22px' }}
              >
                <div className={cn(
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                  item.enabled ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-xl border border-red-200 shadow-sm p-5">
        <h3 className="text-[14px] font-bold text-red-600 mb-3 flex items-center gap-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          <AlertCircle size={15} />
          Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
            <div>
              <div className="text-[13px] font-medium text-foreground">Export Organization Data</div>
              <div className="text-sm text-muted-foreground">Download all data as CSV/JSON</div>
            </div>
            <button
              onClick={() => toast.info('Data export started (Coming Soon)')}
              className="px-3 py-1.5 text-[12px] font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100">
            <div>
              <div className="text-[13px] font-medium text-red-600">Delete Organization</div>
              <div className="text-sm text-muted-foreground">This action cannot be undone</div>
            </div>
            <button
              onClick={() => toast.error('To delete the organization, please contact Admin')}
              className="px-3 py-1.5 text-[12px] font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const { userData } = useUser();
  const { teamMembers, billingPlans, invoices, pendingInvites } = userData;
  const [activeTab, setActiveTab] = useState<AdminTab>('billing');

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'members', label: 'Member Management', icon: Users },
    { id: 'settings', label: 'Organization Settings', icon: Settings },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'oklch(0.48 0.22 264 / 0.1)' }}
          >
            <Building2 size={16} style={{ color: 'oklch(0.48 0.22 264)' }} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
              AdminSettings
            </h1>
            <p className="text-[12px] text-muted-foreground">林商事株式会社 ・ Admin権限でアクセス中</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all',
                activeTab === id
                  ? 'text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              style={activeTab === id ? { background: 'oklch(0.48 0.22 264)' } : {}}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}
