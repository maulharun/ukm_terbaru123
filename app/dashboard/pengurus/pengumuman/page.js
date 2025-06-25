'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, Search } from 'lucide-react';
import Navbar from '@/app/components/Dashboard/Navbar';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Footer from '@/app/components/Dashboard/Footer';

export default function NotifikasiPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUKM, setCurrentUKM] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError('');
  
        // Get user data
        const userData = JSON.parse(localStorage.getItem('users'));
        
        // Validate user data
        if (!userData?.id || !userData?.role || userData.role !== 'pengurus') {
          throw new Error('Akses hanya untuk pengurus UKM');
        }
  
        // Get UKM from array
        if (!Array.isArray(userData.ukm) || !userData.ukm[0]) {
          throw new Error('Data UKM tidak ditemukan');
        }
  
        // Get UKM name directly from array
        const ukmName = userData.ukm[0]; // "Ukm Coding"
        if (!ukmName) {
          throw new Error('Nama UKM tidak valid');
        }
  
        setCurrentUKM(ukmName);
  
        // Fetch notifications with exact UKM name
        const response = await fetch(`/api/ukm/notifikasi-ukm?ukm=${encodeURIComponent(ukmName)}`);
        if (!response.ok) {
          throw new Error('Gagal mengambil data notifikasi');
        }
  
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
  
        // Filter notifications matching exact UKM name
        const filteredNotifications = data.notifications.filter(
          notif => notif.ukmName === ukmName
        );
  
        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
  
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCheck className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/ukm/notifikasi-ukm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notif.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="pengurus" userUKM={currentUKM} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userUKM={currentUKM} />

        <main className="flex-1 p-8 mt-16">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Notifikasi UKM</h1>
              <p className="text-gray-600 mt-1">{currentUKM}</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Notifications */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada notifikasi</h3>
                <p className="mt-2 text-gray-500">Notifikasi akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`bg-white rounded-xl border ${!notif.isRead ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
                      } shadow-sm hover:shadow-md transition-all duration-200`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={() => markAsRead(notif._id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                              >
                                <CheckCheck className="w-4 h-4" />
                                <span>Tandai dibaca</span>
                              </button>
                            )}
                          </div>

                          {notif.userDetails && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi Anggota</h4>
                              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div className="space-x-2">
                                  <span className="text-gray-500">Nama:</span>
                                  <span className="text-gray-900">{notif.userDetails.nama}</span>
                                </div>
                                <div className="space-x-2">
                                  <span className="text-gray-500">NIM:</span>
                                  <span className="text-gray-900">{notif.userDetails.nim}</span>
                                </div>
                                <div className="space-x-2">
                                  <span className="text-gray-500">Fakultas:</span>
                                  <span className="text-gray-900">{notif.userDetails.fakultas}</span>
                                </div>
                                <div className="space-x-2">
                                  <span className="text-gray-500">Prodi:</span>
                                  <span className="text-gray-900">{notif.userDetails.prodi}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {new Date(notif.createdAt).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {notif.ukmName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}