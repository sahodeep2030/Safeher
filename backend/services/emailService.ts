import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  userName: string;
  emergencyEventId: string;
  latitude: number;
  longitude: number;
  riskScore: number;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter() {
    if (this.transporter) return this.transporter;

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (user && pass) {
      // Production SMTP Config
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      console.log('✉️ Nodemailer production SMTP configured.');
    } else {
      // Local Developer Mock Fallback using Ethereal.email
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log(`✉️ Nodemailer initialized using test account: ${testAccount.user}`);
      } catch (err) {
        console.warn('⚠️ Failed to initialize Ethereal Email. Falling back to log-only email sender.', err);
        this.transporter = null;
      }
    }
    return this.transporter;
  }

  public static async sendEmergencyAlert(payload: EmailPayload): Promise<{ success: boolean; previewUrl?: string }> {
    const { to, userName, emergencyEventId, latitude, longitude, riskScore } = payload;
    const dashboardUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/guardian/${emergencyEventId}`;

    const mailOptions = {
      from: `"SafeSphere AI Sentinel" <no-reply@safesphere-security.com>`,
      to,
      subject: `🚨 URGENT: Emergency SOS Alert triggered by ${userName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #b91c1c; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #b91c1c; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">🚨 EMERGENCY ALERT</h1>
          </div>
          <div style="padding: 24px; background-color: #fff; color: #1f2937;">
            <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
            <p style="font-size: 16px; line-height: 1.5;">
              This is an automated alert from <strong>SafeSphere AI</strong>. 
              Our Risk Engine has detected that <strong>${userName}</strong> is in immediate danger.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #991b1b; font-size: 16px;">Distress Details:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li><strong>Current Risk Score:</strong> ${riskScore}/100</li>
                <li><strong>Last Known Location:</strong> Latitude: ${latitude}, Longitude: ${longitude}</li>
                <li><strong>Event Reference ID:</strong> ${emergencyEventId}</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" target="_blank" style="background-color: #b91c1c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(185,28,28,0.4);">
                🔴 Open Guardian Live Dashboard
              </a>
            </p>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">
              Click the link above to view their real-time coordinates, speed, battery, and safety timeline on a live map.
            </p>
          </div>
          <div style="background-color: #f3f4f6; padding: 12px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
            SafeSphere AI Security Dispatcher • Sent via Secure SMTP
          </div>
        </div>
      `,
    };

    const transporter = await this.getTransporter();
    if (!transporter) {
      console.log(`✉️ [MOCK EMAIL ALERT SENT TO ${to}] for user: ${userName}. Dashboard Link: ${dashboardUrl}`);
      return { success: true };
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`✉️ Email successfully dispatched to ${to}. ID: ${info.messageId}`);
      if (previewUrl) {
        console.log(`🔗 Mock email preview URL: ${previewUrl}`);
      }
      return { success: true, previewUrl };
    } catch (err) {
      console.error('❌ Failed to dispatch email alert:', err);
      return { success: false };
    }
  }
}
