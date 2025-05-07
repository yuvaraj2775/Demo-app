import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { to, name, role, token, teamOwnerId } = await request.json();

    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invitation/accept?token=${token}`;
    const declineUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invitation/decline?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Team Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Team Invitation</h2>
          <p>Hello ${name},</p>
          <p>You have been invited to join a team with the role of ${role}.</p>
          <p>Please click one of the buttons below to accept or decline this invitation:</p>
          <div style="margin: 20px 0;">
            <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Accept Invitation</a>
            <a href="${declineUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Decline Invitation</a>
          </div>
          <p>This invitation will expire in 7 days.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 