"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Visit {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  studentId: string;
  date: string;
  purpose: string;
  department: string;
  time: string;
  status: string;
  createdAt: string;
}

interface StatisticsData {
  totalVisits: number;
  approvedVisits: number;
  pendingVisits: number;
  rejectedVisits: number;
  visitsByFloor: Record<string, number>;
  visitsByPurpose: Record<string, number>;
  visitsByDate: Record<string, number>;
  visitsBySchool: Record<string, number>;
}

export default function StatisticsPage(): React.ReactElement {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statsData, setStatsData] = useState<StatisticsData>({
    totalVisits: 0,
    approvedVisits: 0,
    pendingVisits: 0,
    rejectedVisits: 0,
    visitsByFloor: {},
    visitsByPurpose: {},
    visitsByDate: {},
    visitsBySchool: {},
  });
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: '',
    endDate: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  // Check login status
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
  }, [hydrated, isLoggedIn, router]);

  // Fetch visits data
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/visits');
        const data = await response.json();
        setVisits(data);
        processStatistics(data);
        setError('');
      } catch (error) {
        console.error('Error fetching visits:', error);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  // Process statistics when date range changes
  useEffect(() => {
    if (visits.length > 0) {
      processStatistics(visits);
    }
  }, [dateRange, visits]);

  const processStatistics = (data: Visit[]) => {
    // Filter by date range if provided
    let filteredData = [...data];
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the end date fully
      
      filteredData = data.filter(visit => {
        const visitDate = new Date(visit.date);
        return visitDate >= startDate && visitDate <= endDate;
      });
    }

    // Calculate statistics
    const totalVisits = filteredData.length;
    const approvedVisits = filteredData.filter(v => v.status === 'approved').length;
    const pendingVisits = filteredData.filter(v => v.status === 'pending').length;
    const rejectedVisits = filteredData.filter(v => v.status === 'rejected').length;

    // Group by floor
    const visitsByFloor: Record<string, number> = {};
    filteredData.forEach(visit => {
      const floor = visit.department || 'Không xác định';
      visitsByFloor[floor] = (visitsByFloor[floor] || 0) + 1;
    });

    // Group by purpose
    const visitsByPurpose: Record<string, number> = {};
    filteredData.forEach(visit => {
      const purpose = visit.purpose || 'Không xác định';
      visitsByPurpose[purpose] = (visitsByPurpose[purpose] || 0) + 1;
    });

    // Group by date
    const visitsByDate: Record<string, number> = {};
    filteredData.forEach(visit => {
      const date = new Date(visit.date).toLocaleDateString('vi-VN');
      visitsByDate[date] = (visitsByDate[date] || 0) + 1;
    });

    // Group by school
    const visitsBySchool: Record<string, number> = {};
    filteredData.forEach(visit => {
      const school = visit.school || 'Không xác định';
      visitsBySchool[school] = (visitsBySchool[school] || 0) + 1;
    });

    setStatsData({
      totalVisits,
      approvedVisits,
      pendingVisits,
      rejectedVisits,
      visitsByFloor,
      visitsByPurpose,
      visitsByDate,
      visitsBySchool,
    });
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Prepare chart data
  const statusChartData = {
    labels: ['Đã duyệt', 'Đang chờ', 'Đã từ chối'],
    datasets: [
      {
        label: 'Trạng thái đăng ký',
        data: [statsData.approvedVisits, statsData.pendingVisits, statsData.rejectedVisits],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const floorChartData = {
    labels: Object.keys(statsData.visitsByFloor),
    datasets: [
      {
        label: 'Đăng ký theo tầng',
        data: Object.values(statsData.visitsByFloor),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const purposeChartData = {
    labels: Object.keys(statsData.visitsByPurpose),
    datasets: [
      {
        label: 'Đăng ký theo mục đích',
        data: Object.values(statsData.visitsByPurpose),
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dateLabels = Object.keys(statsData.visitsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const dateChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Đăng ký theo ngày',
        data: dateLabels.map(date => statsData.visitsByDate[date]),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const schoolChartData = {
    labels: Object.keys(statsData.visitsBySchool),
    datasets: [
      {
        label: 'Đăng ký theo trường',
        data: Object.values(statsData.visitsBySchool),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!isLoggedIn && hydrated) {
    return <></>;
  }

  return (
    <div className="statistics-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Thống kê đăng ký văn phòng</h1>
        <Link href="/" style={{ 
          padding: '8px 16px', 
          backgroundColor: '#1e2e3e', 
          color: 'white', 
          borderRadius: '4px', 
          textDecoration: 'none',
          display: 'inline-block',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#FF9900';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#1e2e3e';
        }}>
          Về trang chủ
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>
      ) : error ? (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>
      ) : (
        <>
          {/* Date range filter */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', 
            marginBottom: '20px' 
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Lọc theo ngày</h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Từ ngày:</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Đến ngày:</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderLeft: '4px solid #3498db'
            }}>
              <h3 style={{ fontSize: '16px', color: '#666' }}>Tổng số đăng ký</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{statsData.totalVisits}</p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderLeft: '4px solid #2ecc71'
            }}>
              <h3 style={{ fontSize: '16px', color: '#666' }}>Đã duyệt</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{statsData.approvedVisits}</p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderLeft: '4px solid #f39c12'
            }}>
              <h3 style={{ fontSize: '16px', color: '#666' }}>Đang chờ</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{statsData.pendingVisits}</p>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
              borderLeft: '4px solid #e74c3c'
            }}>
              <h3 style={{ fontSize: '16px', color: '#666' }}>Đã từ chối</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{statsData.rejectedVisits}</p>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Trạng thái đăng ký</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={statusChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đăng ký theo tầng</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={floorChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đăng ký theo mục đích</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={purposeChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đăng ký theo trường</h3>
              <div style={{ height: '300px' }}>
                <Pie 
                  data={schoolChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đăng ký theo ngày</h3>
            <div style={{ height: '300px' }}>
              <Bar 
                data={dateChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
