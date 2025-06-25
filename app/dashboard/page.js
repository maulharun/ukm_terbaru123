"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    switch (user.role) {
      case 'mahasiswa':
        router.replace('/dashboard/mahasiswa');
        break;
      case 'pengurus_ukm':
        router.replace('/dashboard/pengurus');
        break;
      case 'admin':
        router.replace('/dashboard/admin');
        break;
      default:
        router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-yellow-50 to-green-100">
      <div className="flex flex-col items-center gap-4 bg-white/80 px-8 py-10 rounded-3xl shadow-2xl border-2 border-pink-200">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-2" />
        <div className="text-lg font-semibold text-pink-700 tracking-wide">
          Mohon tunggu, Anda sedang diarahkan ke dashboard sesuai peran Anda...
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Jika tidak diarahkan, silakan <a href="/login" className="text-green-600 underline hover:text-pink-600">login ulang</a>.
        </div>
      </div>
    </div>
  );
}