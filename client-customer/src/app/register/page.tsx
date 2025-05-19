"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

// CSS styles for the form
const styles = {
  noteContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  requiredNote: {
    fontSize: '0.85rem',
    color: '#666',
    margin: 0,
    fontStyle: 'italic'
  }
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  studentId: string; // Thêm trường mã số sinh viên
  school: string;
  department: string;
  date: string;
  time: string;
  timeOfDay: string;
  purpose: string;
  purposeDetail?: string;
  contact?: string;
}

export default function RegisterPage(): React.ReactElement {
  // Khởi tạo kết nối Socket.IO
  const socketRef = React.useRef<any>(null);
  
  useEffect(() => {
    // Thiết lập kết nối Socket.IO
    socketRef.current = io('http://localhost:3000');
    
    // Dọn dẹp khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    studentId: '', // Thêm trường mã số sinh viên
    school: '',
    department: '',
    date: '',
    time: '',
    timeOfDay: '',
    purpose: '',
    purposeDetail: '',
    contact: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionData, setSubmissionData] = useState<{
    name: string;
    time: string;
    date: string;
  }>({ name: '', time: '', date: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Kiểm tra dữ liệu đầu vào
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.purpose) {
      setMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Lưu thông tin đăng ký thành công
        setSubmissionData({
          name: formData.name,
          time: formattedTime,
          date: formattedDate
        });
        
        // Chuyển sang trạng thái đã gửi
        setIsSubmitted(true);
        
        // Thông báo cho admin rằng có đăng ký mới (không cần vì server đã tự động gửi thông báo)
        console.log('Đã gửi đăng ký thành công');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          studentId: '',
          school: '',
          department: '',
          date: '',
          time: '',
          timeOfDay: '',
          purpose: '',
          purposeDetail: '',
          contact: ''
        });
      } else {
        setMessage(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      setMessage('Đã xảy ra lỗi khi gửi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trang thông báo đăng ký thành công
  if (isSubmitted) {
    return (
      <div className="success-page">
        <div className="card">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h1 className="success-title">Đăng ký thành công!</h1>
          <p className="success-message">
            Đăng ký thành công cho "{submissionData.name}" vào lúc {submissionData.time} ngày {submissionData.date}.
          </p>
          <p className="success-details">
            Chúng tôi sẽ liên hệ với bạn sớm. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setIsSubmitted(false);
              setMessage('');
            }}
          >
            Đăng ký mới
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị form đăng ký
  return (
    <div>
      
      {message && (
        <div 
          className={message.includes('thành công') ? 'alert alert-success' : 'alert alert-error'}
          style={{
            backgroundColor: message.includes('thành công') ? '#d4edda' : '#f8d7da',
            color: message.includes('thành công') ? '#155724' : '#721c24',
            padding: '12px 20px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontWeight: 'bold',
            border: message.includes('thành công') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
          }}
        >
          {message}
        </div>
      )}
      
      <div className="card">
        <h1 className="card-title">Đăng ký lên văn phòng</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Họ và tên *"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Số điện thoại *"
              required
              pattern="[0-9]*"
              title="Số điện thoại chỉ được chứa số"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email *"
              required
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Email phải đúng định dạng và chứa ký tự @"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="school"
              name="school"
              type="text"
              placeholder="Trường đại học *"
              required
              value={formData.school || ''}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <input
              id="studentId"
              name="studentId"
              type="text"
              placeholder="Mã số sinh viên *"
              required
              value={formData.studentId}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <select name="purpose" onChange={handleChange} value={formData.purpose || ''} required>
                <option value="" disabled>Chọn mục đích *</option>
                <option value="Học tập">Học tập</option>
                <option value="Thực tập">Thực tập</option>
                <option value="Làm việc">Làm việc</option>
              </select>
            </div>
            
            <div className="form-group">
              <input
                id="time"
                name="time"
                type="time"
                placeholder="Giờ *"
                required
                value={formData.time || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Chọn tầng *
                </option>
                <option value="Tầng 26">Tầng 26</option>
                <option value="Tầng 46">Tầng 46</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                placeholder="DD/MM/YYYY *"
              />
            </div>
          </div>
          
          <div className="form-group">
            <select
              name="contact"
              value={formData.contact || ''}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Chọn người liên hệ *</option>
              <option value="Anh Kha - 0367242327">Anh Kha - 0367242327</option>
            </select>
          </div>
          
          <p style={{
            fontSize: '0.9rem',
            color: '#555',
            margin: '8px 0 12px 2px',
            fontStyle: 'italic',
            textAlign: 'left'
          }}>* là thông tin bắt buộc phải điền</p>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Đang xử lý...' : 'Gửi đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}
