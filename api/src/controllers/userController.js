// Remove vehicle from favorites
removeFromFavorites: async (req, res) => {
  try {
    console.log('=== START removeFromFavorites ===');
    console.log('User ID:', req.user._id);
    console.log('Vehicle ID:', req.params.vehicleId);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const vehicleId = req.params.vehicleId;
    
    console.log('API - Remove from favorites:', {
      userId: req.user._id,
      vehicleId: vehicleId,
      userFavorites: user.favorites,
      favoritesType: typeof user.favorites,
      isArray: Array.isArray(user.favorites)
    });

    // Kiểm tra nếu favorites không phải là array, khởi tạo nó
    if (!Array.isArray(user.favorites) || !user.favorites) {
      console.log('Favorites is not an array or is empty');
      user.favorites = [];
      return res.status(400).json({ message: 'No favorites to remove' });
    }

    // Kiểm tra nếu xe không trong danh sách yêu thích
    const alreadyFavorited = user.favorites.some(favId => 
      favId && favId.toString() === vehicleId.toString()
    );

    if (!alreadyFavorited) {
      console.log('Vehicle not in favorites');
      return res.status(400).json({ message: 'Vehicle not in favorites' });
    }

    // Filter out the vehicle ID from favorites
    console.log('Removing from favorites. Before:', user.favorites);
    user.favorites = user.favorites.filter(
      fav => fav && fav.toString() !== vehicleId.toString()
    );
    console.log('After removal:', user.favorites);
    
    // Lưu vào database
    await user.save();
    console.log('User saved with updated favorites:', user.favorites);

    // Trả về thông tin chi tiết hơn
    console.log('=== END removeFromFavorites ===');
    res.json({ 
      message: 'Vehicle removed from favorites', 
      favorites: user.favorites,
      favoriteCount: user.favorites.length
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(400).json({ message: error.message });
  }
}, 