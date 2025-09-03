# Jamfadly Mart & Kos Rosely - Sistem Akuntansi

Aplikasi sistem akuntansi modern untuk mengelola Jamfadly Mart & Kos Rosely dengan fitur lengkap untuk manajemen stok barang, kas harian, dan pendapatan kos.

## 🌟 Fitur Utama

- **Dashboard Interaktif** - Visualisasi data real-time dengan grafik yang informatif
- **Manajemen Stok Barang** - Kelola inventori dengan mudah
- **Pencatatan Kas Harian** - Catat pemasukan dan pengeluaran harian
- **Manajemen Pendapatan Kos** - Kelola pembayaran dan status kamar kos
- **Export Laporan PDF** - Generate laporan dalam format PDF
- **Responsive Design** - Bekerja sempurna di desktop dan mobile

## 🚀 Teknologi yang Digunakan

- **Frontend Framework:** React 19 + TypeScript
- **Routing:** React Router v7
- **Build Tool:** Vite
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **PDF Generation:** jsPDF + jsPDF-AutoTable

## 📦 Instalasi

### Prerequisites

- Node.js 18+ 
- npm atau yarn
- Git

### Setup Lokal

1. Clone repository:
```bash
git clone https://github.com/yourusername/jamfadly-mart-kos-rosely.git
cd jamfadly-mart-kos-rosely
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` dan masukkan kredensial Supabase Anda:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Jalankan development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🌐 Deployment

### Deploy ke Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/jamfadly-mart-kos-rosely)

1. Klik tombol di atas atau import project di Vercel Dashboard
2. Set environment variables di Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

### Deploy ke Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/jamfadly-mart-kos-rosely)

1. Klik tombol di atas atau drag & drop folder `dist` ke Netlify
2. Set environment variables di Netlify Dashboard
3. Deploy!

### Deploy ke GitHub Pages

1. Build untuk GitHub Pages:
```bash
npm run build:github
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Add deploy script to package.json:
```json
"scripts": {
  "deploy:github": "npm run build:github && gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy:github
```

### Deploy ke Cloudflare Pages

1. Build project:
```bash
npm run build
```

2. Deploy menggunakan Wrangler:
```bash
npx wrangler pages deploy dist
```

Atau melalui Cloudflare Dashboard:
- Connect GitHub repository
- Build command: `npm run build`
- Build output directory: `dist`

## 📊 Database Setup (Supabase)

1. Buat project baru di [Supabase](https://supabase.com)

2. Jalankan SQL berikut untuk membuat tables:

```sql
-- Table untuk Stok Barang
CREATE TABLE stok_barang (
  id SERIAL PRIMARY KEY,
  kode_barang VARCHAR(50) UNIQUE NOT NULL,
  nama_barang VARCHAR(200) NOT NULL,
  kategori VARCHAR(100),
  stok_awal INTEGER DEFAULT 0,
  stok_masuk INTEGER DEFAULT 0,
  stok_keluar INTEGER DEFAULT 0,
  stok_akhir INTEGER GENERATED ALWAYS AS (stok_awal + stok_masuk - stok_keluar) STORED,
  harga_satuan DECIMAL(12,2),
  total_nilai DECIMAL(15,2) GENERATED ALWAYS AS (stok_akhir * harga_satuan) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table untuk Kas Harian
CREATE TABLE kas_harian (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  keterangan TEXT NOT NULL,
  jenis VARCHAR(20) CHECK (jenis IN ('pemasukan', 'pengeluaran')),
  jumlah DECIMAL(12,2) NOT NULL,
  kategori VARCHAR(100),
  metode_pembayaran VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table untuk Transaksi Kos
CREATE TABLE transaksi_kos (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  nama_penghuni VARCHAR(200) NOT NULL,
  nomor_kamar VARCHAR(50) NOT NULL,
  jenis_pembayaran VARCHAR(50),
  jumlah DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'lunas',
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_kas_harian_tanggal ON kas_harian(tanggal);
CREATE INDEX idx_transaksi_kos_tanggal ON transaksi_kos(tanggal);
CREATE INDEX idx_stok_barang_kode ON stok_barang(kode_barang);
```

3. Enable Row Level Security (RLS) jika diperlukan

## 🛠️ Development

### Struktur Project

```
jamfadly-mart-kos-rosely/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services (Supabase)
│   ├── types.ts         # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── public/              # Static assets
├── dist/                # Production build
├── .env.local          # Environment variables (not in git)
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:github` - Build for GitHub Pages
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 🐛 Troubleshooting

### Build Errors

Jika mengalami error saat build, pastikan:
- Node.js version 18+
- Semua dependencies terinstall dengan benar
- Environment variables sudah diset

### Supabase Connection Issues

- Pastikan URL dan API Key benar
- Check CORS settings di Supabase Dashboard
- Pastikan RLS policies sudah diset dengan benar

### Deployment Issues

- Untuk Vercel/Netlify: Pastikan environment variables sudah diset
- Untuk GitHub Pages: Gunakan `npm run build:github` untuk build dengan base URL yang benar
- Check console browser untuk error messages

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

Jika ada pertanyaan atau butuh bantuan, silakan buka issue di GitHub repository.