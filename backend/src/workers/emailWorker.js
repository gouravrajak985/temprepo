const Queue = require('bull');
const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const EmailTracker = require('../models/EmailTracker');

const emailQueue = new Queue('email-queue');

// Create email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

emailQueue.process('send-email', async (job) => {
  const { trackerId, campaignId } = job.data;

  try {
    const [tracker, campaign] = await Promise.all([
      EmailTracker.findById(trackerId),
      Campaign.findById(campaignId)
    ]);

    if (!tracker || !campaign) {
      throw new Error('Tracker or campaign not found');
    }

    // Add tracking pixel and click tracking
    const trackingPixel = `<img src="${process.env.API_URL}/track/open/${tracker._id}" />`;
    let emailBody = campaign.body + trackingPixel;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: tracker.recipient.email,
      subject: campaign.subject,
      html: emailBody,
      attachments: campaign.attachments
    });

    // Update tracker status
    tracker.status = 'sent';
    tracker.deliveredAt = new Date();
    await tracker.save();

    // Update campaign analytics
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 'analytics.sent': 1 }
    });

  } catch (error) {
    // Handle failure
    await EmailTracker.findByIdAndUpdate(trackerId, {
      status: 'failed',
      failedAt: new Date(),
      failureReason: error.message
    });

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 'analytics.failed': 1 }
    });

    throw error;
  }
});

// Process scheduled campaigns
emailQueue.process('schedule-campaign', async (job) => {
  const { campaignId } = job.data;

  try {
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Create email trackers for each recipient
    const emailTrackers = await Promise.all(
      campaign.recipients.map(recipient =>
        EmailTracker.create({
          campaign: campaign._id,
          recipient: {
            email: recipient.email,
            firstName: recipient.firstName,
            lastName: recipient.lastName
          }
        })
      )
    );

    // Add emails to queue
    await Promise.all(
      emailTrackers.map(tracker =>
        emailQueue.add('send-email', {
          trackerId: tracker._id,
          campaignId: campaign._id
        })
      )
    );

    // Update campaign status
    campaign.status = 'sending';
    await campaign.save();

  } catch (error) {
    // Update campaign status to failed if there's an error
    await Campaign.findByIdAndUpdate(campaignId, {
      status: 'failed',
      error: error.message
    });
    throw error;
  }
});