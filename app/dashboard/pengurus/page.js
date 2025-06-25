'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';
import { Users } from 'lucide-react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Anggota', value: '-', icon: Users }
  ]);
  const [allEvents, setAllEvents] = useState([]);
  const [ukmPengurus, setUkmPengurus] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('users'));
    const ukmName = userData?.ukm || '';
    setUkmPengurus(ukmName);

    if (!ukmName) return;

    fetch(`/api/ukm/members?ukm=${encodeURIComponent(ukmName)}`)
      .then(res => res.json())
      .then(data => {
        setStats(prev => prev.map(stat =>
          stat.title === 'Total Anggota'
            ? { ...stat, value: data.total ?? '-' }
            : stat
        ));
      });

    fetch(`/api/pengurus/kegiatan?ukm=${encodeURIComponent(ukmName)}`)
      .then(res => res.json())
      .then(data => {
        setAllEvents(Array.isArray(data.activities) ? data.activities : []);
      });
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} userRole="pengurus" userUKM={ukmPengurus} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={toggleSidebar} userUKM={ukmPengurus} />
        <main className="flex-1 pt-20 px-2 sm:px-8 pb-10 bg-gray-100">
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-700">
                  Pengurus UKM <span className="text-gray-500">{ukmPengurus}</span>
                </h2>
                <p className="text-gray-500 mt-1 text-base">
                  Selamat datang, pengurus! Pantau statistik dan event UKM <span className="font-semibold text-gray-700">{ukmPengurus}</span> di sini.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold shadow-sm text-sm">
                  Dashboard Pengurus
                </span>
              </div>
            </header>

            {/* Statistik */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl shadow py-8 px-4 hover:scale-105 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 mb-3">
                    <stat.icon className="w-8 h-8 text-gray-600" strokeWidth={2.4} />
                  </div>
                  <div className="text-base text-gray-500 font-semibold mb-1 tracking-wide text-center">{stat.title}</div>
                  <div className="text-4xl font-black text-gray-700 tracking-tight leading-snug text-center">{stat.value}</div>
                </div>
              ))}
            </section>

            {/* Semua Event UKM */}
            <section className="bg-white rounded-3xl shadow border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                Event UKM <span className="text-gray-500">{ukmPengurus}</span>
              </h3>
              <div className="space-y-4">
                {allEvents.length === 0 ? (
                  <div className="text-gray-400 text-center py-10 italic">Belum ada event UKM.</div>
                ) : (
                  allEvents.map((event, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-200 shadow hover:shadow-md transition"
                    >
                      <div>
                        <div className="font-bold text-gray-700 text-lg">{event.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{event.ukm}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{event.status}</div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 mt-3 md:mt-0">
                        {new Date(event.date).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    </div>
  );
}