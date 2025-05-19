import React from 'react';

export const metadata = {
  title: 'Quản lý đăng ký văn phòng - Admin',
  description: 'Trang quản lý đăng ký văn phòng',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
