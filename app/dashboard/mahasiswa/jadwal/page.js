'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Loader } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/app/components/Dashboard/Navbar';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Footer from '@/app/components/Dashboard/Footer';

export default function JadwalPage() {
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userUkm, setUserUkm] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('users'));
            const ukmNames = Array.isArray(userData?.ukm)
                ? userData.ukm.map(u => typeof u === 'string' ? u : u.name)
                : [];

            if (!ukmNames.length) {
                setError('No UKM data found');
                setLoading(false);
                return;
            }
            setUserUkm(userData.ukm);

            const response = await fetch('/api/mahasiswa/kegiatan');
            const data = await response.json();

            if (data.success) {
                const groupedSchedule = data.kegiatan.reduce((acc, activity) => {
                    if (ukmNames.includes(activity.ukm)) {
                        if (!acc[activity.ukm]) {
                            acc[activity.ukm] = [];
                        }
                        acc[activity.ukm].push({
                            _id: activity._id,
                            title: activity.title,
                            description: activity.description,
                            date: activity.date,
                            location: activity.location,
                            status: activity.status,
                            banner: activity.banner,
                            banner_id: activity.banner_id,
                            ukm: activity.ukm,
                            createdAt: activity.createdAt
                        });
                    }
                    return acc;
                }, {});
                setSchedule(groupedSchedule);
            } else {
                setError(data.message || 'Failed to fetch schedule');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch schedule');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} userRole="mahasiswa" userUKM={userUkm} />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6 mt-20">
                            Jadwal Kegiatan UKM
                        </h1>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                                {error}
                            </div>
                        ) : Object.keys(schedule).length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Tidak ada jadwal kegiatan
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    Belum ada kegiatan yang dijadwalkan untuk UKM Anda
                                </p>
                            </div>
                        ) : (
                            Object.entries(schedule).map(([ukm, activities]) => (
                                <div key={ukm} className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
                                    <div className="bg-blue-600 px-6 py-4">
                                        <h2 className="text-xl font-semibold text-white">
                                            Jadwal UKM {ukm}
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {activities.map((activity) => (
                                            <div key={activity._id} className="p-6 hover:bg-gray-50 transition-colors">
                                                {activity.banner && (
                                                    <div className="mb-4">
                                                        <img
                                                            src={activity.banner}
                                                            alt={activity.title}
                                                            className="w-full h-48 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {activity.title}
                                                            </h3>
                                                            <p className="mt-1 text-gray-600 text-sm">
                                                                {activity.description}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="flex items-center text-gray-600">
                                                                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                                                <span className="text-sm">
                                                                    {formatDate(activity.date)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-gray-600">
                                                                <Clock className="w-4 h-4 mr-2 text-blue-600" />
                                                                <span className="text-sm">
                                                                    {formatTime(activity.date)}
                                                                </span>
                                                            </div>
                                                            {activity.location && (
                                                                <div className="flex items-center text-gray-600 col-span-2">
                                                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                                                    <span className="text-sm">
                                                                        {activity.location}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap
                                                        ${activity.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                                                    >
                                                        {activity.status === 'upcoming' ? 'Akan Datang' : 'Sedang Berlangsung'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}