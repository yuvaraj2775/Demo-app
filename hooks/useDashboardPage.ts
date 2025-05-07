import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useBase } from './useBase';

interface UserData {
  id: string;
  storage_used: number;
  storage_total: number;
  tokens_used: number;
  tokens_total: number;
  prompts_used: number;
  prompts_total: number;
  plan: string;
}

interface TeamMember {
  id: string;
  team_owner_id: string;
  member_name: string;
  member_email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

interface PendingInvite {
  id: string;
  team_owner_id: string;
  member_email: string;
  member_name: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
  expires_at: string;
  created_at: string;
}

export function useDashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const userDataHook = useBase({ tableName: 'users_data' });
  const teamMembersHook = useBase({ tableName: 'team_members' });
  const invitesHook = useBase({ tableName: 'team_invitations' });

  const fetchLatestUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const result = await userDataHook.fetchData({ id: user.id });
      if (result && Array.isArray(result) && result.length > 0) {
        return result[0] as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const simulateUsage = async (type: 'storage' | 'tokens' | 'prompts', amount: number) => {
    if (!userData) return;

    const latestData = await fetchLatestUserData();
    if (!latestData) {
      toast.error("Failed to fetch latest data. Please try again.");
      return;
    }

    const updates: Partial<UserData> = {};
    let canUpdate = false;

    switch (type) {
      case 'storage':
        if (latestData.storage_used + amount <= latestData.storage_total) {
          updates.storage_used = latestData.storage_used + amount;
          canUpdate = true;
        } else {
          toast.error(`Maximum storage limit reached!`);
        }
        break;
      case 'tokens':
        if (latestData.tokens_used + amount <= latestData.tokens_total) {
          updates.tokens_used = latestData.tokens_used + amount;
          canUpdate = true;
        } else {
          toast.error(`Maximum tokens limit reached!`);
        }
        break;
      case 'prompts':
        if (latestData.prompts_used + amount <= latestData.prompts_total) {
          updates.prompts_used = latestData.prompts_used + amount;
          canUpdate = true;
        } else {
          toast.error(`Maximum prompts limit reached!`);
        }
        break;
    }

    if (canUpdate) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserData(prev => prev ? { ...prev, ...updates } : null);
      const result = await userDataHook.updateData(user.id, updates);

      if (!result) {
        const latestData = await fetchLatestUserData();
        if (latestData) setUserData(latestData);
        toast.error('Failed to update usage. Please try again.');
      } else {
        toast.success('Usage updated successfully!');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Team member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleResendInvite = async (invite: PendingInvite) => {
    try {
      const newToken = crypto.randomUUID();
      const updates = {
        token: newToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await invitesHook.updateData(invite.id, updates);
      if (result) {
        await fetch('/api/send-invitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: invite.member_email,
            name: invite.member_name,
            role: invite.role,
            token: newToken,
            teamOwnerId: invite.team_owner_id,
          }),
        });

        setPendingInvites(prev => prev.map(i => i.id === invite.id ? { ...i, ...updates } : i));
        toast.success('Invitation resent successfully');
      } else {
        toast.error('Failed to resend invitation');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', inviteId);

      if (error) {
        throw error;
      }

      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
      toast.success('Invitation cancelled successfully');
    } catch (error) {
      console.error('Error canceling invite:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const result = await teamMembersHook.updateData(memberId, { role: newRole });
      if (result) {
        setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
        toast.success('Role updated successfully');
      } else {
        toast.error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleNameChange = async (memberId: string, newName: string) => {
    try {
      const result = await teamMembersHook.updateData(memberId, { member_name: newName });
      if (result) {
        setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, member_name: newName } : m));
        toast.success('Name updated successfully');
      } else {
        toast.error('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating member name:', error);
      toast.error('Failed to update name');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for stored session
        const storedSession = localStorage.getItem('current_session');
        if (storedSession) {
          const { data: { session }, error } = await supabase.auth.setSession(JSON.parse(storedSession));
          if (error) {
            console.error('Error setting session:', error);
            localStorage.removeItem('current_session');
            router.push('/auth/login');
            return;
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Store the session in localStorage
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem('current_session', JSON.stringify(session));
        }

        setEmail(user.email || null);

        // Fetch all accounts for the current user
        const { data: accountsData, error: accountsError } = await supabase
          .from('user_accounts')
          .select('*')
          .or(`user_id.eq.${user.id},email.eq.${user.email}`);

        if (!accountsError && accountsData) {
          const uniqueAccounts = accountsData
            .filter((account, index, self) =>
              index === self.findIndex((a) => a.email === account.email))
            .filter(account => account.email !== user.email);
          setAccounts(uniqueAccounts);
        }

        // Fetch initial user data
        const initialData = await fetchLatestUserData();
        if (initialData) setUserData(initialData);

        // Fetch team members
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_owner_id', user.id);

        if (!teamError) setTeamMembers(teamData || []);

        // Fetch pending invites
        const { data: invitesData, error: invitesError } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('team_owner_id', user.id)
          .eq('status', 'pending');

        if (!invitesError) setPendingInvites(invitesData || []);

        // Real-time subscriptions
        const channel = supabase
          .channel('user_data_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'users_data' }, async (payload) => {
            if (payload.new) {
              const latestData = await fetchLatestUserData();
              if (latestData) setUserData(latestData);
            }
          })
          .subscribe();

        const teamChannel = supabase
          .channel('team_members_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `team_owner_id=eq.${user.id}` }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setTeamMembers(prev => [...prev, payload.new as TeamMember]);
            } else if (payload.eventType === 'DELETE') {
              setTeamMembers(prev => prev.filter(member => member.id !== payload.old.id));
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
          supabase.removeChannel(teamChannel);
        };
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load dashboard data');
      }
    };

    fetchData();
  }, [supabase, router]);

  // Add session to all requests
  useEffect(() => {
    const storedSession = localStorage.getItem('current_session');
    if (storedSession) {
      // Add session to all fetch requests
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set('x-stored-session', storedSession);
        return originalFetch(input, { ...init, headers });
      };
    }
  }, []);

  return {
    userData,
    teamMembers,
    pendingInvites,
    accounts,
    loading,
    error,
    simulateUsage,
    handleRemoveMember,
    handleResendInvite,
    handleCancelInvite,
    handleRoleChange,
    handleNameChange,
  };
} 