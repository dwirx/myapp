# Toolsx — Galeri Alat Mikro Pribadi

**Toolsx** adalah galeri alat bantu mikro (*mini-tools*) yang dirancang khusus untuk mempermudah penyimpanan, pemindaian, dan rendering alat bantu berbasis kode HTML maupun React (TSX/JSX) secara langsung. Cukup drop berkas atau folder alat baru ke dalam proyek, dan Toolsx akan mendeteksinya secara otomatis dan membuatnya siap digunakan seketika.

---

## 🚀 Fitur Utama

- **Otomatisasi Penuh (Auto-Detect)**: Menambah alat baru semudah melakukan *drag-and-drop* berkas ke direktori yang sesuai. Pemindaian sisi server akan mendaftarkan alat Anda secara instan tanpa perlu mengubah berkas registrasi secara manual.
- **Dukungan Format Ganda**:
  - **React Tools**: Komponen React (`.tsx` / `.jsx`) dirender secara langsung menggunakan teknik dynamic-import (`React.lazy`).
  - **HTML Tools**: Halaman HTML murni (`.html`) dirender di dalam `iframe` yang terisolasi dengan aman (*sandboxed*).
- **Desain Premium & Modern**: Tampilan gelap (dark mode) elegan berbasis warna OKLCH, efek kartu menyala (*glow hover*), serta transisi antarmuka yang mulus.
- **Kemudahan Navigasi**: Fitur pencarian instan, filter kategori (Developer, Design, Text, Utility, Math, Fun), opsi pembukaan di Tab Baru (*Open in New Tab*), dan mode Layar Penuh (*Fullscreen*).
- **Dukungan Ikon & Aksi**: Terintegrasi dengan perpustakaan ikon Lucide React serta dukungan API clipboard yang aman untuk menyalin hasil proses alat bantu Anda.

---

## 📂 Struktur Proyek

```text
src/
├── components/
│   ├── ToolCard.tsx            # Komponen kartu galeri dengan hover glow
│   └── ToolViewer.tsx          # Wrapper rendering (React lazy vs HTML iframe)
├── hooks/
│   └── useAutoTools.ts         # Hook klien untuk mengonsumsi alat dari server
├── pages/
│   ├── HomePage.tsx            # Halaman utama (galeri, pencarian, filter)
│   └── ToolPage.tsx            # Halaman penampil alat (navigasi, deskripsi, fullscreen)
├── tools/
│   ├── html/                   # Folder alat berbasis Vanilla HTML (iframe)
│   │   ├── color-picker/       # Konverter format warna (HEX/RGB/HSL/OKLCH)
│   │   ├── gradient-maker/     # Pembuat gradien CSS visual
│   │   └── javasandi.html      # Contoh alat single-file HTML
│   ├── react/                  # Folder alat berbasis React (TSX/JSX)
│   │   ├── base64/             # Kodek dekoder/enkoder Base64
│   │   ├── json-formatter/     # Formatter & validator JSON
│   │   ├── markdown-preview/   # Editor & preview Markdown langsung
│   │   ├── word-counter/       # Penghitung kata, karakter, dan waktu baca
│   │   ├── paste_image.tsx     # Alat penyalin gambar lokal (IndexedDB)
│   │   └── Pelangan-wifi.tsx   # Alat manajemen kas pelanggan wifi
│   ├── tools.index.ts          # Berkas registrasi manual untuk metadata kaya
│   └── auto-registry.tsx       # Berkas registrasi otomatis (hasil scan server)
├── App.tsx                     # Entri navigasi klien (React Router)
├── frontend.tsx                # Entri React klien
├── index.html                  # Halaman HTML pembungkus SPA
└── index.ts                    # Server pengembangan Bun + API Scan & Generator
```

---

## 🛠️ Langkah Memulai

### Prasyarat
Pastikan Anda sudah menginstal [Bun](https://bun.sh) di komputer Anda.

### 1. Instalasi Dependensi
Jalankan perintah berikut untuk mengunduh modul node:
```bash
bun install
```

### 2. Menjalankan Server Pengembangan
Untuk memulai server pengembangan dengan fitur hot-reload:
```bash
bun run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 3. Build untuk Produksi
Untuk mengompilasi dan mengoptimalkan aset proyek untuk produksi:
```bash
bun run build
```

---

## ✍️ Cara Menambahkan Alat Baru

Anda dapat menambahkan alat baru dengan dua cara:

### Cara A: Cepat & Otomatis (Tanpa Sentuh Kode)
Cukup masukkan berkas baru Anda ke folder yang sesuai:
- Untuk HTML: Masukkan ke `src/tools/html/my-tool.html` atau buat subfolder `src/tools/html/my-tool/index.html`.
- Untuk React: Masukkan ke `src/tools/react/MyTool.tsx` atau buat subfolder `src/tools/react/my-tool/index.tsx`.

*Catatan: Nama berkas/folder otomatis diubah menjadi judul alat, dan sistem akan menebak kategori alat berdasarkan namanya.*

### Cara B: Kustomisasi Penuh (Metadata Lengkap)
Agar alat Anda memiliki nama khusus, deskripsi detail, kategori spesifik, dan tag pencarian yang rapi, daftarkan alat tersebut di [src/tools/tools.index.ts](file:///home/hades/jun-2026/myapp/src/tools/tools.index.ts):

```typescript
{
  id: "nama-id-alat",
  name: "Nama Alat Kustom",
  description: "Deskripsi singkat yang menjelaskan kegunaan alat ini.",
  type: "react", // atau "html"
  path: "react/nama-id-alat", // sesuaikan dengan folder/file Anda
  category: "Developer", // Pilihan: "Developer", "Utility", "Design", "Text", "Math", "Fun"
  tags: ["tag1", "tag2"],
}
```

---

## 💻 Tech Stack Proyek

- **Runtime & Bundler**: Bun
- **Library Utama**: React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **Navigasi**: React Router v7
- **Ikon**: Lucide React
