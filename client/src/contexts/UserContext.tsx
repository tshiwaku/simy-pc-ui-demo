/**
 * UserContext — SIMY PC UI (Demo: Single User)
 * 中小企業オーナー: 林 健二 (Kenji Hayashi)
 */

import React, { createContext, useContext } from 'react';
import {
  teamMembers,
  actions,
  meetings,
  currentOKRs,
  midTermPlan,
  billingPlans,
  invoices,
  pendingInvites,
  digitalTwinData,
  type TeamMember,
  type Action,
  type Meeting,
  type OKRObjective,
  type MidTermPlan,
  type BillingPlan,
  type Invoice,
  type PendingInvite,
} from '../lib/mockData';

export type UserId = 'kenji';

export interface UserProfile {
  id: UserId;
  name: string;
  nameJa: string;
  role: string;
  organization: string;
  avatar: string;
  color: string;
  email: string;
}

export interface UserDataSet {
  profile: UserProfile;
  teamMembers: TeamMember[];
  actions: Action[];
  meetings: Meeting[];
  okrs: OKRObjective[];
  midTermPlan: MidTermPlan;
  billingPlans: BillingPlan[];
  invoices: Invoice[];
  pendingInvites: PendingInvite[];
  digitalTwinData: typeof digitalTwinData;
}

const demoUserProfile: UserProfile = {
  id: 'kenji',
  name: 'Kenji Hayashi',
  nameJa: '林 健二',
  role: '代表取締役',
  organization: '林商事株式会社',
  avatar: 'KH',
  color: '#4F46E5',
  email: 'kenji@hayashi-trading.co.jp',
};

const demoDataSet: UserDataSet = {
  profile: demoUserProfile,
  teamMembers,
  actions,
  meetings,
  okrs: currentOKRs,
  midTermPlan,
  billingPlans,
  invoices,
  pendingInvites,
  digitalTwinData,
};

interface UserContextType {
  currentUserId: UserId;
  currentUser: UserProfile;
  userData: UserDataSet;
  switchUser: (userId: UserId) => void;
  availableUsers: UserProfile[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext.Provider value={{
      currentUserId: 'kenji',
      currentUser: demoUserProfile,
      userData: demoDataSet,
      switchUser: () => {},
      availableUsers: [demoUserProfile],
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
