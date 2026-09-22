# PRD — Aplikasi Pelacak Keuangan Pribadi

## 1. Informasi Produk

### Nama Produk
**DompetKu**

### Jenis Produk
Aplikasi web untuk mencatat, mengelola, dan memantau keuangan pribadi.

### Bahasa Aplikasi
**Bahasa Indonesia**

Seluruh teks yang dilihat pengguna harus menggunakan Bahasa Indonesia, termasuk navigasi, tombol, formulir, pesan error, notifikasi, dashboard, laporan, empty state, dialog konfirmasi, dan validasi.

Istilah teknis pada kode seperti `transaction`, `account`, `category`, dan `user` boleh tetap menggunakan Bahasa Inggris.

---

# 2. Tujuan Produk

DompetKu membantu pengguna mengetahui:

1. Berapa total uang yang dimiliki.
2. Uang berada di rekening atau dompet mana.
3. Berapa pemasukan setiap bulan.
4. Berapa pengeluaran setiap bulan.
5. Pengeluaran terbesar berasal dari kategori apa.
6. Berapa uang yang berhasil disimpan.
7. Apakah pengeluaran sudah melebihi anggaran.
8. Seberapa dekat pengguna dengan target tabungannya.

---

# 3. Target Pengguna

Aplikasi ditujukan untuk individu yang ingin mengelola keuangan pribadi.

Contoh pengguna:

- Mahasiswa
- Fresh graduate
- Karyawan
- Freelancer
- Pengusaha kecil
- Pengguna umum

Aplikasi menggunakan sistem akun sehingga setiap pengguna memiliki data keuangannya sendiri.

---

# 4. Konsep Utama

DompetKu menggunakan tiga konsep utama:

```text
REKENING
   ↓
TRANSAKSI
   ↓
KATEGORI
```

Contoh:

```text
Rekening BCA
Rp4.000.000

       ↓

Pengeluaran
Rp50.000

       ↓

Kategori
Makanan
```

---

# 5. Teknologi

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Next.js Server Actions
- Route Handlers

## Database

- PostgreSQL
- Supabase

## Autentikasi

- Supabase Auth

## Validasi

- Zod

## Grafik

- Recharts

## Ikon

- Lucide React

## Deployment

- Vercel

---

# 6. Autentikasi

Aplikasi menyediakan:

- Registrasi
- Login
- Logout
- Lupa kata sandi
- Reset kata sandi
- Verifikasi email

---

# 7. Halaman Registrasi

URL:

```text
/register
```

Judul:

```text
Buat Akun
```

Deskripsi:

```text
Mulai kelola keuangan Anda dengan lebih mudah.
```

Form:

```text
Nama Lengkap
[ Masukkan nama lengkap ]

Alamat Email
[ Masukkan alamat email ]

Kata Sandi
[ Masukkan kata sandi ]

Konfirmasi Kata Sandi
[ Ulangi kata sandi ]

☐ Saya menyetujui syarat dan ketentuan

[ Daftar ]
```

Di bawah form:

```text
Sudah memiliki akun?
Masuk
```

---

# 8. Validasi Registrasi

## Nama

- Wajib diisi.
- Minimal 2 karakter.
- Maksimal 100 karakter.

Pesan:

```text
Nama lengkap wajib diisi.
```

## Email

- Wajib diisi.
- Harus menggunakan format email yang valid.
- Email tidak boleh sudah digunakan.

Pesan:

```text
Masukkan alamat email yang valid.
```

Jika sudah digunakan:

```text
Email tersebut sudah terdaftar.
Silakan masuk menggunakan akun Anda.
```

## Kata Sandi

Minimal:

```text
8 karakter
```

Disarankan mengandung:

- Huruf besar.
- Huruf kecil.
- Angka.

Pesan:

```text
Kata sandi minimal 8 karakter.
```

## Konfirmasi Kata Sandi

Harus sama dengan kata sandi.

Pesan:

```text
Konfirmasi kata sandi tidak cocok.
```

---

# 9. Setelah Registrasi

Setelah registrasi berhasil:

```text
Registrasi berhasil!

Silakan periksa email Anda untuk melakukan verifikasi akun.
```

Setelah email diverifikasi:

