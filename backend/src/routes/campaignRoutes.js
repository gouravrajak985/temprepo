const express = require('express');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(campaignController.getCampaigns)
  .post(campaignController.createCampaign);

router
  .route('/:id')
  .get(campaignController.getCampaign)
  .patch(campaignController.updateCampaign)
  .delete(campaignController.deleteCampaign);

router.post('/:id/send', campaignController.sendCampaign);
router.post('/send-single', campaignController.sendSingleEmail);
router.get('/single-emails', campaignController.getSingleEmails);

module.exports = router;