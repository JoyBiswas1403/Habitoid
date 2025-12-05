import nodemailer from "nodemailer";

// Email service using Nodemailer with Gmail (free tier)
// For production, consider using environment variables for all credentials

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

// Create reusable transporter
// In development, uses Ethereal (fake SMTP) if no Gmail credentials
// In production, uses Gmail SMTP
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) return transporter;

    // Check for Gmail credentials
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailAppPassword) {
        // Production: Use Gmail SMTP (free tier)
        // Note: You need to enable 2FA and create an App Password in Google Account
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser,
                pass: gmailAppPassword,
            },
        });
        console.log("Email service: Using Gmail SMTP");
    } else {
        // Development: Use Ethereal (free fake SMTP for testing)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Email service: Using Ethereal test account");
        console.log("View test emails at: https://ethereal.email/login");
        console.log("Test account:", testAccount.user);
    }

    return transporter;
}

// Send an email
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    try {
        const transport = await getTransporter();

        const info = await transport.sendMail({
            from: process.env.GMAIL_USER || '"Habitoid" <noreply@habitoid.app>',
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log("Email sent:", info.messageId);

        // Get preview URL for Ethereal (development)
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log("Preview URL:", previewUrl);
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: previewUrl || undefined,
        };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false };
    }
}

// Send password reset email
export async function sendPasswordResetEmail(
    email: string,
    resetToken: string,
    baseUrl: string
): Promise<{ success: boolean; previewUrl?: string }> {
    const resetUrl = `${baseUrl}/#/reset-password?token=${resetToken}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 12px 20px; border-radius: 12px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Habitoid</span>
            </div>
          </div>
          
          <!-- Content -->
          <h1 style="color: #18181b; font-size: 24px; text-align: center; margin-bottom: 20px;">
            Reset Your Password
          </h1>
          
          <p style="color: #52525b; font-size: 16px; line-height: 1.6; text-align: center;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #71717a; font-size: 14px; text-align: center; margin-bottom: 20px;">
            This link will expire in <strong>1 hour</strong>.
          </p>
          
          <!-- Alternative link -->
          <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin-top: 20px;">
            <p style="color: #52525b; font-size: 12px; margin: 0 0 8px 0;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="color: #22c55e; font-size: 12px; word-break: break-all; margin: 0;">
              ${resetUrl}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 8px 0 0 0;">
              © ${new Date().getFullYear()} Habitoid. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: "Reset Your Habitoid Password",
        html,
    });
}

// Send welcome email
export async function sendWelcomeEmail(email: string, firstName: string): Promise<{ success: boolean }> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 12px 20px; border-radius: 12px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">Habitoid</span>
            </div>
          </div>
          
          <h1 style="color: #18181b; font-size: 24px; text-align: center;">
            Welcome to Habitoid, ${firstName}! 🎉
          </h1>
          
          <p style="color: #52525b; font-size: 16px; line-height: 1.6; text-align: center;">
            You're all set to start building better habits. Here's what you can do:
          </p>
          
          <ul style="color: #52525b; font-size: 14px; line-height: 2; padding-left: 20px;">
            <li>📊 Create and track daily habits</li>
            <li>🍅 Use the Pomodoro timer for focused work</li>
            <li>🤖 Get AI-powered insights on your progress</li>
            <li>🏆 Earn points and climb the leaderboard</li>
          </ul>
          
          <div style="border-top: 1px solid #e4e4e7; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #a1a1aa; font-size: 12px;">
              © ${new Date().getFullYear()} Habitoid. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: "Welcome to Habitoid! 🎉",
        html,
    });
}
