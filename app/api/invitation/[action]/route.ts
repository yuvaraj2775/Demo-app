import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { action: string } }
) {
  const { action } = params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  // Here you would typically:
  // 1. Verify the token
  // 2. Update the invitation status in your database
  // 3. Add the user to the team if accepted

  // For now, we'll just redirect to the thank-you page
  return NextResponse.redirect(new URL(`/invitation/thank-you?action=${action}`, request.url));
} 