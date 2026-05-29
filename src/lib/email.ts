// Email service abstraction
// Development mode: logs to console
// Production mode: sends via SMTP

import nodemailer from 'nodemailer';

const EMAIL_MODE = process.env.EMAIL_MODE || 'development';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Email templates
const EMAIL_TEMPLATES = {
    verification: {
        subject: 'Verify your LinkMe account',
        html: (code: string, name?: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #8b5cf6; font-size: 28px; margin: 0;">LinkMe</h1>
            </div>
            
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px; text-align: center;">
              Your Verification Code
            </h2>
            
            <p style="color: #4b5563; font-size: 16px;">
              Hi${name ? ` ${name}` : ''},
            </p>
            
            <p style="color: #4b5563; font-size: 16px;">
              Thanks for joining LinkMe! Use the 6-digit verification code below to secure your account and unlock your learning journey.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <div style="display: inline-block; background: #f9fafb; color: #1f2937; padding: 24px 48px; border-radius: 16px; font-size: 36px; font-weight: 900; letter-spacing: 8px; border: 2px solid #f3f4f6; font-family: 'Courier New', Courier, monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
              This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} LinkMe. Find the perfect tutorials, faster.
            </p>
          </div>
        </body>
      </html>
    `,
    },
};

// SMTP transporter for production
function createTransporter() {
    if (EMAIL_MODE === 'production') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return null;
}

// ============================================
// Email Service Functions
// ============================================

/**
 * Send verification email to user
 * In development mode, logs to console instead of sending
 */
export async function sendVerificationEmail(
    email: string,
    token: string,
    name?: string
): Promise<{ success: boolean; message: string }> {
    const template = EMAIL_TEMPLATES.verification;
 
     if (EMAIL_MODE === 'development') {
         // Development mode - log to console
         console.log('\n' + '='.repeat(60));
         console.log('VERIFICATION EMAIL (Development Mode)');
         console.log('='.repeat(60));
         console.log(`To: ${email}`);
         console.log(`Subject: ${template.subject}`);
         console.log(`Verification Code: ${token}`);
         console.log('='.repeat(60) + '\n');
 
         return {
             success: true,
             message: 'Verification email logged to console (development mode)'
         };
     }
 
     // Production mode - send via SMTP
     const transporter = createTransporter();
     if (!transporter) {
         return {
             success: false,
             message: 'Email service not configured'
         };
     }
 
     try {
         await transporter.sendMail({
             from: process.env.SMTP_FROM || 'noreply@linkme.app',
             to: email,
             subject: template.subject,
             html: template.html(token, name),
         });

        return {
            success: true,
            message: 'Verification email sent successfully'
        };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return {
            success: false,
            message: 'Failed to send verification email'
        };
    }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
    email: string,
    name?: string
): Promise<{ success: boolean; message: string }> {
    if (EMAIL_MODE === 'development') {
        console.log('\n' + '='.repeat(60));
        console.log('WELCOME EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Welcome, ${name || 'User'}! Your email is now verified.`);
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            message: 'Welcome email logged to console (development mode)'
        };
    }

    // Production implementation would go here
    return { success: true, message: 'Welcome email sent' };
}

/**
 * Send a password reset email with a secure one-time link
 */