```text
Selamat datang di DompetKu!
```

Pengguna kemudian diarahkan ke:

```text
/dashboard
```

---

# 10. Halaman Login

URL:

```text
/login
```

Tampilan:

```text
Masuk ke DompetKu

Alamat Email
[ Masukkan alamat email ]

Kata Sandi
[ Masukkan kata sandi ]

Lupa kata sandi?

[ Masuk ]

Belum memiliki akun?
Daftar sekarang
```

Opsional:

```text
atau

[ Lanjutkan dengan Google ]
```

---

# 11. Lupa Kata Sandi

URL:

```text
/forgot-password
```

Tampilan:

```text
Lupa Kata Sandi

Masukkan alamat email Anda.
Kami akan mengirimkan tautan untuk
mengatur ulang kata sandi.

Alamat Email

[ Masukkan alamat email ]

[ Kirim Tautan ]
```

---

# 12. Navigasi Utama

Desktop:

```text
DompetKu

Beranda
Transaksi
Rekening
Anggaran
Target Tabungan
Laporan

──────────────

Pengaturan

Keluar
```

Mobile:

```text
Beranda
Transaksi
Tambah
Rekening
Lainnya
```

---

# 13. Beranda

URL:

```text
/dashboard
```

Judul:

```text
Ringkasan Keuangan
```

Contoh:

```text
Selamat datang kembali, [Nama].

September 2026
```

---

# 14. Ringkasan Saldo

Card utama:

```text
Total Saldo

Rp7.250.000
```

Total saldo merupakan jumlah seluruh saldo rekening aktif.

---

# 15. Ringkasan Bulanan

Tampilkan:

```text
Pemasukan
Rp6.000.000

Pengeluaran
Rp2.350.000

Tabungan
Rp3.650.000
```

Formula:

```text
Tabungan =
Pemasukan - Pengeluaran
```

---

# 16. Daftar Rekening

Contoh:

```text
Rekening Saya

BCA
Rp4.000.000

Mandiri
Rp1.500.000

Uang Tunai
Rp750.000

GoPay
Rp500.000
```

---

# 17. Transaksi Terbaru

Contoh:

```text
Transaksi Terbaru

Gaji
+ Rp6.000.000
BCA

Makan Siang
- Rp50.000
Uang Tunai

Transportasi
- Rp25.000
GoPay
```

Tombol:

```text
Lihat Semua Transaksi
```

---

# 18. Grafik Keuangan

Dashboard memiliki dua grafik utama.

## Pemasukan vs Pengeluaran

```text
Pemasukan
████████████

Pengeluaran
██████
```

## Pengeluaran Berdasarkan Kategori

```text
Makanan
Transportasi
Belanja
Tagihan
Hiburan
Lainnya
```

---

# 19. Transaksi

URL:

```text
/transactions
```

Judul:

```text
Transaksi
```

Tombol:

```text
+ Tambah Transaksi
```

---

# 20. Jenis Transaksi

Terdapat tiga jenis:

```text
Pemasukan
Pengeluaran
Transfer
```

---

# 21. Form Pemasukan

Judul:

```text
Tambah Pemasukan
```

Form:

```text
Jumlah
[ Rp0 ]

Kategori
[ Pilih kategori ]

Rekening
[ Pilih rekening ]

Tanggal
[ Pilih tanggal ]

Keterangan
[ Masukkan keterangan ]

Catatan
[ Opsional ]

[ Batal ] [ Simpan ]
```

---

# 22. Form Pengeluaran

Judul:

```text
Tambah Pengeluaran
```

Form:

```text
Jumlah
[ Rp0 ]

Kategori
[ Pilih kategori ]

Rekening
[ Pilih rekening ]

Tanggal
[ Pilih tanggal ]

Keterangan
[ Masukkan keterangan ]

Catatan
[ Opsional ]

[ Batal ] [ Simpan ]
```

---

# 23. Form Transfer

Judul:

```text
Transfer Uang
```

Form:

```text
Dari Rekening
[ BCA ]

Ke Rekening
[ Uang Tunai ]

Jumlah
[ Rp0 ]

Tanggal
[ Pilih tanggal ]

Keterangan
[ Opsional ]

[ Batal ] [ Transfer ]
```

