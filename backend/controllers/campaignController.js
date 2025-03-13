const Campaign = require('../models/Campaign');
const EmailTracker = require('../models/EmailTracker');
const Queue = require('bull');
const emailQueue = new Queue('email-queue');

exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      sender: req.user._id
    });

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