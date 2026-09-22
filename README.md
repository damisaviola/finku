# 💰 DompetKu (Finku) — Aplikasi Pelacak Keuangan Pribadi

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
</p>

---

## 📌 Tentang DompetKu

**DompetKu** adalah aplikasi web modern pencatat, pengelola, dan pemantau keuangan pribadi yang dirancang untuk membantu pengguna mengontrol arus kas secara cerdas, transparan, dan terencana. 

Aplikasi ini memudahkan siapa saja—mulai dari mahasiswa, freelancer, karyawan, hingga pengusaha kecil—untuk memantau saldo di berbagai rekening, menyusun anggaran bulanan, mengalokasikan tabungan impian, serta mencetak mutasi/rekening koran resmi berformat PDF.

---

## ✨ Fitur Unggulan

### 1. 📊 Dashboard Finansial Cerdas
* **Ringkasan Real-Time**: Pantau total saldo kekayaan, total pemasukan, total pengeluaran, dan net cash flow bulanan.
* **Grafik Interaktif**: Analisis tren keuangan bulanan serta grafik pengeluaran per kategori yang responsif dan mudah dibaca.
* **Riwayat Transaksi Terbaru**: Menampilkan catatan aktivitas transaksi paling baru secara cepat.

### 2. 💳 Multi-Rekening (Accounts Management)
* Kelola berbagai jenis rekening dalam satu tempat:
  * **Bank Konvensional**: BCA, Mandiri, BRI, BNI, dsb.
  * **Dompet Digital (E-Wallet)**: GoPay, OVO, Dana, ShopeePay.
  * **Uang Tunai (Cash)**: Dompet fisik, kas harian.
  * **Tabungan & Investasi**: Rekening khusus dana darurat atau instrumen investasi.
* Kalkulasi saldo otomatis setiap kali transaksi pemasukan, pengeluaran, atau transfer terjadi.

### 3. 💸 Pencatatan Transaksi Komprehensif
* **Pemasukan (Income)**: Catat gaji, bonus, dividen, freelance, atau pemasukan lain ke rekening tujuan.
* **Pengeluaran (Expense)**: Catat pengeluaran harian lengkap dengan kategori, metode pembayaran, tanggal, dan catatan tambahan.
* **Transfer Antar Rekening**: Pindahkan saldo antar rekening atau top-up e-wallet dengan audit trail yang akurat tanpa merusak rekonsiliasi kas.
* **Filter & Pencarian**: Telusuri transaksi berdasarkan rentang tanggal, kategori, atau rekening sumber.

### 4. 🎯 Target Tabungan (Financial Goals)
* Tetapkan impian finansial (contoh: Dana Darurat, DP Rumah, Liburan, Gadget Impian).
* Tetapkan target nominal dan tenggat waktu (target date).
* Pantau progres pencapaian tabungan dengan progress bar dinamis dan persentase kelulusan.

### 5. 💰 Anggaran Pengeluaran Bulanan (Budgeting)
* Tetapkan batas pagu pengeluaran per kategori setiap bulan.
* Indikator visual progres penggunaan anggaran (Aman, Waspada, Overbudget).
* Mencegah pemborosan sebelum akhir bulan tiba.

### 6. 📅 Kalender Keuangan (Financial Calendar)
* Tampilan kalender interaktif bulanan untuk memetakan cash flow harian.
* Deteksi hari-hari dengan lonjakan pengeluaran tertinggi dengan mudah.

### 7. 📄 Rekening Koran Digital (Export PDF Statement)
* Cetak atau unduh mutasi rekening dalam bentuk file **PDF resmi** siap cetak.
* Dilengkapi ringkasan periode, rincian debit/kredit, saldo akhir, dan tata letak tabel elegan berkat integrasi **jsPDF** & **jspdf-autotable**.

### 8. 🏷️ Kategori Fleksibel (Categories)
* Kustomisasi kategori pemasukan dan pengeluaran sesuai gaya hidup.
* Pemilihan ikon visual dan palet warna untuk mempermudah identifikasi transaksi.

### 9. 🔒 Autentikasi & Keamanan Data
* Otentikasi pengguna berbasis **Supabase Auth** & sesi terenkripsi.
* Isolasi data per pengguna (*Multi-tenant user isolation*) di level database PostgreSQL.

---

## 🛠️ Tech Stack & Arsitektur

