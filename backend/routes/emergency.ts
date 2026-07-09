import { Router, Request, Response } from 'express';
import { EmailService } from '../services/emailService';
import { SmsService } from '../services/smsService';

const router = Router();

interface Contact {
  name: string;
  phone: string;
  email: string;
}

// POST /api/emergency/trigger
router.post('/trigger', async (req: Request, res: Response) => {
  const { userName, emergencyEventId, riskScore, latitude, longitude, contacts } = req.body;

  if (!userName || !emergencyEventId || !contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  console.log(`🚨 Emergency SOS request received for ${userName}. Event ID: ${emergencyEventId}, Risk: ${riskScore}`);

  const dispatches = [];
  let emailDispatchedCount = 0;
  let smsDispatchedCount = 0;
  const previewUrls: string[] = [];

  for (const contact of contacts as Contact[]) {
    const contactName = contact.name || 'Guardian';
    const email = contact.email;
    const phone = contact.phone;

    const dispatchItem: { name: string; emailStatus: string; smsStatus: string } = {
      name: contactName,
      emailStatus: 'skipped',
      smsStatus: 'skipped',
    };

    // Send Email if present
    if (email && email.trim() !== '') {
      try {
        const mailResult = await EmailService.sendEmergencyAlert({
          to: email,
          userName,
          emergencyEventId,
          latitude: latitude || 0,
          longitude: longitude || 0,
          riskScore: riskScore || 100,
        });
        if (mailResult.success) {
          dispatchItem.emailStatus = 'sent';
          emailDispatchedCount++;
          if (mailResult.previewUrl) {
            previewUrls.push(mailResult.previewUrl);
          }
        } else {
          dispatchItem.emailStatus = 'failed';
        }
      } catch (err) {
        dispatchItem.emailStatus = 'error';
        console.error(`Failed to send email to ${email}:`, err);
      }
    }

    // Send SMS if present
    if (phone && phone.trim() !== '') {
      try {
        const smsResult = await SmsService.sendEmergencySms({
          to: phone,
          userName,
          emergencyEventId,
          riskScore: riskScore || 100,
        });
        if (smsResult.success) {
          dispatchItem.smsStatus = 'sent';
          smsDispatchedCount++;
        } else {
          dispatchItem.smsStatus = 'failed';
        }
      } catch (err) {
        dispatchItem.smsStatus = 'error';
        console.error(`Failed to send SMS to ${phone}:`, err);
      }
    }

    dispatches.push(dispatchItem);
  }

  res.json({
    message: 'SOS dispatches processed.',
    eventRef: emergencyEventId,
    dispatches,
    stats: {
      totalContacts: contacts.length,
      emailsSent: emailDispatchedCount,
      smsSent: smsDispatchedCount,
    },
    mockPreviews: previewUrls,
  });
});

export default router;
