'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectPath } from '@/app/utils/auth';
import { Mail, Lock, Loader, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('users', JSON.stringify(data.user));
        const redirectPath = getRedirectPath(data.user.role);
        router.push(redirectPath);
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg transition-all">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
          <div className="text-center space-y-2">
            <LogIn className="mx-auto h-14 w-14 text-gray-600" />
            <h2 className="text-3xl font-extrabold text-gray-700">
              Masuk ke UKMku
            </h2>
            <p className="text-gray-500">Silakan login untuk melanjutkan</p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 rounded-xl border border-red-200 flex items-center space-x-2 mt-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-7 mt-8">
            <div className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-gray-700" />
                <input
                  type="email"
                  required
                  id="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="peer w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 text-gray-900 placeholder-transparent focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-gray-50 transition-all duration-200"
                  placeholder="Email"
                />
                <label
                  htmlFor="email"
                  className="absolute left-12 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-700"
                >
                  Email
                </label>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 peer-focus:text-gray-700" />
                <input
                  type="password"
                  required
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="peer w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 text-gray-900 placeholder-transparent focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none bg-gray-50 transition-all duration-200"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-12 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-gray-700"
                >
                  Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3 px-6 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Masuk</span>
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <a href="/register" className="text-gray-700 hover:text-gray-900 font-semibold hover:underline transition-colors duration-200">
                  Daftar di sini
                </a>
              </p>
            </div>
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Info Login:</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Admin:</h4>
                  <p className="text-sm text-gray-600">Email: admin@gmail.com</p>
                  <p className="text-sm text-gray-600">Password: admin123</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Pengurus:</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Email: coding@gmail.com</p>
                      <p className="text-sm text-gray-600">Password: koding123</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email: jepang@gmail.com</p>
                      <p className="text-sm text-gray-600">Password: jepang123</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email: ccmu@gmail.com</p>
                      <p className="text-sm text-gray-600">Password: komputer123</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Mahasiswa:</h4>
                  <p className="text-sm text-gray-600 italic">Silakan daftar terlebih dahulu</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
