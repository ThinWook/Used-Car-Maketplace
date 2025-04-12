/**
 * Trả về phản hồi thành công
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo thành công
 * @param {any} data - Dữ liệu trả về
 * @param {number} statusCode - Mã trạng thái HTTP
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Trả về phản hồi lỗi
 * @param {Object} res - Express response object
 * @param {string} message - Thông báo lỗi
 * @param {number} statusCode - Mã trạng thái HTTP
 * @param {any} errors - Chi tiết lỗi (tùy chọn)
 */
const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
}; 