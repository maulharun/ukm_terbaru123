'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  User,
  Calendar,
  UserPlus,
  Activity,
  Award,
  UsersRound
} from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [ukmList, setUkmList] = useState([]);
  const [stats, setStats] = useState([
    { id: 1, title: 'Total UKM', value: '-', icon: Users, color: 'bg-blue-500' },
    { id: 2, title: 'Total Anggota', value: '-', icon: UsersRound, color: 'bg-green-500' },
    { id: 3, title: 'Total Kegiatan', value: '-', icon: Calendar, color: 'bg-purple-500' },
    { id: 4, title: 'Total Pendaftar', value: '-', icon: UserPlus, color: 'bg-orange-500' }
  ]);
  const [recentRegistration, setRecentRegistration] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [topUKM, setTopUKM] = useState([]);

  useEffect(() => {
    // Fetch UKM Data
    fetch('/api/dashadmin/ukm')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Update stats with total UKM and members
          setStats(prev => prev.map(stat => {
            if (stat.title === 'Total UKM') return { ...stat, value: data.total };
            if (stat.title === 'Total Anggota') return { ...stat, value: data.totalMembers };
            return stat;
          }));

          // Set UKM list directly from API response
          setUkmList(data.list.map((ukm, index) => ({
            id: index,
            name: ukm.name,
            memberCount: ukm.memberCount
          })));
        }
      })
      .catch(error => {
        console.error('Error fetching UKM data:', error);
        setUkmList([]);
      });

    // Fetch Activities Data  
    fetch('/api/dashadmin/kegiatan')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(prev => prev.map(stat =>
            stat.title === 'Total Kegiatan' ? { ...stat, value: data.total } : stat
          ));
          setTopUKM(data.topUKM || []);
        }
      })
      .catch(error => console.error('Error fetching activities:', error));

    fetch('/api/dashadmin/pendaftar')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }

        // Update total pendaftar in stats
        setStats(prev => prev.map(stat =>
          stat.title === 'Total Pendaftar'
            ? { ...stat, value: data.total }
            : stat
        ));

        // Update registration status counts
        setRecentRegistration({
          pending: data.pending || 0,
          approved: data.approved || 0,
          rejected: data.rejected || 0
        });
      })
      .catch(error => {
        console.error('Error fetching registrations:', error);
        setRecentRegistration({
          pending: 0,
          approved: 0,
          rejected: 0
        });
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-6 md:p-10 mt-16 mb-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Dashboard Admin
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(stat => (
              <div key={stat.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-gray-800">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Status Pendaftaran
              </h2>
              <div className="space-y-4">
                <StatusBar
                  label="Pending"
                  value={recentRegistration.pending}
                  total={recentRegistration.pending + recentRegistration.approved + recentRegistration.rejected}
                  color="yellow"
                />
                <StatusBar
                  label="Approved"
                  value={recentRegistration.approved}
                  total={recentRegistration.pending + recentRegistration.approved + recentRegistration.rejected}
                  color="green"
                />
                <StatusBar
                  label="Rejected"
                  value={recentRegistration.rejected}
                  total={recentRegistration.pending + recentRegistration.approved + recentRegistration.rejected}
                  color="red"
                />
              </div>
            </div>

            {/* Top UKMs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                UKM Teraktif
              </h2>
              <div className="space-y-4">
                {topUKM.map((ukm, idx) => (
                  <div key={ukm.ukm} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${idx === 0 ? 'bg-yellow-100' :
                        idx === 1 ? 'bg-gray-100' : 'bg-orange-100'}`}>
                      <span className="font-bold">#{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{ukm.ukm}</h3>
                      <p className="text-sm text-gray-600">{ukm.totalKegiatan} Kegiatan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Daftar UKM</h2>
              <span className="text-sm text-gray-500">Total: {ukmList.length} UKM</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama UKM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Anggota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ukmList.sort((a, b) => b.memberCount - a.memberCount).map((ukm, index) => {
                    const percentage = ((ukm.memberCount / stats.find(s => s.title === 'Total Anggota').value) * 100).toFixed(1);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ukm.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ukm.memberCount} mahasiswa
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

// Update StatusBar component to show registration stats
function StatusBar({ label, value, total, color }) {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-${color}-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
