// Tạo file migration.js trong thư mục backend/src/scripts

const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
require('dotenv').config();

async function migrateSellerToUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Kết nối database thành công');

    // Cập nhật từ seller_id sang user cho xe hiện có
    const updateResult = await Vehicle.updateMany(
      { 
        seller_id: { $exists: true },
        user: { $exists: false }
      },
      [
        {
          $set: {
            user: '$seller_id', // Chuyển từ seller_id sang user
          }
        }
      ]
    );

    console.log(`Đã cập nhật ${updateResult.modifiedCount} xe từ seller_id sang user`);

    // Xóa trường seller_id và seller nếu chúng tồn tại
    const cleanupResult = await Vehicle.updateMany(
      { $or: [{ seller_id: { $exists: true } }, { seller: { $exists: true } }] },
      { $unset: { seller_id: "", seller: "" } }
    );

    console.log(`Đã xóa trường seller_id và seller từ ${cleanupResult.modifiedCount} xe`);
    
    console.log('Migration hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi migration:', error);
    process.exit(1);
  }
}

migrateSellerToUser();