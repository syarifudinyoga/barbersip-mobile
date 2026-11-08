# Rencana Pengembangan Aplikasi Mobile BarberSip (`barbersip-mobile`)

Dokumen ini berisi hasil analisis menyeluruh terhadap seluruh fungsi berdasarkan role (`superadmin`, `admin`, `capster`, `member`, serta `public/guest`), spesifikasi **Design System & Styling** agar identik dengan tampilan **Next.js (`barbersip-frontend`)**, serta tahapan implementasi (**Phased Roadmap**) menggunakan **React Native (Expo)**.

---

## 1. Analisis Fungsi Berdasarkan Role & Endpoint API

Berdasarkan kode pada `barbersip-frontend` dan `barbersip-backend`, aplikasi memiliki **4 role terautentikasi** (`superadmin`, `admin`, `capster`, `member`) ditambah akses **Public / Guest** sebelum login.

### A. Public / Guest (Tanpa Login)
| Fitur / Modul | Detail Fungsi | Endpoint API / Socket |
| :--- | :--- | :--- |
| **Landing & Informasi** | Hero section, informasi perusahaan, jam operasional, lokasi, feedback pelanggan, dan kontak WhatsApp Call Center. | `GET /api/settings` |
| **Guest Booking (3 Langkah)** | 1. Pilih Capster, Tanggal, Jam tersedia, dan Layanan (mendukung multi-kuantitas maks. 20 orang & validasi durasi slot).<br>2. Isi info pelanggan (Nama, No. WA, Email), validasi kode kupon diskon.<br>3. Pembayaran QRIS & upload bukti bayar (`JPG/PNG/WEBP` maks. 5 MB). | `GET /api/barbers`<br>`GET /api/holidays`<br>`GET /api/barbers/holiday`<br>`GET /api/bookings/slots/available-slots`<br>`POST /api/coupons/validate`<br>`POST /api/bookings`<br>`POST /api/bookings/:id/payment-proof` |
| **Booking Tracker** | Cek status booking menggunakan kode booking (`booking_code`). | `GET /api/bookings` / pencarian kode |
| **Guest Product Store** | Katalog produk, preview galeri foto produk, keranjang lokal (`AsyncStorage` di mobile), checkout guest dengan upload bukti bayar QRIS. | `GET /api/products`<br>`POST /api/products/orders/guest` |
| **Public Leaderboard** | Melihat peringkat Top Member (Transaksi Terbanyak, Poin Terbanyak, Transaksi Tersering) secara realtime. | `GET /api/members/public/leaderboard?limit=50`<br>WS: `leaderboard:subscribe`, `leaderboard:changed` |
| **Autentikasi & Registrasi** | - Login semua role.<br>- Registrasi Member (2 Langkah: Isi biodata + minimal 1 sosmed → Pembayaran biaya pendaftaran via QRIS & upload bukti bayar). | `POST /auth/login`<br>`GET /auth/me`<br>`POST /auth/logout`<br>`POST /api/members` |

---

### B. Role: `member`
Menu navigasi utama: **Dashboard**, **Booking**, **Produk**, **Riwayat**, **Leaderboard Member**.

