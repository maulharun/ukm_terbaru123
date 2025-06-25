'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mahasiswa'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full shadow-lg mb-2">
              <UserPlus size={36} className="text-gray-600" />
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-700 tracking-tight">
              Daftar Akun UKM
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Bergabung dan mulai perjalanan barumu!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-400 rounded shadow-sm">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-7">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-gray-50 transition-colors"
                  placeholder="Nama lengkap"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-gray-50 transition-colors"
                  placeholder="Email aktif"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-gray-50 transition-colors"
                  placeholder="Buat password"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gray-700 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-lg transition-all duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Mendaftar...</span>
                </div>
              ) : (
                'Daftar'
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <a
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 font-semibold hover:underline"
                >
                  Masuk di sini
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}