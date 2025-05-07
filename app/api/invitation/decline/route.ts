import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=decline&error=Token is required`);
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
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=decline&error=Invalid or expired invitation`);
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({ status: 'declined' })
      .eq('token', token);

    if (updateError) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=decline&error=Failed to decline invitation`);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=decline&success=true`);
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/invitation/thank-you?action=decline&error=Internal server error`);
  }
} 