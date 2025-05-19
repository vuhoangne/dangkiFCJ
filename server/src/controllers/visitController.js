const { getAllVisits, saveAllVisits } = require('../models/visitModel');
const { sendApprovalEmail, sendRejectionEmail } = require('../emailService');

// GET /api/visits
function getVisits(req, res) {
  try {
    const data = getAllVisits();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Không thể đọc dữ liệu' });
  }
}

// POST /api/visits
function createVisit(req, res) {
  try {
    const { name, email, phone, date, purpose, school, department, time, contact, purposeDetail, studentId } = req.body;
    if (!name || !email || !phone || !date || !purpose) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }
    
    // Log the request body to verify studentId is being received
    console.log('Registration data received:', req.body);
    console.log('Student ID received:', studentId);
    
    const data = getAllVisits();
    
    // Check for total daily capacity limit (55 registrations per day)
    const todayRegistrations = data.filter(visit => {
      const visitDate = new Date(visit.date);
      const requestDate = new Date(date);
      return visitDate.getFullYear() === requestDate.getFullYear() && 
             visitDate.getMonth() === requestDate.getMonth() && 
             visitDate.getDate() === requestDate.getDate();
    });
    
    if (todayRegistrations.length >= 55) {
      return res.status(400).json({ 
        error: 'Đăng kí không thành công: Đã đủ số lượng đăng ký trong ngày. Vui lòng đăng ký vào ngày khác.'
      });
    }
    
    // Check for floor capacity limits
    if (department === 'Tầng 46') {
      const floor46Registrations = data.filter(visit => {
        const visitDate = new Date(visit.date);
        const requestDate = new Date(date);
        return visit.department === 'Tầng 46' && 
               visitDate.getFullYear() === requestDate.getFullYear() && 
               visitDate.getMonth() === requestDate.getMonth() && 
               visitDate.getDate() === requestDate.getDate();
      });
      
      if (floor46Registrations.length >= 20) {
        return res.status(400).json({ 
          error: 'Đăng kí không thành công: Tầng 46 đã hết chỗ. Vui lòng đăng ký lên tầng 26.'
        });
      }
    } else if (department === 'Tầng 26') {
      const floor26Registrations = data.filter(visit => {
        const visitDate = new Date(visit.date);
        const requestDate = new Date(date);
        return visit.department === 'Tầng 26' && 
               visitDate.getFullYear() === requestDate.getFullYear() && 
               visitDate.getMonth() === requestDate.getMonth() && 
               visitDate.getDate() === requestDate.getDate();
      });
      
      if (floor26Registrations.length >= 20) {
        return res.status(400).json({ 
          error: 'Đăng kí không thành công: Tầng 26 đã hết chỗ. Vui lòng đăng ký vào ngày khác.'
        });
      }
    }
    const newVisit = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      school,
      studentId, // Ensure studentId is included
      date,
      purpose,
      department,
      time,
      contact,
      note: purposeDetail,
      floor: department ? department.replace('Tầng ', '') : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    data.push(newVisit);
    saveAllVisits(data);
    
    // Emit socket.io event
    if (global.io) {
      global.io.emit('new-registration', newVisit);
    }
    
    res.status(201).json(newVisit);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lưu dữ liệu' });
  }
}

// PATCH /api/visits/:id
async function updateVisitStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Đang cập nhật trạng thái đăng ký ${id} thành ${status}`);
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    
    const data = getAllVisits();
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      console.log(`Không tìm thấy đăng ký với ID: ${id}`);
      return res.status(404).json({ error: 'Đăng ký không tồn tại' });
    }
    
    const visit = data[visitIndex];
    visit.status = status;
    visit.updatedAt = new Date().toISOString();
    
    // Lưu trạng thái mới
    saveAllVisits(data);
    console.log(`Đã cập nhật trạng thái đăng ký ${id} thành ${status}`);
    
    // Emit socket.io events trước khi gửi email
    if (global.io) {
      console.log('Đang phát sóng sự kiện cập nhật đăng ký qua socket.io');
      
      // Phát sóng sự kiện cập nhật cho tất cả client
      global.io.emit('update-registration', visit);
      global.io.emit('visitUpdated', visit);
    }
    
    // Gửi email (không chờ kết quả)
    let emailSent = false;
    if (status === 'approved' || status === 'rejected') {
      try {
        // Gửi email trong một promise riêng để không làm chậm API
        setTimeout(async () => {
          try {
            if (status === 'approved') {
              emailSent = await sendApprovalEmail(visit);
              console.log('Kết quả gửi email duyệt:', emailSent ? 'Thành công' : 'Thất bại');
            } else {
              emailSent = await sendRejectionEmail(visit);
              console.log('Kết quả gửi email từ chối:', emailSent ? 'Thành công' : 'Thất bại');
            }
          } catch (emailError) {
            console.error('Lỗi khi gửi email trong background:', emailError);
          }
        }, 100);
        
        console.log('Đã khởi tạo quá trình gửi email trong background');
      } catch (emailSetupError) {
        console.error('Lỗi khi thiết lập gửi email:', emailSetupError);
      }
    }
    
    // Trả về kết quả ngay lập tức, không chờ email
    res.json({ 
      success: true, 
      message: status === 'approved' ? 'Đã duyệt đăng ký và đang gửi email thông báo' : 'Đã từ chối đăng ký và đang gửi email thông báo', 
      visit 
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    res.status(500).json({ 
      success: false,
      error: 'Không thể cập nhật dữ liệu', 
      details: error.message 
    });
  }
}

// DELETE /api/visits/:id
function deleteVisit(req, res) {
  try {
    const { id } = req.params;
    console.log('Deleting visit with ID:', id);
    
    const data = getAllVisits();
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      console.log('Visit not found with ID:', id);
      return res.status(404).json({ error: 'Đăng ký không tồn tại' });
    }
    
    const deletedVisit = data[visitIndex];
    data.splice(visitIndex, 1);
    saveAllVisits(data);
    
    // Emit socket.io event
    if (global.io) {
      global.io.emit('delete-registration', id);
    }
    
    console.log('Successfully deleted visit:', deletedVisit);
    res.json({ success: true, message: 'Đã xóa đăng ký thành công', visit: deletedVisit });
  } catch (error) {
    console.error('Lỗi khi xóa đăng ký:', error);
    res.status(500).json({ error: 'Không thể xóa dữ liệu' });
  }
}

module.exports = {
  getVisits,
  createVisit,
  updateVisitStatus,
  deleteVisit
};
