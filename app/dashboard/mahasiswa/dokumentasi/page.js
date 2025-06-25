'use client';

import { useState, useEffect } from 'react';
import { Download, Loader, FileText, Search } from 'lucide-react';
import Navbar from '@/app/components/Dashboard/Navbar';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Footer from '@/app/components/Dashboard/Footer';
import Image from 'next/image';

export default function DokumentasiPage() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userUkms, setUserUkms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchDokumentasi = async () => {
            try {
                setLoading(true);
                setError('');

                // Get user data
                const userData = JSON.parse(localStorage.getItem('users'));
                if (!userData?.id) throw new Error('Silahkan login terlebih dahulu');

                // Get user's UKM list
                const userUkmNames = userData.ukm?.map(u => u.name) || [];
                setUserUkms(userUkmNames);

                if (userUkmNames.length === 0) {
                    throw new Error('Anda belum terdaftar di UKM manapun');
                }

                // Fetch dokumentasi
                const response = await fetch('/api/mahasiswa/dokumentasi');
                const data = await response.json();

                if (!data.success) throw new Error(data.message);

                // Filter documents by user's UKM
                const filteredDocs = data.kegiatan.filter(doc =>
                    doc.ukm && userUkmNames.includes(doc.ukm)
                );
                setDocuments(filteredDocs);

            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDokumentasi();
    }, []);

    const getFileType = (file) => {
        if (!file?.type) return 'other';
        return file.type;
    };

    // Filter documents
    const filteredDocs = documents
        .filter(doc => {
            if (filterType === 'all') return true;
            return doc.files?.some(file => file.type === filterType);
        })
        .filter(doc => (
            doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.kegiatan?.toLowerCase().includes(searchQuery.toLowerCase())
        ));

        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isOpen={sidebarOpen} />
                <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
                    <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    
                    <main className="flex-1 p-8 bg-gray-50">
                        {/* Header with UKM list */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-800 mb-3 mt-20">Dokumentasi UKM</h1>
                            <p className="text-gray-600 mb-4">Lihat dan unduh dokumentasi dari UKM yang Anda ikuti</p>
                            <div className="flex flex-wrap gap-2">
                                {userUkms.map(ukm => (
                                    <span key={ukm} 
                                        className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm">
                                        {ukm}
                                    </span>
                                ))}
                            </div>
                        </div>
    
                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Cari dokumentasi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-200 shadow-sm"
                                    />
                                </div>
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all duration-200 shadow-sm min-w-[160px]"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="image">Gambar</option>
                                <option value="video">Video</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
    
                        {/* Content */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader className="w-8 h-8 animate-spin text-gray-500" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                                {error}
                            </div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
                                Tidak ada dokumentasi ditemukan
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredDocs.map(doc => (
                                    <div key={doc._id} 
                                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                        <div className="aspect-video relative bg-gray-100">
                                            {doc.files?.[0]?.type === 'image' ? (
                                                <Image
                                                    src={doc.files[0].url}
                                                    alt={doc.title}
                                                    fill
                                                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <FileText className="w-12 h-12 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-semibold text-gray-800 mb-2">{doc.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{doc.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                                    {doc.ukm}
                                                </span>
                                                {doc.files?.[0]?.url && (
                                                    <a
                                                        href={doc.files[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                    <Footer />
                </div>
            </div>
        );
    }