const express = require('express');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Campaign routes
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

module.exports = router;