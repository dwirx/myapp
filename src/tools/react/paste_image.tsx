import React, { useState, useEffect, useRef } from 'react';
import { 
  FileDown, Moon, Sun, Languages, Tent, 
  FileText, ClipboardPaste, Trash2, Download, Image as ImageIcon, Trash, X, Maximize2
} from 'lucide-react';

function Github({ size = 20 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// ==========================================
// KONFIGURASI INDEXEDDB (Database Lokal)
// ==========================================
let dbPromise = null;
if (typeof window !== 'undefined' && window.indexedDB) {
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('ImageDownloaderDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Fungsi Helper Database
const db = {
  async add(record) {
    if (!dbPromise) return null;
    const database = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = database.transaction('history', 'readwrite');
      const request = tx.objectStore('history').add(record);
      request.onsuccess = () => resolve({ ...record, id: request.result });
      request.onerror = () => reject(request.error);
    });
  },
  async getAll() {
    if (!dbPromise) return [];
    const database = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = database.transaction('history', 'readonly');
      const request = tx.objectStore('history').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  async delete(id) {
    if (!dbPromise) return;
    const database = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = database.transaction('history', 'readwrite');
      const request = tx.objectStore('history').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  async clearAll() {
    if (!dbPromise) return;
    const database = await dbPromise;
    return new Promise((resolve, reject) => {
      const tx = database.transaction('history', 'readwrite');
      const request = tx.objectStore('history').clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};


// ==========================================
// KOMPONEN UTAMA APLIKASI
// ==========================================
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const historyRef = useRef(history);
  historyRef.current = history;

  // Fungsi untuk menampilkan pesan (Toast)
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Memuat riwayat dari IndexedDB saat aplikasi pertama kali dijalankan
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const items = await db.getAll();
        // Buat Object URL untuk preview agar gambar bisa ditampilkan
        const itemsWithUrls = items.map(item => ({
          ...item,
          previewUrl: URL.createObjectURL(item.blob)
        }));
        // Urutkan dari yang terbaru
        itemsWithUrls.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(itemsWithUrls);
      } catch (error) {
        console.error("Gagal memuat riwayat:", error);
      }
    };
    loadHistory();

    // Membersihkan Object URL saat komponen unmount untuk mencegah memory leak
    return () => {
      historyRef.current.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  // Fungsi internal untuk memicu proses download browser
  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fungsi memproses gambar baru (Unduh + Simpan ke Riwayat)
  const processNewImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File yang dimasukkan bukan gambar.');
      return;
    }

    const extension = file.type.split('/')[1] || 'png';
    const finalName = file.name && file.name !== 'image.png' 
      ? file.name 
      : `gambar-unduhan-${Date.now()}.${extension}`;

    // 1. Langsung memicu pengunduhan
    triggerDownload(file, finalName);
    showToast('Gambar berhasil diunduh!');

    // 2. Simpan ke database IndexedDB
    const record = {
      blob: file,
      name: finalName,
      type: file.type,
      timestamp: Date.now()
    };

    try {
      const savedRecord = await db.add(record);
      if (savedRecord) {
        const newItem = {
          ...savedRecord,
          previewUrl: URL.createObjectURL(savedRecord.blob)
        };
        // Tambahkan ke state urutan teratas
        setHistory(prev => [newItem, ...prev]);
      }
    } catch (error) {
      console.error("Gagal menyimpan ke riwayat:", error);
    }
  };

  // Menghapus satu item dari riwayat
  const handleDeleteItem = async (id, previewUrl) => {
    try {
      await db.delete(id);
      URL.revokeObjectURL(previewUrl);
      setHistory(prev => prev.filter(item => item.id !== id));
      showToast('Gambar dihapus dari riwayat.');
    } catch (error) {
      showToast('Gagal menghapus gambar.');
    }
  };

  // Menghapus semua riwayat
  const handleClearAllHistory = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus semua riwayat?')) return;
    try {
      await db.clearAll();
      history.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setHistory([]);
      showToast('Seluruh riwayat berhasil dibersihkan.');
    } catch (error) {
      showToast('Gagal membersihkan riwayat.');
    }
  };

  // Mengunduh ulang gambar dari riwayat
  const handleRedownload = (item) => {
    triggerDownload(item.blob, item.name);
    showToast('Mengunduh ulang gambar...');
  };

  // Menangani event paste (CTRL+V) dari seluruh window
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          processNewImage(file);
          e.preventDefault(); 
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Event Handlers Drag & Drop & Click
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processNewImage(files[0]);
  };
  const handleClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) processNewImage(files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Tombol Paste Manual
  const handlePasteButtonClick = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('Not supported');
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        for (const imageType of imageTypes) {
          const blob = await clipboardItem.getType(imageType);
          const file = new File([blob], `pasted-image-${Date.now()}.${imageType.split('/')[1]}`, { type: imageType });
          processNewImage(file);
          return; 
        }
      }
      showToast('Tidak ada gambar di papan klip Anda.');
    } catch (err) {
      showToast('Akses diblokir. Silakan klik area kosong & tekan CTRL+V.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-10 px-4 sm:px-8 transition-colors duration-300 ${isDark ? 'bg-[#111111] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 z-50 px-6 py-3 rounded-lg shadow-xl bg-pink-600 text-white font-medium text-sm sm:text-base transition-all" style={{ animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER / LOGO (Opsional jika ingin tampilan lebih cantik) */}
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <div className="flex items-center gap-x-2">
          <div className="p-2 bg-pink-500 text-white rounded-lg"><ImageIcon size={24} /></div>
          <h1 className="text-xl font-bold tracking-tight">Image<span className="text-pink-500">Grabber</span></h1>
        </div>
        
        <button type="button" 
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-full transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-200 text-gray-600 shadow-sm'}`} 
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* KONTEN UTAMA - AREA DROPZONE */}
      <div 
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-5xl h-[50vh] min-h-[350px] 
          flex flex-col items-center justify-center 
          border-2 border-dashed rounded-2xl cursor-pointer 
          transition-all duration-300 ease-in-out group shadow-sm
          ${isDragging 
            ? (isDark ? 'border-pink-500 bg-[#1a1a1a]' : 'border-pink-500 bg-pink-50') 
            : (isDark ? 'border-gray-700 hover:border-gray-500 bg-[#151515] hover:bg-[#1a1a1a]' : 'border-gray-300 hover:border-pink-300 bg-white hover:bg-gray-50')
          }
        `}
      >
        <div className="flex flex-col items-center gap-y-6 text-center px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            TEMPEL GAMBAR DI SINI
          </h2>
          
          <div className={`p-4 rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2 ${isDark ? 'bg-gray-800 text-gray-300 group-hover:text-pink-400' : 'bg-gray-100 text-gray-600 group-hover:text-pink-500'}`}>
            <FileDown size={48} strokeWidth={1.5} />
          </div>
          
          <p className={`text-sm md:text-base font-medium mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Seret & Lepas gambar, atau cukup klik area ini.
          </p>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {/* TOMBOL & INSTRUKSI */}
      <div className="mt-8 flex flex-col items-center gap-y-5 text-center w-full max-w-5xl">
        <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Gunakan pintasan <span className="font-bold text-pink-500 px-2 py-1 bg-pink-500/10 rounded-md">CTRL + V</span> untuk menempelkan gambar dari *clipboard* Anda.
        </p>
        
        <button type="button"
          onClick={handlePasteButtonClick}
          className={`flex items-center gap-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm ${
            isDark 
              ? 'bg-[#1e1e1e] hover:bg-gray-800 text-gray-200 hover:text-white border border-gray-700 hover:border-gray-500' 
              : 'bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200'
          }`}
        >
          <ClipboardPaste size={20} />
          <span>Atau klik tombol ini (Paste)</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* SEKSI RIWAYAT (HISTORY) GALERI            */}
      {/* ========================================= */}
      <div className="w-full max-w-5xl mt-16 flex flex-col">
        <div className="flex justify-between items-end mb-6 border-b pb-4 border-gray-500/20">
          <div>
            <h3 className="text-2xl font-bold">Riwayat Unduhan</h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Tersimpan lokal di browser Anda (IndexedDB)
            </p>
          </div>
          {history.length > 0 && (
            <button type="button" 
              onClick={handleClearAllHistory}
              className="flex items-center gap-x-1 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash size={16} />
              <span className="hidden sm:inline">Bersihkan Semua</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className={`w-full py-12 flex flex-col items-center justify-center rounded-xl border border-dashed ${isDark ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-100/50'}`}>
            <ImageIcon size={48} className={isDark ? 'text-gray-600' : 'text-gray-400'} strokeWidth={1} />
            <p className={`mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Belum ada gambar yang Anda unduh.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                role="button"
                tabIndex={0}
                onClick={() => setSelectedImage(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedImage(item)}
                className={`relative group aspect-square rounded-xl overflow-hidden border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}
              >
                {/* Gambar Pratinjau */}
                <img 
                  src={item.previewUrl} 
                  alt={item.name} 
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Hitam saat di-hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  {/* Info Nama File */}
                  <p className="text-xs text-white truncate drop-shadow-md font-medium">
                    {item.name}
                  </p>
                  
                  {/* Tombol Aksi */}
                  <div className="flex items-center justify-center gap-x-2">
                    <button type="button" 
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(item); }}
                      className="p-2 bg-white/20 hover:bg-blue-500 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="Lihat Penuh"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button type="button" 
                      onClick={(e) => { e.stopPropagation(); handleRedownload(item); }}
                      className="p-2 bg-white/20 hover:bg-pink-500 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="Unduh Ulang"
                    >
                      <Download size={16} />
                    </button>
                    <button type="button" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.previewUrl); }}
                      className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER & NAVIGASI */}
      <div className="mt-16 w-full max-w-5xl flex justify-center gap-x-6 border-t pt-8 border-gray-500/20">
        <button type="button" aria-label="GitHub" className={`hover:text-pink-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Github size={20} /></button>
        <button type="button" aria-label="Tent" className={`hover:text-pink-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Tent size={20} /></button>
        <button type="button" aria-label="File" className={`hover:text-pink-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><FileText size={20} /></button>
        <button type="button" aria-label="Languages" className={`hover:text-pink-500 transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}><Languages size={20} /></button>
      </div>
      
      {/* ========================================= */}
      {/* MODAL PRATINJAU GAMBAR PENUH (LIGHTBOX)   */}
      {/* ========================================= */}
      {selectedImage && (
        <div 
          role="presentation"
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedImage(null)}
        >
          {/* Tombol Tutup */}
          <button type="button" 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-gray-950 p-2 rounded-full transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <X size={28} />
          </button>
          
          {/* Gambar Layar Penuh */}
          <img 
            src={selectedImage.previewUrl} 
            alt={selectedImage.name} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
          
          {/* Info di bawah gambar */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md pointer-events-auto flex items-center gap-x-4">
              <span className="truncate max-w-[200px] sm:max-w-xs">{selectedImage.name}</span>
              <button type="button" 
                onClick={() => handleRedownload(selectedImage)}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                Unduh
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
