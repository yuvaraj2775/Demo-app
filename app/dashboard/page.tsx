"use client"
import { Dashboard } from "@/components/dashboard/Dashboard";
import { UsageStats } from "@/components/dashboard/UsageStats";
import { TeamMembers } from "@/components/dashboard/TeamMembers";

export default function DashboardPage() {
  return (
    <Dashboard>
      <Dashboard.Header />
      <UsageStats>
        <UsageStats.Storage />
        <UsageStats.Tokens />
        <UsageStats.Prompts />
      </UsageStats>
      <TeamMembers>
        <TeamMembers.List />
        <TeamMembers.PendingInvites />
      </TeamMembers>
    </Dashboard>
  );
} 