import React, { createContext, useContext, useState } from 'react';

export type Language = 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Translation Dictionary ───────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
  ja: {
    // Sidebar
    'nav.digitalTwin': 'デジタルツイン',
    'nav.issue': 'マイイシュー',
    'nav.myActions': 'マイアクション',
    'nav.myAgents': 'マイエージェント',
    'nav.teamMembers': 'チームメンバー',
    'nav.meetings': 'ミーティング',
    'nav.dashboard': '成長ダッシュボード',
    'nav.strategyDashboard': '戦略ダッシュボード',
    'nav.strategyExecution': '戦略実行マネジメント',
    'nav.leaderboard': 'パフォーマンスランキング',
    'nav.orgPlan': '組織プラン',
    'nav.agentsList': 'エージェント一覧',
    'nav.activity': 'アクティビティ',
    'nav.notifications': '通知',
    'nav.settings': '設定',
    'nav.organization': '組織',
    'nav.workspace': 'ワークスペース',
    'nav.admin': '管理者',
    'nav.adminSettings': '管理者設定',

    // Common
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.close': '閉じる',
    'common.edit': '編集',
    'common.delete': '削除',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.all': 'すべて',
    'common.loading': '読み込み中...',
    'common.noData': 'データがありません',
    'common.back': '戻る',
    'common.next': '次へ',
    'common.confirm': '確認',
    'common.add': '追加',
    'common.create': '作成',
    'common.update': '更新',
    'common.view': '表示',
    'common.details': '詳細',
    'common.status': 'ステータス',
    'common.date': '日付',
    'common.name': '名前',
    'common.description': '説明',
    'common.type': '種類',
    'common.category': 'カテゴリ',
    'common.priority': '優先度',
    'common.assignee': '担当者',
    'common.dueDate': '期限',
    'common.progress': '進捗',
    'common.completed': '完了',
    'common.incomplete': '未完了',
    'common.archived': 'アーカイブ済み',
    'common.featureComing': 'この機能は近日公開予定です',
    'common.owner': '担当者',
    'common.today': '今日',
    'common.openInMyActions': 'マイアクションで開く',

    // MyActionsPage
    'actions.title': 'マイアクション',
    'actions.searchPlaceholder': 'アクションを検索...',
    'actions.allCategories': 'すべてのカテゴリ',
    'actions.aiInsight': 'AIインサイト',
    'actions.stoppedDays': '件が3日以上停止中',
    'actions.aiRunning': 'AI実行中: ',
    'actions.completedCount': '完了: ',
    'actions.activeCount': 'アクティブ: ',
    'actions.selectAction': 'アクションを選択してください',
    'actions.newAction': '新しいアクションを作成（近日公開）',
    'actions.backToDashboard': 'ダッシュボード',
    'actions.contextSuffix': '関連アクション',
    'actions.showAll': 'すべてのアクションを表示',

    // Status filters
    'filter.all': 'すべて',
    'filter.incomplete': '未完了',
    'filter.completed': '完了',

    // Categories
    'cat.dev': 'エンジニアリング',
    'cat.sales': '営業',
    'cat.exec': '経営',
    'cat.marketing': 'マーケティング',
    'cat.hr': '人事',
    'cat.finance': '財務',

    // OrgPlanPage
    'orgplan.title': '組織プラン',
    'orgplan.strategyDashboard': '戦略ダッシュボード',
    'orgplan.matrixStrategy': 'マトリクス戦略',
    'orgplan.velocity': '進捗ベロシティ',
    'orgplan.drilldownFrom': ' のドリルダウン中',
    'orgplan.backToDashboard': '← 戦略ダッシュボードに戻る',
    'orgplan.companyOKR': '会社OKR',
    'orgplan.divisionOKR': '部門OKR',
    'orgplan.teamOKR': 'チームOKR',
    'orgplan.personalOKR': '個人OKR',
    'orgplan.keyResults': '主要結果',
    'orgplan.actions': 'アクション',
    'orgplan.growth': '成長率',
    'orgplan.viewActions': 'アクション一覧を見る →',
    'orgplan.weeklyVelocity': '週次実行アクション数',
    'orgplan.velocityTitle': '進捗ベロシティ',
    'orgplan.velocitySubtitle': '先週・先月・3ヶ月前との成長率を可視化',
    'orgplan.compareWeek': '先週比',
    'orgplan.compareMonth': '先月比',
    'orgplan.compare3Month': '3ヶ月前比',
    'orgplan.accelerating': '加速中',
    'orgplan.decelerating': '減速中',
    'orgplan.aiComment': 'AI週次コメント',

    // ProductDashboardPage — Growth Dashboard
    'dashboard.commandCenter': '成長ダッシュボード',
    'dashboard.whatLabel': 'What',
    'dashboard.whyLabel': 'Why',
    'dashboard.howLabel': 'How',
    'dashboard.driverAnalysis': 'ボトルネック',
    'dashboard.productDriversWhat': 'プロダクトドライバー',
    'dashboard.topPriorityActionsHow': '最優先アクション',
    'dashboard.northStar': 'ノーススター',
    'dashboard.weeklyActiveOrgs': '週次アクティブ組織数',
    'dashboard.vsLastWeek': '先週比',
    'dashboard.target': '目標',
    'dashboard.drivers': 'ドライバー',
    'dashboard.live': 'ライブ',
    'dashboard.updatedAgo': '分前に更新',
    'dashboard.critical': 'クリティカル',
    'dashboard.watch': '要注意',
    'dashboard.productDrivers': 'プロダクトドライバー',
    'dashboard.onTrack': '順調',
    'dashboard.toTarget': '目標達成率',
    'dashboard.rootCauseAnalysis': '根本原因分析',
    'dashboard.causalLevers': '因果レバー',
    'dashboard.bottleneckAnalysis': 'ボトルネック',
    'dashboard.impact': '影響度',
    'dashboard.affectedUsers': '影響組織',
    'dashboard.rootFactor': '根本要因',
    'dashboard.actionHint': '解決策',
    'dashboard.timeToFix': '解決期間',
    'dashboard.bottleneck': 'ボトルネック',
    'dashboard.viewAllActions': 'のすべてのアクションを見る',
    'dashboard.topPriorityActions': '最優先アクション',
    'dashboard.needsDecision': '今すぐ判断が必要',
    'dashboard.openInMyActions': 'マイアクションで開く',
    'dashboard.blocked': 'ブロック中',
    'dashboard.running': '実行中',
    'dashboard.completed': '完了',
    'dashboard.planned': '予定',
    'dashboard.experimentPulse': '実験パルス',
    'dashboard.sortedBy': 'インパクト × 信頼度でソート',
    'dashboard.confidence': '信頼度',
    'dashboard.score': 'スコア',
    'dashboard.declining': '低下中',
    'dashboard.improving': '改善中',
    'dashboard.stable': '安定',
    'dashboard.high': '高',
    'dashboard.medium': '中',
    'dashboard.low': '低',
    'dashboard.optOutRate': 'オプトアウト率',
    'dashboard.d7Retention': 'D7リテンション',
    'dashboard.p95Response': 'P95レスポンス',
    'dashboard.exp': '実験',

    // Meetings
    'meetings.title': 'ミーティング',
    'meetings.upcoming': '予定',
    'meetings.past': '過去',
    'meetings.today': '今日',
    'meetings.tomorrow': '明日',
    'meetings.joinMeeting': 'ミーティングに参加',
    'meetings.summary': 'サマリー',
    'meetings.transcript': '文字起こし',
    'meetings.actionItems': 'アクションアイテム',

    // Team
    'team.title': 'チームメンバー',
    'team.online': 'オンライン',
    'team.offline': 'オフライン',
    'team.role': '役職',
    'team.department': '部署',

    // Settings
    'settings.title': '個人設定',
    'settings.subtitle': 'プロフィール・テーマ・言語・通知・セキュリティ設定',
    'settings.profile': 'プロフィール',
    'settings.appearance': '外観',
    'settings.language': '言語・地域',
    'settings.notifications': '通知',
    'settings.security': 'セキュリティ',
    'settings.displayLanguage': '表示言語',
    'settings.timezone': 'タイムゾーン',
    'settings.dateFormat': '日付・時刻フォーマット',
    'settings.saved': '言語・地域設定を保存しました',
    'settings.languageChanged': '言語を変更しました',
  },

  en: {
    // Sidebar
    'nav.digitalTwin': 'Digital Twin',
    'nav.issue': 'My Issues',
    'nav.myActions': 'My Actions',
    'nav.myAgents': 'My Agents',
    'nav.teamMembers': 'Team Members',
    'nav.meetings': 'Meetings',
    'nav.dashboard': 'Growth Dashboard',
    'nav.strategyDashboard': 'Strategy Dashboard',
    'nav.strategyExecution': 'Strategy Execution',
    'nav.leaderboard': 'Performance Ranking',
    'nav.orgPlan': 'Org Plan',
    'nav.agentsList': 'Agents List',
    'nav.activity': 'Activity',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.organization': 'Organization',
    'nav.workspace': 'Workspace',
    'nav.admin': 'Admin',
    'nav.adminSettings': 'Admin Settings',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.confirm': 'Confirm',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.view': 'View',
    'common.details': 'Details',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.type': 'Type',
    'common.category': 'Category',
    'common.priority': 'Priority',
    'common.assignee': 'Assignee',
    'common.dueDate': 'Due Date',
    'common.progress': 'Progress',
    'common.completed': 'Completed',
    'common.incomplete': 'Incomplete',
    'common.archived': 'Archived',
    'common.featureComing': 'Feature coming soon',
    'common.owner': 'Owner',
    'common.today': 'Today',
    'common.openInMyActions': 'Open in My Actions',

    // MyActionsPage
    'actions.title': 'My Actions',
    'actions.searchPlaceholder': 'Search actions...',
    'actions.allCategories': 'All Categories',
    'actions.aiInsight': 'AI Insights',
    'actions.stoppedDays': ' stopped for 3+ days',
    'actions.aiRunning': 'AI running: ',
    'actions.completedCount': 'Completed: ',
    'actions.activeCount': 'Active: ',
    'actions.selectAction': 'Select an action',
    'actions.newAction': 'Create new action (coming soon)',
    'actions.backToDashboard': 'Dashboard',
    'actions.contextSuffix': 'related actions',
    'actions.showAll': 'Show all actions',

    // Status filters
    'filter.all': 'All',
    'filter.incomplete': 'Incomplete',
    'filter.completed': 'Completed',

    // Categories
    'cat.dev': 'Engineering',
    'cat.sales': 'Sales',
    'cat.exec': 'Executive',
    'cat.marketing': 'Marketing',
    'cat.hr': 'HR',
    'cat.finance': 'Finance',

    // OrgPlanPage
    'orgplan.title': 'Org Plan',
    'orgplan.strategyDashboard': 'Strategy Dashboard',
    'orgplan.matrixStrategy': 'Matrix Strategy',
    'orgplan.velocity': 'Progress Velocity',
    'orgplan.drilldownFrom': ' drill-down active',
    'orgplan.backToDashboard': '← Back to Strategy Dashboard',
    'orgplan.companyOKR': 'Company OKR',
    'orgplan.divisionOKR': 'Division OKR',
    'orgplan.teamOKR': 'Team OKR',
    'orgplan.personalOKR': 'Personal OKR',
    'orgplan.keyResults': 'Key Results',
    'orgplan.actions': 'Actions',
    'orgplan.growth': 'Growth Rate',
    'orgplan.viewActions': 'View Action List →',
    'orgplan.weeklyVelocity': 'Weekly Actions Executed',
    'orgplan.velocityTitle': 'Progress Velocity',
    'orgplan.velocitySubtitle': 'Growth rates from last week, last month, and 3 months ago',
    'orgplan.compareWeek': 'vs Last Week',
    'orgplan.compareMonth': 'vs Last Month',
    'orgplan.compare3Month': 'vs 3 Months Ago',
    'orgplan.accelerating': 'Accelerating',
    'orgplan.decelerating': 'Decelerating',
    'orgplan.aiComment': 'AI Weekly Comment',

    // ProductDashboardPage — Growth Dashboard
    'dashboard.commandCenter': 'GROWTH DASHBOARD',
    'dashboard.whatLabel': 'What',
    'dashboard.whyLabel': 'Why',
    'dashboard.howLabel': 'How',
    'dashboard.driverAnalysis': 'BOTTLENECK',
    'dashboard.productDriversWhat': 'PRODUCT DRIVERS',
    'dashboard.topPriorityActionsHow': 'TOP PRIORITY ACTIONS',
    'dashboard.northStar': 'NORTH STAR',
    'dashboard.weeklyActiveOrgs': 'Weekly Active Organizations',
    'dashboard.vsLastWeek': 'vs last week',
    'dashboard.target': 'Target',
    'dashboard.drivers': 'DRIVERS',
    'dashboard.live': 'Live',
    'dashboard.updatedAgo': ' min ago',
    'dashboard.critical': 'Critical',
    'dashboard.watch': 'Watch',
    'dashboard.productDrivers': 'PRODUCT DRIVERS',
    'dashboard.onTrack': 'On Track',
    'dashboard.toTarget': 'to target',
    'dashboard.rootCauseAnalysis': 'ROOT CAUSE ANALYSIS',
    'dashboard.causalLevers': 'CAUSAL LEVERS',
    'dashboard.bottleneckAnalysis': 'BOTTLENECK',
    'dashboard.impact': 'Impact',
    'dashboard.affectedUsers': 'Affected Orgs',
    'dashboard.rootFactor': 'Root Factor',
    'dashboard.actionHint': 'Action',
    'dashboard.timeToFix': 'ETA',
    'dashboard.bottleneck': 'Bottleneck',
    'dashboard.viewAllActions': 'View all Actions for',
    'dashboard.topPriorityActions': 'TOP PRIORITY ACTIONS',
    'dashboard.needsDecision': 'Needs your decision now',
    'dashboard.openInMyActions': 'Open in My Actions',
    'dashboard.blocked': 'Blocked',
    'dashboard.running': 'Running',
    'dashboard.completed': 'Completed',
    'dashboard.planned': 'Planned',
    'dashboard.experimentPulse': 'EXPERIMENT PULSE',
    'dashboard.sortedBy': 'Sorted by Impact × Confidence',
    'dashboard.confidence': 'Confidence',
    'dashboard.score': 'score',
    'dashboard.declining': 'DECLINING',
    'dashboard.improving': 'IMPROVING',
    'dashboard.stable': 'STABLE',
    'dashboard.high': 'High',
    'dashboard.medium': 'Medium',
    'dashboard.low': 'Low',
    'dashboard.optOutRate': 'Opt-out Rate',
    'dashboard.d7Retention': 'D7 Retention',
    'dashboard.p95Response': 'P95 Response',
    'dashboard.exp': 'exp',

    // Meetings
    'meetings.title': 'Meetings',
    'meetings.upcoming': 'Upcoming',
    'meetings.past': 'Past',
    'meetings.today': 'Today',
    'meetings.tomorrow': 'Tomorrow',
    'meetings.joinMeeting': 'Join Meeting',
    'meetings.summary': 'Summary',
    'meetings.transcript': 'Transcript',
    'meetings.actionItems': 'Action Items',

    // Team
    'team.title': 'Team Members',
    'team.online': 'Online',
    'team.offline': 'Offline',
    'team.role': 'Role',
    'team.department': 'Department',

    // Settings
    'settings.title': 'Personal Settings',
    'settings.subtitle': 'Profile, appearance, language, notifications & security',
    'settings.profile': 'Profile',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language & Region',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.displayLanguage': 'Display Language',
    'settings.timezone': 'Timezone',
    'settings.dateFormat': 'Date & Time Format',
    'settings.saved': 'Language & region settings saved',
    'settings.languageChanged': 'Language changed',
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('simy-language');
    return (stored as Language) || 'ja';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('simy-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? translations['en'][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
