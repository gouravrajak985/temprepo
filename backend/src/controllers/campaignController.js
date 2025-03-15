const Campaign = require('../models/Campaign');
const EmailTracker = require('../models/EmailTracker');
const SingleEmail = require('../models/SingleEmail');
const nodemailer = require('nodemailer');

// Create email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper function to send email and update tracking
async function sendEmailAndTrack(recipient, campaign, emailTracker) {
  try {
    const {email}= recipient;
    const {subject, body} = campaign;

    const mailOptions = {
      from: process.env.EMAIL_FROM, // Must be your verified email
      to: email,
      subject: subject,
      html: body,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
 
    // Update tracker and campaign analytics
    emailTracker.status = 'sent';
    emailTracker.deliveredAt = new Date();
    await emailTracker.save();

    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: {
        'analytics.sent': 1
      }
    });

    return true;
  } catch (error) {
    // Update tracker and campaign analytics for failure
    emailTracker.status = 'failed';
    emailTracker.failedAt = new Date();
    emailTracker.failureReason = error.message;
    await emailTracker.save();

    await Campaign.findByIdAndUpdate(campaign._id, {
      $inc: {
        'analytics.failed': 1
      }
    });

    return false;
  }
}

// Helper function to send emails in batches
async function sendEmailBatch(campaign, emailTrackers, batchSize = 50) {
  const totalRecipients = campaign.recipients.length;
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < totalRecipients; i += batchSize) {
    const batch = campaign.recipients.slice(i, i + batchSize);
    const batchTrackers = emailTrackers.slice(i, i + batchSize);

    // Send emails in current batch concurrently
    const results = await Promise.all(
      batch.map((recipient, index) => 
        sendEmailAndTrack(recipient, campaign, batchTrackers[index])
      )
    );

    // Count successes and failures
    successCount += results.filter(result => result).length;
    failureCount += results.filter(result => !result).length;

    // Small delay between batches to prevent overwhelming the email server
    if (i + batchSize < totalRecipients) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Update campaign status based on results
  const status = failureCount === totalRecipients ? 'failed' : 
                 successCount === totalRecipients ? 'completed' : 
                 'partially_sent';

  await Campaign.findByIdAndUpdate(campaign._id, { status });
}

exports.createCampaign = async (req, res) => {
  try {
    // Parse recipients from the request body
    let recipients;
    try {
      recipients = JSON.parse(req.body.recipients);
      console.log(recipients, "This is recipients");
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
    console.log(campaign, "this is created campaign");
    // Create email trackers
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

    // Start sending emails in background
    sendEmailBatch(campaign, emailTrackers).catch(error => {
      console.error('Error sending campaign emails:', error);
    });

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

    // Create email trackers
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

    // Update campaign status
    campaign.status = 'sending';
    await campaign.save();

    // Start sending emails in background
    sendEmailBatch(campaign, emailTrackers).catch(error => {
      console.error('Error sending campaign emails:', error);
    });

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
    if (req.body.recipients) {
      try {
        const recipients = JSON.parse(req.body.recipients);
        if (!Array.isArray(recipients) || recipients.length === 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'At least one recipient is required'
          });
        }

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
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html: body
      });

      // Create single email record
      const singleEmail = await SingleEmail.create({
        sender: req.user._id,
        recipient: { email, firstName, lastName },
        subject,
        body,
        status: 'sent',
        sentAt: new Date()
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent successfully',
        data: { email: singleEmail }
      });
    } catch (error) {
      // Log failed attempt
      await SingleEmail.create({
        sender: req.user._id,
        recipient: { email, firstName, lastName },
        subject,
        body,
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });

      throw error;
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getSingleEmails = async (req, res) => {
  try {
    const emails = await SingleEmail.find({ sender: req.user._id })
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