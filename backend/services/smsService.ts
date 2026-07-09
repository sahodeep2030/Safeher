import twilio from 'twilio';

interface SmsPayload {
  to: string;
  userName: string;
  emergencyEventId: string;
  riskScore: number;
}

export class SmsService {
  private static client: twilio.Twilio | null = null;

  private static getClient() {
    if (this.client) return this.client;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && accountSid !== 'YOUR_TWILIO_ACCOUNT_SID') {
      this.client = twilio(accountSid, authToken);
      console.log('📱 Twilio client configured.');
    }
    return this.client;
  }

  public static async sendEmergencySms(payload: SmsPayload): Promise<{ success: boolean }> {
    const { to, userName, emergencyEventId, riskScore } = payload;
    const dashboardUrl = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/guardian/${emergencyEventId}`;
    const smsBody = `🚨 SafeSphere ALERT: Emergency SOS triggered by ${userName}! Risk Score: ${riskScore}/100. Track live location: ${dashboardUrl}`;

    const client = this.getClient();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!client || !fromPhone || fromPhone === 'YOUR_TWILIO_PHONE_NUMBER') {
      console.log(`📱 [MOCK SMS ALERT SENT TO ${to}] Body: "${smsBody}"`);
      return { success: true };
    }

    try {
      const message = await client.messages.create({
        body: smsBody,
        from: fromPhone,
        to,
      });
      console.log(`📱 SMS successfully dispatched via Twilio to ${to}. Message SID: ${message.sid}`);
      return { success: true };
    } catch (err) {
      console.error('❌ Failed to dispatch SMS via Twilio:', err);
      return { success: false };
    }
  }
}
