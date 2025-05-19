const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const apiRoutes = require('./routes/index');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Thiết lập port
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Xuất io cho các module khác sử dụng
global.io = io;

// Middleware để xử lý socket.io trong controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Sử dụng routes
app.use('/api', apiRoutes);

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('Client kết nối:', socket.id);

  // Xử lý sự kiện duyệt đăng ký
  socket.on('approveVisit', async (data) => {
    try {
      console.log('Nhận yêu cầu duyệt đăng ký:', data);
      const id = data.id;
      
      if (!id) {
        console.error('Thiếu ID đăng ký cần duyệt');
        socket.emit('approveVisitResult', { success: false, error: 'Thiếu ID đăng ký' });
        return;
      }
      
      const { getAllVisits, saveAllVisits } = require('./models/visitModel');
      const { sendApprovalEmail } = require('./emailService');
      
      const visits = getAllVisits();
      console.log(`Tìm đăng ký với ID: ${id}`);
      
      const visitIndex = visits.findIndex(visit => visit.id === id);
      
      if (visitIndex !== -1) {
        console.log(`Đã tìm thấy đăng ký với ID: ${id}, cập nhật trạng thái thành 'approved'`);
        visits[visitIndex].status = 'approved';
        visits[visitIndex].updatedAt = new Date().toISOString();
        saveAllVisits(visits);
        
        try {
          await sendApprovalEmail(visits[visitIndex]);
          console.log('Đã gửi email thông báo duyệt đến:', visits[visitIndex].email);
        } catch (emailError) {
          console.error('Lỗi khi gửi email duyệt:', emailError);
        }
        
        // Thông báo cho tất cả client
        console.log('Phát sóng cập nhật đăng ký đã duyệt');
        io.emit('update-registration', visits[visitIndex]);
        io.emit('visitUpdated', visits[visitIndex]);
        socket.emit('approveVisitResult', { success: true, visit: visits[visitIndex] });
      } else {
        console.error(`Không tìm thấy đăng ký với ID: ${id}`);
        socket.emit('approveVisitResult', { success: false, error: 'Không tìm thấy đăng ký' });
      }
    } catch (error) {
      console.error('Lỗi khi duyệt đăng ký:', error);
      socket.emit('approveVisitResult', { success: false, error: `Lỗi server: ${error.message}` });
    }
  });

  // Xử lý sự kiện từ chối đăng ký
  socket.on('rejectVisit', async (data) => {
    try {
      console.log('Nhận yêu cầu từ chối đăng ký:', data);
      const id = data.id;
      
      if (!id) {
        console.error('Thiếu ID đăng ký cần từ chối');
        socket.emit('rejectVisitResult', { success: false, error: 'Thiếu ID đăng ký' });
        return;
      }
      
      const { getAllVisits, saveAllVisits } = require('./models/visitModel');
      const { sendRejectionEmail } = require('./emailService');
      
      const visits = getAllVisits();
      console.log(`Tìm đăng ký với ID: ${id}`);
      
      const visitIndex = visits.findIndex(visit => visit.id === id);
      
      if (visitIndex !== -1) {
        console.log(`Đã tìm thấy đăng ký với ID: ${id}, cập nhật trạng thái thành 'rejected'`);
        visits[visitIndex].status = 'rejected';
        visits[visitIndex].updatedAt = new Date().toISOString();
        saveAllVisits(visits);
        
        try {
          await sendRejectionEmail(visits[visitIndex]);
          console.log('Đã gửi email thông báo từ chối đến:', visits[visitIndex].email);
        } catch (emailError) {
          console.error('Lỗi khi gửi email từ chối:', emailError);
        }
        
        // Thông báo cho tất cả client
        console.log('Phát sóng cập nhật đăng ký đã từ chối');
        io.emit('update-registration', visits[visitIndex]);
        io.emit('visitUpdated', visits[visitIndex]);
        socket.emit('rejectVisitResult', { success: true, visit: visits[visitIndex] });
      } else {
        console.error(`Không tìm thấy đăng ký với ID: ${id}`);
        socket.emit('rejectVisitResult', { success: false, error: 'Không tìm thấy đăng ký' });
      }
    } catch (error) {
      console.error('Lỗi khi từ chối đăng ký:', error);
      socket.emit('rejectVisitResult', { success: false, error: `Lỗi server: ${error.message}` });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client ngắt kết nối:', socket.id);
  });
});

