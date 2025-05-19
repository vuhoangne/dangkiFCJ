# Backend Server (API)

Đây là phần backend của hệ thống đăng ký văn phòng, được xây dựng với Node.js và Express.

## Cấu trúc thư mục

```
server/
├── data/                  # Thư mục chứa dữ liệu JSON
├── src/
│   ├── controllers/       # Xử lý logic nghiệp vụ
│   │   ├── authController.js
│   │   └── visitController.js
│   ├── middleware/        # Middleware xác thực và xử lý request
│   ├── models/            # Tương tác với dữ liệu
│   │   ├── userModel.js
│   │   └── visitModel.js
│   ├── routes/            # Định tuyến API
│   │   ├── authRoutes.js
│   │   ├── index.js
│   │   └── visitRoutes.js
│   ├── emailService.js    # Dịch vụ gửi email thông báo
│   └── index.js           # Entry point của server
├── .env                   # Biến môi trường
├── package.json
└── jsconfig.json
```

## Các API Endpoints

- `GET /api/visits`: Lấy danh sách đăng ký
- `POST /api/visits`: Tạo đăng ký mới
- `PATCH /api/visits/:id`: Cập nhật trạng thái đăng ký (duyệt/từ chối)
- `DELETE /api/visits/:id`: Xóa đăng ký
- `POST /api/auth/login`: Đăng nhập admin

## Tính năng chính

1. **Quản lý đăng ký**: Lưu trữ và quản lý thông tin đăng ký văn phòng
2. **Gửi email thông báo**: Gửi email thông báo khi đăng ký được duyệt hoặc từ chối
3. **Xác thực người dùng**: Xác thực admin khi đăng nhập
4. **Real-time updates**: Sử dụng Socket.IO để cập nhật real-time

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start
```

Server sẽ chạy tại http://localhost:3000
