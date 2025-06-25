'use client';
import { useState, useEffect } from "react";
import { Menu, User } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function Navbar({ toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('users');
    if (userData) {
      setUsers(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('users');
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const displayName = () => {
    if (!users) return "Guest";
    switch (users.role) {
      case "mahasiswa":
        return users.name;
      case "pengurus":
        const ukmName = Array.isArray(users.ukm) ? users.ukm[0] : users.ukm;
        return `${users.name} (${ukmName || 'UKM'})`;
      case "admin":
        return "Administrator";
      default:
        return users.name;
    }
  };

  return (
    <nav className="w-full h-16 flex items-center px-6 fixed top-0 z-30 shadow-lg bg-gray-100 border-b border-gray-300">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-700 text-2xl p-2 rounded-full hover:bg-gray-200 border border-gray-300 transition"
          aria-label="Toggle sidebar"
        >
          <Menu />
        </button>
      </div>

      <div className="ml-auto flex items-center relative">
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 cursor-pointer p-2 rounded-full hover:bg-gray-200 border border-gray-300 transition"
        >
          <span className="text-sm text-gray-700 font-semibold">{displayName()}</span>
          <User className="w-8 h-8 text-gray-500" />
        </div>

        {/* Dropdown menu */}
        <div className={`absolute right-0 top-14 w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all duration-200 z-50 ${
          dropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}>
          <div className="py-2">
            <hr className="border-gray-200 my-1" />
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 rounded-b-2xl transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}