// Middleware để bắt lỗi 404
app.use((req, res) => {
  res.status(404).json({ error: 'Không tìm thấy endpoint' });
});

// API Routes
// Đăng nhập admin
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Kiểm tra thông tin đăng nhập
  if (username === 'admin' && password === 'admin123321') {
    res.status(200).json({ 
      success: true, 
      message: 'Đăng nhập thành công',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
    });
  }
});

// API xóa đăng ký
app.delete('/api/visits/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const visitIndex = data.findIndex(visit => visit.id === id);
    
    if (visitIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký' });
    }
    
    // Xóa đăng ký khỏi mảng
    const deletedVisit = data.splice(visitIndex, 1)[0];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    // Thông báo cho tất cả client rằng có đăng ký bị xóa
    io.emit('delete-registration', id);
    
    res.json({ success: true, message: 'Đã xóa đăng ký thành công', deletedVisit });
  } catch (error) {
    console.error('Error deleting visit:', error);
    res.status(500).json({ error: 'Không thể xóa dữ liệu' });
  }
});

// Tài khoản admin mặc định
const adminAccount = {
  email: 'vuhoangdz2003@gmail.com',
  password: '0937036966'
};

// API đăng nhập
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    
    if (email === adminAccount.email && password === adminAccount.password) {
      console.log('Login successful');
      res.json({ success: true, message: 'Đăng nhập thành công' });
    } else {
      console.log('Login failed');
      res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Route mặc định
app.get('/', (req, res) => {
  res.json({ message: 'API Đăng Ký Văn Phòng' });
});

// Thêm sự kiện kết nối cho Socket.IO
io.on('connection', (socket) => {
  console.log('Client kết nối:', socket.id);
  
  // Xử lý sự kiện duyệt đăng ký
  socket.on('approveVisit', async (visitId) => {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const visitIndex = data.findIndex(visit => visit.id === visitId);
      
      if (visitIndex !== -1) {
        data[visitIndex].status = 'approved';
        data[visitIndex].updatedAt = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        // Gửi email thông báo
        try {
          await sendApprovalEmail(data[visitIndex]);
        } catch (emailError) {
          console.error('Lỗi khi gửi email duyệt:', emailError);
        }
        
        // Thông báo cho tất cả client
        io.emit('visitUpdated', data[visitIndex]);
        socket.emit('approveVisitResult', { success: true, visit: data[visitIndex] });
      } else {
        socket.emit('approveVisitResult', { success: false, error: 'Không tìm thấy đăng ký' });
      }
    } catch (error) {
      console.error('Lỗi khi duyệt đăng ký:', error);
      socket.emit('approveVisitResult', { success: false, error: 'Lỗi server' });
    }
  });
  
  // Xử lý sự kiện từ chối đăng ký
  socket.on('rejectVisit', async (visitId) => {
    try {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const visitIndex = data.findIndex(visit => visit.id === visitId);
      
      if (visitIndex !== -1) {
        data[visitIndex].status = 'rejected';
        data[visitIndex].updatedAt = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        
        // Gửi email thông báo
        try {
          await sendRejectionEmail(data[visitIndex]);
        } catch (emailError) {
          console.error('Lỗi khi gửi email từ chối:', emailError);
        }
        
        // Thông báo cho tất cả client
        io.emit('visitUpdated', data[visitIndex]);
        socket.emit('rejectVisitResult', { success: true, visit: data[visitIndex] });
      } else {
        socket.emit('rejectVisitResult', { success: false, error: 'Không tìm thấy đăng ký' });
      }
    } catch (error) {
      console.error('Lỗi khi từ chối đăng ký:', error);
      socket.emit('rejectVisitResult', { success: false, error: 'Lỗi server' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client ngắt kết nối:', socket.id);
  });
});

// Sử dụng server thay vì app để hỗ trợ Socket.IO
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
