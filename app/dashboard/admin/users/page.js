'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ukmOptions, setUkmOptions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mahasiswa',
    ukm: [],
    nim: '',
    fakultas: '',
    prodi: '',
    file: null
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUkmOptions = async () => {
      try {
        const response = await fetch('/api/ukm/');
        const data = await response.json();
        if (data.success && Array.isArray(data.ukm)) {
          const ukms = data.ukm.map(ukm => ({
            _id: ukm._id,
            name: ukm.name
          }));
          setUkmOptions(ukms);
        } else {
          setUkmOptions([]);
        }
      } catch (error) {
        setUkmOptions([]);
      }
    };
    fetchUkmOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = isEdit ? `/api/users/${editId}` : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('ukm', JSON.stringify(formData.ukm));
      formDataToSend.append('nim', formData.nim);
      formDataToSend.append('fakultas', formData.fakultas);
      formDataToSend.append('prodi', formData.prodi);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        await fetchUsers();
        setRefreshTrigger(prev => prev + 1);
        setShowModal(false);
        resetForm();
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to save user');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setIsEdit(true);
    setEditId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      ukm: Array.isArray(user.ukm) ? user.ukm : [],
      nim: user.nim || '',
      fakultas: user.fakultas || '',
      prodi: user.prodi || '',
      file: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah anda yakin ingin menghapus pengguna ini?')) return;
    try {
      setDeletingId(id);
      setIsLoading(true);
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setUsers(users.filter(user => user._id !== id));
        await fetchUsers();
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
      setIsLoading(false);
    }
  };

  const renderUkmList = (ukmArray) => {
    if (!Array.isArray(ukmArray)) return '-';
    return ukmArray.map(ukm => ukm.name).join(', ');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'mahasiswa',
      ukm: []
    });
    setIsEdit(false);
    setEditId(null);
    setError('');
  };

  const handleUkmSelect = (e) => {
    const selectedUkmName = e.target.value;
    if (selectedUkmName) {
      setFormData(prev => ({
        ...prev,
        ukm: [selectedUkmName]
      }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-8 mt-14">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-xl shadow">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 rounded-xl shadow">
              {successMessage}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-700">Kelola Pengguna</h1>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow hover:bg-gray-800 hover:scale-105 transition"
              disabled={isLoading}
            >
              <Plus className="w-5 h-5" />
              Tambah Pengguna
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">UKM</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="even:bg-gray-50">
                      <td className="px-5 py-5 border-b border-gray-100 bg-white text-sm text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-100 bg-white text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-100 bg-white text-sm text-gray-700 capitalize">
                        {user.role}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-100 bg-white text-sm text-gray-700">
                        {renderUkmList(user.ukm)}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-100 bg-white text-sm text-gray-700">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-gray-700 hover:text-gray-900 mr-4"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Apakah anda yakin ingin menghapus pengguna ini?')) {
                              handleDelete(user._id);
                            }
                          }}
                          disabled={deletingId === user._id}
                          className={`${deletingId === user._id
                            ? 'text-gray-400'
                            : 'text-red-600 hover:text-red-900'
                            }`}
                        >
                          {deletingId === user._id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer className="mt-auto" />
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 text-gray-800">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md border-2 border-gray-200 shadow-2xl">
              <h2 className="text-xl font-extrabold mb-6 text-gray-700">
                {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
                {!isEdit && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                      required={!isEdit}
                      minLength={6}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                    required
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="pengurus">Pengurus UKM</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {formData.role === 'pengurus' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      UKM
                    </label>
                    <select
                      onChange={handleUkmSelect}
                      value={formData.ukm[0] || ''}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                    >
                      <option value="">Pilih UKM</option>
                      {ukmOptions.map((ukm) => (
                        <option key={ukm._id} value={ukm.name}>
                          {ukm.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 space-y-2">
                      {formData.ukm.length > 0 && (
                        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg text-gray-700 font-medium">
                          <span>{formData.ukm[0].name || formData.ukm[0]}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                ukm: []
                              }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    disabled={isLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      isEdit ? 'Update' : 'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}