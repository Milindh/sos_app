const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = process.env.SOS_FROM_ADDRESS || 'onboarding@resend.dev';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userName, contacts, location, timestamp } = req.body || {};

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'No contacts provided' });
    }

    const sentAt = timestamp ? new Date(timestamp) : new Date();
    const mapsLink = location
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : null;

    const subject = `SOS Alert from ${userName || 'a contact'}`;

    const buildHtml = (contactName) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px;">
        <h2 style="color: #e02424;">🚨 Emergency Alert</h2>
        <p>Hi ${contactName || ''},</p>
        <p><strong>${userName || 'Someone'}</strong> has triggered an SOS alert
          from their phone at ${sentAt.toLocaleString()}.</p>
        ${
          mapsLink
            ? `<p><a href="${mapsLink}" style="color:#2563eb;">View their location on Google Maps</a></p>`
            : `<p>Location was not available at the time of the alert.</p>`
        }
        <p>Please try to reach them as soon as possible.</p>
      </div>
    `;

    const results = await Promise.allSettled(
      contacts.map((contact) =>
        resend.emails.send({
          from: FROM_ADDRESS,
          to: contact.email,
          subject,
          html: buildHtml(contact.name),
        })
      )
    );

    const failed = results.filter((r) => r.status === 'rejected');

    if (failed.length > 0) {
      console.error('Some SOS emails failed to send', failed);
      return res.status(207).json({
        ok: failed.length < contacts.length,
        sent: contacts.length - failed.length,
        failed: failed.length,
      });
    }

    return res.status(200).json({ ok: true, sent: contacts.length });
  } catch (err) {
    console.error('SOS handler error', err);
    return res.status(500).json({ error: 'Internal error sending alert' });
  }
};