Transfer tidak dihitung sebagai pengeluaran.

---

# 24. Contoh Transfer

Jika:

```text
BCA
Rp4.000.000

Uang Tunai
Rp500.000
```

Kemudian melakukan:

```text
BCA → Uang Tunai
Rp300.000
```

Maka:

```text
BCA
Rp3.700.000

Uang Tunai
Rp800.000
```

Total saldo tetap:

```text
Rp4.500.000
```

---

# 25. Riwayat Transaksi

Tabel:

```text
Tanggal
Jenis
Keterangan
Kategori
Rekening
Jumlah
```

Contoh:

```text
21 Sep
Pengeluaran
Makan Siang
Makanan
Uang Tunai
-Rp50.000

20 Sep
Pemasukan
Gaji
Gaji
BCA
+Rp6.000.000

19 Sep
Transfer
Tarik Tunai
-
BCA → Uang Tunai
Rp500.000
```

---

# 26. Filter Transaksi

Pengguna dapat memfilter berdasarkan:

```text
Tanggal
Jenis transaksi
Rekening
Kategori
Rentang jumlah
```

Search:

```text
Cari transaksi...
```

---

# 27. Kategori

URL:

```text
/categories
```

Judul:

```text
Kategori
```

## Kategori Pengeluaran

Default:

```text
Makanan
Transportasi
Belanja
Tagihan
Hiburan
Kesehatan
Pendidikan
Perjalanan
Langganan
Lainnya
```

## Kategori Pemasukan

Default:

```text
Gaji
Freelance
Bisnis
Bonus
Hadiah
Investasi
Lainnya
```

Pengguna dapat:

- Menambah kategori.
- Mengubah kategori.
- Menghapus kategori.

---

# 28. Rekening

URL:

```text
/accounts
```

Judul:

```text
Rekening Saya
```

Tombol:

```text
+ Tambah Rekening
```

---

# 29. Jenis Rekening

```text
Bank
Uang Tunai
Dompet Digital
Tabungan
Lainnya
```

Contoh:

```text
BCA
Bank

Uang Tunai
Uang Tunai

GoPay
Dompet Digital
```

---

# 30. Form Tambah Rekening

```text
Nama Rekening

[ Contoh: BCA ]

Jenis Rekening

[ Bank ]

Saldo Awal

[ Rp0 ]

Mata Uang

[ Rupiah (IDR) ]

[ Batal ] [ Simpan ]
```

---

# 31. Anggaran

URL:

```text
/budgets
```

Judul:

```text
Anggaran Bulanan
```

Contoh:

```text
September 2026

Makanan

Anggaran
Rp1.000.000

Terpakai
Rp750.000

Tersisa
Rp250.000

75%
```

---

# 32. Status Anggaran

```text
0–79%
Dalam batas

80–99%
Mendekati batas

100%+
Melewati batas
```

Contoh:

```text
Makanan
Rp850.000 / Rp1.000.000

85%

Mendekati batas anggaran
```

Anggaran tidak akan memblokir transaksi.

---

# 33. Target Tabungan

URL:

```text
/goals
```

Judul:

```text
Target Tabungan
```

Tombol:

```text
+ Tambah Target
```

Contoh:

```text
Laptop Baru

Target
Rp15.000.000

Terkumpul
Rp7.500.000

50%
```

---

# 34. Form Target Tabungan

```text
Nama Target

[ Contoh: Laptop Baru ]

Jumlah Target

[ Rp0 ]

Jumlah Saat Ini

[ Rp0 ]

Tanggal Target

[ Opsional ]

Deskripsi

[ Opsional ]

[ Batal ] [ Simpan ]
```

---

# 35. Laporan

URL:

```text
/reports
```

Judul:

```text
Laporan Keuangan
```

Periode:

```text
Bulan Ini
Bulan Lalu
Tahun Ini
Pilih Periode
```

---

# 36. Ringkasan Laporan

```text
Total Pemasukan
Rp6.000.000

Total Pengeluaran
Rp2.350.000

Total Tabungan
Rp3.650.000

Rasio Tabungan
60,8%
```

---

# 37. Analisis Pengeluaran

Contoh:

