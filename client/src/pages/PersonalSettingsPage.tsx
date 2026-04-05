/*
 * PersonalSettingsPage — SIMY PC UI
 * Design: "GALACTIC COMMAND" — consistent with app-wide dark/light theme system
 * Sections:
 *   - Profile (name, avatar, title, bio)
 *   - Appearance theme (dark/light toggle)
 *   - Language & region (language, timezone, date format)
 *   - Notification settings (email, push, various events)
 *   - Security (password change, 2FA, sessions)
 */

import { useState } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  User, Palette, Globe, Bell, Shield, Camera, Check,
  Moon, Sun, ChevronDown, Mail, Smartphone, Lock,
  LogOut, Eye, EyeOff, Save, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

// ─── Types ─────────────────────────────────────────────────────────────

type SettingsTab = 'profile' | 'appearance' | 'language' | 'notifications' | 'security';

// ─── Tab Button ────────────────────────────────────────────────────────

function TabButton({
  id, label, icon: Icon, isActive, onClick,
}: {
  id: SettingsTab; label: string; icon: React.ElementType;
  isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 text-[13px]',
        isActive
          ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
      )}
    >
      <Icon size={15} className="flex-shrink-0" />
      {label}
    </button>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-10 rounded-full transition-colors flex-shrink-0',
        enabled ? 'bg-primary' : 'bg-muted-foreground/30'
      )}
      style={{ height: '22px' }}
    >
      <div className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5">
      <h3 className="text-[14px] font-bold text-foreground mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────────────

function ProfileTab() {
  const [name, setName] = useState('林 健二');
  const [nameEn, setNameEn] = useState('Kenji Hayashi');
  const [title, setTitle] = useState('代表取締役社長');
  const [email, setEmail] = useState('k.hayashi@hayashi-shokai.co.jp');
  const [bio, setBio] = useState('林商事株式会社代表取締役社長。創業15年、社員7名。制造業向け消耗資材の販売を中心に、業務DXと組織拡大を推進。');
  const [department, setDepartment] = useState('経営');

  return (
    <div className="space-y-5">
      <SectionCard title="Avatar">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, oklch(0.48 0.22 264), oklch(0.55 0.20 290))' }}
            >
KH
            </div>
            <button
              onClick={() => toast.info('Avatar change feature coming soon')}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-90"
              style={{ background: 'oklch(0.48 0.22 264)' }}
            >
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">Profile Image</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">JPG, PNG, GIF (max 5MB)</p>
            <button
              onClick={() => toast.info('Upload feature coming soon')}
              className="mt-2 px-3 py-1.5 text-[12px] font-medium border border-border rounded-lg text-foreground hover:bg-accent/40 transition-colors"
            >
              Upload Image
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Basic Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Full Name (Japanese)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Full Name (English)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <p className="text-sm text-muted-foreground mt-1">{bio.length} / 200 characters</p>
          </div>
        </div>
        <button
          onClick={() => toast.success('Profile saved')}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
          style={{ background: 'oklch(0.48 0.22 264)' }}
        >
          <Save size={14} />
          Save Changes
        </button>
      </SectionCard>
    </div>
  );
}

// ─── Appearance Tab ────────────────────────────────────────────────────

