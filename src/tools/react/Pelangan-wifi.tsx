import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Check, Camera, Download, CalendarDays } from 'lucide-react';

export default function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Menggunakan format YYYY-MM untuk input type="month"
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  
  const printRef = useRef(null);

  const [rows, setRows] = useState([
    { id: 1, name: 'Wahyu', amount: '120000', status: 'SUDAH', bgColor: '#E06666' },
    { id: 2, name: 'Ages', amount: '120000', status: 'SUDAH', bgColor: '#F6B26B' },
    { id: 3, name: 'Cak Edi', amount: '', status: 'Belum', bgColor: '#FFFF00' },
    { id: 4, name: 'Manda', amount: '120000', status: 'SUDAH', bgColor: '#93C47D' },
    { id: 5, name: 'Nisa', amount: '', status: 'Belum', bgColor: '#00FFFF' },
    { id: 6, name: 'Cak Sugeng', amount: '120000', status: 'SUDAH', bgColor: '#988BC8' },
    { id: 7, name: 'Mbak Wiwik', amount: '120000', status: 'SUDAH', bgColor: '#988BC8' },
  ]);

  // Fungsi untuk memformat "2026-03" menjadi "Mar 2026"
  const getDisplayMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    
    // Format menggunakan bahasa Indonesia (id-ID)
    const formatted = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    
    // Memastikan huruf pertama kapital (Mar, Apr, Mei, dst)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatRupiahDisplay = (angka) => {
    if (!angka) return '';
    return 'Rp' + Number(angka).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatThousand = (angka) => {
    if (!angka) return '';
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const totalAmount = rows.reduce((total, row) => {
    const val = parseInt(row.amount.replace(/[^0-9]/g, ''));
    return total + (isNaN(val) ? 0 : val);
  }, 0);

  const handleChange = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleAmountChange = (id, rawValue) => {
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    handleChange(id, 'amount', numericValue);
  };

  const handleAddRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, name: '', amount: '', status: 'Belum', bgColor: '#FFFFFF' }]);
    setIsEditMode(true);
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // Fungsi Screenshot
  const handleDownload = () => {
    setIsCapturing(true);
    const wasEditMode = isEditMode;
    if (wasEditMode) setIsEditMode(false);

    setTimeout(() => {
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => captureCanvas(wasEditMode);
        document.body.appendChild(script);
      } else {
        captureCanvas(wasEditMode);
      }
    }, 300);
  };

  const captureCanvas = (wasEditMode) => {
    const element = printRef.current;
    const displayTitle = getDisplayMonth(selectedMonth);
    
    window.html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Kas_${displayTitle.replace(/\s+/g, '_')}.png`; // Nama file menyesuaikan bulan
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setIsCapturing(false);
      if (wasEditMode) setIsEditMode(true);
    }).catch(err => {
      console.error("Gagal mengambil screenshot", err);
      setIsCapturing(false);
      if (wasEditMode) setIsEditMode(true);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-6 flex flex-col items-center font-sans text-gray-900 pb-20">
      
      <style>{`
        .table-cell-custom {
          border: 1px solid #1f2937;
          padding: 6px 4px;
          height: 44px;
          vertical-align: middle;
        }
        .note { position: relative; }
        .note::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          border-top: 12px solid #cc0000;
          border-left: 12px solid transparent;
          z-index: 5;
        }
        input, select, button { touch-action: manipulation; }
        
        /* Modifikasi input month agar terlihat lebih rapi */
        input[type="month"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
          transition: 0.2s;
        }
        input[type="month"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>

      {/* Header Info & Tombol */}
      <div className="w-full max-w-2xl bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-xl font-bold text-gray-800">Manajemen Kas</h1>
          <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm">
            <span className="text-gray-500">Total Kas:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-base">
              {formatRupiahDisplay(totalAmount)}
            </span>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto gap-2">
          <button type="button" 
            onClick={handleDownload}
            disabled={isCapturing}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.97]
              ${isCapturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600'}`}
          >
            {isCapturing ? <Camera className="animate-pulse" size={18} /> : <Download size={18} />}
            <span className="hidden sm:inline">{isCapturing ? 'Memproses...' : 'Simpan Foto'}</span>
            <span className="sm:hidden">{isCapturing ? 'Wait...' : 'Foto'}</span>
          </button>

          <button type="button" 
            onClick={() => setIsEditMode(!isEditMode)}
            disabled={isCapturing}
            className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-bold text-white shadow-md transition-all active:scale-[0.97]
              ${isEditMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}
              ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isEditMode ? <><Check size={18} /> <span className="hidden sm:inline">Selesai Edit</span><span className="sm:hidden">Selesai</span></> : <><Edit2 size={18} /> <span className="hidden sm:inline">Mode Edit</span><span className="sm:hidden">Edit</span></>}
          </button>
        </div>
      </div>

      {/* TABEL AREA SCREENSHOT */}
      <div ref={printRef} className="w-full max-w-2xl bg-white p-2 sm:p-4 rounded-sm shadow-xl border border-gray-300 mx-auto">
        <table className="w-full table-fixed border-collapse text-[13px] sm:text-[16px] text-black">
          <colgroup>
            <col className={isEditMode ? "w-[30%]" : "w-[32%]"} />
            <col className={isEditMode ? "w-[38%]" : "w-[43%]"} />
            <col className={isEditMode ? "w-[22%]" : "w-[25%]"} />
            {isEditMode && <col className="w-[10%]" />}
          </colgroup>

          <thead>
            <tr className="bg-[#999999]">
              <th className="table-cell-custom bg-[#999999]"></th>
              <th className="table-cell-custom font-normal text-right pr-2 bg-[#999999] relative">
                
                {/* PEMILIH BULAN & TAHUN */}
                {isEditMode ? (
                  <div className="flex justify-end items-center bg-white rounded-sm border-2 border-indigo-400 overflow-hidden px-1 h-full max-h-[32px]">
                    <CalendarDays size={14} className="text-indigo-500 shrink-0 ml-1 hidden sm:block" />
                    <input 
                      type="month" 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="size-full text-right font-bold text-black outline-none cursor-pointer bg-transparent text-[11px] sm:text-[14px] p-1"
                    />
                  </div>
                ) : (
                  <span className="font-bold sm:font-normal">{getDisplayMonth(selectedMonth)}</span>
                )}

              </th>
              <th className="table-cell-custom font-normal text-center bg-[#00FFFF]">Status</th>
              {isEditMode && <th className="table-cell-custom bg-slate-800 text-white text-[11px]">Del</th>}
            </tr>
          </thead>
          
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="table-cell-custom font-bold text-center">
                  {isEditMode ? (
                    <input 
                      type="text" 
                      value={row.name} 
                      onChange={(e) => handleChange(row.id, 'name', e.target.value)}
                      className="size-full text-center font-bold bg-transparent border-b border-dashed border-gray-400 outline-none focus:bg-indigo-50 px-1"
                      placeholder="Nama"
                    />
                  ) : (
                    <span className="block w-full truncate px-1">{row.name}</span>
                  )}
                </td>

                <td className="table-cell-custom" style={{ backgroundColor: row.bgColor }}>
                  {isEditMode ? (
                    <div className="flex size-full items-center justify-between px-1 gap-1">
                      <label aria-label="Pilih warna baris" className="relative flex items-center justify-center size-5 sm:w-6 sm:h-6 shrink-0 rounded-full border-2 border-white/60 shadow-sm overflow-hidden cursor-pointer active:scale-90 transition-transform">
                        <div className="size-full" style={{ backgroundColor: row.bgColor }}></div>
                        <input 
                          type="color" 
                          value={row.bgColor}
                          onChange={(e) => handleChange(row.id, 'bgColor', e.target.value)}
                          className="absolute inset-0 opacity-0 size-[200%] cursor-pointer -top-2 -left-2" 
                        />
                      </label>
                      
                      <div className="flex w-full items-center justify-end font-medium">
                        <span className="text-black/50 text-[10px] sm:text-xs mr-0.5">Rp</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={formatThousand(row.amount)} 
                          onChange={(e) => handleAmountChange(row.id, e.target.value)}
                          className="w-full text-right bg-transparent outline-none placeholder-gray-600 border-b border-dashed border-gray-500/50"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-right pr-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatRupiahDisplay(row.amount)}
                    </div>
                  )}
                </td>

                <td 
                  className="table-cell-custom font-bold note" 
                  style={{ backgroundColor: row.status === 'SUDAH' ? '#00FF00' : '#FF0000' }}
                >
                  {isEditMode ? (
                    <select 
                      value={row.status}
                      onChange={(e) => handleChange(row.id, 'status', e.target.value)}
                      className="size-full text-center font-bold bg-transparent outline-none cursor-pointer appearance-none px-1"
                    >
                      <option value="SUDAH">SUDAH</option>
                      <option value="Belum">Belum</option>
                    </select>
                  ) : (
                    <div className="w-full text-left pl-1 sm:pl-2">{row.status}</div>
                  )}
                </td>

                {isEditMode && (
                  <td className="table-cell-custom bg-slate-50 p-0">
                    <button type="button" 
                      onClick={() => handleDeleteRow(row.id)}
                      className="size-full min-h-[44px] flex justify-center items-center text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            
            <tr>
              <td className="table-cell-custom"></td>
              <td className="table-cell-custom"></td>
              <td className="table-cell-custom"></td>
              {isEditMode && <td className="table-cell-custom bg-gray-200"></td>}
            </tr>
            
            <tr>
              <td className="table-cell-custom text-left pl-2" style={{ backgroundColor: '#FFD966' }}>Total</td>
              <td className="table-cell-custom text-center font-bold" style={{ backgroundColor: '#FFD966' }}>
                {formatRupiahDisplay(totalAmount)}
              </td>
              <td className="table-cell-custom"></td>
              {isEditMode && <td className="table-cell-custom bg-gray-200"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {isEditMode && (
        <button type="button" 
          onClick={handleAddRow}
          className="mt-5 w-full max-w-2xl flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-dashed border-indigo-400 text-indigo-700 rounded-xl font-bold shadow-sm hover:bg-indigo-50 active:scale-[0.98] transition-all"
        >
          <Plus size={20} /> Tambah Anggota
        </button>
      )}

    </div>
  );
}
