const Vehicle = require('../models/Vehicle');

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
  try {
    console.log('Received create vehicle request');
    console.log('User ID:', req.user?._id);

    if (!req.body) {
      return res.status(400).json({ message: 'Missing request body' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Log the basic data to debug
    console.log('Vehicle data received:', {
      title: req.body.title,
      description: req.body.description?.substring(0, 20) + '...',
      type: req.body.type,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      price: req.body.price,
      hasImages: !!req.body.images,
      imagesCount: req.body.images?.length || 0
    });

    // Create a basic vehicle object WITHOUT any images or large data
    const basicVehicleData = {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      make: req.body.make,
      model: req.body.model, 
      year: req.body.year,
      price: req.body.price,
      location: req.body.location,
      user: req.user._id,
      status: 'pending',
      // Include other basic fields
      mileage: req.body.mileage || 0,
      body_type: req.body.body_type || 'Other',
      fuel_type: req.body.fuel_type || 'Other',
      transmission: req.body.transmission || 'Other',
      // Empty placeholder for images
      images: []
    };

    try {
      console.log('Creating vehicle with basic data');
      const vehicle = await Vehicle.create(basicVehicleData);
      console.log('Vehicle created successfully with ID:', vehicle._id);
      
      // Return success immediately after creating basic vehicle
      return res.status(201).json({
        _id: vehicle._id,
        title: vehicle.title,
        message: 'Vehicle created successfully'
      });
    } catch (dbError) {
      console.error('Database error creating vehicle:', dbError);
      
      if (dbError.name === 'ValidationError') {
        const fields = Object.keys(dbError.errors);
        console.error('Validation failed for fields:', fields);
        return res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ',
          fields
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating vehicle:', error);
    
    // Kiểm tra cụ thể lỗi từ mongoose để trả về thông báo phù hợp
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: messages 
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: 'Trùng lặp dữ liệu', 
        field: Object.keys(error.keyValue)[0] 
      });
    }
    
    // Generic error, return a 500
    res.status(500).json({ message: error.message || 'Error creating vehicle' });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
exports.getAllVehicles = async (req, res) => {
  try {
    const { 
      type, 
      brand, 
      minPrice, 
      maxPrice, 
      condition, 
      location,
      page = 1,
      limit = 10
    } = req.query;
    
    const filters = {};
    
    if (type) filters.type = type;
    if (brand) filters.brand = brand;
    if (condition) filters.condition = condition;
    if (location) filters.location = location;
    
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Pagination setup
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Vehicle.countDocuments(filters);
    
    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filters)
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Send response with pagination data
    res.json({
      vehicles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vehicles by type
// @route   GET /api/vehicles/type/:type
// @access  Public
exports.getVehiclesByType = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ type: req.params.type })
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('user', 'full_name email phone_number avatar_url rating');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload vehicle images
// @route   POST /api/vehicles/upload
// @access  Private
exports.uploadVehicleImages = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('User:', req.user);
    console.log('Files:', req.files);
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_length: process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.length : 0,
      api_secret_length: process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 0
    });

    if (!req.files) {
      console.log('No files uploaded');
      return res.status(400).json({ message: 'Please upload files' });
    }

    const urls = req.files.map(file => file.path);
    console.log('Upload successful. URLs:', urls);
    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user vehicles
// @route   GET /api/vehicles/user
// @access  Private
exports.getUserVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user._id })
      .populate('user', 'full_name email phone_number avatar_url rating');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 