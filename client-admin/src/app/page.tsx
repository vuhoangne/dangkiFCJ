"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminHomeProps {}

export default function AdminHome({}: AdminHomeProps): React.ReactElement {
  // Get dark mode state from localStorage
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Apply CSS variables based on theme
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.style.setProperty('--card-bg', '#1e1e1e');
      document.documentElement.style.setProperty('--text-secondary', '#aaaaaa');
    } else {
      document.documentElement.style.setProperty('--card-bg', 'white');
      document.documentElement.style.setProperty('--text-secondary', '#666');
    }
  }, []);
  
  // Listen for dark mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const isDarkMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDarkMode);
      document.documentElement.style.setProperty('--card-bg', isDarkMode ? '#1e1e1e' : 'white');
      document.documentElement.style.setProperty('--text-secondary', isDarkMode ? '#aaaaaa' : '#666');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false)
  console.log('isLoggedIn: ', isLoggedIn);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Kiểm tra đăng nhập từ localStorage
  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn) {
      setIsLoggedIn(true);
    }
  }, []);
  useEffect(() => {
    const cookies = document.cookie;
    const isCookieLoggedIn = cookies.includes('isLoggedIn=true');
    setIsLoggedIn(isCookieLoggedIn);
    setHydrated(true);
  }, []);
  
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push('/login');
    }
  }, [hydrated, isLoggedIn]);

  // const handleLogin = (e: React.FormEvent<HTMLFormElement>): void => {
  //   e.preventDefault();
    
  //   // Thông tin đăng nhập đơn giản (trong thực tế nên sử dụng API)
  //   if (username === 'admin' && password === 'admin123321') {
  //     localStorage.setItem('adminLoggedIn', 'true');
  //     setIsLoggedIn(true);
  //     setError('');
  //   } else {
  //     setError('Tên đăng nhập hoặc mật khẩu không đúng');
  //   }
  // };

  const handleLogout = (): void => {
    // Xóa cookie đăng nhập
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('adminLoggedIn');
    
    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login';
  };

  const router = useRouter();
  
  // Chuyển hướng đến trang login nếu chưa đăng nhập
  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     router.push('/login');
  //   }
  // }, [isLoggedIn, router]);
  
  if (!isLoggedIn) {
    // Trả về fragment rỗng thay vì null để tránh lỗi TypeScript
    return <></>; // Trang sẽ chuyển hướng đến trang login
  }

  return (
    <div style={{ padding: '20px', width: '95%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Trang Chủ Quản Trị</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Thẻ quản lý đăng ký */}
        <div style={{ backgroundColor: darkMode ? '#1e1e1e' : 'white', borderRadius: '8px', boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#1e2e3e', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e0e0e0' : '#1e2e3e', marginBottom: '5px', transition: 'color 0.3s ease' }}>Quản lý đăng ký văn phòng</h3>
                <p style={{ fontSize: '14px', color: darkMode ? '#aaaaaa' : '#666', marginBottom: '10px', transition: 'color 0.3s ease' }}>Xem và quản lý danh sách đăng ký</p>
                <Link href="/admin" style={{ display: 'inline-block', padding: '10px 0', backgroundColor: '#1e2e3e', color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease', width: '140px', height: '40px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '20px' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF9900';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e2e3e';
                  }}>
                  Xem danh sách
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Thẻ thống kê */}
        <div style={{ backgroundColor: darkMode ? '#1e1e1e' : 'white', borderRadius: '8px', boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#1e2e3e', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '15px' }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e0e0e0' : '#1e2e3e', marginBottom: '5px', transition: 'color 0.3s ease' }}>Thống kê đăng ký</h3>
                <p style={{ fontSize: '14px', color: darkMode ? '#aaaaaa' : '#666', marginBottom: '10px', transition: 'color 0.3s ease' }}>Xem báo cáo và thống kê</p>
                <Link 
                  href="/statistics" 
                  style={{ display: 'inline-block', padding: '10px 0', backgroundColor: '#1e2e3e', color: 'white', border: 'none', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease', width: '140px', height: '40px', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: '20px' }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF9900';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e2e3e';
                  }}
                >
                  Xem thống kê
                </Link>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  );
}
