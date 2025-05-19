"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  studentId?: string; // Added student ID field
  date: string;
  time?: string;
  floor?: string;
  purpose: string;
  contact: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  timestamp?: string;
}

// Thêm style cho toàn bộ trang
const globalStyle = `
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-y: auto !important;
  }
  body {
    padding-bottom: 50px;
  }
`;

export default function AdminPage(): React.ReactElement {
  // Thêm style vào document khi component mount
  useEffect(() => {
    // Tạo style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalStyle;
    document.head.appendChild(styleEl);
    
    // Cleanup khi unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all'); // all, pending, approved, rejected
  const [dateFilter, setDateFilter] = useState<string>('all'); // all or a specific date
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Store selected item IDs
  const [selectAll, setSelectAll] = useState<boolean>(false); // Track if all items are selected

  // Removed edit functionality as requested
  
  // Handle selecting/deselecting all items
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      // Select all visible items
      const allIds = filteredVisits.map(visit => visit.id);
      setSelectedItems(allIds);
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };
  
  // Handle selecting/deselecting individual items
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        // Remove the item if already selected
        setSelectAll(false);
        return prev.filter(itemId => itemId !== id);
      } else {
        // Add the item if not selected
        const newSelected = [...prev, id];
        // Check if all items are now selected
        if (newSelected.length === filteredVisits.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };
  
  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một đăng ký để xóa');
      return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} đăng ký đã chọn không?`)) {
      try {
        setLoading(true);
        let successCount = 0;
        let errorCount = 0;
        
        // Delete each selected item
        for (const id of selectedItems) {
          try {
            const response = await fetch(`http://localhost:3000/api/visits/${id}`, {
              method: 'DELETE'
            });
            
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (err) {
            errorCount++;
          }
        }
        
        // Update UI
        setVisits(prev => prev.filter(visit => !selectedItems.includes(visit.id)));
        setSelectedItems([]);
        setSelectAll(false);
        
        if (errorCount > 0) {
          alert(`Đã xóa thành công ${successCount} đăng ký. ${errorCount} đăng ký không thể xóa.`);
        } else {
          alert(`Đã xóa thành công ${successCount} đăng ký!`);
        }
      } catch (error) {
        console.error('Error in batch delete:', error);
        alert('Có lỗi xảy ra khi xóa đăng ký. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này không?')) {
      try {
        setLoading(true);
        console.log('Deleting visit with ID:', id);
        
        // Gọi API để xóa dữ liệu trên server
        const response = await fetch(`http://localhost:3000/api/visits/${id}`, {
          method: 'DELETE'
        });
        
        console.log('Delete response status:', response.status);
        
        // Xử lý kết quả thành công
        if (response.ok) {
          // Cập nhật state để xóa đăng ký khỏi UI
          setVisits(prev => prev.filter(visit => visit.id !== id));
          alert('Đã xóa đăng ký thành công!');
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
      } catch (error) {
        console.error('Error deleting visit:', error);
        setError('Lỗi khi xóa đăng ký: ' + (error instanceof Error ? error.message : 'Không xác định'));
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchVisits = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/visits');
      const data = await response.json();
      
      const processedData = data.map((visit: any) => ({
        ...visit,
        school: visit.school || 'Chưa có thông tin',
        studentId: visit.studentId || 'Chưa có thông tin',
        floor: visit.floor || (visit.department ? visit.department.replace('Tầng ', '') : '4'),
        time: visit.time || '9:00',
        contact: visit.contact || 'Chưa có thông tin'
      }));
      
      setVisits(processedData);
      setError('');
    } catch (error) {
      console.error('Error fetching visits:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    fetchVisits();
    
    // Khởi tạo kết nối socket.io
    const socketInstance = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'Access-Control-Allow-Origin': 'http://localhost:3002'
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Lưu socket vào state để sử dụng trong các hàm khác
    setSocket(socketInstance);
    
    // Xử lý sự kiện kết nối thành công
    socketInstance.on('connect', () => {
      console.log('Kết nối socket.io thành công, ID:', socketInstance.id);
    });
    
    // Xử lý sự kiện lỗi kết nối
    socketInstance.on('connect_error', (error) => {
      console.error('Lỗi kết nối socket.io:', error);
    });
    
    // Xử lý sự kiện đăng ký mới
    socketInstance.on('new-registration', (newVisit) => {
      console.log('Nhận đăng ký mới:', newVisit);
      setVisits(prev => {
        const updated = [newVisit, ...prev];
        return updated;
      });
    });
    
    // Xử lý sự kiện cập nhật đăng ký
    socketInstance.on('update-registration', (updatedVisit) => {
      console.log('Cập nhật đăng ký:', updatedVisit);
      setVisits(prev => {
        const updated = prev.map(visit => 
          visit.id === updatedVisit.id ? updatedVisit : visit
        );
        return updated;
      });
    });
    
    // Xử lý sự kiện cập nhật đăng ký (tên khác)
    socketInstance.on('visitUpdated', (updatedVisit) => {
      console.log('Cập nhật đăng ký (visitUpdated):', updatedVisit);
      setVisits(prev => {
        const updated = prev.map(visit => 
          visit.id === updatedVisit.id ? updatedVisit : visit
        );
        return updated;
      });
    });
    
    // Xử lý sự kiện xóa đăng ký
    socketInstance.on('delete-registration', (deletedId) => {
      console.log('Xóa đăng ký:', deletedId);
      setVisits(prev => {
        const updated = prev.filter(visit => visit.id !== deletedId);
        return updated;
      });
    });
    
    // Xử lý kết quả duyệt đăng ký
    socketInstance.on('approveVisitResult', (result) => {
      console.log('Kết quả duyệt đăng ký:', result);
      if (result.success) {
        // Cập nhật UI
        setVisits(prev => prev.map(visit => 
          visit.id === result.visit.id ? result.visit : visit
        ));
      } else {
        setError(`Lỗi khi duyệt đăng ký: ${result.error || 'Không xác định'}`);
      }
    });
    
    // Xử lý kết quả từ chối đăng ký
    socketInstance.on('rejectVisitResult', (result) => {
      console.log('Kết quả từ chối đăng ký:', result);
      if (result.success) {
        // Cập nhật UI
        setVisits(prev => prev.map(visit => 
          visit.id === result.visit.id ? result.visit : visit
        ));
      } else {
        setError(`Lỗi khi từ chối đăng ký: ${result.error || 'Không xác định'}`);
      }
    });
    
    return () => {
      socketInstance.disconnect();
    };
  }, [router]);


  // Khai báo biến socket ở cấp component để có thể sử dụng trong nhiều hàm
  const [socket, setSocket] = useState<any>(null);

  // Định nghĩa hàm formatDate trước khi sử dụng trong useMemo
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    return timeString;
  };

  const updateVisitStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      setLoading(true);
      console.log('Updating visit status via socket.io:', id, status);
      
      if (!socket) {
        throw new Error('Socket connection not established');
      }
      
      // Sử dụng socket.io để gửi yêu cầu cập nhật trạng thái
      if (status === 'approved') {
        console.log('Gửi yêu cầu duyệt đăng ký với ID:', id);
        socket.emit('approveVisit', { id: id });
      } else if (status === 'rejected') {
        console.log('Gửi yêu cầu từ chối đăng ký với ID:', id);
        socket.emit('rejectVisit', { id: id });
      }
      
      // Cập nhật UI ngay lập tức để phản hồi nhanh cho người dùng
      setVisits(prev => prev.map(visit => 
        visit.id === id ? { ...visit, status } : visit
      ));
      
      // Hiển thị thông báo thành công
      const action = status === 'approved' ? 'duyệt' : 'từ chối';
      const foundVisit = visits.find(visit => visit.id === id);
      alert(`Đã ${action} đăng ký thành công! ${foundVisit ? `Email thông báo đã được gửi đến ${foundVisit.email}` : ''}`);
    } catch (err) {
      console.error('Error updating visit status:', err);
      setError(`Lỗi khi cập nhật trạng thái: ${err instanceof Error ? err.message : 'Không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get unique dates from visits for the date filter
  const uniqueDates = React.useMemo(() => {
    const dates = new Set<string>();
    
    visits.forEach(visit => {
      const dateToUse = visit.date || visit.createdAt;
      const formattedDate = formatDate(dateToUse);
      dates.add(formattedDate);
    });
    
    return Array.from(dates).sort((a, b) => {
      // Sort dates in descending order (newest first)
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });
  }, [visits]);
  
  // Reset to 'all' when component mounts or visits change
  useEffect(() => {
    setDateFilter('all');
  }, []);

  const filteredVisits = visits.filter(visit => {
    // Filter by status
    if (filter !== 'all' && visit.status !== filter) return false;
    
    // Filter by date
    if (dateFilter !== 'all') {
      const visitDate = formatDate(visit.date || visit.createdAt);
      if (visitDate !== dateFilter) return false;
    }
    
    // Filter by search term - only name or phone number
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        visit.name.toLowerCase().includes(term) ||
        visit.phone.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  return (
    <>
      {/* Global styles for the entire application */}
      <style jsx global>{`
        html, body {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-y: auto !important;
        }
        body {
          padding-bottom: 50px;
        }
        /* Fixed header table styles */
        .table-container {
          width: 100%;
          max-width: 100%;
          position: relative;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
          background-color: white;
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .table-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: #232f3e; /* AWS Blue */
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .scrollable-container {
          display: block;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 65vh;
          width: 100%;
        }
        
        .fixed-header-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background-color: #232f3e;
        }
        
        .fixed-header-table {
          width: 100%;
          min-width: 2000px;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        .fixed-header-table th {
          padding: 15px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: white; /* White text for better contrast */
          background-color: #232f3e; /* AWS Blue */
          border-bottom: 1px solid #1a2533;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
        .fixed-header-table tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #eaeaea;
        }
        
        .fixed-header-table tbody tr:hover {
          background-color: #f5f9ff !important;
        }
        
        .fixed-header-table td {
          padding: 15px;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 0; /* Ensures text-overflow works properly */
          text-align: center;
          vertical-align: middle;
        }
        .fixed-header-table th.center,
        .fixed-header-table td.center {
          text-align: center;
        }
        
        /* Action buttons styling */
        .action-button {
          background-color: transparent;
          border: none;
          cursor: pointer;
          padding: 5px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 4px;
        }
        
        .action-button:hover {
          transform: scale(1.2);
          background-color: rgba(0,0,0,0.05);
        }
        
        .action-button.approve {
          color: green;
        }
        
        .action-button.reject {
          color: #dc3545;
        }
        
        .action-button.delete {
          color: #dc3545;
        }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-right: 5px;
        }
        
        .status-badge.approved {
          color: green;
          background-color: #e6f4ea;
        }
        
        .status-badge.rejected {
          color: #dc3545;
          background-color: #f8d7da;
        }
        /* Column width definitions */
        .fixed-header-table th:nth-child(1), .fixed-header-table td:nth-child(1) { width: 12%; } /* Họ tên */
        .fixed-header-table th:nth-child(2), .fixed-header-table td:nth-child(2) { width: 8%; } /* Số điện thoại */
        .fixed-header-table th:nth-child(3), .fixed-header-table td:nth-child(3) { width: 15%; } /* Email */
        .fixed-header-table th:nth-child(4), .fixed-header-table td:nth-child(4) { width: 15%; } /* Trường */
        .fixed-header-table th:nth-child(5), .fixed-header-table td:nth-child(5) { width: 5%; } /* Tầng */
        .fixed-header-table th:nth-child(6), .fixed-header-table td:nth-child(6) { width: 8%; } /* Ngày đăng ký */
        .fixed-header-table th:nth-child(7), .fixed-header-table td:nth-child(7) { width: 5%; } /* Giờ */
        .fixed-header-table th:nth-child(8), .fixed-header-table td:nth-child(8) { width: 10%; } /* Người liên hệ */
        .fixed-header-table th:nth-child(9), .fixed-header-table td:nth-child(9) { width: 10%; } /* Mục đích */
        .fixed-header-table th:nth-child(10), .fixed-header-table td:nth-child(10) { width: 12%; } /* Thao tác */
      `}</style>
      
      <div style={{ 
        padding: '20px', 
        width: '95%', 
        maxWidth: '1600px', 
        margin: '0 auto', 
        boxSizing: 'border-box', 
        color: '#333',
        backgroundColor: '#f5f5f5',
        height: 'auto',
        minHeight: 'calc(100vh - 80px)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '40px' /* Add margin at the bottom */
      }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1e2e3e' }}>Danh Sách Đăng Ký Văn Phòng</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError('')} 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#721c24',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 5px',
              fontWeight: 'bold'
            }}
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Search box */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            position: 'relative', 
            flex: 1,
            marginRight: '15px'
          }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc số điện thoại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                paddingLeft: '40px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
              fontSize: '16px'
            }}>🔍</span>
          </div>
          <button 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#1e2e3e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              height: '40px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#FF9900';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1e2e3e';
            }}
            onClick={() => {
              // Use the current search term to filter
            }}
          >
            Tìm kiếm
          </button>
        </div>
      </div>
      
      {/* Filter buttons */}
      <div style={{ 
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          {/* Status filter buttons */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: filter === 'all' ? '#FF9900' : '#1e2e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (filter !== 'all') {
                  e.currentTarget.style.backgroundColor = '#FF9900';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'all') {
                  e.currentTarget.style.backgroundColor = '#1e2e3e';
                }
              }}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: filter === 'pending' ? '#FF9900' : '#1e2e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (filter !== 'pending') {
                  e.currentTarget.style.backgroundColor = '#FF9900';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'pending') {
                  e.currentTarget.style.backgroundColor = '#1e2e3e';
                }
              }}
              onClick={() => setFilter('pending')}
            >
              Chờ duyệt
            </button>
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: filter === 'approved' ? '#FF9900' : '#1e2e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (filter !== 'approved') {
                  e.currentTarget.style.backgroundColor = '#FF9900';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'approved') {
                  e.currentTarget.style.backgroundColor = '#1e2e3e';
                }
              }}
              onClick={() => setFilter('approved')}
            >
              Đã duyệt
            </button>
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: filter === 'rejected' ? '#FF9900' : '#1e2e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                if (filter !== 'rejected') {
                  e.currentTarget.style.backgroundColor = '#FF9900';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'rejected') {
                  e.currentTarget.style.backgroundColor = '#1e2e3e';
                }
              }}
              onClick={() => setFilter('rejected')}
            >
              Từ chối
            </button>
          </div>
          
          {/* Date filter and refresh button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center'
            }}>
              <label 
                htmlFor="dateFilter" 
                style={{ 
                  marginRight: '8px', 
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}
              >
                Lọc theo ngày:
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter === 'all' ? '' : dateFilter.split('/').reverse().join('-')}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Convert YYYY-MM-DD to DD/MM/YYYY format for filtering
                      const date = new Date(e.target.value);
                      const formattedDate = formatDate(date.toISOString());
                      setDateFilter(formattedDate);
                    } else {
                      setDateFilter('all');
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: '#333',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '150px',
                    height: '40px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                />
                {dateFilter !== 'all' && (
                  <button
                    onClick={() => setDateFilter('all')}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1e2e3e',
                      marginLeft: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px'
                    }}
                    title="Xóa bộ lọc"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                marginRight: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
              onClick={handleBatchDelete}
              disabled={selectedItems.length === 0}
              title={selectedItems.length === 0 ? 'Chọn ít nhất một đăng ký để xóa' : `Xóa ${selectedItems.length} đăng ký đã chọn`}
            >
              Xóa đã chọn ({selectedItems.length})
            </button>
            
            <button 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: '#1e2e3e', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                minWidth: '120px',
                height: '40px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FF9900';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1e2e3e';
              }}
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                fetchVisits();
              }}
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#333',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
          marginTop: '20px',
          fontSize: '16px'
        }}>
          Đang tải dữ liệu...
        </div>
      ) : filteredVisits.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          fontSize: '16px', 
          color: '#666'
        }}>
          Không có dữ liệu đăng ký nào.
        </div>
      ) : (
        <div className="table-container">
          <div className="scrollable-container">
            <table className="fixed-header-table">
              <thead className="table-header">
                <tr>
                  <th style={{ width: '4%' }} className="center">
                    STT
                  </th>
                  <th style={{ width: '4%' }} className="center">
                    {/* No checkbox in header row */}
                  </th>
                  <th style={{ width: '15%' }}>Họ tên</th>
                  <th style={{ width: '8%' }}>Số điện thoại</th>
                  <th style={{ width: '14%' }}>Email</th>
                  <th className="school" style={{ width: '14%' }}>Trường/Đại học</th>
                  <th style={{ width: '8%' }}>MSSV</th>
                  <th className="center" style={{ width: '4%' }}>Tầng</th>
                  <th style={{ width: '7%' }}>Ngày đăng ký</th>
                  <th className="center" style={{ width: '4%' }}>Giờ</th>
                  <th style={{ width: '10%' }}>Người liên hệ</th>
                  <th style={{ width: '8%' }}>Mục đích</th>
                  <th className="center" style={{ width: '8%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="table-body">
              {filteredVisits.map((visit, index) => (
                <tr key={visit.id} style={{ 
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  transition: 'background-color 0.3s ease'
                }}>
                  <td className="center" style={{ fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td className="center" style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(visit.id)}
                      onChange={() => handleSelectItem(visit.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', margin: '0 auto', display: 'block' }}
                    />
                  </td>
                  <td>{visit.name}</td>
                  <td>{visit.phone}</td>
                  <td>{visit.email}</td>
                  <td>{visit.school || 'Chưa có thông tin'}</td>
                  <td>{visit.studentId || 'Chưa có thông tin'}</td>
                  <td className="center">{visit.floor || '4'}</td>
                  <td>{formatDate(visit.date || visit.createdAt)}</td>
                  <td className="center">{formatTime(visit.time) || '9:00'}</td>
                  <td>{visit.contact || 'Chưa có thông tin'}</td>
                  <td>{visit.purpose || 'Học tập'}</td>
                  <td className="center">
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                      {visit.status === 'approved' ? (
                        <>
                          <span className="status-badge approved">Đã duyệt</span>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            className="action-button delete"
                            title="Xóa"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </>
                      ) : visit.status === 'rejected' ? (
                        <>
                          <span className="status-badge rejected">Từ chối</span>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            className="action-button delete"
                            title="Xóa"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'approved')}
                            className="action-button approve"
                            title="Duyệt"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => updateVisitStatus(visit.id, 'rejected')}
                            className="action-button reject"
                            title="Từ chối"
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(visit.id)}
                            className="action-button delete"
                            title="Xóa"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
