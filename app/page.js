import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 md:px-20 py-12 gap-12">
        <section className="w-full md:w-1/2 flex flex-col items-start md:items-start text-left space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-800 drop-shadow-lg">
            Temukan UKM Favoritmu!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed bg-white p-4 rounded-lg shadow-md">
            Eksplorasi komunitas, kembangkan bakat, dan jadilah bagian dari perubahan di kampus. Daftar UKM, cek agenda, dan raih pengalaman baru bersama teman-teman!
          </p>
          <a
            href="/login"
            className="inline-block mt-2 px-8 py-3 bg-gray-700 text-white font-semibold rounded-full shadow-lg hover:bg-gray-800 hover:scale-105 transition-transform"
          >
            Daftar Sekarang
          </a>
        </section>
        <section className="w-full md:w-1/2 flex justify-center">
          <div className="w-80 h-80 relative rounded-3xl shadow-2xl border-4 border-gray-200 bg-white overflow-hidden">
            <Image
              src="/ilustrasi.jpeg"
              alt="Ilustrasi UKM Mahasiswa"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </section>
      </main>
      <Footer className="mt-auto" />
    </div>
  );
}