'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Loader, Search, Filter } from 'lucide-react';
import Navbar from '@/app/components/Dashboard/Navbar';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Footer from '@/app/components/Dashboard/Footer';
import { motion, AnimatePresence } from 'framer-motion';

// Utility for date formatting
function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function MembersPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUKM, setCurrentUKM] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState({ prodi: [], fakultas: [] });
    const [filterParams, setFilterParams] = useState({ filterBy: '', filterValue: '' });

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery && currentUKM) {
                handleSearch(searchQuery);
            } else if (!searchQuery && currentUKM) {
                fetchMembers(currentUKM);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line
    }, [searchQuery, currentUKM]);

    // Fetch members initial
    useEffect(() => {
        const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('users')) : null;
        if (!userData?.ukm?.length) {
            setError('No UKM data found');
            setLoading(false);
            return;
        }
        setCurrentUKM(userData.ukm[0]);
        fetchMembers(userData.ukm[0]);
        // eslint-disable-next-line
    }, []);

    // Fetch members, can be reused
    const fetchMembers = useCallback(async (ukmName) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/ukm/members?ukm=${encodeURIComponent(ukmName)}`);
            const data = await response.json();
            if (data.success) {
                setMembers(data.members);
                setFilterOptions({
                    prodi: [...new Set(data.members.map(m => m.prodi).filter(Boolean))],
                    fakultas: [...new Set(data.members.map(m => m.fakultas).filter(Boolean))],
                });
            } else {
                setError(data.message || 'Failed to fetch members');
            }
        } catch (err) {
            setError('Error loading members');
        } finally {
            setLoading(false);
        }
    }, []);

    // Search handler
    const handleSearch = async (value) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/ukm/members?ukm=${encodeURIComponent(currentUKM)}&search=${encodeURIComponent(value)}`);
            const data = await response.json();
            if (data.success) {
                setMembers(data.members);
            } else {
                setError(data.message || 'Search failed');
            }
        } catch (err) {
            setError('Error searching members');
        } finally {
            setLoading(false);
        }
    };

    // Filter handler
    const handleFilter = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `/api/ukm/members?ukm=${encodeURIComponent(currentUKM)}`;
            if (filterParams.filterBy && filterParams.filterValue) {
                url += `&filterBy=${encodeURIComponent(filterParams.filterBy)}&filterValue=${encodeURIComponent(filterParams.filterValue)}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setMembers(data.members);
            } else {
                setError(data.message || 'Filter failed');
            }
        } catch (err) {
            setError('Error filtering members');
        } finally {
            setLoading(false);
            setFilterOpen(false);
        }
    };

    // Layout
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} userRole="pengurus" userUKM={currentUKM} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} userUKM={currentUKM} />
                <main className="flex-1 p-6 pt-24 bg-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
                                <Users className="w-6 h-6 text-gray-500" />
                                <span className="tracking-tight">Daftar Anggota <span className="text-gray-500">{currentUKM}</span></span>
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                Total Anggota: <span className="font-bold text-gray-700">{members.length}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari anggota..."
                                    className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 
                                        text-gray-800 placeholder-gray-500 focus:border-gray-400 
                                        focus:ring-2 focus:ring-gray-200 hover:border-gray-300 
                                        transition-all duration-200 bg-gray-50"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setFilterOpen((o) => !o)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-700"
                                    aria-label="Buka menu filter"
                                >
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <span>Filter Anggota</span>
                                </button>
                                <AnimatePresence>
                                    {filterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        Program Studi
                                                    </label>
                                                    <select
                                                        value={filterParams.filterBy === 'prodi' ? filterParams.filterValue : ''}
                                                        onChange={(e) => setFilterParams({ filterBy: 'prodi', filterValue: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-200 p-2 text-gray-700 bg-gray-50"
                                                        aria-label="Pilih Program Studi"
                                                    >
                                                        <option value="">Tampilkan Semua Prodi</option>
                                                        {filterOptions.prodi.map((prodi) => (
                                                            <option key={prodi} value={prodi}>{prodi}</option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Filter berdasarkan program studi anggota
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                                        Fakultas
                                                    </label>
                                                    <select
                                                        value={filterParams.filterBy === 'fakultas' ? filterParams.filterValue : ''}
                                                        onChange={(e) => setFilterParams({ filterBy: 'fakultas', filterValue: e.target.value })}
                                                        className="w-full rounded-lg border border-gray-200 p-2 text-gray-700 bg-gray-50"
                                                        aria-label="Pilih Fakultas"
                                                    >
                                                        <option value="">Tampilkan Semua Fakultas</option>
                                                        {filterOptions.fakultas.map((fakultas) => (
                                                            <option key={fakultas} value={fakultas}>{fakultas}</option>
                                                        ))}
                                                    </select>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Filter berdasarkan fakultas anggota
                                                    </p>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFilterParams({ filterBy: '', filterValue: '' });
                                                            handleFilter();
                                                        }}
                                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                                                        aria-label="Reset filter"
                                                    >
                                                        Hapus Filter
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleFilter}
                                                        className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium"
                                                        aria-label="Terapkan filter"
                                                    >
                                                        Terapkan Filter
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nama</th>
                                        <th className="px-4 py-3 text-left">NIM</th>
                                        <th className="px-4 py-3 text-left">Prodi</th>
                                        <th className="px-4 py-3 text-left">Fakultas</th>
                                        <th className="px-4 py-3 text-left">Tanggal Diterima</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <AnimatePresence mode="wait">
                                        {members.map((member, index) => (
                                            <motion.tr
                                                key={member.id || `${member.name}-${index}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.04,
                                                    ease: "easeOut"
                                                }}
                                                className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.nim}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.prodi}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.fakultas}</td>
                                                <td className="px-4 py-3 text-gray-600">{formatDate(member.tanggalDiterima)}</td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {loading && (
                        <div className="flex justify-center items-center py-10">
                            <Loader className="w-8 h-8 animate-spin text-gray-500" />
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-center items-center py-10 text-red-500">
                            {error}
                        </div>  
                    )}
                </main>
                <Footer className="mt-6" />
            </div>
        </div>
    );
}