| Fitur / Halaman | Detail Fungsi | Endpoint API / Socket |
| :--- | :--- | :--- |
| **Dashboard Member** (`/dashboard`) | - **UserInfoCard**: Foto profil, nama, badge status membership (`Aktif` / `Kedaluwarsa` + sisa hari), tanggal aktif sampai, dan jumlah poin aktif.<br>- **Pengaturan Profil**: Ubah foto profil & ubah password.<br>- **Modal Rincian Poin Aktif**: Riwayat mutasi poin (`+` cashback/bonus, `-` penggunaan/hangus).<br>- **Perpanjangan Membership (Renewal)**: Muncul otomatis saat masuk rentang pengingat (`H-reminderDays`) atau saat status `PENDING`. Menampilkan nominal biaya perpanjangan, gambar QRIS, dan upload bukti bayar.<br>- **5 Kartu Statistik**: Total Transaksi (`Rp`), Total Pemesanan, Pemesanan Dikonfirmasi, Pemesanan Ditolak, Pemesanan Tertunda.<br>- **Syarat & Ketentuan Poin**: Ditampilkan dari `settings.point_terms`.<br>- **Kalender Booking**: Visualisasi jadwal booking member pada kalender bulanan. | `GET /api/users?uid=:id`<br>`POST /api/users/me/photo`<br>`PATCH /api/users/me/password`<br>`GET /api/users/points/history`<br>`GET /api/members/renewals/status`<br>`POST /api/members/renewals`<br>`GET /api/bookings` |
| **Booking Member** (`/members-booking`) | - Form booking 3 langkah khusus member (data diri otomatis terisi dari akun).<br>- Mendukung pembayaran menggunakan **QRIS**, **Poin Member** (memperhitungkan saldo minimum mengendap `member_points_reserve`), atau **MIX (QRIS + Poin)**.<br>- Mendukung pemakaian **Kupon Diskon** & harga promo event (`service-price-events`). | `GET /api/barbers`<br>`GET /api/bookings/slots/available-slots`<br>`POST /api/coupons/validate`<br>`POST /api/bookings`<br>`POST /api/bookings/:id/payment-proof` |
| **Toko Produk Member** (`/members-products`) | - Belanja produk dengan **Harga Khusus Member (`price_member`)**.<br>- Keranjang belanja tersinkronisasi di server.<br>- Checkout produk dengan upload bukti bayar QRIS. | `GET /api/products`<br>`GET /api/products/cart`<br>`POST /api/products/cart/items`<br>`PATCH /api/products/cart/items/:productId`<br>`DELETE /api/products/cart/items/:productId`<br>`POST /api/products/orders/member` |
| **Riwayat Member** (`/members-history`) | - **Tab 1: Booking**: Daftar kode booking, capster, layanan, jadwal, total, dan status (`Dikonfirmasi`, `Ditolak`, `Menunggu`).<br>- **Tab 2: Pembelian Produk**: Daftar kode pesanan, daftar item & qty, tanggal, total, dan status pembayaran.<br>- **Tab 3: Poin**: Riwayat tanggal, aktivitas (`Cashback`, `Bonus dari admin`, `Penggunaan`, `Hangus`), kode booking, dan nominal perubahan poin.<br>- Pencarian & paginasi di setiap tab. | `GET /api/bookings/member/:id`<br>`GET /api/products/orders/mine`<br>`GET /api/users/points/history?uid=:id` |
| **Leaderboard Member** (`/top-members`) | - Peringkat member aktif tahun berjalan dalam 3 tab: **Transaksi Terbanyak (Nominal)**, **Poin Terbanyak**, **Transaksi Tersering (Frekuensi)**.<br>- Indikator koneksi Realtime WebSocket & tombol sync manual. | `GET /api/members/leaderboard?limit=50`<br>WS: `leaderboard:subscribe`, `leaderboard:changed` |

---

### C. Role: `capster`
Menu navigasi utama: **Dashboard**, **Booking History**, **Attendance**, **Attendance History**.

| Fitur / Halaman | Detail Fungsi | Endpoint API / Socket |
| :--- | :--- | :--- |
| **Dashboard Capster** (`/dashboard`) | - **UserInfoCard**: Nama, email, foto profil capster, tombol edit foto profil & ganti password.<br>- **Today's Activity**: Daftar antrean booking hari ini secara realtime (WebSocket + Cron status indicator), dilengkapi aksi status layanan (`Start` / `Finish` / `Cancel`).<br>- **Booking Calendar**: Kalender bulanan berisi daftar jadwal booking pada capster tersebut. | `GET /api/users?uid=:id`<br>`POST /api/users/me/photo`<br>`GET /api/bookings`<br>WS: `cron:status`, `booking:updated` |
| **Booking History** (`/service-booking`) | - **3 Summary Card Capster**: Total Booking, Booking Member, Booking Guest pada bulan terpilih.<br>- **Filter & Search**: Cari nama pelanggan / kode booking, filter per bulan (`YYYY-MM`).<br>- **Tabel/List Booking Capster**: Menampilkan Kode, Pelanggan (badge Member/Non-member & info poin), No. WA, Layanan (beserta jumlah orang), dan Tanggal/Jam (dengan warna indikator status waktu). *Tanpa kolom nominal/aksi admin*. | `GET /api/bookings` |
| **Attendance (Absensi)** (`/attendance`) | - Jam digital realtime (`Asia/Jakarta`) & info tanggal hari ini.<br>- **Geofencing & Peta Lokasi**: Membaca koordinat GPS perangkat secara presisi, menghitung jarak Haversine ke titik lokasi barbershop (`attendance_latitude`, `attendance_longitude`), memvalidasi radius izin (`attendance_radius_meters`), dan menampilkan peta interaktif.<br>- **Kamera Selfie Wajib**: Ambil foto langsung dari kamera depan/belakang (`Check-In` & `Check-Out`).<br>- **Validasi Jam & Cooldown**: Deteksi keterlambatan (`attendance_start_time`) & penguncian tombol Check-Out sebelum durasi kerja minimum (`attendance_min_checkout_hours`) terpenuhi. | `GET /api/attendance/today`<br>`POST /api/attendance/check-in`<br>`POST /api/attendance/check-out`<br>`GET /api/settings` |
| **Attendance History** (`/attendance-history`) | - Daftar riwayat absensi capster (Tanggal, jam Check-In, badge `Terlambat`/`Tepat waktu`, jam Check-Out, status `Selesai`/`Belum Check Out`, dan modal preview bukti foto Check-In/Check-Out). | `GET /api/attendance/history?page=:p&pageSize=10` |

