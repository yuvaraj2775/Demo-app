"use client"
import { createContext, useContext } from "react";
import { Toaster } from "@/components/ui/sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UsageStats } from "@/components/dashboard/UsageStats";
import { TeamMembers } from "@/components/dashboard/TeamMembers";
import { useDashboardPage } from "@/hooks/useDashboardPage";

interface DashboardContextType {
  userData: {
    plan: string;
    storage_used: number;
    storage_total: number;
    tokens_used: number;
    tokens_total: number;
    prompts_used: number;
    prompts_total: number;
  } | null;
  teamMembers: any[];
  pendingInvites: any[];
  simulateUsage: (type: 'storage' | 'tokens' | 'prompts', amount: number) => Promise<void>;
  handleRemoveMember: (memberId: string) => void;
  handleResendInvite: (invite: any) => void;
  handleCancelInvite: (inviteId: string) => void;
  handleRoleChange: (memberId: string, newRole: string) => void;
  handleNameChange: (memberId: string, newName: string) => void;
  loading: boolean;
  error: string | null;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function Dashboard({ children }: { children: React.ReactNode }) {
  const {
    userData,
    teamMembers,
    pendingInvites,
    simulateUsage,
    handleRemoveMember,
    handleResendInvite,
    handleCancelInvite,
    handleRoleChange,
    handleNameChange,
    loading,
    error,
  } = useDashboardPage();

  if (loading || !userData) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardContext.Provider
      value={{
        userData,
        teamMembers,
        pendingInvites,
        simulateUsage,
        handleRemoveMember,
        handleResendInvite,
        handleCancelInvite,
        handleRoleChange,
        handleNameChange,
        loading,
        error,
      }}
    >
      <div className="min-h-screen bg-gray-50 p-8">
        <Toaster />
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a Dashboard component");
  }
  return context;
}

export function DashboardHeaderSection() {
  const { userData } = useDashboard();
  return (
    <>
      <DashboardHeader plan={userData!.plan} />
      <p className="text-gray-600 mb-8">Manage your resources and team members</p>
    </>
  );
}

export function DashboardUsageStats() {
  const { userData, simulateUsage } = useDashboard();
  return <UsageStats userData={userData!} onSimulateUsage={simulateUsage} />;
}

export function DashboardTeamMembers() {
  const {
    teamMembers,
    pendingInvites,
    handleRemoveMember,
    handleResendInvite,
    handleCancelInvite,
    handleRoleChange,
    handleNameChange,
    userData,
  } = useDashboard();

  return (
    <TeamMembers
      teamMembers={teamMembers}
      pendingInvites={pendingInvites}
      onRemoveMember={handleRemoveMember}
      onResendInvite={handleResendInvite}
      onCancelInvite={handleCancelInvite}
      onRoleChange={handleRoleChange}
      onNameChange={handleNameChange}
      userData={userData!}
    />
  );
}

// Compound component subcomponents
Dashboard.Header = DashboardHeaderSection;
Dashboard.UsageStats = DashboardUsageStats;
Dashboard.TeamMembers = DashboardTeamMembers; 