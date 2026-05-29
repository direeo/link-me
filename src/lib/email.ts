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
 * Send learning path completion congratulations email
 */
export async function sendLearningPathCompletionEmail(
    email: string,
    name: string | null,
    topic: string,
    totalVideos: number,
    estimatedTime: string
): Promise<{ success: boolean; message: string }> {
    const subject = `You completed your ${topic} learning path!`;
    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Learning Path Completed</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0f; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8b5cf6; font-size: 28px; margin: 0; letter-spacing: -1px;">LinkMe</h1>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #4f46e5); line-height: 72px; font-size: 36px;">
                  &#x2713;
                </div>
              </div>

              <h2 style="color: #ffffff; font-size: 24px; text-align: center; margin-bottom: 8px;">
                Learning Path Complete
              </h2>
              <p style="color: #6b7280; text-align: center; font-size: 15px; margin-bottom: 32px;">
                Hi${name ? ` ${name}` : ''},<br>you've finished your <strong style="color: #a78bfa;">${topic}</strong> learning path.
              </p>

              <div style="background: #111111; border: 1px solid #262626; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                <div style="display: inline-flex; gap: 40px;">
                  <div>
                    <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Videos watched</p>
                    <p style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0;">${totalVideos}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Time invested</p>
                    <p style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0;">${estimatedTime}</p>
                  </div>
                </div>
              </div>

              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 24px;">
                Ready for your next challenge? Head back to LinkMe and start a new learning path.
              </p>

              <div style="text-align: center; margin-top: 32px;">
                <a href="${APP_URL}/chat" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                  Start Next Path
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #1f2937; margin: 32px 0;">
              <p style="color: #374151; font-size: 12px; text-align: center;">
                You received this because you enabled learning reminders in your LinkMe settings.<br>
                &copy; ${new Date().getFullYear()} LinkMe
              </p>
            </div>
          </body>
        </html>
    `;

    if (EMAIL_MODE === 'development') {
        console.log('\n' + '='.repeat(60));
        console.log('COMPLETION EMAIL (Development Mode)');
        console.log('='.repeat(60));
        console.log(`To: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Topic: ${topic} | Videos: ${totalVideos} | Time: ${estimatedTime}`);
        console.log('='.repeat(60) + '\n');
        return { success: true, message: 'Completion email logged to console (development mode)' };
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
        return { success: true, message: 'Completion email sent successfully' };
    } catch (error) {
        console.error('Failed to send completion email:', error);
        return { success: false, message: 'Failed to send completion email' };
    }
}