---

### D. Role: `admin`
Menu navigasi utama terbagi dalam 4 grup: **UMUM**, **LAYANAN**, **MANAJEMEN**, **SISTEM**, dilengkapi badge notifikasi merah untuk item *pending*.

| Grup | Fitur / Halaman | Detail Fungsi | Endpoint API |
| :--- | :--- | :--- | :--- |
| **UMUM** | **Dashboard Booking** (`/dashboard`) | - Shortcut badge jumlah booking belum disetujui.<br>- Filter per bulan (`YYYY-MM`).<br>- Summary Card: **Total Pendapatan** & **Total Booking**.<br>- 6 Visualisasi Grafik: *Pendapatan per Hari* (Bar), *Trend Booking* (Line), *Top Servis* (Bar), *Booking Berdasarkan Jam* (Bar), *Pendapatan per Capster* (Bar), dan *Heatmap Aktivitas* (Grid jam × tanggal). | `GET /api/bookings?month=:m`<br>`GET /api/bookings/pending/count-pending` |
| **UMUM** | **Dashboard Produk** (`/dashboard-products`) | - Filter per bulan.<br>- Summary Card: **Pesanan Lunas**, **Pendapatan Lunas**, **Item Terjual**.<br>- Grafik Bar ganda: *Total Pesanan & Pendapatan Lunas Harian*. | `GET /api/reports/superadmin/dashboard?from=...&to=...` |
| **UMUM** | **Leaderboard Member** (`/members-leaderboard`) | - Sama seperti halaman leaderboard member (3 tab kategori ranking + sinkronisasi realtime WebSocket). | `GET /api/members/leaderboard?limit=50` |
| **LAYANAN** | **Review Booking** (`/service-booking`)<br>*(Badge: `pendingBookings`)* | - Summary Card: Total Pendapatan, Dikonfirmasi, Menunggu.<br>- Filter bulan & pencarian.<br>- Lihat bukti pembayaran QRIS.<br>- **Action Menu Booking**: Konfirmasi (`confirm`), Tolak (`reject`), Reset ke menunggu (`cancel`), Koreksi Harga layanan (`correction`), Reschedule tanggal & jam (`reschedule`), dan Hapus booking (`DELETE`). | `GET /api/bookings`<br>`PATCH /api/bookings/:id/global-book-status`<br>`PATCH /api/bookings/:id/correction`<br>`PATCH /api/bookings/:id/reschedule`<br>`DELETE /api/bookings/:id` |
| **LAYANAN** | **Review Produk** (`/product-orders`)<br>*(Badge: `pendingProductOrders`)* | - Summary Card: Pendapatan Produk, Lunas, Menunggu.<br>- Filter status (`WAITING_VERIFICATION`, `PAID`, `REJECTED`) & pencarian.<br>- Preview foto bukti bayar, tombol **Konfirmasi Lunas (`PAID`)** dan **Tolak (`REJECTED`)**. | `GET /api/products/admin/orders`<br>`GET /api/products/admin/orders/pending/count`<br>`PATCH /api/products/admin/orders/:id/payment-status` |
| **LAYANAN** | **Cetak Struk** (`/payment`) | - 2 Tab: **Pembayaran Booking** & **Pembayaran Produk**.<br>- Pencarian transaksi.<br>- Generate & cetak/bagikan **Struk Thermal PDF** (mengikuti konfigurasi logo, header, footer, ukuran font, dan perataan teks dari pengaturan aplikasi). | `GET /api/payments`<br>`GET /api/products/admin/orders` |
| **MANAJEMEN** | **Produk** (`/product`) | - CRUD produk: Nama, deskripsi, harga Guest, harga Member, foto utama, hingga 10 foto galeri tambahan, serta toggle aktif/nonaktif produk. | `GET /api/products/admin/products`<br>`POST /api/products/admin/products`<br>`PATCH /api/products/admin/products/:id` |
| **MANAJEMEN** | **Capster** (`/service-capster`) | - Tambah capster (nama & email), hapus capster, toggle status aktif/nonaktif, upload foto capster, dan **Pengaturan Jam Operasional Mingguan** (Senin–Minggu: jam buka, jam tutup, atau tutup/libur per hari). | `GET /api/barbers/management`<br>`POST /api/barbers/management`<br>`PUT /api/barbers/management/:id`<br>`DELETE /api/barbers/management/:id`<br>`POST /api/barbers/management/:id/photo` |
| **MANAJEMEN** | **Harga Service** (`/management-pricelist`) | - Pilih capster aktif.<br>- Kelola grup kategori layanan (`service_group`), ubah nama grup, atur urutan grup & urutan tampil layanan (`ChevronUp`/`ChevronDown`).<br>- CRUD layanan: Nama, grup, deskripsi, harga reguler, durasi (menit), dan cashback poin. | `GET /api/barbers/servis`<br>`POST /api/barbers/servis`<br>`PUT /api/barbers/servis/:id`<br>`DELETE /api/barbers/servis/:id`<br>`PATCH /api/barbers/servis/order` |
| **MANAJEMEN** | **Harga Event** (`/service-price-events`) | - Buat & edit promo harga event per layanan atau **Bulk Editor per Capster**.<br>- Atur harga event, rentang tanggal (`starts_on` - `ends_on`), batas jam harian opsional (`starts_at_time` - `ends_at_time`), kuota harian (`daily_quota`), dan izin penggunaan/perolehan poin (`allow_points`). | `GET /api/barbers/servis/events`<br>`POST /api/barbers/servis/events`<br>`PUT /api/barbers/servis/events/:id`<br>`DELETE /api/barbers/servis/events/:id` |
| **MANAJEMEN** | **Kupon** (`/coupons`) | - CRUD kupon diskon booking: Kode kupon, tipe diskon (`PERCENT` / `FIXED`), nilai diskon, kuota pemakaian (`usage_limit`), waktu mulai & berakhir, serta nonaktifkan kupon. | `GET /api/coupons`<br>`POST /api/coupons`<br>`PATCH /api/coupons/:id`<br>`DELETE /api/coupons/:id` |
| **MANAJEMEN** | **Libur** (`/management-holidays`) | - Kelola hari libur nasional/toko (tanggal & deskripsi): tambah dan hapus tanggal libur. | `GET /api/holidays`<br>`POST /api/holidays`<br>`DELETE /api/holidays/:id` |
| **MANAJEMEN** | **Cuti** (`/management-leave`)<br>*(Badge: `pendingLeaves`)* | - Daftar pengajuan cuti capster (rentang `start_date` s/d `end_date` & alasan).<br>- Tambah cuti capster, filter status (`pending`, `approved`, `rejected`), serta setujui (`approved`) atau tolak (`rejected`) cuti. | `GET /api/barbers/holiday`<br>`GET /api/barbers/holiday/pending/count`<br>`POST /api/barbers/holiday`<br>`PATCH /api/barbers/holiday/:id` |
| **MANAJEMEN** | **Member** (`/members`)<br>*(Badge: `pendingMembers`)* | - Daftar member beserta biodata, sosmed, bukti pembayaran pendaftaran, masa aktif, dan poin.<br>- **Section Perpanjangan Menunggu Verifikasi**: Review bukti bayar renewal, `Approve` (+1 tahun) atau `Reject`.<br>- **Daftarkan Member Baru** secara manual oleh admin.<br>- **Aksi Member**: Verifikasi/Batalkan verifikasi member, Edit tanggal `active_until`, dan Tambah Bonus Poin (`POST /api/members/:id/points`). | `GET /api/members`<br>`GET /api/members/pending/count`<br>`POST /api/members/admin`<br>`PATCH /api/members/:id`<br>`POST /api/members/:id/points`<br>`GET /api/members/renewals/pending`<br>`PATCH /api/members/renewals/:id/approve`<br>`PATCH /api/members/renewals/:id/reject` |
| **SISTEM** | **Pengaturan Aplikasi** (`/settings`) | - **8 Tab Konfigurasi**:<br>  1. *Kode Transaksi*: Prefix & pola kode booking/produk.<br>  2. *Operasional & Booking*: Batas menit booking terakhir sebelum tutup.<br>  3. *Attendance*: Jam masuk, min jam check-out, koordinat Latitude/Longitude, radius meter.<br>  4. *Pembayaran*: Upload gambar QRIS, biaya daftar member, biaya renewal, H-reminder renewal.<br>  5. *Poin Member*: Saldo poin minimum mengendap (`member_points_reserve`) & teks syarat ketentuan poin (`point_terms`).<br>  6. *Kontak*: Nomor WhatsApp Call Center.<br>  7. *Notifikasi Telegram*: Toggle aktif, API URL, Authorization, Chat ID.<br>  8. *Template Struk*: Toggle logo teks, nama brand, heading, footer, ukuran font, alignment, beserta live preview struk. | `GET /api/settings`<br>`PATCH /api/settings`<br>`POST /api/settings/qris-image` |
| **SISTEM** | **Booking Manual** (`/booking`) | - Form booking 3 langkah dengan mode `admin` untuk menginput walk-in / booking manual pelanggan. | Sama dengan endpoint Booking |

