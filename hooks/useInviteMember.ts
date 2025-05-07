import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface InviteFormData {
  name: string;
  email: string;
  role: string;
}

export function useInviteMember() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: InviteFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Check if email already exists in team members
      const { data: existingMember, error: memberError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_owner_id', user.id)
        .eq('member_email', formData.email)
        .single();

      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw memberError;
      }

      if (existingMember) {
        toast.error('This email is already a team member');
        return;
      }

      // Check if email already has a pending invitation
      const { data: existingInvite, error: inviteError } = await supabase
        .from('team_invitations')
        .select('id')
        .eq('team_owner_id', user.id)
        .eq('member_email', formData.email)
        .eq('status', 'pending')
        .single();

      if (inviteError && inviteError.code !== 'PGRST116') {
        throw inviteError;
      }

      if (existingInvite) {
        toast.error('A pending invitation already exists for this email');
        return;
      }

      // Get user's plan and team members count
      const { data: userData, error: userError } = await supabase
        .from('users_data')
        .select('plan')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Get current team members count
      const { count, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_owner_id', user.id);

      if (countError) throw countError;

      // Check team member limit based on plan
      const memberLimit = userData.plan === 'Basic' ? 5 : userData.plan === 'Pro' ? 10 : 15;
      if (count && count >= memberLimit) {
        toast.error(`You've reached the maximum team members limit for your ${userData.plan} plan`);
        return;
      }

      // Generate a unique token for the invitation
      const invitationToken = crypto.randomUUID();

      // Create invitation record
      const { error: createInviteError } = await supabase
        .from('team_invitations')
        .insert({
          team_owner_id: user.id,
          member_name: formData.name,
          member_email: formData.email,
          role: formData.role,
          token: invitationToken,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
        });

      if (createInviteError) throw createInviteError;

      // Send invitation email using local API route
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.email,
          name: formData.name,
          role: formData.role,
          token: invitationToken,
          teamOwnerId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation email');
      }

      toast.success('Invitation sent successfully!');
      setSuccess('Invitation sent successfully!');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    handleSubmit,
  };
} 