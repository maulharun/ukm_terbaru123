function Footer({ className }) {
  return (
    <footer className={`w-full bg-gray-200 border-t border-gray-300 shadow-inner ${className}`}>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-4 py-6">
        <div className="flex items-center gap-2 text-gray-700 font-bold text-base">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#6b7280"/>
            <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="tracking-wide">Portal UKM Mahasiswa</span>
        </div>
        <div className="text-gray-600 text-xs mt-2 md:mt-0">
          &copy; {new Date().getFullYear()} Ma&#39;soem University
        </div>
      </div>
    </footer>
  );
}
export default Footer;