---

### E. Role: `superadmin`
Menu navigasi utama: **Dashboard Booking**, **Dashboard Produk**, **Dashboard Absensi**, **Laporan**.
*(Catatan: di backend & layout, `superadmin` juga memiliki izin akses ke endpoint admin/report).*

| Fitur / Halaman | Detail Fungsi | Endpoint API |
| :--- | :--- | :--- |
| **Dashboard Booking** (`/dashboard`) | - Menampilkan analitik lengkap pendapatan & tren booking bulanan, top servis, distribusi jam sibuk, pendapatan per capster, dan heatmap aktivitas. | `GET /api/bookings?month=:m` |
| **Dashboard Produk** (`/dashboard-products`) | - Ringkasan pesanan lunas, pendapatan produk lunas, jumlah unit terjual, dan grafik harian per bulan. | `GET /api/reports/superadmin/dashboard` |
| **Dashboard Absensi** (`/dashboard-attendance`) | - Filter periode bulan.<br>- **4 Summary Card**: Rata-rata Kehadiran (`%`), Total Hari Kerja, Tidak Masuk, Belum Check Out.<br>- **Tabel Rekap per Capster**: Hari kerja, Masuk, Tidak Masuk, Belum Check Out, Terlambat, dan Progress Bar Persentase Kehadiran (Hijau ≥90%, Kuning ≥75%, Merah <75%). | `GET /api/reports/superadmin/dashboard?from=...&to=...` |
| **Laporan (Export PDF)** (`/superadmin-reports`) | - Pemilih rentang tanggal & jam (`from` s/d `to`) dengan preset cepat.<br>- Export & unduh laporan PDF Landscape A4 beserta Grand Total untuk 3 jenis laporan:<br>  1. **Summary Booking**<br>  2. **Summary Produk**<br>  3. **Summary Attendance** | `GET /api/reports/superadmin/export?from=...&to=...&type=bookings\|products\|attendance` |

