const verifiedKyc = (req, res, next) => {
  if (req.user && req.user.kyc_status === 'verified') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Tài khoản chưa được xác thực KYC. Vui lòng hoàn thành xác thực KYC trước khi đăng tin.',
      redirect: '/profile/edit' 
    });
  }
};

module.exports = { verifiedKyc }; 