```text
Pengeluaran Berdasarkan Kategori

Makanan
Rp700.000

Transportasi
Rp400.000

Tagihan
Rp300.000

Belanja
Rp250.000

Hiburan
Rp200.000
```

---

# 38. Perbandingan Bulanan

Contoh:

```text
Perbandingan Pengeluaran

Agustus 2026
Rp2.100.000

September 2026
Rp2.350.000
```

Grafik menunjukkan perubahan tanpa memberikan penilaian.

---

# 39. Rasio Tabungan

Formula:

```text
Rasio Tabungan =
(Pemasukan - Pengeluaran)
÷ Pemasukan
× 100
```

Contoh:

```text
Pemasukan
Rp6.000.000

Pengeluaran
Rp2.400.000

Tabungan
Rp3.600.000

Rasio Tabungan
60%
```

---

# 40. Pengaturan

URL:

```text
/settings
```

Menu:

```text
Profil
Preferensi
Kategori
Keamanan
```

---

# 41. Profil

```text
Nama Lengkap

Alamat Email

Foto Profil
```

Tombol:

```text
Simpan Perubahan
```

---

# 42. Preferensi

```text
Mata Uang
Rupiah (IDR)

Zona Waktu
Asia/Jakarta

Tema
Terang
Gelap
Sistem
```

---

# 43. Keamanan

```text
Ubah Kata Sandi

Email Akun

Sesi Aktif

Keluar dari Semua Perangkat
```

---

# 44. Konfirmasi Penghapusan

Setiap transaksi atau data penting yang dihapus harus memiliki konfirmasi.

Contoh:

```text
Hapus Transaksi?

Transaksi "Makan Siang"
sebesar Rp50.000 akan dihapus.

Tindakan ini tidak dapat dibatalkan.

[Batal] [Hapus]
```

---

# 45. Notifikasi

Gunakan toast notification.

Berhasil:

```text
Transaksi berhasil ditambahkan.
```

```text
Rekening berhasil ditambahkan.
```

```text
Anggaran berhasil diperbarui.
```

Gagal:

```text
Transaksi gagal disimpan.
Silakan coba lagi.
```

---

# 46. Pesan Kesalahan

Semua error menggunakan Bahasa Indonesia.

Contoh:

```text
Jumlah harus lebih besar dari nol.
```

```text
Silakan pilih rekening.
```

```text
Silakan pilih kategori.
```

```text
Saldo tidak mencukupi.
```

```text
Rekening asal dan rekening tujuan tidak boleh sama.
```

```text
Terjadi kesalahan. Silakan coba lagi.
```

---

# 47. Empty State

Jika belum ada transaksi:

```text
Belum Ada Transaksi

Anda belum memiliki transaksi.
Mulai catat pemasukan atau pengeluaran Anda.

[ + Tambah Transaksi ]
```

Jika belum ada rekening:

```text
Belum Ada Rekening

Tambahkan rekening, uang tunai,
atau dompet digital untuk mulai
mengelola keuangan.

[ + Tambah Rekening ]
```

Jika belum ada target:

```text
Belum Ada Target Tabungan

Buat target untuk membantu Anda
memantau tabungan.

[ + Tambah Target ]
```

---

# 48. Saldo Rekening

Saldo dihitung dengan:

```text
Saldo Saat Ini =
Saldo Awal
+ Pemasukan
- Pengeluaran
- Transfer Keluar
+ Transfer Masuk
```

Contoh:

```text
Saldo Awal       Rp2.000.000
Pemasukan        Rp6.000.000
Pengeluaran      Rp250.000
Transfer Keluar  Rp500.000
Transfer Masuk   Rp100.000

Saldo Saat Ini   Rp7.350.000
```

---

# 49. Aturan Transfer

Transfer:

```text
BCA → Uang Tunai
```

tidak boleh masuk ke:

```text
Total Pengeluaran
```

dan tidak boleh mengurangi:

```text
Total Kekayaan
```

Transfer hanya memindahkan lokasi uang.

---

# 50. Aturan Pemasukan

Pemasukan:

```text
Gaji → BCA
```

akan:

```text
Menambah saldo BCA
Menambah total pemasukan
```

---

# 51. Aturan Pengeluaran

