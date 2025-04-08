const asyncHandler = require('express-async-handler');
const externalVehicleService = require('../services/externalVehicleService');

const externalVehicleController = {
  async getMakes(req, res) {
    try {
      const makes = await externalVehicleService.getMakes();
      res.json(makes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching makes', error: error.message });
    }
  },

  async getModelsByMake(req, res) {
    try {
      const { makeId } = req.params;
      const models = await externalVehicleService.getModelsByMake(makeId);
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching models', error: error.message });
    }
  },

  async getVehicleDetails(req, res) {
    try {
      const { make, model, year } = req.query;
      const details = await externalVehicleService.getVehicleDetails(make, model, year);
      res.json(details);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vehicle details', error: error.message });
    }
  },

  async getVehicleRecalls(req, res) {
    try {
      const { make, model, year } = req.query;
      const recalls = await externalVehicleService.getVehicleRecalls(make, model, year);
      res.json(recalls);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching recalls', error: error.message });
    }
  },

  // @desc    Get vehicle image from external API
  // @route   GET /api/external-vehicles/image
  // @access  Public
  getVehicleImage: asyncHandler(async (req, res) => {
    const { brand, model, year } = req.query;

    if (!brand || !model) {
      res.status(400);
      throw new Error('Please provide brand and model');
    }

    const imageData = await externalVehicleService.getVehicleImage(
      brand,
      model,
      year || new Date().getFullYear()
    );

    res.json(imageData);
  }),

  // @desc    Search vehicles from external API
  // @route   GET /api/external-vehicles/search
  // @access  Public
  searchVehicles: asyncHandler(async (req, res) => {
    const vehicles = await externalVehicleService.searchVehicles(req.query);
    res.json(vehicles);
  })
};

module.exports = externalVehicleController; 