function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-5">
      <SectionCard title="Color Theme">
        <p className="text-[12px] text-muted-foreground mb-4">Switch the app color scheme. Settings are saved in your browser.</p>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          {/* Light Mode Card */}
          <button
            onClick={() => { setTheme('light'); toast.success('Switched to light mode'); }}
            className={cn(
              'relative rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden',
              theme === 'light'
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/40'
            )}
            style={{
              background: theme === 'light'
                ? 'linear-gradient(135deg, oklch(0.96 0.03 264), oklch(0.99 0.005 240))'
                : 'var(--card)',
            }}
          >
            {/* Preview */}
            <div className="w-full h-16 rounded-lg mb-3 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F0F4FF 0%, #EEF2FF 100%)' }}>
              <div className="flex gap-1 p-1.5 h-full">
                <div className="w-7 rounded" style={{ background: 'oklch(0.97 0.008 240)' }}>
                  <div className="w-3 h-3 rounded-full mx-auto mt-1.5" style={{ background: 'oklch(0.48 0.22 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-1" style={{ background: 'oklch(0.88 0.02 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.88 0.02 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.88 0.02 264)' }} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-2.5 rounded" style={{ background: 'oklch(1.00 0 0)' }} />
                  <div className="flex gap-1 flex-1">
                    <div className="flex-1 rounded" style={{ background: 'oklch(0.98 0.005 240)' }} />
                    <div className="flex-1 rounded" style={{ background: 'oklch(0.98 0.005 240)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sun size={14} className={theme === 'light' ? 'text-primary' : 'text-muted-foreground'} />
              <span className={cn('text-[13px] font-bold', theme === 'light' ? 'text-foreground' : 'text-muted-foreground')}>
                Light Mode
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Clean White × Indigo</p>
            {theme === 'light' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.48 0.22 264)' }}>
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>

          {/* Dark Mode Card */}
          <button
            onClick={() => { setTheme('dark'); toast.success('Switched to dark mode'); }}
            className={cn(
              'relative rounded-xl border-2 p-4 text-left transition-all duration-200 overflow-hidden',
              theme === 'dark'
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/40'
            )}
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, oklch(0.14 0.04 264), oklch(0.10 0.025 260))'
                : 'var(--card)',
            }}
          >
            {/* Preview */}
            <div className="w-full h-16 rounded-lg mb-3 overflow-hidden" style={{ background: 'linear-gradient(135deg, #050A14 0%, #080D1A 100%)' }}>
              <div className="flex gap-1 p-1.5 h-full">
                <div className="w-7 rounded" style={{ background: 'oklch(0.08 0.025 260)' }}>
                  <div className="w-3 h-3 rounded-full mx-auto mt-1.5" style={{ background: 'oklch(0.60 0.22 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-1" style={{ background: 'oklch(0.25 0.04 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.20 0.04 264)' }} />
                  <div className="w-3 h-1 rounded mx-auto mt-0.5" style={{ background: 'oklch(0.20 0.04 264)' }} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-2.5 rounded" style={{ background: 'oklch(0.13 0.025 260)' }} />
                  <div className="flex gap-1 flex-1">
                    <div className="flex-1 rounded" style={{ background: 'oklch(0.12 0.025 260)' }} />
                    <div className="flex-1 rounded" style={{ background: 'oklch(0.12 0.025 260)' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-0.5">
              <Moon size={14} className={theme === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
              <span className={cn('text-[13px] font-bold', theme === 'dark' ? 'text-foreground' : 'text-muted-foreground')}>
                Dark Mode
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Deep Space Black × Neon Indigo</p>
            {theme === 'dark' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.48 0.22 264)' }}>
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Font Size">
        <p className="text-[12px] text-muted-foreground mb-3">Adjust the text display size.</p>
        <div className="flex gap-2">
          {(['Small', 'Medium', 'Large'] as const).map((size, i) => (
            <button
              key={size}
              onClick={() => toast.info(`Font size "${size}" will be changed (coming soon)`)}
              className={cn(
                'px-4 py-2 rounded-lg border text-[13px] transition-colors',
                i === 1
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Language Tab ──────────────────────────────────────────────────────

function LanguageTab() {
  const { language, setLanguage: setGlobalLanguage } = useLanguage();
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [dateFormat, setDateFormat] = useState('YYYY/MM/DD');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('monday');

  const languages: { value: Language | 'zh' | 'ko'; label: string; flag: string; disabled?: boolean }[] = [
    { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'zh', label: 'Chinese (Simplified)', flag: '🇨🇳', disabled: true },
    { value: 'ko', label: '한국어', flag: '🇰🇷', disabled: true },
  ];

  const timezones = [
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
    { value: 'Asia/Seoul', label: 'Asia/Seoul (UTC+9)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1)' },
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Display Language">
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => {
                if (lang.disabled) {
                  toast.info(`Switching to ${lang.label} is coming soon`);
                  return;
                }
                setGlobalLanguage(lang.value as Language);
                toast.success(lang.value === 'en' ? 'Language changed to English' : 'Switched to Japanese');
              }}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all',
                language === lang.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:border-primary/40'
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-[13px] font-medium">{lang.label}</span>
              {language === lang.value && <Check size={12} className="ml-auto text-primary" />}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Timezone">
        <div className="max-w-sm">
          <label className="text-[12px] font-medium text-foreground mb-1.5 block">Timezone</label>
          <div className="relative">
            <select
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); toast.success('Timezone updated'); }}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none pr-8"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Date & Time Format">
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-2 block">Date Format</label>
            <div className="flex flex-col gap-1.5">
              {['YYYY/MM/DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD (JP)'].map((fmt) => (
                <label key={fmt} className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => setDateFormat(fmt)}
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                      dateFormat === fmt ? 'border-primary' : 'border-muted-foreground/40'
                    )}
                  >
                    {dateFormat === fmt && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[13px] text-foreground">{fmt}</span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {fmt === 'YYYY/MM/DD' ? '2026/03/27' :
                     fmt === 'MM/DD/YYYY' ? '03/27/2026' :
                     fmt === 'DD/MM/YYYY' ? '27/03/2026' : '2026/03/27'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-2 block">Time Format</label>
            <div className="flex gap-2">
              {[{ value: '24h', label: '24-hour', example: '14:30' }, { value: '12h', label: '12-hour', example: '2:30 PM' }].map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setTimeFormat(fmt.value)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg border text-[13px] transition-colors',
                    timeFormat === fmt.value
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  <div>{fmt.label}</div>
                  <div className="text-sm opacity-70">{fmt.example}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground mb-2 block">Week Start</label>
            <div className="flex gap-2">
              {[{ value: 'monday', label: 'Monday' }, { value: 'sunday', label: 'Sunday' }].map((day) => (
                <button
                  key={day.value}
                  onClick={() => setFirstDayOfWeek(day.value)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg border text-[13px] transition-colors',
                    firstDayOfWeek === day.value
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => toast.success('Language & Region settings saved')}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
          style={{ background: 'oklch(0.48 0.22 264)' }}
        >
          <Save size={14} />
          Save
        </button>
      </SectionCard>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────────────

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState({
    actionCompleted: true,
    actionFailed: true,
    teamMention: true,
    weeklyDigest: false,
    productUpdates: true,
  });
  const [pushNotifs, setPushNotifs] = useState({
    actionCompleted: true,
    actionFailed: true,
    teamMention: false,
    meetingReminder: true,
  });
  const [quietHours, setQuietHours] = useState(true);

  return (
    <div className="space-y-5">
      <SectionCard title="Emailnotifications">
        <div className="space-y-3">
          {[
            { key: 'actionCompleted', label: 'When an Action is completed', desc: 'When an AI agent completes an Action' },
            { key: 'actionFailed', label: 'When an Action fails', desc: 'When an error or stoppage occurs' },
            { key: 'teamMention', label: 'Mention from team', desc: 'When mentioned in comments or change history' },
            { key: 'weeklyDigest', label: 'Weekly Summary', desc: 'Weekly summary of last week delivered every Monday' },
            { key: 'productUpdates', label: 'Product Updates', desc: 'New features and announcements' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="text-[13px] font-medium text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
              <Toggle
                enabled={emailNotifs[item.key as keyof typeof emailNotifs]}
                onChange={(v) => setEmailNotifs(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Pushnotifications">
        <div className="space-y-3">
          {[
            { key: 'actionCompleted', label: 'ActionCompleted', desc: 'When AI completes work' },
            { key: 'actionFailed', label: 'Action Error', desc: 'When an issue occurs' },
            { key: 'teamMention', label: 'Team Mention', desc: 'When mentioned' },
            { key: 'meetingReminder', label: 'Meeting Reminder', desc: '15 minutes before a meeting' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Smartphone size={14} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="text-[13px] font-medium text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.desc}</div>
                </div>
              </div>
              <Toggle
                enabled={pushNotifs[item.key as keyof typeof pushNotifs]}
                onChange={(v) => setPushNotifs(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Do Not Disturb Hours">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-medium text-foreground">Do Not Disturb</div>
            <div className="text-sm text-muted-foreground">Mutes all notifications during the specified hours</div>
          </div>
          <Toggle enabled={quietHours} onChange={setQuietHours} />
        </div>
        {quietHours && (
          <div className="flex items-center gap-3 mt-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">Start</span>
              <select className="px-2 py-1 text-[13px] rounded border border-border bg-background text-foreground focus:outline-none">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} selected={i === 22}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <span className="text-muted-foreground">–</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">End</span>
              <select className="px-2 py-1 text-[13px] rounded border border-border bg-background text-foreground focus:outline-none">
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i} selected={i === 8}>{String(i).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────

function SecurityTab() {
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const sessions = [
    { device: 'MacBook Pro', location: 'Tokyo, Japan', browser: 'Chrome 122', lastActive: 'Current', isCurrent: true },
    { device: 'iPhone 15', location: 'Tokyo, Japan', browser: 'Safari iOS', lastActive: '2 hours ago', isCurrent: false },
    { device: 'Windows PC', location: 'Osaka, Japan', browser: 'Edge 121', lastActive: '3 days ago', isCurrent: false },
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="Change Password">
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="8+ characters"
                className="w-full px-3 py-2 pr-10 text-[13px] rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPw.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1 rounded-full transition-colors"
                    style={{
                      background: newPw.length >= (i + 1) * 2
                        ? i < 1 ? 'oklch(0.55 0.22 27)' : i < 2 ? 'oklch(0.68 0.18 55)' : i < 3 ? 'oklch(0.62 0.18 145)' : 'oklch(0.48 0.22 264)'
                        : 'oklch(0.25 0.02 260)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1.5 block">Confirm Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              className={cn(
                'w-full px-3 py-2 text-[13px] rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
                confirmPw.length > 0 && confirmPw !== newPw ? 'border-red-400' : 'border-border'
              )}
            />
            {confirmPw.length > 0 && confirmPw !== newPw && (
              <p className="text-sm text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            onClick={() => {
              if (!currentPw) { toast.error('Please enter your current password'); return; }
              if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
              if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
              toast.success('Password changed');
              setCurrentPw(''); setNewPw(''); setConfirmPw('');
            }}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white rounded-lg shadow-sm transition-all hover:opacity-90"
            style={{ background: 'oklch(0.48 0.22 264)' }}
          >
            <Lock size={14} />
            Change Password
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication (2FA)">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-medium text-foreground">2FA using authenticator app</div>
            <div className="text-sm text-muted-foreground mt-0.5">Compatible with Google Authenticator, Authy, etc.</div>
          </div>
          <Toggle
            enabled={twoFAEnabled}
            onChange={(v) => {
              setTwoFAEnabled(v);
              toast.info(v ? 'Opening 2FA settings (coming soon)' : '2FA disabled (coming soon)');
            }}
          />
        </div>
        {!twoFAEnabled && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[12px] text-amber-400">
            ⚠️ Enabling 2FA significantly improves account security
          </div>
        )}
      </SectionCard>

      <SectionCard title="Active Sessions">
        <div className="space-y-2">
          {sessions.map((session, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  session.isCurrent ? 'bg-green-400' : 'bg-muted-foreground/40'
                )} />
                <div>
                  <div className="text-[13px] font-medium text-foreground flex items-center gap-2">
                    {session.device}
                    {session.isCurrent && (
                      <span className="text-sm font-bold px-1.5 py-0.5 rounded" style={{ background: 'oklch(0.15 0.06 145)', color: 'oklch(0.62 0.18 145)' }}>
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{session.browser} · {session.location} · {session.lastActive}</div>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => toast.success(`${session.device} session ended`)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  <LogOut size={12} />
                  End
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.success('All other sessions ended')}
          className="mt-3 flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
        >
          <RefreshCw size={13} />
          End All Other Sessions
        </button>
      </SectionCard>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────

export default function PersonalSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const { t } = useLanguage();

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Shield },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
        <h1 className="text-[22px] font-bold text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
          {t('settings.title')}
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{t('settings.subtitle')}</p>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left nav */}
        <div className="w-52 flex-shrink-0 border-r border-border p-3 space-y-1 overflow-y-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'language' && <LanguageTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
