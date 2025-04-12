// Add vehicle to favorites
addToFavorites: async (req, res) => {
  try {
    console.log('=== START addToFavorites ===');
    console.log('User ID:', req.user._id);
    console.log('Vehicle ID:', req.params.vehicleId);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const vehicleId = req.params.vehicleId;
    
    console.log('API - Add to favorites:', {
      userId: req.user._id,
      vehicleId: vehicleId,
      userFavorites: user.favorites,
      favoritesType: typeof user.favorites,
      isArray: Array.isArray(user.favorites)
    });

    // Kiểm tra nếu favorites không phải là array, khởi tạo nó
    if (!user.favorites) {
      user.favorites = [];
      console.log('Created empty favorites array');
    }

    // Chuyển đổi vehicleId và so sánh chuỗi thay vì kiểm tra 'includes'
    const alreadyFavorited = user.favorites.some(favId => 
      favId && favId.toString() === vehicleId.toString()
    );

    if (alreadyFavorited) {
      console.log('Vehicle already in favorites');
      return res.status(400).json({ message: 'Vehicle already in favorites' });
    }

    // Thêm vào mảng favorites, đảm bảo ID hợp lệ
    try {
      const mongoose = require('mongoose');
      // Kiểm tra và tạo một ObjectId hợp lệ
      const validObjectId = mongoose.Types.ObjectId.isValid(vehicleId) 
        ? mongoose.Types.ObjectId(vehicleId)
        : null;
      
      if (!validObjectId) {
        console.log('Invalid Vehicle ID format');
        return res.status(400).json({ message: 'Invalid Vehicle ID format' });
      }
      
      // Push ObjectId vào mảng
      user.favorites.push(validObjectId);
      console.log('Added to favorites array:', user.favorites);
    } catch (err) {
      console.error('Error adding to favorites array:', err);
      return res.status(400).json({ message: 'Error adding to favorites: ' + err.message });
    }

    // Lưu vào database
    await user.save();
    console.log('User saved with new favorites:', user.favorites);

    // Trả về thông tin chi tiết hơn
    console.log('=== END addToFavorites ===');
    res.json({ 
      message: 'Vehicle added to favorites', 
      favorites: user.favorites,
      favoriteCount: user.favorites.length
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(400).json({ message: error.message });
  }
}, 