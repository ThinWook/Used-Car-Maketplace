const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'used-vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const upload = multer({ storage: storage });

// Import vehicle controller
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehiclesByType,
  uploadVehicleImages,
  getUserVehicles,
} = require('../controllers/vehicleController');

// Routes
router.route('/')
  .get(getAllVehicles)
  .post(protect, createVehicle);

router.route('/user')
  .get(protect, getUserVehicles);

router.route('/search')
  .get(getAllVehicles);

router.route('/type/:type')
  .get(getVehiclesByType);

router.route('/upload')
  .post(protect, upload.array('images', 10), uploadVehicleImages);

router.route('/:id')
  .get(getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

module.exports = router; 