Pengeluaran:

```text
BCA → Makanan
```

akan:

```text
Mengurangi saldo BCA
Menambah total pengeluaran
Menambah pengeluaran kategori Makanan
```

---

# 52. Aturan Saldo Tidak Mencukupi

Jika saldo:

```text
BCA = Rp100.000
```

dan pengguna mencoba:

```text
Pengeluaran = Rp150.000
```

maka aplikasi menampilkan:

```text
Saldo tidak mencukupi.

Saldo BCA saat ini:
Rp100.000

Jumlah transaksi:
Rp150.000
```

Transaksi tidak disimpan.

---

# 53. Keamanan Data

Aplikasi tidak boleh menyimpan:

- PIN ATM.
- Password rekening bank.
- CVV.
- OTP.
- Nomor kartu lengkap.
- Password layanan keuangan lain.

Aplikasi hanya menyimpan data yang diperlukan untuk pencatatan keuangan.

---

# 54. Keamanan Database

Gunakan:

- Supabase Authentication.
- Row Level Security.
- Server-side validation.
- Zod.
- Server Actions.

Jika aplikasi berkembang menjadi multi-user, struktur database dapat diperluas dengan `user_id`.

---

# 55. Database

## users

```text
id
email
name
avatar_url
created_at
updated_at
```

## accounts

```text
id
user_id
name
type
initial_balance
currency
icon
is_active
created_at
updated_at
```

## categories

```text
id
user_id
name
type
icon
is_active
created_at
updated_at
```

## transactions

```text
id
user_id
type
amount
account_id
destination_account_id
category_id
description
date
notes
created_at
updated_at
```

## budgets

```text
id
user_id
category_id
amount
month
created_at
updated_at
```

## goals

```text
id
user_id
name
target_amount
current_amount
target_date
description
created_at
updated_at
```

---

# 56. Struktur Next.js

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── dashboard/
│   ├── transactions/
│   ├── accounts/
│   ├── categories/
│   ├── budgets/
│   ├── goals/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── transactions/
│   ├── accounts/
│   ├── budgets/
│   ├── goals/
│   ├── reports/
│   └── charts/
│
├── actions/
│   ├── accounts.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   └── goals.ts
│
├── lib/
│   ├── supabase/
│   ├── validations/
│   ├── calculations/
│   └── utils/
│
├── types/
│   ├── account.ts
│   ├── transaction.ts
│   ├── category.ts
│   ├── budget.ts
│   └── goal.ts
│
└── config/
    └── site.ts
```

---

# 57. Komponen UI

Komponen yang dibutuhkan:

```text
Button
Input
Select
Textarea
Dialog
Dropdown
Date Picker
Tabs
Card
Table
Badge
Toast
Skeleton
Tooltip
Progress Bar
Chart
```

---

# 58. Responsive Design

Aplikasi harus optimal pada:

```text
Ponsel
Tablet
Desktop
```

Prioritas desain:

```text
Ponsel → Tablet → Desktop
```

Karena pencatatan transaksi biasanya dilakukan melalui smartphone.

---

# 59. Tombol Tambah

Pada mobile, gunakan tombol utama:

```text
+ Tambah
```

Menu dapat membuka pilihan:

```text
+ Tambah Pemasukan
- Tambah Pengeluaran
↔ Transfer
```

---

# 60. Aksesibilitas

Aplikasi harus memperhatikan:

- Kontras teks.
- Label form.
- Keyboard navigation.
- Focus state.
- Aria label untuk ikon.
- Ukuran tombol yang mudah disentuh.
- Jangan hanya menggunakan warna untuk membedakan status.

Contoh:

Jangan hanya:

```text
Merah = melewati anggaran
```

Tetapi:

```text
⚠ Melewati anggaran
```

---

# 61. Performa

Target:

- Dashboard cepat dimuat.
- Transaction list menggunakan pagination.
- Query database efisien.
- Chart menggunakan data agregasi.
- Tidak mengambil seluruh transaksi jika tidak diperlukan.

Index database:

```text
transactions.user_id
transactions.date
transactions.account_id
transactions.category_id
transactions.type
```

---

# 62. Pengujian

## Unit Test

Uji:

```text
Perhitungan saldo
Perhitungan tabungan
Perhitungan anggaran
Perhitungan rasio tabungan
Perhitungan transfer
```

## Integration Test

Uji:

```text
Registrasi
Login
Tambah rekening
Tambah pemasukan
Tambah pengeluaran
Transfer
Edit transaksi
Hapus transaksi
```

---

# 63. Skenario Pengujian Utama

## Skenario 1 — Pemasukan

```text
Saldo BCA:
Rp1.000.000

