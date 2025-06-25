'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader, Users, X } from 'lucide-react';
import Sidebar from '@/app/components/Dashboard/Sidebar';
import Navbar from '@/app/components/Dashboard/Navbar';
import Footer from '@/app/components/Dashboard/Footer';

export default function KelolaUKM() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ukms, setUkms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedUKMMembers, setSelectedUKMMembers] = useState([]);
  const [selectedUKMName, setSelectedUKMName] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchUKMs();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUKMs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ukm');
      const data = await res.json();

      if (data.success) {
        setUkms(data.ukm || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError(error.message);
      setUkms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = (ukm) => {
    setSelectedUKMMembers(ukm.members || []);
    setSelectedUKMName(ukm.name);
    setShowMembersModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { _id: editId, ...formData } : formData;

      const res = await fetch('/api/ukm', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setSuccessMessage(result.message);
      setShowModal(false);
      resetForm();
      fetchUKMs();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus UKM ini?')) return;

    try {
      setIsLoading(true);
      const res = await fetch(`/api/ukm?id=${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setSuccessMessage(result.message);
      fetchUKMs();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ukm) => {
    setFormData({
      name: ukm.name,
      description: ukm.description,
      category: ukm.category
    });
    setEditId(ukm._id);
    setIsEdit(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '' });
    setIsEdit(false);
    setEditId(null);
  };

  // Modal anggota UKM dengan tampilan baru
  const MembersModal = ({ ukm, onClose }) => {
    if (!ukm) return null;

    return (
      <div className="fixed inset-0 bg-gray-200 bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto border-2 border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-700 flex items-center gap-2">
              <Users className="w-7 h-7 text-gray-500" />
              Anggota UKM <span className="text-gray-600">{ukm.name}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {ukm.members && ukm.members.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">NIM</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Nama</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Fakultas</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Prodi</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Bergabung</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {ukm.members.map((member, index) => (
                    <tr key={member.nim} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{member.nim}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{member.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{member.fakultas}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{member.prodi}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(member.tanggalDiterima).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada anggota terdaftar</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Total Anggota: {ukm.members?.length || 0} orang
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} userRole="admin" />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-8 mt-14">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-xl shadow">
              {successMessage}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-extrabold text-gray-700 drop-shadow">
              Kelola UKM
            </h1>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white rounded-full font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition"
            >
              <Plus className="w-5 h-5" />
              Tambah UKM
            </button>
          </div>

          {/* UKM Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-10 h-10 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Nama UKM</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Anggota</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {ukms.map((ukm, index) => (
                    <tr key={ukm._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{ukm.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{ukm.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{ukm.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => fetchMembers(ukm)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-200 shadow-sm text-xs font-semibold rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          {ukm.members?.length || 0} Anggota
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(ukm)}
                            className="text-green-600 hover:text-green-800 transition"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ukm._id)}
                            className="text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* UKM Form Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 text-gray-700">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-2 border-gray-200">
                <h2 className="text-2xl font-extrabold mb-6 text-gray-700">
                  {isEdit ? 'Edit UKM' : 'Tambah UKM Baru'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Nama UKM
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-800 hover:scale-105 transition disabled:bg-gray-400"
                    >
                      {isLoading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Members Modal */}
          {showMembersModal && (
            <MembersModal
              ukm={{ name: selectedUKMName, members: selectedUKMMembers }}
              onClose={() => setShowMembersModal(false)}
            />
          )}
           </main>
        <Footer className="mt-auto" />
      </div>
    </div>
  );
}