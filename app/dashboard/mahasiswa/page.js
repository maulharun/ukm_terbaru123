'use client';

import { useState, useEffect } from 'react';
import { Bell, Users, Calendar, BookOpen } from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total UKM', value: '-', icon: Users, color: 'bg-blue-500' },
    { title: 'Notifikasi', value: '-', icon: Bell, color: 'bg-green-500' },
    { 
      id: 3, 
      title: 'Total Kegiatan', 
      value: '-', 
      icon: Calendar, 
      color: 'bg-purple-500' 
    },
  ]);
  const [topUKMs, setTopUKMs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userUKM, setUserUKM] = useState('');

  useEffect(() => {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('users') || '{}');
    if (userData?.ukm?.[0]) {
      setUserUKM(userData.ukm[0]);

      // Fetch notifications for user's UKM
      fetch(`/api/ukm/notifikasi-ukm?ukm=${encodeURIComponent(userData.ukm[0])}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(prev => prev.map(stat =>
              stat.title === 'Notifikasi'
                ? { ...stat, value: data.unreadCount }
                : stat
            ));
            setNotifications(data.notifications.slice(0, 5));
          }
        });

      // Fetch UKM stats
      fetch('/api/dashadmin/ukm')
        .then(res => res.json())
        .then(data => {
          if (data.total) {
            setStats(prev => prev.map(stat =>
              stat.title === 'Total UKM'
                ? { ...stat, value: data.total }
                : stat
            ));
          }
        });
      fetch('/api/dashadmin/kegiatan')
        .then(res => res.json())
        .then(data => {
          if (data.all) {
            setStats(prev => prev.map(stat =>
              stat.title === 'Total Kegiatan'
                ? { ...stat, value: data.all.length }
                : stat
            ));
          }
        })
        .catch(err => console.error('Error fetching kegiatan:', err));

      fetch('/api/dashadmin/kegiatan')
        .then(res => res.json())
        .then(data => {
          setStats(prev => prev.map(stat =>
            stat.title === 'Kegiatan'
              ? { ...stat, value: data.all.length }
              : stat
          ));
          setTopUKMs(data.topUKM);
        });
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="mahasiswa" userUKM={userUKM} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Mahasiswa</h2>
              <p className="text-gray-600 mt-2">Selamat datang di portal UKM Universitas Ma&apos;soem</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Top UKMs by Kegiatan */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">UKM Teraktif</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topUKMs.map((ukm, index) => (
                  <div key={ukm.ukm} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-100' :
                      index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                      }`}>
                      <span className="text-xl font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{ukm.ukm}</h4>
                      <p className="text-sm text-gray-600">{ukm.totalKegiatan} Kegiatan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifikasi Terbaru</h3>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada notifikasi</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50">
                      <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}