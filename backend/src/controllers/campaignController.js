const Campaign = require('../models/Campaign');
const EmailTracker = require('../models/EmailTracker');
const SingleEmail = require('../models/SingleEmail');
const Queue = require('bull');
const nodemailer = require('nodemailer');
const emailQueue = new Queue('email-queue');

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

    // Create campaign with validated recipients
    const campaign = await Campaign.create({
      name: req.body.name,
      subject: req.body.subject,
      body: req.body.body,
      sender: req.user._id,
      status: req.body.scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: req.body.scheduledFor || null,
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

    // Handle file attachments if present
    if (req.files && req.files.length > 0) {
      campaign.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype
      }));
      await campaign.save();
    }

    res.status(201).json({
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

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        contentType: file.mimetype
      }));
    }

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html: body,
        attachments
      });

      // Log the sent email
      await SingleEmail.create({
        sender: req.user._id,
        recipient: { email, firstName, lastName },
        subject,
        body,
        attachments,
        status: 'sent'
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent successfully'
      });
    } catch (error) {
      // Log failed attempt
      await SingleEmail.create({
        sender: req.user._id,
        recipient: { email, firstName, lastName },
        subject,
        body,
        attachments,
        status: 'failed',
        error: error.message
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