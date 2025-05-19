const express = require('express');
const router = express.Router();
const { sendApprovalEmail, sendRejectionEmail } = require('../emailService');

// Test gửi email duyệt
router.post('/test-approval', async (req, res) => {
  try {
    console.log('Đang test gửi email duyệt...');
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'floor', 'purpose', 'contact'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu thông tin: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    const testVisit = {
      id: 'test-id',
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      school: req.body.school,
      date: req.body.date,
      time: req.body.time,
      floor: req.body.floor,
      purpose: req.body.purpose,
      contact: req.body.contact,
      note: req.body.note
    };
    
    console.log('Dữ liệu test:', testVisit);
    
    const result = await sendApprovalEmail(testVisit);
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: 'Email duyệt đã được gửi thành công',
        to: testVisit.email
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Không thể gửi email duyệt',
        to: testVisit.email
      });
    }
  } catch (error) {
    console.error('Lỗi khi test gửi email duyệt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi test gửi email duyệt',
      error: error.message
    });
  }
});

// Test gửi email từ chối
router.post('/test-rejection', async (req, res) => {
  try {
    console.log('Đang test gửi email từ chối...');
    
    // Kiểm tra các trường bắt buộc
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'floor', 'purpose', 'contact'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].trim() === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Thiếu thông tin: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    const testVisit = {
      id: 'test-id',
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      school: req.body.school,
      date: req.body.date,
      time: req.body.time,
      floor: req.body.floor,
      purpose: req.body.purpose,
      contact: req.body.contact,
      note: req.body.note
    };
    
    console.log('Dữ liệu test:', testVisit);
    
    const result = await sendRejectionEmail(testVisit);
    
    if (result) {
      res.status(200).json({ 
        success: true, 
        message: 'Email từ chối đã được gửi thành công',
        to: testVisit.email
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Không thể gửi email từ chối',
        to: testVisit.email
      });
    }
  } catch (error) {
    console.error('Lỗi khi test gửi email từ chối:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi test gửi email từ chối',
      error: error.message
    });
  }
});

module.exports = router;
