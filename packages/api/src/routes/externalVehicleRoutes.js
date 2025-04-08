const express = require('express');
const router = express.Router();
const externalVehicleController = require('../controllers/externalVehicleController');
const { protect } = require('../middleware/auth');
const {
  getVehicleImage,
  searchVehicles
} = require('../controllers/externalVehicleController');

// Public routes
router.get('/makes', externalVehicleController.getMakes);
router.get('/makes/:makeId/models', externalVehicleController.getModelsByMake);

// Protected routes
router.get('/details', protect, externalVehicleController.getVehicleDetails);
router.get('/recalls', protect, externalVehicleController.getVehicleRecalls);

router.get('/image', getVehicleImage);
router.get('/search', searchVehicles);

module.exports = router; 