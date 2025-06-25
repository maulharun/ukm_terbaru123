import React from 'react';

const Footer = React.memo(function Footer({ className = '' }) {
  return (
    <footer className={`w-full py-8 bg-gray-200 shadow-inner border-t border-gray-300 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto px-4 gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#6b7280"/>
            <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          UKM Mahasiswa
        </div>
        <div className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Ma&#39;soem University
        </div>
        <div className="flex gap-3">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="3" rx="5" fill="#9ca3af"/>
              <circle cx="12" cy="12" r="4" fill="#fff"/>
            </svg>
          </a>
          <a href="mailto:info@masoemuniversity.ac.id" className="hover:scale-110 transition-transform">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="14" x="3" y="5" rx="3" fill="#d1d5db"/>
              <path d="M3 5l9 7 9-7" stroke="#fff" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
});

export default Footer;