---

## 2. Spesifikasi Visual & Styling ("Cyber-Galaxy Dark Glassmorphism")

Agar aplikasi React Native (`barbersip-mobile`) memiliki tampilan dan nuansa yang **identik dengan existing Next.js (`barbersip-frontend`)**, berikut adalah token desain yang wajib diterapkan pada tema mobile:

### A. Palet Warna (Color Tokens)
- **Background Utama (Canvas / Screen)**:
  - Deep Space Black: `#030611`
  - Slate Night: `#020617`
  - Dark Navy Surface: `#0f172a` (dengan variasi opasitas `rgba(15, 23, 42, 0.80)`)
  - Secondary Card Surface: `#111827` dan `#1e293b` (untuk header tabel / tab bar)
- **Brand & Aksen Utama**:
  - Primary BarberSip Blue: `#125AB8` (Hover/Pressed: `#0F4C9C`)
  - Electric Sky Blue: `#60A5FA` / `#3B82F6`
  - Cyber Cyan Glow: `#22D3EE` (`rgba(34, 211, 238, 0.7)`)
  - Nebula Purple Accent: `#A855F7` / `#C084FC`
- **Warna Status Semantik**:
  - **Success / Confirmed / Paid / Present**: Teks `#34D399` / `#4ADE80`, Background `rgba(16, 185, 129, 0.15)`, Border `rgba(52, 211, 153, 0.25)`
  - **Warning / Pending / Incomplete / Late**: Teks `#FBBF24` / `#FCD34D`, Background `rgba(245, 158, 11, 0.15)`, Border `rgba(251, 191, 36, 0.25)`
  - **Danger / Rejected / Absent / Expired**: Teks `#F87171` / `#FB7185`, Background `rgba(239, 68, 68, 0.15)`, Border `rgba(248, 113, 113, 0.25)`
- **Tipografi & Garis Batas (Border)**:
  - Text Primary: `#FFFFFF` / `#EDEDED`
  - Text Secondary: `#D1D5DB` (`gray-300`) & `#9CA3AF` (`gray-400`)
  - Text Muted: `#6B7280` (`gray-500`)
  - Glass Border: `rgba(255, 255, 255, 0.10)`
  - Cyber Outline Border: `rgba(37, 99, 235, 0.90)` dengan shadow biru

