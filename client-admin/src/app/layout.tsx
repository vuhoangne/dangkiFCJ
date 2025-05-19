'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Metadata được chuyển vào file metadata.ts riêng biệt

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Kiểm tra xem người dùng đã đăng nhập chưa (dựa vào cookie)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Kiểm tra cookie trong useEffect để tránh lỗi hydration
    const checkLoginStatus = () => {
      setIsLoggedIn(document.cookie.includes('isLoggedIn=true'));
    };
    
    // Kiểm tra ban đầu
    checkLoginStatus();
    
    // Thêm event listener để kiểm tra khi có thay đổi cookie
    window.addEventListener('storage', checkLoginStatus);
    
    // Thêm event listener cho sự kiện tùy chỉnh khi đăng nhập
    window.addEventListener('login-success', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('login-success', checkLoginStatus);
    };
  }, []);

  // Kiểm tra và áp dụng chế độ tối từ localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Lưu chế độ tối vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  return (
    <html lang="vi">
      <head>
        <title>Quản Lý Đăng Ký Văn Phòng</title>
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'auto' }}>
        <header style={{ 
          backgroundColor: '#1e2e3e', 
          color: 'white', 
          padding: '0', 
          width: '100%', 
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', 
          height: '80px', 
          display: 'flex', 
          alignItems: 'center', 
          transition: 'background-color 0.3s ease', 
          margin: 0 
        }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginLeft: '20px' }}>
                <nav>
                  <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: '0', padding: '0' }}>
                    <li>
                      <Link 
                        href="/" 
                        style={{ 
                          color: pathname === '/' ? '#FF9900' : '#cccccc', 
                          textDecoration: 'none', 
                          padding: '10px 15px', 
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          fontWeight: pathname === '/' ? '600' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onMouseOver={(e) => {
                          if (pathname !== '/') {
                            e.currentTarget.style.color = '#FF9900';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (pathname !== '/') {
                            e.currentTarget.style.color = '#cccccc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Trang chủ
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/admin" 
                        style={{ 
                          color: pathname === '/admin' ? '#FF9900' : '#cccccc', 
                          textDecoration: 'none', 
                          padding: '10px 15px', 
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          fontWeight: pathname === '/admin' ? '600' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onMouseOver={(e) => {
                          if (pathname !== '/admin') {
                            e.currentTarget.style.color = '#FF9900';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (pathname !== '/admin') {
                            e.currentTarget.style.color = '#cccccc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Quản lý đăng ký
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/statistics" 
                        style={{ 
                          color: pathname === '/statistics' ? '#FF9900' : '#cccccc', 
                          textDecoration: 'none', 
                          padding: '10px 15px', 
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          fontWeight: pathname === '/statistics' ? '600' : '400',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onMouseOver={(e) => {
                          if (pathname !== '/statistics') {
                            e.currentTarget.style.color = '#FF9900';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (pathname !== '/statistics') {
                            e.currentTarget.style.color = '#cccccc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        Thống kê
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', position: 'relative' }}>
              {isLoggedIn ? (
                <>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#e0e0e0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: '10px',
                      overflow: 'hidden'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div style={{ color: 'white' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  
                  {showDropdown && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '50px', 
                      right: '0', 
                      backgroundColor: 'white', 
                      borderRadius: '4px', 
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', 
                      width: '200px',
                      zIndex: 10
                    }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontWeight: '600', color: '#333' }}>Admin</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Tài khoản quản trị viên</div>
                      </div>
                      
                      <Link 
                        href="/login" 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px 15px', 
                          color: '#333', 
                          textDecoration: 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 153, 0, 0.1)';
                          e.currentTarget.style.color = '#FF9900';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#333';
                        }}
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn chặn hành vi mặc định của Link
                          
                          // Xóa cookie đăng nhập
                          document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                          localStorage.removeItem('adminLoggedIn');
                          
                          // Cập nhật trạng thái đăng nhập
                          setIsLoggedIn(false);
                          setShowDropdown(false);
                          
                          // Chuyển hướng về trang đăng nhập
                          window.location.href = '/login';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Đăng xuất
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  href="/login-new" 
                  style={{ 
                    padding: '10px 15px', 
                    cursor: 'pointer', 
                    fontWeight: '600', 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#FF9900';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = '#cccccc';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </header>
        
        <main style={{ 
          width: '100%', 
          margin: '0 auto', 
          padding: '0',
          backgroundColor: darkMode ? '#121212' : '#f5f5f5',
          color: darkMode ? '#e0e0e0' : 'inherit',
          minHeight: 'calc(100vh - 80px)',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          overflow: 'auto'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
