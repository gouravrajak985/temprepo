const Campaign = require('../models/Campaign');
const EmailTracker = require('../models/EmailTracker');
const nodemailer = require('nodemailer');
const Queue = require('bull');

// Create email queue
const emailQueue = new Queue('email-queue', {
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
});

// Create email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Process emails in the queue
emailQueue.process('send-email', async (job) => {
  const { trackerId, campaignId } = job.data;
  
  try {
    const emailTracker = await EmailTracker.findById(trackerId);
    const campaign = await Campaign.findById(campaignId);

    if (!emailTracker || !campaign) {
      throw new Error('Email tracker or campaign not found');
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emailTracker.recipient.email,
      subject: campaign.subject,
      html: campaign.body
    });

    // Update tracker and campaign analytics
    emailTracker.status = 'sent';
    emailTracker.deliveredAt = new Date();
    await emailTracker.save();

    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: {
        'analytics.sent': 1
      }
    });

    return { success: true };
  } catch (error) {
    // Update tracker and campaign analytics for failure
    if (trackerId) {
      await EmailTracker.findByIdAndUpdate(trackerId, {
        status: 'failed',
        failedAt: new Date(),
        failureReason: error.message
      });
    }

    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: {
          'analytics.failed': 1
        }
      });
    }

    throw error;
  }
});

exports.createCampaign = async (req, res) => {
  try {
    // Parse recipients from the request body
    let recipients;
    try {
      recipients = JSON.parse(req.body.recipients);
    } catch (error) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid recipients format'
      });
    }

    // Validate recipients
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'At least one recipient is required'
      });
    }

    // Validate each recipient
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidRecipients = recipients.filter(r => !r.email || !emailRegex.test(r.email));
    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email address found in recipients'
      });
    }

    // Create campaign
    const campaign = await Campaign.create({
      name: req.body.name,
      subject: req.body.subject,
      body: req.body.body,
      sender: req.user._id,
      status: 'sending',
      recipients: recipients.map(r => ({
        email: r.email,
        firstName: r.firstName || '',
        lastName: r.lastName || '',
        customFields: r.customFields || {}
      })),
      analytics: {
        totalRecipients: recipients.length,
        sent: 0,
        opened: 0,
        clicked: 0,
        failed: 0
      }
    });

    // Create email trackers and queue emails immediately
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

    res.status(201).json({
      status: 'success',
      data: { campaign }
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
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

    res.status(200).json({
      status: 'success',
      message: 'Campaign is being sent'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ sender: req.user._id });
    
    res.status(200).json({
      status: 'success',
      data: { campaigns }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { campaign }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    // Handle recipients update if present
    if (req.body.recipients) {
      try {
        const recipients = JSON.parse(req.body.recipients);
        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'At least one recipient is required'
          });
        }

        // Validate recipient emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidRecipients = recipients.filter(r => !r.email || !emailRegex.test(r.email));
        if (invalidRecipients.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Invalid email address found in recipients'
          });
        }

        req.body.recipients = recipients;
        req.body.analytics = {
          totalRecipients: recipients.length,
          sent: 0,
          opened: 0,
          clicked: 0,
          failed: 0
        };
      } catch (error) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid recipients format'
        });
      }
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, sender: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { campaign }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.sendSingleEmail = async (req, res) => {
  try {
    const { email, firstName, lastName, subject, body } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email address'
      });
    }

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: body
    });

    // Log the sent email
    await EmailTracker.create({
      recipient: { email, firstName, lastName },
      status: 'sent',
      deliveredAt: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully'
    });
  } catch (error) {
    // Log failed attempt
    await EmailTracker.create({
      recipient: { email, firstName, lastName },
      status: 'failed',
      failedAt: new Date(),
      failureReason: error.message
    });

    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getSingleEmails = async (req, res) => {
  try {
    const emails = await EmailTracker.find({ sender: req.user._id })
      .sort({ sentAt: -1 })
      .limit(100);

    res.status(200).json({
      status: 'success',
      data: { emails }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 