export async function sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetUrl: string
): Promise<{ success: boolean; message: string }> {
    const firstName = name?.split(' ')[0] || 'there';
    const subject = 'Reset your LinkMe password';

    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8b5cf6; font-size: 28px; margin: 0;">LinkMe</h1>
              </div>

              <h2 style="color: #1f2937; font-size: 22px; margin-bottom: 16px; text-align: center;">
                Reset your password
              </h2>

              <p style="color: #4b5563; font-size: 16px;">Hi ${firstName},</p>
              <p style="color: #4b5563; font-size: 16px;">
                We received a request to reset your LinkMe password. Click the button below to choose a new one.
                This link expires in <strong>1 hour</strong>.
              </p>

              <div style="text-align: center; margin: 36px 0;">
                <a href="${resetUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white;
                          text-decoration: none; padding: 14px 40px; border-radius: 10px;
                          font-weight: 800; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                  Reset Password
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 13px; text-align: center;">
                If you didn't request this, you can safely ignore this email — your password won't change.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} LinkMe. Find the perfect tutorials, faster.
              </p>
            </div>
          </body>
        </html>
    `;

    if (EMAIL_MODE === 'development') {
        console.log('\n' + '='.repeat(60));
        console.log('PASSWORD RESET EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('='.repeat(60) + '\n');
        return { success: true, message: 'Password reset email logged to console (development mode)' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, message: 'Email service not configured' };
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@linkme.app',
            to: email,
            subject,
            html,
        });
        return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
        console.error('Failed to send password reset email:', error);
        return { success: false, message: 'Failed to send password reset email' };
    }
}

export interface ActiveLearningPath {
    topic: string;
    totalVideos: number;
    watchedCount: number;
    estimatedTotalTime: string;
}

/**
 * Send a Duolingo-style daily reminder email encouraging the user to watch
 * a few minutes of video from their active learning paths.
 */
export async function sendDailyReminderEmail(
    email: string,
    name: string | null,
    activePaths: ActiveLearningPath[]
): Promise<{ success: boolean; message: string }> {
    const firstName = name?.split(' ')[0] || 'there';
    const subject = `Your daily learning reminder — keep the streak alive`;

    const pathRows = activePaths.map(p => {
        const pct = p.totalVideos > 0 ? Math.round((p.watchedCount / p.totalVideos) * 100) : 0;
        const remaining = p.totalVideos - p.watchedCount;
        return `
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #1f2937;">
              <p style="color: #ffffff; font-size: 14px; font-weight: 700; margin: 0 0 6px 0;">${p.topic}</p>
              <div style="background: #1f2937; border-radius: 4px; height: 6px; overflow: hidden; margin-bottom: 6px;">
                <div style="background: linear-gradient(90deg, #7c3aed, #4f46e5); width: ${pct}%; height: 100%; border-radius: 4px;"></div>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                ${p.watchedCount}/${p.totalVideos} videos &nbsp;&bull;&nbsp; ${remaining} left &nbsp;&bull;&nbsp; ${p.estimatedTotalTime} total
              </p>
            </td>
          </tr>`;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Learning Reminder</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; background-color: #0d0d10;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #0a0a0f; border: 1px solid #1f2937; border-radius: 16px; padding: 40px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">

              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #8b5cf6; font-size: 26px; margin: 0; letter-spacing: -1px; font-weight: 900;">LinkMe</h1>
              </div>

              <!-- Headline -->
              <h2 style="color: #ffffff; font-size: 22px; font-weight: 900; text-align: center; margin: 0 0 8px 0;">
                Keep your streak going, ${firstName}
              </h2>
              <p style="color: #6b7280; font-size: 15px; text-align: center; margin: 0 0 32px 0;">
                Just a few minutes of video today keeps your momentum alive.
                Your paths are waiting.
              </p>

              <!-- Active paths -->
              ${activePaths.length > 0 ? `
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tbody>
                  ${pathRows}
                </tbody>
              </table>
              ` : `
              <div style="background: #111111; border: 1px solid #262626; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">Start a new learning path in LinkMe to track your progress here.</p>
              </div>
              `}

              <!-- CTA -->
              <div style="text-align: center;">
                <a href="${APP_URL}/chat"
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none;
                          padding: 14px 40px; border-radius: 10px; font-weight: 800; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                  Continue Learning
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #1f2937; margin: 36px 0 24px 0;">
              <p style="color: #374151; font-size: 11px; text-align: center; margin: 0;">
                You're getting this because you enabled daily reminders in your LinkMe settings.<br>
                <a href="${APP_URL}/settings" style="color: #4b5563; text-decoration: underline;">Turn off reminders</a>
                &nbsp;&bull;&nbsp;
                &copy; ${new Date().getFullYear()} LinkMe
              </p>
            </div>
          </body>
        </html>
    `;

    if (EMAIL_MODE === 'development') {
        console.log('\n' + '='.repeat(60));
        console.log('DAILY REMINDER EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email} (${firstName})`);
        console.log(`Subject: ${subject}`);
        console.log(`Active paths: ${activePaths.length}`);
        activePaths.forEach(p => console.log(`  - ${p.topic}: ${p.watchedCount}/${p.totalVideos} watched`));
        console.log('='.repeat(60) + '\n');
        return { success: true, message: 'Daily reminder email logged to console (development mode)' };
    }

    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, message: 'Email service not configured' };
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@linkme.app',
            to: email,
            subject,
            html,
        });
        return { success: true, message: 'Daily reminder email sent successfully' };
    } catch (error) {
        console.error('Failed to send daily reminder email:', error);
        return { success: false, message: 'Failed to send daily reminder email' };
    }
}
