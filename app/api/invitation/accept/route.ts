import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Token is required`);
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Invalid or expired invitation`);
    }

    // Check if invitation is expired
    const invitationDate = new Date(invitation.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - invitationDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Invitation has expired`);
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('token', token);

    if (updateError) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Failed to accept invitation`);
    }

    // Add user to team
    const { error: teamError } = await supabase
      .from('team_members')
      .insert({
        team_owner_id: invitation.team_owner_id,
        member_name: invitation.member_name,
        member_email: invitation.member_email,
        role: invitation.role,
      });

    if (teamError) {
      console.error('Team error:', teamError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Failed to add user to team`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&success=true`);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=accept&error=Internal server error`);
  }
} 