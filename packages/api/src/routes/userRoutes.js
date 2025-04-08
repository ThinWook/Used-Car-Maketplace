const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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

// Debug Cloudinary configuration
console.log('Cloudinary Configuration:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key_length: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
  api_secret_length: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
});

// Configure multer storage for avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  },
});

// Configure multer storage for cover image uploads
const coverImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'covers',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1200, height: 300, crop: 'fill' }]
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadCoverImage = multer({ storage: coverImageStorage });

// Configure multer storage for KYC document uploads
const kycDocumentsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyc_documents',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ quality: 'auto:best' }]
  },
});

const uploadKycDocuments = multer({ storage: kycDocumentsStorage });

// Debug middleware to log upload requests
const logUploadMiddleware = (req, res, next) => {
  console.log('Upload request received:');
  console.log('Headers:', req.headers);
  console.log('Files before multer:', req.files);
  next();
};

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.delete('/profile', protect, userController.deleteUser);

// Avatar upload route
router.post('/avatar', protect, logUploadMiddleware, uploadAvatar.single('avatar'), userController.updateUserAvatar);

// Cover image upload route
router.post('/cover-image', protect, logUploadMiddleware, uploadCoverImage.single('coverImage'), userController.updateUserCoverImage);

// KYC document upload route
router.post('/upload-kyc-documents', protect, logUploadMiddleware, uploadKycDocuments.fields([
  { name: 'front', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]), userController.uploadKycDocuments);

// KYC information update route
router.put('/update-kyc', protect, userController.updateKyc);

// Favorites routes
router.post('/favorites/:vehicleId', protect, userController.addToFavorites);
router.delete('/favorites/:vehicleId', protect, userController.removeFromFavorites);

module.exports = router; 