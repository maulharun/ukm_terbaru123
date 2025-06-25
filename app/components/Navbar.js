"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-gray-100 shadow-lg border-b border-gray-300 px-0 py-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-2">
        <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <Image
            src="/logo.png"
            alt="UKM Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-gray-400 bg-white"
            priority
          />
          <span className="text-3xl font-black text-gray-700 drop-shadow-lg tracking-wide">
            UKMku
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors border-2 border-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-7 h-7 text-gray-700"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" />
            )}
          </svg>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 bg-gray-700 text-white rounded-2xl font-bold shadow-md hover:bg-gray-800 hover:scale-105 transition-transform"
          >
            Daftar UKM
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-gray-200 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="flex flex-col gap-4 p-6">
            <Link
              href="/"
              className="text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/login"
              className="text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all"
              onClick={() => setIsOpen(false)}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gray-700 text-white rounded-2xl font-bold shadow-md hover:bg-gray-800 hover:scale-105 transition-transform text-center"
              onClick={() => setIsOpen(false)}
            >
              Daftar UKM
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}