const nodemailer = require('nodemailer');

let transporter = null;

// Biến môi trường - true: sử dụng Ethereal (dev), false: sử dụng Gmail (production)
const isDevelopment = false; // Set to false for production

// Tạo mới transporter mỗi lần gửi email để tránh lỗi hết hạn
async function createTransporter() {
  try {
    if (isDevelopment) {
      // Môi trường DEVELOPMENT: Sử dụng Ethereal Email (fake SMTP service)
      console.log('Sử dụng Ethereal Email cho môi trường development');
      
      // Tạo tài khoản test Ethereal
      const testAccount = await nodemailer.createTestAccount();
      
      // Tạo transporter với tài khoản test
      const newTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Log thông tin tài khoản để xem email
      console.log('\nThông tin tài khoản Ethereal Email để xem email:');
      console.log('- Username:', testAccount.user);
      console.log('- Password:', testAccount.pass);
      console.log('- Link xem email: https://ethereal.email/login');
      
      return newTransporter;
    } else {
      // Môi trường PRODUCTION: Sử dụng Gmail SMTP
      console.log('Sử dụng Gmail SMTP cho môi trường production');
      
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'vuhoangdz2003@gmail.com', // Email của bạn
          pass: 'blwfprdpmvccwwlf'      // Mật khẩu ứng dụng từ Google
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  } catch (error) {
    console.error('Lỗi khi tạo transporter:', error);
    throw error;
  }
}

// Gửi email thông báo đã duyệt
const sendApprovalEmail = async (visit) => {
  console.log('Đang gửi email duyệt đến:', visit.email);
  try {
    // Tạo mới transporter mỗi lần gửi email
    const transporter = await createTransporter();
    
    // Kiểm tra dữ liệu đầu vào
    if (!visit || !visit.email) {
      console.error('Thiếu thông tin người nhận email');
      return false;
    }
    
    // Cấu hình email
    const mailOptions = {
      from: 'FCJ Office <vuhoangdz2003@gmail.com>',
      to: visit.email,
      subject: 'Đăng ký thăm quan văn phòng đã được duyệt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #1E2E3E; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Đăng ký thăm quan văn phòng đã được duyệt</h2>
          </div>
          <div style="padding: 20px;">
            <p>Xin chào <strong>${visit.name || 'Quý khách'}</strong>,</p>
            <p>Chúng tôi vui mừng thông báo rằng đăng ký thăm quan văn phòng của bạn đã được <strong style="color: #28a745;">DUYỆT</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1E2E3E; margin-top: 0;">Chi tiết đăng ký:</h3>
              <p><strong>Họ và tên:</strong> ${visit.name || 'Không có thông tin'}</p>
              <p><strong>Email:</strong> ${visit.email}</p>
              <p><strong>Số điện thoại:</strong> ${visit.phone || 'Không có thông tin'}</p>
              <p><strong>Trường/Đơn vị:</strong> ${visit.school || 'Không có thông tin'}</p>
              <p><strong>Ngày đăng ký:</strong> ${visit.date || 'Không có thông tin'}</p>
              <p><strong>Thời gian:</strong> ${visit.time || 'Chưa xác định'}</p>
              <p><strong>Tầng:</strong> ${visit.floor || 'Chưa xác định'}</p>
              <p><strong>Mục đích:</strong> ${visit.purpose || 'Không có thông tin'}</p>
              <p><strong>Người tiếp đón:</strong> ${visit.contact || 'Chưa xác định'}</p>
              ${visit.note ? `<p><strong>Ghi chú:</strong> ${visit.note}</p>` : ''}
            </div>
            <p>Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân để thuận tiện cho việc đăng ký.</p>
            <p>Nếu bạn có bất kỳ thay đổi nào, vui lòng liên hệ với chúng tôi trước thời gian đăng ký.</p>
            <p>Trân trọng,</p>
            <p><strong>FCJ Office</strong></p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
          </div>
        </div>
      `
    };

    // Gửi email
    console.log('Bắt đầu gửi email duyệt...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email thông báo duyệt đã được gửi: %s', info.messageId);
    
    // Hiển thị URL xem email (chỉ có trong Ethereal)
    if (isDevelopment && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Xem email đã gửi tại:', previewUrl);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Lỗi khi gửi email duyệt:', err);
    return false;
  }
}

// Gửi email thông báo từ chối
async function sendRejectionEmail(visit) {
  console.log('Đang gửi email từ chối đến:', visit.email);
  try {
    // Tạo mới transporter mỗi lần gửi email
    const transporter = await createTransporter();
    
    // Kiểm tra dữ liệu đầu vào
    if (!visit || !visit.email) {
      console.error('Thiếu thông tin người nhận email');
      return false;
    }
    
    // Cấu hình email
    const mailOptions = {
      from: 'FCJ Office <vuhoangdz2003@gmail.com>',
      to: visit.email,
      subject: 'Đăng ký thăm quan văn phòng bị từ chối',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #1E2E3E; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Đăng ký thăm quan văn phòng không được duyệt</h2>
          </div>
          <div style="padding: 20px;">
            <p>Xin chào <strong>${visit.name || 'Quý khách'}</strong>,</p>
            <p>Chúng tôi rất tiếc phải thông báo rằng đăng ký thăm quan văn phòng của bạn đã <strong style="color: #dc3545;">KHÔNG ĐƯỢC DUYỆT</strong>.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1E2E3E; margin-top: 0;">Chi tiết đăng ký:</h3>
              <p><strong>Họ và tên:</strong> ${visit.name || 'Không có thông tin'}</p>
              <p><strong>Email:</strong> ${visit.email}</p>
              <p><strong>Số điện thoại:</strong> ${visit.phone || 'Không có thông tin'}</p>
              <p><strong>Trường/Đơn vị:</strong> ${visit.school || 'Không có thông tin'}</p>
              <p><strong>Ngày đăng ký:</strong> ${visit.date || 'Không có thông tin'}</p>
              <p><strong>Mục đích:</strong> ${visit.purpose || 'Không có thông tin'}</p>
            </div>
            <p>Lý do có thể do lịch đã kín, hoặc không phù hợp với thời gian và mục đích của văn phòng.</p>
            <p>Bạn có thể đăng ký lại vào thời gian khác hoặc liên hệ trực tiếp với chúng tôi để biết thêm thông tin.</p>
            <p>Trân trọng,</p>
            <p><strong>FCJ Office</strong></p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
          </div>
        </div>
      `
    };

    // Gửi email
    console.log('Bắt đầu gửi email từ chối...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email thông báo từ chối đã được gửi: %s', info.messageId);
    
    // Hiển thị URL xem email (chỉ có trong Ethereal)
    if (isDevelopment && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Xem email đã gửi tại:', previewUrl);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Lỗi khi gửi email từ chối:', err);
    return false;
  }
}

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail
};