### B. Padanan Komponen UI (Next.js → React Native)
1. **`AnimatedBackground` & `Galaxy Background`**:
   - Menggunakan `expo-linear-gradient` (`['#000000', '#0f172a', '#000000']`) dikombinasikan dengan partikel bintang (`react-native-svg` / `react-native-reanimated`) yang ringan dan hemat baterai (mengikuti aturan media query mobile di `globals.css` yang menonaktifkan blur berat).
2. **`GradientCard` (dengan Mobile Corner Highlights)**:
   - Mengadaptasi class `.gradient-card--mobile-corner-highlights` dari `globals.css`: card berlatar `#0f172a` dengan `borderRadius: 24`, border tipis `rgba(255,255,255,0.1)`, serta aksen siku sudut kiri-atas & kanan-bawah berwarna `#60A5FA` dan siku kanan-atas & kiri-bawah berwarna `#A855F7` yang berdenyut halus (`Reanimated`).
3. **`SummaryCard`**:
   - Card `borderRadius: 16`, background `#111827`, border `rgba(255,255,255,0.1)`, menampilkan judul (`#9CA3AF`), nilai utama berukuran besar & tebal sesuai varian warna (`blue`, `green`, `yellow`, `red`), subtitle, serta kotak ikon `48x48` (`borderRadius: 12`) di sisi kanan dan garis aksen bawah.
4. **`FloatingInput`**:
   - Input `TextInput` dengan label mengambang (*floating label*) yang naik dan mengecil saat fokus atau terisi nilai, latar `#020617`, border `rgba(255,255,255,0.1)` yang berubah menjadi `#125AB8` saat aktif.
5. **`DataTable` → `MobileDataList` & `FilterBar`**:
   - Di layar mobile, tabel lebar diubah menjadi **Card List Responsif** (atau mendukung mode toggle Card/Horizontal Scroll Table) lengkap dengan komponen `FilterBar` (Search input bulat + chip/dropdown filter) dan kontrol `Pagination` yang identik.
6. **`Modal` & `Alert`**:
   - Menggunakan custom dark modal (`#0f172a`, border `rgba(255,255,255,0.1)`) untuk menggantikan `Modal.tsx` dan `SweetAlert2` sehingga seluruh dialog konfirmasi/sukses/error tampil konsisten dengan tema gelap BarberSip.

---

## 3. Arsitektur Teknis `barbersip-mobile`

### A. Tech Stack Utama
- **Framework**: **Expo (React Native)** dengan **TypeScript** dan **Expo Router** (file-based routing yang sangat mirip dengan App Router di Next.js).
- **Styling**: **NativeWind v4** (Tailwind CSS untuk React Native) + `expo-linear-gradient` agar class Tailwind dari `barbersip-frontend` dapat digunakan kembali secara maksimal.
- **Animasi**: `react-native-reanimated` (menggantikan `framer-motion`).
- **Ikon**: `lucide-react-native` (100% kompatibel dengan ikon `lucide-react` di web).
- **State & Data Fetching**: `@tanstack/react-query` + `AuthContext` + `expo-secure-store`.
- **Realtime**: `socket.io-client` (identik dengan web untuk Leaderboard & TodayActivity).
- **Fitur Native**:
  - `expo-camera` & `expo-image-picker` (Selfie Attendance, Foto Profil, Bukti Bayar QRIS, Foto Produk).
  - `expo-location` & `react-native-maps` (Geofencing & Peta Attendance Capster).
  - `expo-print` & `expo-sharing` (Cetak Struk Thermal PDF & Export Laporan Superadmin PDF).

### B. Catatan Penting Kompatibilitas Backend (`barbersip-backend`)
Saat ini `AuthService` di backend (`src/auth/auth.service.ts` & `jwt.strategy.ts`) menyimpan JWT di cookie `httpOnly` (`req.cookies.token`).
- Agar aplikasi mobile React Native berjalan sangat stabil di iOS & Android tanpa kendala cookie lintas domain:
  1. Pada `AuthService.login()`, selain mengirim cookie `token`, kembalikan juga properti `access_token: token` di JSON response (tidak merusak frontend web sama sekali).
  2. Pada `JwtStrategy` dan `AuthService.me()`, tambahkan pembacaan token dari header `Authorization: Bearer <token>` sebagai fallback apabila `req.cookies.token` kosong.