| Layer | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | React Server Components, Route Handlers, Server Actions |
| **UI Library** | [React 19](https://react.dev/) | State-of-the-art UI interactivity |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Styling modern, responsif, & performa tinggi |
| **Database** | [PostgreSQL via Supabase](https://supabase.com/) | Database relasional cloud berkinerja tinggi |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Schema modeling & database client |
| **Charts** | [Recharts](https://recharts.org/) | Visualisasi data dan grafik keuangan |
| **PDF Engine** | [jsPDF](https://github.com/parallax/jsPDF) & [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Pembuatan dokumen rekening koran PDF |
| **Icons** | [Lucide React](https://lucide.dev/) | Ikonografi modern dan konsisten |
| **Validasi** | [Zod](https://zod.dev/) | Validasi skema data & formulir |

---

## 📁 Struktur Direktori

```plaintext
finku/
├── prisma/
│   └── schema.prisma          # Skema database relasional Prisma (User, Account, Category, Transaction, Budget, Goal)
├── scripts/                   # Skrip utilitas pengujian & verifikasi finansial
│   ├── verify-finance.mjs
│   ├── verify-registration-db.ts
│   └── verify-statement.ts
├── src/
│   ├── app/
│   │   ├── (auth)/            # Autentikasi: Login & Register
│   │   ├── accounts/          # Manajemen rekening & dompet
│   │   ├── api/               # Next.js Route Handlers (Auth & API endpoints)
│   │   ├── budgets/           # Manajemen anggaran bulanan
│   │   ├── calendar/          # Kalender arus kas
│   │   ├── categories/       # Pos kategori pengeluaran & pemasukan
│   │   ├── dashboard/         # Dashboard ringkasan finansial utama
│   │   ├── goals/             # Target finansial (tabungan impian)
│   │   ├── reports/           # Laporan statistik & analitik
│   │   ├── settings/          # Pengaturan akun pengguna
│   │   ├── statement/         # Rekening koran & ekspor PDF
│   │   ├── transactions/      # Riwayat & form transaksi (In/Out/Transfer)
│   │   ├── globals.css        # Konfigurasi Tailwind CSS v4 & theme tokens
│   │   ├── layout.tsx         # Root layout aplikasi
│   │   └── page.tsx           # Halaman utama / landing
│   ├── components/            # Komponen UI modular, layout sidebar, navigasi, dialog modal, dsb.
│   ├── lib/
│   │   ├── calculations/      # Logika kalkulasi saldo, bunga, & cashflow
│   │   ├── pdf/               # Generator & template rekening koran PDF
│   │   ├── supabase/          # Konfigurasi Supabase Client (browser & server)
│   │   ├── store.tsx          # State management Context API
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   └── validations/       # Skema Zod
│   └── types/                 # Deklarasi tipe TypeScript global
├── supabase/
│   └── schema.sql             # Skrip SQL DDL & inisialisasi tabel Supabase
├── .env.example               # Template environment variables
├── package.json
└── README.md
```

---

## 🚀 Panduan Memulai (Getting Started)

### 1. Prasyarat Sistem
* [Node.js](https://nodejs.org/) versi 18.x atau yang lebih baru
* Package manager: `npm`, `pnpm`, atau `yarn`
* Akun [Supabase](https://supabase.com/) atau instance PostgreSQL aktif

---

### 2. Kloning Repositori
```bash
git clone https://github.com/damisaviola/finku.git
cd finku
```

---

### 3. Instalasi Dependensi
```bash
npm install
```

---

### 4. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local` atau `.env`:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan lengkapi konfigurasi berikut:
```env
# Kredensial Supabase (Dapatkan dari Supabase Dashboard -> Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Koneksi Database PostgreSQL (Dapatkan dari Project Settings -> Database -> Connection String)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

---

### 5. Inisialisasi Database (Prisma)
Jalankan perintah berikut untuk menggenerasikan Prisma Client dan menerapkan skema ke database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Dorong skema model ke database PostgreSQL
npm run prisma:push
```

*(Opsional)* Anda dapat membuka antarmuka visual **Prisma Studio** untuk melihat dan mengelola data tabel secara langsung:
```bash
npm run prisma:studio
```

---

### 6. Menjalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000) untuk mengakses aplikasi.

---

## 📜 Skrip NPM yang Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js development server pada port 3000 |
| `npm run build` | Melakukan build produksi aplikasi |
| `npm run start` | Menjalankan server aplikasi Next.js dalam mode produksi |
| `npm run lint` | Menjalankan ESLint untuk pemeriksaan kode |
| `npm run prisma:generate` | Mengompilasi dan menggenerasikan Prisma Client terbaru |
| `npm run prisma:push` | Menyinkronkan perubahan `prisma/schema.prisma` ke database Supabase |
| `npm run prisma:studio` | Membuka antarmuka grafis web Prisma Studio untuk eksplorasi data |

---

## 🤝 Kontribusi

Kontribusi selalu terbuka! Jika Anda memiliki saran, perbaikan bug, atau penambahan fitur:
1. Fork repositori ini
2. Buat branch baru untuk fitur Anda (`git checkout -b feature/FiturKeren`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`)
4. Push ke branch Anda (`git push origin feature/FiturKeren`)
5. Buka Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
