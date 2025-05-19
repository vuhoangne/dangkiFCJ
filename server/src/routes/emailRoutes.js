const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { isAuthenticated } = require('../middleware/auth');

// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Gửi email thông báo khi đăng ký được duyệt
router.post('/approval', isAuthenticated, async (req, res) => {
  try {
    const { name, email, date, time, floor, purpose } = req.body;
    
    if (!name || !email || !date) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Đăng ký lên văn phòng đã được duyệt',
      html: `
        <h2>Xin chào ${name},</h2>
        <p>Đăng ký lên văn phòng của bạn đã được <strong>duyệt</strong>.</p>
        <h3>Chi tiết:</h3>
        <ul>
          <li><strong>Ngày:</strong> ${date}</li>
          <li><strong>Thời gian:</strong> ${time}</li>
          <li><strong>Tầng:</strong> ${floor}</li>
          <li><strong>Mục đích:</strong> ${purpose}</li>
        </ul>
        <p>Vui lòng đến đúng giờ và tuân thủ các quy định của văn phòng.</p>
        <p>Trân trọng,<br>Ban quản lý</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email thông báo duyệt đã được gửi' });
  } catch (error) {
    console.error('Lỗi khi gửi email duyệt:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi email duyệt' });
  }
});

// Gửi email thông báo khi đăng ký bị từ chối
router.post('/rejection', isAuthenticated, async (req, res) => {
  try {
    const { name, email, date, time, floor, purpose, reason } = req.body;
    
    if (!name || !email || !date) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Đăng ký lên văn phòng đã bị từ chối',
      html: `
        <h2>Xin chào ${name},</h2>
        <p>Đăng ký lên văn phòng của bạn đã bị <strong>từ chối</strong>.</p>
        <h3>Chi tiết:</h3>
        <ul>
          <li><strong>Ngày:</strong> ${date}</li>
          <li><strong>Thời gian:</strong> ${time}</li>
          <li><strong>Tầng:</strong> ${floor}</li>
          <li><strong>Mục đích:</strong> ${purpose}</li>
        </ul>
        <p><strong>Lý do từ chối:</strong> ${reason || 'Không có lý do cụ thể'}</p>
        <p>Bạn có thể đăng ký lại với thông tin phù hợp hơn.</p>
        <p>Trân trọng,<br>Ban quản lý</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email thông báo từ chối đã được gửi' });
  } catch (error) {
    console.error('Lỗi khi gửi email từ chối:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi email từ chối' });
  }
});

// Gửi email nhắc nhở
router.post('/reminder', isAuthenticated, async (req, res) => {
  try {
    const { name, email, date, time, floor, purpose } = req.body;
    
    if (!name || !email || !date) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nhắc nhở lịch lên văn phòng',
      html: `
        <h2>Xin chào ${name},</h2>
        <p>Đây là email nhắc nhở về lịch lên văn phòng sắp tới của bạn.</p>
        <h3>Chi tiết:</h3>
        <ul>
          <li><strong>Ngày:</strong> ${date}</li>
          <li><strong>Thời gian:</strong> ${time}</li>
          <li><strong>Tầng:</strong> ${floor}</li>
          <li><strong>Mục đích:</strong> ${purpose}</li>
        </ul>
        <p>Vui lòng đến đúng giờ và tuân thủ các quy định của văn phòng.</p>
        <p>Trân trọng,<br>Ban quản lý</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email nhắc nhở đã được gửi' });
  } catch (error) {
    console.error('Lỗi khi gửi email nhắc nhở:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi gửi email nhắc nhở' });
  }
});

module.exports = router;
