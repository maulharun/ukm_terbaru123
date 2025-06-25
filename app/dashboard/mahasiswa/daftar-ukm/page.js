'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Loader, Image as ImageIcon } from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';
import Image from 'next/image';

export default function DaftarUKM() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ukmList, setUkmList] = useState([]);
  const [isLoadingUKM, setIsLoadingUKM] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUKM, setSelectedUKM] = useState('');
  const [userUKM, setUserUKM] = useState([]);
  const [availableUKMs, setAvailableUKMs] = useState([]);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [ktmFile, setKtmFile] = useState(null);
  const [sertifikatFile, setSertifikatFile] = useState(null);
  const [ktmPreview, setKtmPreview] = useState(null);
  const [sertifikatPreview, setSertifikatPreview] = useState(null);
  const [alasan, setAlasan] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [incompleteFields, setIncompleteFields] = useState([]);
  const [userData, setUserData] = useState({
    _id: '',
    name: '',
    email: '',
    nim: '',
    fakultas: '',
    prodi: '',
    ukm: [],
    photoUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingUKM(true);
        const userStored = JSON.parse(localStorage.getItem('users'));

        if (!userStored?.id) {
          router.push('/login');
          return;
        }

        // Fetch user data from API
        const userRes = await fetch(`/api/users/${userStored.id}`);
        if (!userRes.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userRes.json();

        // Update user data state
        setUserData({
          _id: userData._id,
          name: userData.name || '',
          email: userData.email || '',
          nim: userData.nim || '',
          fakultas: userData.fakultas || '',
          prodi: userData.prodi || '',
          ukm: userData.ukm || [],
          photoUrl: userData.photoUrl || ''
        });

        // Validate profile
        const { isComplete, missing } = validateProfile(userData);
        setIsProfileComplete(isComplete);
        setIncompleteFields(missing);

        // Get user's UKM list
        const userUkmList = userData.ukm.map(u => u.name.toLowerCase());
        setUserUKM(userUkmList);

        // Fetch available UKMs
        const ukmRes = await fetch('/api/ukm');
        const ukmData = await ukmRes.json();

        if (ukmData.success) {
          const available = ukmData.ukm.filter(ukm =>
            !userUkmList.includes(ukm.name.toLowerCase())
          );
          setUkmList(ukmData.ukm);
          setAvailableUKMs(available);
        }

      } catch (error) {
        console.error('Error:', error);
        setError('Gagal memuat data');
      } finally {
        setIsLoadingUKM(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUKMSelection = (e) => {
    const selectedValue = e.target.value;
    setSelectedUKM(selectedValue);

    if (!selectedValue) return;

    // Check user's existing UKM memberships
    const userUkmData = userData.ukm || [];

    // Check if user is already registered in this UKM
    const existingMembership = userUkmData.find(
      ukm => ukm.name.toLowerCase() === selectedValue.toLowerCase()
    );

    if (existingMembership) {
      setDuplicateWarning(`Anda sudah terdaftar di UKM ${selectedValue}`);
      setAlreadyMember(true);
      // Reset form values to prevent submission
      setSelectedUKM('');
      setKtmFile(null);
      setKtmPreview(null);
      setSertifikatFile(null);
      setSertifikatPreview(null);
      setAlasan('');
    } else {
      setDuplicateWarning('');
      setAlreadyMember(false);
    }
  };

  const fetchAndFilterUKMs = async () => {
    try {
      setIsLoadingUKM(true);

      const userStoredData = JSON.parse(localStorage.getItem('users'));
      if (!userStoredData?.id) {
        router.push('/login');
        return;
      }

      // Fetch user data
      const userRes = await fetch(`/api/users/${userStoredData.id}`);
      const userData = await userRes.json();

      // Update user data state
      setUserData({
        _id: userData._id,
        name: userData.name || '',
        email: userData.email || '',
        nim: userData.nim || '',
        fakultas: userData.fakultas || '',
        prodi: userData.prodi || '',
        ukm: userData.ukm || [],
        photoUrl: userData.photoUrl || ''
      });

      // Get user's UKM list
      const userUkmList = (userData?.ukm || []).map(ukm =>
        ukm.name.toLowerCase()
      );
      setUserUKM(userUkmList);

      // Fetch all UKMs
      const ukmRes = await fetch('/api/ukm');
      const ukmData = await ukmRes.json();

      if (ukmData.success && Array.isArray(ukmData.ukm)) {
        // Filter available UKMs
        const available = ukmData.ukm.filter(ukm =>
          !userUkmList.includes(ukm.name.toLowerCase())
        );
        setUkmList(ukmData.ukm);
        setAvailableUKMs(available);
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Gagal memuat data UKM');
    } finally {
      setIsLoadingUKM(false);
    }
  };

  // Update useEffect to use fetchAndFilterUKMs
  useEffect(() => {
    fetchAndFilterUKMs();
  }, [fetchAndFilterUKMs]);

  // Update file validation
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`Ukuran file ${type === 'ktm' ? 'KTM' : 'Sertifikat'} maksimal 5MB`);
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError(`Format file ${type === 'ktm' ? 'KTM' : 'Sertifikat'} harus JPG, PNG atau PDF`);
      e.target.value = '';
      return;
    }

    // Handle file preview
    if (type === 'ktm') {
      setKtmFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setKtmPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setKtmPreview(null);
      }
    } else {
      setSertifikatFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setSertifikatPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setSertifikatPreview(null);
      }
    }

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!ktmFile || !selectedUKM || !alasan) {
        throw new Error('Semua field wajib diisi');
      }

      // Create FormData
      const formData = new FormData();

      // Add files
      formData.append('ktmFile', ktmFile);
      if (sertifikatFile) {
        formData.append('sertifikatFile', sertifikatFile);
      }

      // Add registration data
      formData.append('userId', userData._id);
      formData.append('nama', userData.name);
      formData.append('email', userData.email);
      formData.append('nim', userData.nim);
      formData.append('fakultas', userData.fakultas);
      formData.append('prodi', userData.prodi);
      formData.append('ukmName', selectedUKM);
      formData.append('alasan', alasan);

      // Submit registration
      const response = await fetch('/api/ukm/register', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Gagal mendaftar UKM');
      }

      // Show success and reset form
      setSuccessMessage('Pendaftaran UKM berhasil dikirim');
      resetForm();

      // Update available UKMs list
      await fetchAndFilterUKMs();

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUKM('');
    setKtmFile(null);
    setKtmPreview(null);
    setSertifikatFile(null);
    setSertifikatPreview(null);
    setAlasan('');
  };

  // Update validateProfile function
  const validateProfile = (profile) => {
    const requiredFields = {
      name: 'Nama Lengkap',
      nim: 'NIM',
      fakultas: 'Fakultas',
      prodi: 'Program Studi',
      email: 'Email'
    };

    const missing = [];
    const currentUkm = profile.ukm?.[0] || {};

    Object.entries(requiredFields).forEach(([key, label]) => {
      if (!currentUkm[key] && !profile[key]) {
        missing.push(label);
      }
    });

    return {
      isComplete: missing.length === 0,
      missing
    };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-8 mt-14">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Pendaftaran UKM</h1>

            {duplicateWarning && (
              <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                {duplicateWarning}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md text-green-700">
                {successMessage}
              </div>
            )}
            {!isProfileComplete && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Profil Belum Lengkap
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Lengkapi data berikut sebelum mendaftar:</p>
                      <ul className="list-disc list-inside mt-1">
                        {incompleteFields.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <div className="flex space-x-3">
                        <a
                          href="/dashboard/mahasiswa/profil"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Lengkapi Profil
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Data Pendaftar</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Lengkap</p>
                  <p className="font-medium text-gray-700 mb-2">{userData.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIM</p>
                  <p className="font-medium text-gray-700 mb-2">{userData.nim || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fakultas</p>
                  <p className="font-medium text-gray-700 mb-2">{userData.fakultas || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Program Studi</p>
                  <p className="font-medium text-gray-700 mb-2">{userData.prodi || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-700 mb-2">{userData.email || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih UKM
                  </label>
                  <select
                    value={selectedUKM}
                    onChange={handleUKMSelection}
                    className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 px-6 py-4"
                    disabled={isLoadingUKM}
                    required
                  >
                    <option value="">Pilih UKM</option>
                    {isLoadingUKM ? (
                      <option disabled>Loading...</option>
                    ) : availableUKMs.length > 0 ? (
                      availableUKMs.map((ukm) => (
                        <option key={ukm._id} value={ukm.name}>
                          {ukm.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>Tidak ada UKM tersedia</option>
                    )}
                  </select>

                  {duplicateWarning && (
                    <p className="mt-2 text-sm text-red-600">
                      {duplicateWarning}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload KTM
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'ktm')}
                      className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">Format: JPG, JPEG, PNG, PDF (Max: 5MB)</p>
                    {ktmPreview && (
                      <div className="mt-3 relative">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
                          {ktmFile?.type.startsWith('image/') ? (
                            <Image
                              src={ktmPreview}
                              alt="KTM Preview"
                              fill
                              className="object-cover"
                              sizes="192px"
                              style={{ objectFit: 'cover' }}
                              unoptimized={true}
                            />
                          ) : (
                            <div className="flex flex-col justify-center items-center h-full w-full">
                              <FileText className="w-16 h-16 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-2">Preview tidak tersedia untuk PDF</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Preview KTM</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Sertifikat
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'sertifikat')}
                      className="w-full px-4 py-3 text-gray-500 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">Format: JPG, JPEG, PNG, PDF (Max: 5MB)</p>
                    {sertifikatPreview && (
                      <div className="mt-3 relative">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
                          {/* Use next/image for image preview */}
                          {sertifikatFile && sertifikatFile.type.startsWith('image/') ? (
                            <Image
                              src={sertifikatPreview}
                              alt="Sertifikat Preview"
                              fill
                              className="object-cover"
                              sizes="192px"
                              style={{ objectFit: 'cover' }}
                              unoptimized={sertifikatPreview.startsWith('blob:') || sertifikatPreview.startsWith('data:')}
                            />
                          ) : (
                            <div className="flex flex-col justify-center items-center h-full w-full">
                              <ImageIcon className="w-16 h-16 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-2">Preview tidak tersedia untuk PDF</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Preview Sertifikat</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alasan Mendaftar
                  </label>
                  <textarea
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                    placeholder="Tuliskan alasan anda mendaftar UKM ini..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !selectedUKM ||
                    !ktmFile ||
                    !alasan ||
                    duplicateWarning ||
                    alreadyMember ||
                    !isProfileComplete
                  }
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-xl 
    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:ring-offset-2 disabled:bg-blue-400 transition-all duration-150 
    flex items-center justify-center space-x-2"
                >
                  {!isProfileComplete ? (
                    'Lengkapi Profil Terlebih Dahulu'
                  ) : isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Mendaftar...</span>
                    </>
                  ) : duplicateWarning ? (
                    'Anda Sudah Terdaftar'
                  ) : (
                    'Daftar UKM'
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer className="mt-auto" />
      </div>
    </div>
  );
}