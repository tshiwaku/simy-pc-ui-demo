/**
 * MainLayout — SIMY PC UI
 * Design: "Warm Productivity" — Left sidebar + main content
 * Pages: twin | actions | requests | team | meetings | orgplan | dashboard | admin | activity
 * Navigation: navigateTo(section, agentId?, dashboardContext?) to navigate from Dashboard to Actions
 */

import { useState, useEffect } from 'react';
import { Action } from '../lib/mockData';
import { useUser } from '../contexts/UserContext';
import Sidebar from './Sidebar';
import TwinPage from '../pages/TwinPage';
import MyActionsPage from '../pages/MyActionsPage';
import AgentRequestsPage from '../pages/AgentRequestsPage';
import TeamPage from '../pages/TeamPage';
import MeetingsPage from '../pages/MeetingsPage';
import AdminPage from '../pages/AdminPage';
import ActivityPage from '../pages/ActivityPage';
import AgentsListPage from '../pages/AgentsListPage';
import PersonalSettingsPage from '../pages/PersonalSettingsPage';
import ProductDashboardPage from '../pages/ProductDashboardPage';
import IssuePage from '../pages/IssuePage';
import LeaderboardPage from '../pages/LeaderboardPage';
import SettingsPage from '../pages/SettingsPage';

export type NavSection = 'twin' | 'actions' | 'requests' | 'team' | 'meetings' | 'dashboard' | 'issue' | 'agentslist' | 'admin' | 'activity' | 'settings' | 'leaderboard';

export interface DashboardContext {
  layer: 'L1' | 'L2' | 'L3';
  label: string;       // e.g. "Retention", "Notification", "Simplified Onboarding Flow"
  sublabel?: string;   // e.g. "Product Driver", "Product Lever", "A/B Test"
  color?: string;
}

export default function MainLayout() {
  const { userData, currentUserId } = useUser();
  const [activeSection, setActiveSection] = useState<NavSection>('twin');
  const [targetAgentId, setTargetAgentId] = useState<string | null>(null);
  const [dashboardContext, setDashboardContext] = useState<DashboardContext | null>(null);
  const [actionsList, setActionsList] = useState<Action[]>(userData.actions);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarFlyoutOpen, setSidebarFlyoutOpen] = useState(false);

  // ユーザー切り替え時に actionsList を新しいユーザーのデータでリセット
  useEffect(() => {
    setActionsList(userData.actions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const navigateTo = (section: NavSection, agentId?: string, ctx?: DashboardContext) => {
    setTargetAgentId(agentId ?? null);
    if (section !== 'actions') setDashboardContext(null); // clear context when leaving actions
    if (section === 'actions' && ctx) setDashboardContext(ctx);
    setActiveSection(section);
  };

  const handleCreateBottleneckAction = (_bottleneckLabel: string, _bottleneckLabelJa: string, _actionHint: string, _actionHintJa: string, _driverLabel: string, _driverLabelJa: string, _severity: string) => {
    // イシュー化: マイイシューページへ遷移
    navigateTo('issue');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'twin': return <TwinPage />;
      case 'actions': return (
        <MyActionsPage
          onOpenPipeline={(agentId) => navigateTo('requests', agentId)}
          dashboardContext={dashboardContext}
          onClearContext={() => setDashboardContext(null)}
          onBackToDashboard={() => navigateTo('dashboard')}
          actionsList={actionsList}
        />
      );
      case 'requests': return (
        <AgentRequestsPage initialAgentId={targetAgentId ?? undefined} />
      );
      case 'team': return <TeamPage />;
      case 'meetings': return <MeetingsPage />;
      case 'dashboard': return (
        <ProductDashboardPage />
      );
      case 'issue': return <IssuePage />;
      case 'agentslist': return <AgentsListPage />;
      case 'admin': return <AdminPage />;
      case 'activity': return <ActivityPage />;
      case 'settings': return <SettingsPage />;
      case 'leaderboard': return <LeaderboardPage />;
      default: return <MyActionsPage onOpenPipeline={(agentId) => navigateTo('requests', agentId)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activeSection={activeSection}
        onNavigate={(s) => navigateTo(s)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        flyoutOpen={sidebarFlyoutOpen}
        onFlyoutChange={setSidebarFlyoutOpen}
      />
      <main
        className="flex-1 overflow-hidden"
        onClick={() => { if (!sidebarCollapsed) setSidebarCollapsed(true); }}
      >
        {renderContent()}
      </main>
    </div>
  );
}