Pemasukan:
Rp500.000
```

Hasil:

```text
BCA:
Rp1.500.000
```

## Skenario 2 — Pengeluaran

```text
Saldo BCA:
Rp1.000.000

Pengeluaran:
Rp100.000
```

Hasil:

```text
BCA:
Rp900.000
```

## Skenario 3 — Transfer

```text
BCA:
Rp1.000.000

Cash:
Rp0

Transfer:
Rp300.000
```

Hasil:

```text
BCA:
Rp700.000

Cash:
Rp300.000
```

Total:

```text
Rp1.000.000
```

## Skenario 4 — Transfer Tidak Menjadi Pengeluaran

```text
Pemasukan:
Rp1.000.000

Transfer:
Rp300.000

Pengeluaran:
Rp100.000
```

Hasil:

```text
Total Pemasukan:
Rp1.000.000

Total Pengeluaran:
Rp100.000

Tabungan:
Rp900.000
```

Transfer Rp300.000 tidak dihitung sebagai pengeluaran.

---

# 64. Tahapan Pengembangan

## Tahap 1 — Fondasi

- [ ] Membuat project Next.js.
- [ ] TypeScript.
- [ ] Tailwind CSS.
- [ ] Supabase.
- [ ] Database.
- [ ] Layout.
- [ ] Tema.

## Tahap 2 — Autentikasi

- [ ] Registrasi.
- [ ] Login.
- [ ] Logout.
- [ ] Verifikasi email.
- [ ] Lupa kata sandi.
- [ ] Reset kata sandi.
- [ ] Protected routes.

## Tahap 3 — Rekening

- [ ] Tambah rekening.
- [ ] Edit rekening.
- [ ] Nonaktifkan rekening.
- [ ] Saldo awal.
- [ ] Perhitungan saldo.

## Tahap 4 — Kategori

- [ ] Kategori pemasukan.
- [ ] Kategori pengeluaran.
- [ ] Tambah kategori.
- [ ] Edit kategori.
- [ ] Hapus kategori.

## Tahap 5 — Transaksi

- [ ] Pemasukan.
- [ ] Pengeluaran.
- [ ] Transfer.
- [ ] Edit transaksi.
- [ ] Hapus transaksi.
- [ ] Filter.
- [ ] Search.
- [ ] Pagination.

## Tahap 6 — Dashboard

- [ ] Total saldo.
- [ ] Pemasukan.
- [ ] Pengeluaran.
- [ ] Tabungan.
- [ ] Daftar rekening.
- [ ] Transaksi terbaru.
- [ ] Grafik.

## Tahap 7 — Anggaran

- [ ] Tambah anggaran.
- [ ] Progress anggaran.
- [ ] Status anggaran.
- [ ] Edit anggaran.

## Tahap 8 — Target Tabungan

- [ ] Tambah target.
- [ ] Progress.
- [ ] Kontribusi.
- [ ] Edit target.

## Tahap 9 — Laporan

- [ ] Laporan bulanan.
- [ ] Pengeluaran berdasarkan kategori.
- [ ] Pemasukan.
- [ ] Pengeluaran.
- [ ] Rasio tabungan.
- [ ] Perbandingan bulan.

## Tahap 10 — Penyempurnaan

- [ ] Responsive.
- [ ] Dark mode.
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Toast.
- [ ] Accessibility.
- [ ] Testing.
- [ ] Performance.

---

# 65. Definition of Done

Produk dianggap siap digunakan apabila pengguna dapat:

## Akun

- [ ] Membuat akun.
- [ ] Masuk.
- [ ] Keluar.
- [ ] Mengubah kata sandi.
- [ ] Reset kata sandi.

## Rekening

- [ ] Membuat rekening.
- [ ] Mengubah rekening.
- [ ] Menonaktifkan rekening.
- [ ] Melihat saldo.

## Transaksi

- [ ] Menambah pemasukan.
- [ ] Menambah pengeluaran.
- [ ] Melakukan transfer.
- [ ] Mengubah transaksi.
- [ ] Menghapus transaksi.
- [ ] Mencari transaksi.
- [ ] Memfilter transaksi.

## Keuangan

- [ ] Melihat total saldo.
- [ ] Melihat pemasukan.
- [ ] Melihat pengeluaran.
- [ ] Melihat tabungan.
- [ ] Melihat kategori pengeluaran.

## Perencanaan

- [ ] Membuat anggaran.
- [ ] Memantau anggaran.
- [ ] Membuat target tabungan.
- [ ] Memantau target.

## Laporan

- [ ] Melihat laporan bulanan.
- [ ] Melihat grafik.
- [ ] Membandingkan periode.

---

# 66. Prinsip UX Utama

DompetKu harus mengikuti prinsip:

> **Catat dengan cepat, pahami dengan mudah.**

Pengguna tidak boleh membutuhkan banyak langkah untuk mencatat transaksi.

Contoh target:

```text
Buka aplikasi
      ↓
