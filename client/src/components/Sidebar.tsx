/*
 * Sidebar — SIMY PC UI (Demo: Single User)
 * Design: "Warm Productivity" — warm cream sidebar with indigo accent
 * Collapsed: icon-only strip (56px).
 */

import { NavSection } from './MainLayout';
import {
  Brain,
  CheckSquare,
  Bot,
  Users,
  Calendar,
  Settings,
  Bell,
  Zap,
  Shield,
  Sparkles,
  LayoutDashboard,
  Lightbulb,
  Trophy,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  flyoutOpen?: boolean;
  onFlyoutChange?: (open: boolean) => void;
}

// Square toggle icon
function ToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <rect x="1.5" y="1.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {collapsed ? (
        <line x1="12" y1="1.5" x2="12" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
      ) : (
        <line x1="6" y1="1.5" x2="6" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function NavButton({
  id,
  label,
  icon: Icon,
  badge,
  isActive,
  onClick,
  collapsed,
}: {
  id: NavSection;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'w-full flex items-center rounded-lg text-left transition-all duration-150',
        collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
        isActive
          ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
      )}
    >
      <div className="relative flex-shrink-0">
        <Icon
          size={17}
          className={cn('transition-colors', isActive ? 'text-primary' : '')}
        />
        {collapsed && badge ? (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1 text-[13.5px]" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
            {label}
          </span>
          {badge && (
            <span
              className={cn(
                'text-sm font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default function Sidebar({ activeSection, onNavigate, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();
  const { currentUser } = useUser();

  const mainNavItems: { id: NavSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'twin', label: t('nav.digitalTwin'), icon: Brain },
    { id: 'issue', label: t('nav.issue'), icon: Lightbulb },
    { id: 'actions', label: t('nav.myActions'), icon: CheckSquare, badge: 5 },
    { id: 'requests', label: t('nav.myAgents'), icon: Bot, badge: 3 },
    { id: 'team', label: t('nav.teamMembers'), icon: Users },
    { id: 'meetings', label: t('nav.meetings'), icon: Calendar, badge: 2 },
  ];

  const orgNavItems: { id: NavSection; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'leaderboard', label: 'HVP ランキング', icon: Trophy },
    { id: 'agentslist', label: t('nav.agentsList'), icon: Sparkles },
  ];

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-screen flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[56px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Brand + Toggle */}
      <div className={cn(
        'py-4 border-b border-border flex items-center',
        isCollapsed ? 'justify-center px-2 flex-col gap-2' : 'justify-between px-5'
      )}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: 'oklch(0.48 0.22 264)' }}
          >
            <Zap size={16} className="text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-bold text-[15px] text-foreground" style={{ fontFamily: "'Sora', sans-serif" }}>
                SIMY
              </div>
              <div className="text-sm text-muted-foreground leading-none mt-0.5">
                Action Intelligence
              </div>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
            className={cn(
              'flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors',
              isCollapsed ? 'w-8 h-8' : 'w-7 h-7'
            )}
          >
            <ToggleIcon collapsed={isCollapsed} />
          </button>
        )}
      </div>

      {/* User Profile (no switcher) */}
      {!isCollapsed ? (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: currentUser.color }}
            >
              {currentUser.avatar}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[13px] font-semibold text-foreground truncate">{currentUser.nameJa}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 size={10} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate">{currentUser.organization}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-2 py-3 border-b border-border flex justify-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: currentUser.color }}
            title={currentUser.name}
          >
            {currentUser.avatar}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 py-3 overflow-y-auto space-y-4', isCollapsed ? 'px-1.5' : 'px-3')}>
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <NavButton
              key={item.id}
              {...item}
              isActive={activeSection === item.id}
              onClick={() => onNavigate(item.id)}
              collapsed={isCollapsed}
            />
          ))}
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-1.5">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nav.organization')}
              </div>
            </div>
          )}
          {isCollapsed && <div className="border-t border-border/50 mx-1 mb-2" />}
          <div className="space-y-0.5">
            {orgNavItems.map((item) => (
              <NavButton
                key={item.id}
                {...item}
                isActive={activeSection === item.id}
                onClick={() => onNavigate(item.id)}
                collapsed={isCollapsed}
              />
            ))}
          </div>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-1.5">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('nav.workspace')}
              </div>
            </div>
          )}
          {isCollapsed && <div className="border-t border-border/50 mx-1 mb-2" />}
          <div className="space-y-0.5">
            <button
              onClick={() => {}}
              title={isCollapsed ? t('nav.notifications') : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-left text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-all duration-150',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
              )}
            >
              <Bell size={17} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-[13.5px]" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{t('nav.notifications')}</span>}
            </button>
            <button
              onClick={() => onNavigate('settings')}
              title={isCollapsed ? t('nav.settings') : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-left transition-all duration-150',
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                activeSection === 'settings'
                  ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                  : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
              )}
            >
              <Settings size={17} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-[13.5px]" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{t('nav.settings')}</span>}
            </button>
          </div>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-3 mb-1.5">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Admin</div>
            </div>
          )}
          {isCollapsed && <div className="border-t border-border/50 mx-1 mb-2" />}
          <div className="space-y-0.5">
            <NavButton
              id="admin"
              label="Admin Settings"
              icon={Shield}
              isActive={activeSection === 'admin'}
              onClick={() => onNavigate('admin')}
              collapsed={isCollapsed}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={cn(
        'py-3 border-t border-border',
        isCollapsed ? 'px-1.5 flex justify-center' : 'px-4 flex items-center justify-between'
      )}>
        {!isCollapsed && (
          <div className="text-sm text-muted-foreground">SIMY v3.0 · AI Powered</div>
        )}
        {!isCollapsed && (
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('ja')}
              className={cn(
                'px-2 py-1 rounded-md text-sm font-bold transition-all',
                language === 'ja' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >JA</button>
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'px-2 py-1 rounded-md text-sm font-bold transition-all',
                language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >EN</button>
          </div>
        )}
        {isCollapsed && <div className="text-sm text-muted-foreground/50">v3</div>}
      </div>
    </aside>
  );
}
