'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader, User } from 'lucide-react';
import Image from 'next/image';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';

export default function MahasiswaProfile() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    fakultas: '',
    prodi: '',
    photoUrl: '',
    ukm: []
  });

  // Data fakultas dan program studi langsung di dalam kode
  const fakultasData = {
    "Fakultas Komputer": ["Sistem Informasi", "Komputerisasi Akuntansi", "Bisnis Digital"],
    "Fakultas Ekonomi Bisnis Islam": ["Perbankan Syariah", "Manajemen Bisnis Syariah"],
    "Fakultas Pertanian": ["Teknologi Pangan", "Agribisnis"],
    "Fakultas Keguruan dan Ilmu Pendidikan": ["Pendidikan Bahasa Inggris", "Bimbingan dan Konseling"],
    "Fakultas Teknik": ["Teknik Industri", "Teknik Informatika"]
  };

  const [prodiList, setProdiList] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('users');
      if (!userData) {
        router.push('/login');
        return;
      }
      await fetchProfile();
    };
    checkAuth();
    // eslint-disable-next-line
  }, [router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem('users'));
      const res = await fetch(`/api/users/profil/${userData.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Gagal mengambil data profil');
      }

      // Set form data from API response
      if (data.user) {
        const currentUkm = data.user.ukm?.[0] || {};
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          nim: data.user.nim || '',
          fakultas: data.user.fakultas || '',
          prodi: data.user.prodi || '',
          photoUrl: data.user.photoUrl || '',
          ukm: data.user.ukm?.map(ukm => ({
            ...ukm,
            joinDate: ukm.joinDate ? new Date(ukm.joinDate) : null,
            createdAt: ukm.createdAt ? new Date(ukm.createdAt) : null,
            updatedAt: ukm.updatedAt ? new Date(ukm.updatedAt) : null
          })) || []
        });

        // Update prodi list if fakultas exists
        if (currentUkm.fakultas) {
          setProdiList(fakultasData[currentUkm.fakultas] || []);
        }

        // Set image preview if exists
        if (data.user.photoUrl) {
          setImagePreview(data.user.photoUrl);
        }
      }

    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFakultasChange = (e) => {
    const selectedFakultas = e.target.value;
    setFormData({ ...formData, fakultas: selectedFakultas, prodi: '' });
    setProdiList(fakultasData[selectedFakultas] || []);
  };

  // Add Cloudinary image handling
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Format file harus JPG atau PNG');
      return;
    }

    try {
      setIsLoading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'profiles');

      // Upload to Cloudinary via API route
      const res = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        photoUrl: data.url
      }));
      setImagePreview(data.url);
      setImageFile(file);
      setSuccessMessage('Foto profil berhasil diunggah');

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = JSON.parse(localStorage.getItem('users'));

      // Create payload object instead of FormData
      const payload = {
        name: formData.name,
        email: formData.email,
        nim: formData.nim,
        fakultas: formData.fakultas,
        prodi: formData.prodi,
        photoUrl: formData.photoUrl
      };

      // Send JSON payload
      const res = await fetch(`/api/users/profil/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal memperbarui profil');
      }

      // Update localStorage
      localStorage.setItem('users', JSON.stringify({
        ...userData,
        ...payload
      }));

      setSuccessMessage('Profil berhasil diperbarui');

      // Refresh data
      await fetchProfile();

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} userRole="mahasiswa" />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-8 mt-14">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Mahasiswa</h1>

            {(error || successMessage) && (
              <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                {error || successMessage}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Profile Photo */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                    {imagePreview || formData.photoUrl ? (
                      <Image
                        src={imagePreview || formData.photoUrl}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                        unoptimized={imagePreview?.startsWith('blob:') || imagePreview?.startsWith('data:')}
                        priority
                      />
                    ) : (
                      <User className="w-full h-full p-6 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIM
                    </label>
                    <input
                      type="text"
                      value={formData.nim}
                      onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan NIM"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fakultas
                    </label>
                    <select
                      value={formData.fakultas}
                      onChange={handleFakultasChange}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Fakultas</option>
                      {Object.keys(fakultasData).map((fakultas) => (
                        <option key={fakultas} value={fakultas}>
                          {fakultas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program Studi
                    </label>
                    <select
                      value={formData.prodi}
                      onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Program Studi</option>
                      {prodiList.map((prodi) => (
                        <option key={prodi} value={prodi}>
                          {prodi}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-all duration-150 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>

              {/* UKM Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Keanggotaan UKM
                </h3>

                {formData.ukm && formData.ukm.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {formData.ukm.map((ukmItem, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-blue-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {ukmItem.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">
                      Belum terdaftar dalam UKM manapun
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div >
    </div >
  );
}