Tekan "+"
      ↓
Pilih Pengeluaran
      ↓
Masukkan Rp50.000
      ↓
Pilih Makanan
      ↓
Pilih Uang Tunai
      ↓
Simpan
```

Idealnya proses selesai dalam beberapa detik.

---

# 67. Konsep Akhir Produk

```text
                       DOMPETKU
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
     REKENING          TRANSAKSI       PERENCANAAN
        │                 │                 │
        ↓                 ↓                 ↓
    Bank / Cash      Pemasukan          Anggaran
    E-Wallet         Pengeluaran        Target
                     Transfer            Tabungan
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ↓
                       BERANDA
                          ↓
                       LAPORAN
```

Tujuan akhirnya:

```text
Berapa uang saya?
        ↓
Uang saya ada di mana?
        ↓
Uang saya digunakan untuk apa?
        ↓
Berapa yang saya simpan?
        ↓
Apa target keuangan saya?
```

---

# 68. Bahasa Antarmuka

Seluruh antarmuka menggunakan Bahasa Indonesia.

| Istilah Teknis | Bahasa Aplikasi |
|---|---|
| Dashboard | Beranda |
| Transaction | Transaksi |
| Account | Rekening |
| Category | Kategori |
| Income | Pemasukan |
| Expense | Pengeluaran |
| Transfer | Transfer |
| Budget | Anggaran |
| Goal | Target Tabungan |
| Report | Laporan |
| Settings | Pengaturan |
| Login | Masuk |
| Register | Daftar |
| Logout | Keluar |
| Save | Simpan |
| Cancel | Batal |
| Delete | Hapus |
| Edit | Ubah |
| Search | Cari |
| Add | Tambah |
| Balance | Saldo |
| Total Balance | Total Saldo |
| Recent Transactions | Transaksi Terbaru |
| Monthly Summary | Ringkasan Bulanan |
| Forgot Password | Lupa Kata Sandi |
| Reset Password | Atur Ulang Kata Sandi |
| Sign Up | Daftar |
| Sign In | Masuk |

Tidak boleh ada teks UI berbahasa Inggris yang terlihat oleh pengguna jika padanannya sudah tersedia dalam Bahasa Indonesia.

---

# 69. Kesimpulan

DompetKu merupakan aplikasi pelacak keuangan pribadi berbasis web yang berfokus pada:

1. **Pencatatan transaksi.**
2. **Pengelolaan rekening.**
3. **Pemantauan saldo.**
4. **Pengelolaan anggaran.**
5. **Target tabungan.**
6. **Laporan keuangan.**

Aplikasi harus tetap sederhana sehingga dapat digunakan setiap hari tanpa proses pencatatan yang rumit.

Fondasi utama sistem adalah:

```text
Rekening
+
Pemasukan
+
Pengeluaran
+
Transfer
=
Saldo yang akurat
```

Semua fitur lain seperti anggaran, target tabungan, grafik, dan laporan dibangun berdasarkan data transaksi tersebut.
