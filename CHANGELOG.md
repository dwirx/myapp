# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-06-11

### Added
- Menambahkan fitur penggantian tema Dark/Light mode di seluruh aplikasi dengan persistensi di *localStorage*.
- Menambahkan filter tipe alat (All, React, HTML) pada toolbar halaman utama.
- Menambahkan fitur pengurutan alat (*sorting*) berdasarkan waktu (Terbaru/Terlama) dan nama (A-Z/Z-A).
- Memperluas registry alat otomatis dengan metadata jalur file (*filePath*) dan stempel waktu modifikasi (*mtime*) untuk mendukung pengurutan berbasis tanggal.

### Changed
- Memperbarui UI `ToolCard` agar menggunakan warna tema yang dinamis (menggunakan `var(--cat)`) dan badge yang lebih bersih.
- Mengatur ulang tata letak toolbar di `HomePage` dengan desain yang lebih terstruktur (toolbar-filters).
- Menambahkan tombol toggle tema pada header halaman utama dan navigasi `ToolPage`.

## [0.2.0] - 2026-06-11

### Added
- Menyalin dan mendaftarkan alat React baru `Pelangan-wifi.tsx` untuk mengelola kas pelanggan wifi secara lokal.
- Menambahkan generator dynamic auto-registry (`auto-registry.tsx`) di sisi server untuk memetakan import dynamic React secara otomatis pada saat server dijalankan.
- Menambahkan komponen SVG ikon `Github` kustom di `paste_image.tsx` untuk mengatasi hilangnya ekspor brand ikon bawaan dari *lucide-react*.

### Changed
- Mengubah penampil komponen React `ToolViewer.tsx` agar memanfaatkan pemetaan dynamic lazy import dari `reactComponents` bawaan *auto-registry*.
- Menyederhanakan penanganan data hook klien `useAutoTools.ts` untuk langsung mengonsumsi data alat terintegrasi dari server tanpa kalkulasi manual.
- Mengoptimalkan gaya rendering iframe alat HTML di `ToolViewer.tsx` dengan layout `flex: 1` agar mengisi penuh ruang layar tanpa terpotong (mengatasi bug default height 150px).

### Fixed
- Menambahkan izin sandbox `allow-same-origin` pada iframe agar fungsi *copy to clipboard* dalam penampil alat HTML murni berjalan normal tanpa diblokir oleh kebijakan keamanan peramban.

## [0.1.0] - 2026-06-10

### Added
- Rilis awal galeri alat bantu pribadi **Toolsx**.
- Antarmuka bertema gelap dengan aksen warna OKLCH serta efek cahaya kartu menyala saat di-hover.
- Enam alat bawaan awal: JSON Formatter, Word Counter, Gradient Maker, Base64 Codec, Color Picker, dan Markdown Preview.
- Fitur pencarian alat dan filter kategori instan.
- Mode Layar Penuh (Fullscreen) dan opsi pembukaan tautan di tab baru browser.