### C. Struktur Folder `barbersip-mobile`
```text
barbersip-mobile/
├── app/                          # Expo Router (mirip src/app di Next.js)
│   ├── _layout.tsx               # Root Layout (AuthProvider, Theme, Navbar/Header)
│   ├── index.tsx                 # Public Landing, Guest Booking, Tracker, Store
│   ├── login.tsx                 # Halaman Login
│   ├── register.tsx              # Halaman Registrasi Member (2 Step + QRIS)
│   ├── (drawer)/                 # Authenticated Role-Based Navigation
│   │   ├── _layout.tsx           # Custom Drawer/Bottom Tab sesuai Role + Badge Count
│   │   ├── dashboard.tsx         # Switcher Dashboard (Superadmin/Admin/Capster/Member)
│   │   ├── dashboard-products.tsx
│   │   ├── dashboard-attendance.tsx
│   │   ├── superadmin-reports.tsx
│   │   ├── service-booking.tsx
│   │   ├── product-orders.tsx
│   │   ├── payment.tsx
│   │   ├── product.tsx
│   │   ├── service-capster.tsx
│   │   ├── management-pricelist.tsx
│   │   ├── service-price-events.tsx
│   │   ├── coupons.tsx
│   │   ├── management-holidays.tsx
│   │   ├── management-leave.tsx
│   │   ├── members.tsx
│   │   ├── settings.tsx
│   │   ├── booking.tsx
│   │   ├── members-booking.tsx
│   │   ├── members-products.tsx
│   │   ├── members-history.tsx
│   │   ├── members-leaderboard.tsx
│   │   ├── attendance.tsx
│   │   └── attendance-history.tsx
├── src/
│   ├── api/                      # HTTP Client (Bearer token + Cookie support) & Endpoints
│   ├── components/
│   │   ├── ui/                   # GradientCard, GlassCard, SummaryCard, FloatingInput, Modal, Alert
│   │   ├── layout/               # MobileNavbar, RoleDrawer, menu.ts, WebSocketStatus
│   │   ├── booking/              # BookingForm, BarberSelector, SchedulePicker, BookingTracker
│   │   ├── products/             # ProductStore, CartModal, CheckoutModal
│   │   ├── dashboard/            # TodayActivity, BookingCalendar, Charts, Heatmap
│   │   └── datatable/            # MobileDataList, FilterBar, Pagination
│   ├── context/                  # AuthContext.tsx
│   ├── hooks/                    # useAppSettings.ts, usePendingCounts.ts
│   ├── lib/                      # socket-client.ts, booking-calendar.ts, pdf-generator.ts
│   └── theme/                    # colors.ts, typography.ts
├── assets/                       # Logo (/text-logo-blue.png, /barbersip-logo.png)
├── package.json
├── app.json
└── tailwind.config.js
```

---

## 4. Rencana Implementasi Bertahap (Phased Implementation Plan)

Implementasi akan dilakukan secara bertahap per modul agar setiap fase dapat diuji dan diverifikasi sebelum lanjut ke fase berikutnya:

### Tahap 1: Inisialisasi Proyek, Design System & Core UI (`Foundation`)
- [x] Inisialisasi proyek Expo React Native TypeScript di dalam folder `barbersip-mobile`.
- [x] Konfigurasi NativeWind (Tailwind CSS), `react-native-reanimated`, `lucide-react-native`, dan asset gambar logo dari `barbersip-frontend/public`.
- [x] Pembuatan token tema (`colors.ts`) dan komponen UI dasar yang identik dengan Next.js:
  - `GalaxyBackground`, `GradientCard` (dengan animasi *corner highlights*), `GlassCard`, `SummaryCard`, `PrimaryButton`, `FloatingInput`, `Modal`, `Alert` (pengganti SweetAlert2), `PageHeader`, `FilterBar`, dan `MobileDataList` (padanan `DataTable`).
- [x] Penyesuaian ringan `barbersip-backend/src/auth` agar mendukung `Bearer Token` di samping cookie `httpOnly` untuk sesi mobile.

### Tahap 2: Autentikasi, Navigasi Role-Based & Halaman Public (`Auth & Public`)
- [x] Implementasi `AuthContext` dengan penyimpanan sesi di `expo-secure-store`.
- [x] Implementasi halaman **Login** (`/login`) dan **Register Member 2 Langkah + Upload QRIS** (`/register`).
- [x] Implementasi **Role-Based Drawer & Tab Navigation** (`menu.ts`) lengkap dengan *realtime/polling badge counter* (`pendingBookings`, `pendingProductOrders`, `pendingMembers`, `pendingLeaves`) dan indikator `WebSocketStatus`.
- [x] Implementasi halaman **Public / Guest** (`/`): Hero, Guest Booking, Booking Tracker, Guest Product Store, dan Company Info.

