const Vehicle = require('../models/Vehicle');

class VehicleService {
  async createVehicle(vehicleData) {
    try {
      const vehicle = new Vehicle(vehicleData);
      return await vehicle.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllVehicles(filters = {}) {
    try {
      return await Vehicle.find(filters)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async getVehicleById(id) {
    try {
      return await Vehicle.findById(id)
        .populate('user', 'full_name email phone_number avatar_url rating');
    } catch (error) {
      throw error;
    }
  }

  async updateVehicle(id, updateData) {
    try {
      return await Vehicle.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteVehicle(id) {
    try {
      return await Vehicle.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async searchVehicles(searchTerm, filters = {}) {
    const searchRegex = new RegExp(searchTerm, 'i');
    const baseQuery = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { location: searchRegex }
      ],
      ...filters
    };

    return await Vehicle.find(baseQuery)
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 });
  }

  async getVehiclesByType(type) {
    return await Vehicle.find({ type })
      .populate('user', 'full_name email phone_number avatar_url rating')
      .sort({ createdAt: -1 });
  }
}

module.exports = new VehicleService(); 