### Tahap 3: Modul Role `member` (`Member Experience`)
- [x] **Dashboard Member**: `UserInfoCard`, upload foto profil, ganti password, modal rincian poin aktif, fitur pengajuan **Perpanjangan Member (Renewal)** beserta upload bukti bayar QRIS, 5 kartu ringkasan, dan `BookingCalendar`.
- [x] **Booking Member** (`/members-booking`) & **Booking Form**: Pemilihan capster, tanggal, slot jam, multi-layanan, validasi kupon, pemakaian poin member (`POINT` / `MIX` / `QRIS`), dan upload bukti bayar.
- [x] **Produk Member** (`/members-products`): Katalog dengan harga member, keranjang tersinkronisasi server, dan checkout QRIS.
- [x] **Riwayat Member** (`/members-history`): 3 tab (Booking, Pembelian Produk, Poin) dengan pencarian dan paginasi.
- [x] **Leaderboard Member** (`/top-members` & `/members-leaderboard`) dengan integrasi WebSocket (`leaderboard:subscribe`).

### Tahap 4: Modul Role `capster` (`Capster Operations & Attendance`)
- [x] **Dashboard Capster**: Profil capster, **Today's Activity** (antrean hari ini dengan WebSocket + aksi `Start`, `Finish`, `Cancel`), dan `BookingCalendar`.
- [x] **Booking History Capster** (`/service-booking` mode capster): 3 Summary Card (Total, Member, Guest), filter bulan, dan daftar jadwal booking.
- [x] **Attendance (Absensi GPS + Kamera)** (`/attendance`): Peta interaktif lokasi barbershop & posisi capster, kalkulasi jarak Haversine & validasi radius meter, kamera selfie check-in/check-out, serta validasi jam terlambat & durasi minimum check-out.
- [x] **Attendance History** (`/attendance-history`): Riwayat absensi & modal preview foto bukti check-in/check-out.

### Tahap 5: Modul Role `admin` — Layanan & Transaksi (`Admin Operations`)
- [x] **Dashboard Booking Admin** (`/dashboard`) & **Dashboard Produk** (`/dashboard-products`): Kartu ringkasan, filter bulan, grafik pendapatan/tren/jam/capster, serta **Heatmap Aktivitas**.
- [x] **Review Booking** (`/service-booking` mode admin): Konfirmasi, Tolak, Reset, Hapus, Preview Bukti Bayar, Modal **Correction Harga**, dan Modal **Reschedule Booking**.
- [x] **Review Pesanan Produk** (`/product-orders`): Filter status, preview bukti bayar, konfirmasi lunas (`PAID`), dan tolak (`REJECTED`).
- [x] **Cetak Struk** (`/payment`) & **Booking Manual** (`/booking`): Daftar pembayaran booking & produk, pembuatan & cetak/share struk thermal PDF (`expo-print` & `expo-sharing`).

### Tahap 6: Modul Role `admin` — Manajemen Master Data & Sistem (`Admin Management`)
- [x] **Manajemen Produk** (`/product`): CRUD produk, upload foto utama & galeri multi-foto (maks. 10), toggle aktif/nonaktif.
- [x] **Manajemen Capster** (`/service-capster`): CRUD capster, upload foto, toggle aktif, dan pengaturan **Jam Operasional Mingguan** (Senin–Minggu).
- [x] **Manajemen Harga Service** (`/management-pricelist`) & **Harga Event** (`/service-price-events`): Pengaturan grup layanan, urutan tampil, CRUD layanan, serta CRUD promo harga event (satuan & bulk per capster).
- [x] **Manajemen Kupon** (`/coupons`), **Hari Libur** (`/management-holidays`), dan **Cuti Capster** (`/management-leave`).
- [x] **Manajemen Member** (`/members`): Verifikasi member baru, tambah member manual, kelola pengajuan renewal (`Approve`/`Reject`), ubah tanggal `active_until`, dan tambah bonus poin.
- [x] **Pengaturan Aplikasi** (`/settings`): 8 tab konfigurasi lengkap beserta live preview template struk.

### Tahap 7: Modul Role `superadmin` (`Executive Analytics & PDF Export`)
- [x] **Dashboard Absensi Superadmin** (`/dashboard-attendance`): Rekap kehadiran bulanan seluruh capster beserta progress bar persentase kehadiran.
- [x] **Laporan Superadmin** (`/superadmin-reports`): Filter rentang tanggal-waktu (`from` - `to`) dan generator/export laporan PDF A4 Landscape untuk *Summary Booking*, *Summary Produk*, dan *Summary Attendance* menggunakan `expo-print` & `expo-sharing`.

### Tahap 8: Pengujian, Optimasi Performa & Build (`QA & Release`)
- [x] Pengujian lintas role (`superadmin`, `admin`, `capster`, `member`, `guest`) terhadap seluruh alur bisnis dan WebSocket.
- [x] Optimasi animasi, performa daftar panjang (`FlatList`/`FlashList`), penanganan izin kamera & lokasi di iOS/Android.
- [x] Konfigurasi build Android (`.apk` / `.aab`) & iOS.

