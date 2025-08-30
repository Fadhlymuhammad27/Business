
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- TYPES.TS CONTENT ---
interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  stok_awal: number;
  barang_masuk: number;
  barang_keluar: number;
  alihkan: string;
  stok_akhir: number;
  harga_jual: number;
  hpb: number;
}

interface KasHarian {
  id: number;
  tanggal: string; // YYYY-MM-DD
  rp_100k: number;
  rp_50k: number;
  rp_20k: number;
  rp_10k: number;
  rp_5k: number;
  rp_2k: number;
  rp_1k: number;
  rp_500: number;
  beli_beras: number | null;
  barter_lili: number | null;
  total: number;
}

interface TransaksiKos {
  id: number;
  tanggal: string; // YYYY-MM-DD
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
}

// --- SERVICES/SUPABASE.TS CONTENT ---
const supabaseUrl = 'https://jxnmmlkzeyohhhdmtmcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bm1tbGt6ZXlvaGhoZG10bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTY5NTAsImV4cCI6MjA3MTc3Mjk1MH0.zaD-4Nj_UY8pmldJW4T5F4WUcdFdERCyEtB2pZxijkc';

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseServiceError extends Error {
    details?: string;
    hint?: string;
    code?: string;

    constructor(error: PostgrestError, context: string) {
        super(error.message); 
        this.name = 'SupabaseServiceError';
        this.message = `Gagal saat ${context}: ${error.message}`;
        this.details = error.details;
        this.hint = error.hint;
        this.code = error.code;
    }
}

const handleSupabaseError = (error: PostgrestError | null, context: string): void => {
    if (error) {
        console.error(`Error ${context}:`, error);
        throw new SupabaseServiceError(error, context);
    }
};

const getBarang = async (): Promise<Barang[]> => {
  const { data, error } = await supabase.from('stok_barang').select('*').order('kode_barang', { ascending: true });
  handleSupabaseError(error, 'mengambil data barang');
  return data || [];
};
const addBarang = async (barang: Omit<Barang, 'id' | 'stok_akhir'>): Promise<Barang[] | null> => {
  const { data, error } = await supabase.from('stok_barang').insert([barang]).select();
  handleSupabaseError(error, 'menambah barang');
  return data;
};
const updateBarang = async (id: number, barang: Partial<Omit<Barang, 'id' | 'stok_akhir'>>): Promise<Barang[] | null> => {
    const { data, error } = await supabase.from('stok_barang').update(barang).eq('id', id).select();
    handleSupabaseError(error, `memperbarui barang (id: ${id})`);
    return data;
};
const deleteBarang = async (id: number): Promise<void> => {
    const { error } = await supabase.from('stok_barang').delete().eq('id', id);
    handleSupabaseError(error, `menghapus barang (id: ${id})`);
};
const getKasHarian = async (): Promise<KasHarian[]> => {
  const { data, error } = await supabase.from('kas_harian').select('*').order('tanggal', { ascending: false });
  handleSupabaseError(error, 'mengambil data kas harian');
  return data || [];
};
const addKasHarian = async (kas: Omit<KasHarian, 'id' | 'total'>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').insert([kas]).select();
    handleSupabaseError(error, 'menambah kas harian');
    return data;
};
const updateKasHarian = async (id: number, kas: Partial<Omit<KasHarian, 'id' | 'total'>>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').update(kas).eq('id', id).select();
    handleSupabaseError(error, `memperbarui kas harian (id: ${id})`);
    return data;
};
const deleteKasHarian = async (id: number): Promise<void> => {
    const { error } = await supabase.from('kas_harian').delete().eq('id', id);
    handleSupabaseError(error, `menghapus kas harian (id: ${id})`);
};
const getTransaksiKos = async (): Promise<TransaksiKos[]> => {
  const { data, error } = await supabase.from('transaksi_kos').select('*').order('tanggal', { ascending: true });
  handleSupabaseError(error, 'mengambil data transaksi kos');
  return data || [];
};
const addTransaksiKos = async (transaksi: Omit<TransaksiKos, 'id'>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').insert([transaksi]).select();
    handleSupabaseError(error, 'menambah transaksi kos');
    return data;
};
const updateTransaksiKos = async (id: number, transaksi: Partial<Omit<TransaksiKos, 'id'>>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').update(transaksi).eq('id', id).select();
    handleSupabaseError(error, `memperbarui transaksi kos (id: ${id})`);
    return data;
};
const deleteTransaksiKos = async (id: number): Promise<void> => {
    const { error } = await supabase.from('transaksi_kos').delete().eq('id', id);
    handleSupabaseError(error, `menghapus transaksi kos (id: ${id})`);
};

// --- ICONS ---
const DashboardIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const PackageIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const CashIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const HomeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3V16a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1V10l-7-7-7 7z" />
  </svg>
);
const PlusIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
  </svg>
);
const DeleteIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// --- COMPONENTS ---
const Sidebar = () => {
  const navItems = [
    { to: '/', text: 'Dasbor', icon: DashboardIcon },
    { to: '/stok-barang', text: 'Stok Barang', icon: PackageIcon },
    { to: '/kas-harian', text: 'Kas Harian', icon: CashIcon },
    { to: '/pendapatan-kos', text: 'Pendapatan Kos', icon: HomeIcon },
  ];
  const linkClasses = "flex items-center px-6 py-4 text-lg font-semibold transition-colors duration-200";
  const activeLinkClasses = "bg-brand-secondary text-white";
  const inactiveLinkClasses = "text-white hover:bg-brand-secondary";

  return (
    <div className="w-72 bg-brand-primary flex flex-col shadow-2xl">
      <div className="flex items-center justify-center h-24 border-b-2 border-brand-secondary">
        <h1 className="text-2xl font-bold text-white text-center leading-tight">
          Jamfadly Mart<br/>& Kos Rosely
        </h1>
      </div>
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
          >
            <item.icon className="w-7 h-7 mr-4" />
            {item.text}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 text-center text-sm text-brand-light">
        <p>&copy; {new Date().getFullYear()} JM & KR</p>
        <p>Sistem Akuntansi v1.0</p>
      </div>
    </div>
  );
};

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}
const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red';
}
const Card: React.FC<CardProps> = ({ title, value, description, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-start space-x-6">
      <div className={`p-4 rounded-full ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium text-gray-500">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-md text-gray-400 mt-2">{description}</p>
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-brand-danger">{title}</h2>
           <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-lg text-gray-600 mb-8">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-3 bg-brand-danger text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

// Dashboard.tsx
const Dashboard = () => {
    const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
    const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    const StockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    const LoadingSpinner = () => <div className="flex justify-center items-center h-full"><svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    const formatCurrency = (value: number) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
    const formatCurrencyShort = (value: number) => {
        if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}Jt`;
        if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(1)}Rb`;
        return `Rp ${value}`;
    }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [barang, setBarang] = useState<Barang[]>([]);
    const [kasHarian, setKasHarian] = useState<KasHarian[]>([]);
    const [transaksiKos, setTransaksiKos] = useState<TransaksiKos[]>([]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [barangData, kasData, kosData] = await Promise.all([
                    getBarang(), getKasHarian(), getTransaksiKos()
                ]);
                setBarang(barangData);
                setKasHarian(kasData);
                setTransaksiKos(kosData);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Gagal memuat data dasbor.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);
    
    const currentMonth = new Date().getMonth();
    const totalPemasukan = kasHarian.filter(k => new Date(k.tanggal).getMonth() === currentMonth).reduce((sum, k) => sum + k.total, 0)
        + transaksiKos.filter(t => new Date(t.tanggal).getMonth() === currentMonth).reduce((sum, t) => sum + t.penerimaan, 0);
    const totalPengeluaranKos = transaksiKos.filter(t => new Date(t.tanggal).getMonth() === currentMonth).reduce((sum, t) => sum + t.pengeluaran, 0);
    const totalKeuntungan = totalPemasukan - totalPengeluaranKos;
    const totalItemStok = barang.reduce((sum, b) => sum + b.stok_akhir, 0);
    const stokKritis = barang.filter(b => b.stok_akhir < 10).length;

    const dailyCashData = kasHarian
        .map(k => ({ date: new Date(k.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }), total: k.total / 1000 }))
        .reverse();

    const monthlyData = kasHarian.reduce((acc, curr) => {
        const month = new Date(curr.tanggal).toLocaleString('id-ID', { month: 'short' });
        if (!acc[month]) acc[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
        acc[month].pemasukan += curr.total;
        return acc;
    }, {} as any);

    transaksiKos.forEach(t => {
        const month = new Date(t.tanggal).toLocaleString('id-ID', { month: 'short' });
        if (!monthlyData[month]) monthlyData[month] = { name: month, pemasukan: 0, pengeluaran: 0 };
        monthlyData[month].pemasukan += t.penerimaan;
        monthlyData[month].pengeluaran += t.pengeluaran;
    });
    
    const expenseCategoryData = transaksiKos.reduce((acc, curr) => {
        if(curr.pengeluaran > 0) {
            let category = 'Lain-lain';
            if (curr.uraian.toLowerCase().includes('listrik')) category = 'Listrik';
            else if (curr.uraian.toLowerCase().includes('wifi')) category = 'Wifi';
            else if (curr.uraian.toLowerCase().includes('sampah')) category = 'Kebersihan';
            else if (curr.uraian.toLowerCase().includes('keamanan')) category = 'Keamanan';
            
            const existing = acc.find(item => item.name === category);
            if(existing) {
                existing.value += curr.pengeluaran;
            } else {
                acc.push({ name: category, value: curr.pengeluaran });
            }
        }
        return acc;
    }, [] as {name: string, value: number}[]);

    if (loading) return <div><Header title="Dasbor Analitik" /><div className="flex justify-center items-center h-96"><LoadingSpinner /></div></div>;
    if (error) return <div><Header title="Dasbor Analitik" /><div className="text-left text-red-800 p-6 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-md mt-8"><strong className="block text-xl font-bold mb-2">Terjadi Kesalahan</strong><p className="text-base text-gray-700 whitespace-pre-wrap">{error}</p></div></div>;

  return (
    <div>
      <Header title="Dasbor Analitik" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <Card title="Total Pemasukan (Bulan Ini)" value={formatCurrencyShort(totalPemasukan)} description="Dari Mart & Kos" icon={<MoneyIcon />} color="blue" />
        <Card title="Total Keuntungan (Bulan Ini)" value={formatCurrencyShort(totalKeuntungan)} description="Pemasukan - Pengeluaran Kos" icon={<ProfitIcon />} color="green" />
        <Card title="Total Item Stok" value={totalItemStok.toString()} description={`${barang.length} jenis barang`} icon={<StockIcon />} color="amber" />
        <Card title="Stok Kritis" value={`${stokKritis} Item`} description="Stok di bawah 10 unit" icon={<AlertIcon />} color="red" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Pemasukan vs Pengeluaran</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.values(monthlyData)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000000}Jt`} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #eee' }} formatter={(value: number) => formatCurrency(value)} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="pemasukan" fill="#1976D2" name="Pemasukan" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="pengeluaran" fill="#FFC107" name="Pengeluaran" radius={[10, 10, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Arus Kas Harian (dalam Ribuan)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyCashData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}Jt`} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #eee' }} formatter={(value: number) => formatCurrency(value * 1000)} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="total" name="Total Kas Masuk" stroke="#2E7D32" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Kategori Pengeluaran Kos Rosely</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={expenseCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {expenseCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// StokBarang.tsx
const StokBarang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Barang> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Barang | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const barangData = await getBarang();
      setData(barangData);
      setError(null);
    } catch (err: any) {
        setError(err.message || 'Gagal memuat data stok barang.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = useMemo(() => data.filter(item =>
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase())
  ), [data, searchTerm]);

  const getStockColor = (stock: number) => {
    if (stock < 10) return 'bg-red-100 text-red-800';
    if (stock < 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Stok Barang - Jamfadly Mart", 14, 20);
    (doc as any).autoTable({
      startY: 25,
      head: [['Kode', 'Nama Barang', 'Stok Awal', 'Masuk', 'Keluar', 'Stok Akhir', 'Harga Jual']],
      body: filteredData.map(item => [item.kode_barang, item.nama_barang, item.stok_awal, item.barang_masuk, item.barang_keluar, item.stok_akhir, item.harga_jual.toLocaleString('id-ID')]),
    });
    doc.save(`laporan-stok-barang-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleOpenModal = (item: Partial<Barang> | null) => { setCurrentItem(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setCurrentItem(null); setIsModalOpen(false); };

  const handleSave = async (formData: Partial<Barang>) => {
    setIsSubmitting(true);
    try {
        const { id, ...rest } = formData;
        const submissionData = {
            kode_barang: rest.kode_barang || '', nama_barang: rest.nama_barang || '', stok_awal: Number(rest.stok_awal) || 0,
            barang_masuk: Number(rest.barang_masuk) || 0, barang_keluar: Number(rest.barang_keluar) || 0, alihkan: rest.alihkan || '',
            harga_jual: Number(rest.harga_jual) || 0, hpb: Number(rest.hpb) || 0,
        }
        if (id) { await updateBarang(id, submissionData); } else { await addBarang(submissionData); }
        fetchData(); handleCloseModal();
    } catch (err: any) { alert(`Gagal menyimpan data: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteBarang(itemToDelete.id);
        fetchData(); setItemToDelete(null);
    } catch (err: any) { alert(`Gagal menghapus data: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <Header title="Laporan Stok Barang">
        <button className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary transition-colors flex items-center" onClick={() => handleOpenModal({})}><PlusIcon className="w-6 h-6 mr-2"/>Tambah Barang</button>
        <button className="px-4 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors" onClick={handleExportPDF}>Unduh Laporan (PDF)</button>
      </Header>
      <div className="mb-6"><input type="text" placeholder="Cari barang..." className="w-full max-w-lg p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center items-center h-96"><svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
          : error ? <div className="p-6 text-red-800 bg-red-50 m-4"><p className="font-bold">Gagal memuat data</p><p>{error}</p></div>
          : filteredData.length === 0 ? <p className="text-center text-gray-500 p-8">Tidak ada data.</p>
          : (
            <table className="w-full text-left text-lg">
              {/* FIX: Replaced invalid JSX tag 'tr_class_1_' with 'tr'. */}
              <thead className="bg-gray-100"><tr>
                  {['Kode', 'Nama Barang', 'Stok Awal', 'Masuk', 'Keluar', 'Alihkan', 'Stok Akhir', 'Harga Jual', 'HPB', 'Aksi'].map(h => <th key={h} className="p-4 font-bold text-gray-600">{h}</th>)}
                </tr></thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={item.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-semibold text-brand-primary">{item.kode_barang}</td><td className="p-4 font-semibold">{item.nama_barang}</td>
                    <td className="p-4 text-center">{item.stok_awal}</td><td className="p-4 text-center text-green-600">{item.barang_masuk}</td>
                    <td className="p-4 text-center text-red-600">{item.barang_keluar}</td><td className="p-4">{item.alihkan || '-'}</td>
                    <td className="p-4 text-center"><span className={`px-3 py-1 font-bold rounded-full ${getStockColor(item.stok_akhir)}`}>{item.stok_akhir}</span></td>
                    <td className="p-4">{item.harga_jual.toLocaleString('id-ID')}</td><td className="p-4">{item.hpb.toLocaleString('id-ID')}</td>
                    <td className="p-4"><div className="flex justify-center space-x-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                        <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><DeleteIcon /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {isModalOpen && currentItem && <StokBarangForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={currentItem} isSubmitting={isSubmitting}/>}
      {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} title="Konfirmasi Hapus" message={`Yakin ingin menghapus "${itemToDelete.nama_barang}"?`}/>}
    </div>
  );
};
interface StokBarangFormProps { isOpen: boolean; onClose: () => void; onSave: (item: Partial<Barang>) => void; item: Partial<Barang>; isSubmitting: boolean; }
const StokBarangForm: React.FC<StokBarangFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<Barang>>(item);
    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary";
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Barang' : 'Tambah Barang Baru'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block font-medium mb-1">Kode Barang</label><input type="text" name="kode_barang" value={formData.kode_barang || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">Nama Barang</label><input type="text" name="nama_barang" value={formData.nama_barang || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">Stok Awal</label><input type="number" name="stok_awal" value={formData.stok_awal || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">Alihkan</label><input type="text" name="alihkan" value={formData.alihkan || ''} onChange={handleChange} className={inputClass} /></div>
                    <div><label className="block font-medium mb-1">Barang Masuk</label><input type="number" name="barang_masuk" value={formData.barang_masuk || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">Barang Keluar</label><input type="number" name="barang_keluar" value={formData.barang_keluar || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">Harga Jual (Rp)</label><input type="number" name="harga_jual" value={formData.harga_jual || ''} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className="block font-medium mb-1">HPB (Rp)</label><input type="number" name="hpb" value={formData.hpb || ''} onChange={handleChange} className={inputClass} required /></div>
                </div>
                <div className="flex justify-end pt-6 border-t mt-8">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 font-bold rounded-lg mr-4">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-success text-white font-bold rounded-lg disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
            </form>
        </Modal>
    );
};

// KasHarian.tsx
const KasHarianPage = () => {
  const [data, setData] = useState<KasHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<KasHarian> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<KasHarian | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setData(await getKasHarian()); setError(null);
    } catch (err: any) { setError(err.message || 'Gagal memuat data.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("Laporan Penerimaan Kas Harian - Jamfadly Mart", 14, 20);
    (doc as any).autoTable({
        startY: 25,
        head: [['Tanggal', '100rb', '50rb', '20rb', '10rb', '5rb', '2rb', '1rb', '500', 'Total']],
        body: data.map(item => [ formatDate(item.tanggal), item.rp_100k, item.rp_50k, item.rp_20k, item.rp_10k, item.rp_5k, item.rp_2k, item.rp_1k, item.rp_500, item.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) ]),
    });
    doc.save(`laporan-kas-harian-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  const handleOpenModal = (item: Partial<KasHarian> | null) => { setCurrentItem(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setCurrentItem(null); setIsModalOpen(false); };
  const handleSave = async (formData: Partial<KasHarian>) => {
    setIsSubmitting(true);
    try {
        const { id, total, ...rest } = formData;
        const submissionData = Object.entries(rest).reduce((acc, [key, value]) => {
            (acc as any)[key] = key === 'tanggal' ? value : Number(value) || 0; return acc;
        }, {} as Omit<KasHarian, 'id' | 'total'>);
        if (!submissionData.tanggal) throw new Error('Tanggal wajib diisi.');
        if (id) { await updateKasHarian(id, submissionData); } else { await addKasHarian(submissionData); }
        fetchData(); handleCloseModal();
    } catch (err: any) { alert(`Gagal: ${err.message}`); } finally { setIsSubmitting(false); }
  };
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteKasHarian(itemToDelete.id);
        fetchData(); setItemToDelete(null);
    } catch (err: any) { alert(`Gagal hapus: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <Header title="Laporan Penerimaan Kas Harian">
         <button className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary flex items-center" onClick={() => handleOpenModal({ tanggal: new Date().toISOString().split('T')[0] })}><PlusIcon className="w-6 h-6 mr-2"/>Tambah Data</button>
        <button className="px-4 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700" onClick={handleExportPDF}>Unduh Laporan (PDF)</button>
      </Header>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center items-center h-96"><svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
          : error ? <div className="p-6 text-red-800 bg-red-50 m-4"><p className="font-bold">Gagal memuat data</p><p>{error}</p></div>
          : data.length === 0 ? <p className="text-center text-gray-500 p-8">Tidak ada data.</p>
          : (
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-100"><tr>
                  <th className="p-4 font-bold text-gray-600">Tanggal</th>
                  {['100rb', '50rb', '20rb', '10rb', '5rb', '2rb', '1rb', '500'].map(d => <th key={d} className="p-4 font-bold text-gray-600 text-center">Rp. {d}</th>)}
                  <th className="p-4 font-bold text-gray-600 text-right">Total</th><th className="p-4 font-bold text-gray-600 text-center">Aksi</th>
              </tr></thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={item.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-semibold">{formatDate(item.tanggal)}</td>
                    <td className="p-4 text-center">{item.rp_100k}</td><td className="p-4 text-center">{item.rp_50k}</td><td className="p-4 text-center">{item.rp_20k}</td>
                    <td className="p-4 text-center">{item.rp_10k}</td><td className="p-4 text-center">{item.rp_5k}</td><td className="p-4 text-center">{item.rp_2k}</td>
                    <td className="p-4 text-center">{item.rp_1k}</td><td className="p-4 text-center">{item.rp_500}</td>
                    <td className="p-4 text-right font-bold text-brand-primary">{item.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</td>
                    <td className="p-4"><div className="flex justify-center space-x-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                        <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><DeleteIcon /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
       {isModalOpen && currentItem && <KasHarianForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={currentItem} isSubmitting={isSubmitting}/>}
       {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} title="Konfirmasi Hapus" message={`Yakin ingin hapus data tanggal ${formatDate(itemToDelete.tanggal)}?`}/>}
    </div>
  );
};
interface KasHarianFormProps { isOpen: boolean; onClose: () => void; onSave: (item: Partial<KasHarian>) => void; item: Partial<KasHarian>; isSubmitting: boolean; }
const KasHarianForm: React.FC<KasHarianFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<KasHarian>>(item);
    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-brand-secondary";
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Data Kas' : 'Tambah Data Kas'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div><label className="block font-medium mb-1">Tanggal</label><input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} className={inputClass} required /></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(['rp_100k', 'rp_50k', 'rp_20k', 'rp_10k', 'rp_5k', 'rp_2k', 'rp_1k', 'rp_500'] as const).map(d => (
                         <div key={d}><label className="block font-medium mb-1">Jml {d.replace('rp_', '').toUpperCase()}</label><input type="number" name={d} value={formData[d] as number || ''} onChange={handleChange} className={inputClass} required /></div>
                    ))}
                </div>
                <div className="flex justify-end pt-6 border-t mt-8"><button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 font-bold rounded-lg mr-4">Batal</button><button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-success text-white font-bold rounded-lg disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
        </Modal>
    );
}

// PendapatanKos.tsx
const PendapatanKos = () => {
  const [data, setData] = useState<TransaksiKos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<TransaksiKos> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TransaksiKos | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try { setLoading(true); setData(await getTransaksiKos()); setError(null); } 
    catch (err: any) { setError(err.message || 'Gagal memuat data.'); } 
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const dataWithSaldo = useMemo(() => data.reduce((acc, item) => {
    const prevSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
    acc.push({ ...item, saldo: prevSaldo + item.penerimaan - item.pengeluaran }); return acc;
  }, [] as (TransaksiKos & { saldo: number })[]), [data]);

  const formatCurrency = (amount: number) => amount === 0 ? '-' : amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Pendapatan Kos Rosely", 14, 20);
    (doc as any).autoTable({
        startY: 25, head: [['Tanggal', 'Uraian', 'Penerimaan', 'Pengeluaran', 'Saldo']],
        body: dataWithSaldo.map(i => [formatDate(i.tanggal), i.uraian, formatCurrency(i.penerimaan), formatCurrency(i.pengeluaran), formatCurrency(i.saldo)]),
    });
    doc.save(`laporan-kos-rosely-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleOpenModal = (item: Partial<TransaksiKos> | null) => { setCurrentItem(item); setIsModalOpen(true); };
  const handleCloseModal = () => { setCurrentItem(null); setIsModalOpen(false); };
  const handleSave = async (formData: Partial<TransaksiKos>) => {
    setIsSubmitting(true);
    try {
        const { id, ...rest } = formData;
        const submissionData = {
            tanggal: rest.tanggal || new Date().toISOString().split('T')[0], uraian: rest.uraian || '',
            penerimaan: Number(rest.penerimaan) || 0, pengeluaran: Number(rest.pengeluaran) || 0,
        };
        if (id) { await updateTransaksiKos(id, submissionData); } else { await addTransaksiKos(submissionData); }
        fetchData(); handleCloseModal();
    } catch (err: any) { alert(`Gagal: ${err.message}`); } finally { setIsSubmitting(false); }
  };
  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteTransaksiKos(itemToDelete.id);
        fetchData(); setItemToDelete(null);
    } catch (err: any) { alert(`Gagal hapus: ${err.message}`); } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <Header title="Laporan Pendapatan Kos Rosely">
         <button className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary flex items-center" onClick={() => handleOpenModal({ tanggal: new Date().toISOString().split('T')[0] })}><PlusIcon className="w-6 h-6 mr-2"/>Tambah Transaksi</button>
        <button className="px-4 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700" onClick={handleExportPDF}>Unduh Laporan (PDF)</button>
      </Header>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? <div className="flex justify-center items-center h-96"><svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
          : error ? <div className="p-6 text-red-800 bg-red-50 m-4"><p className="font-bold">Gagal memuat data</p><p>{error}</p></div>
          : data.length === 0 ? <p className="text-center text-gray-500 p-8">Tidak ada data.</p>
          : (
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-100"><tr>
                  <th className="p-4 font-bold text-gray-600 w-1/6">Tanggal</th><th className="p-4 font-bold text-gray-600 w-2/5">Uraian</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Penerimaan</th><th className="p-4 font-bold text-gray-600 text-right">Pengeluaran</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Saldo</th><th className="p-4 font-bold text-gray-600 text-center">Aksi</th>
              </tr></thead>
              <tbody>
                {dataWithSaldo.map((item, i) => (
                    <tr key={item.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4">{formatDate(item.tanggal)}</td><td className="p-4 font-semibold">{item.uraian}</td>
                      <td className="p-4 text-right text-green-600">{formatCurrency(item.penerimaan)}</td><td className="p-4 text-right text-red-600">{formatCurrency(item.pengeluaran)}</td>
                      <td className="p-4 text-right font-bold text-brand-primary">{formatCurrency(item.saldo)}</td>
                      <td className="p-4"><div className="flex justify-center space-x-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                          <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><DeleteIcon /></button>
                      </div></td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {isModalOpen && currentItem && <TransaksiKosForm isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} item={currentItem} isSubmitting={isSubmitting}/>}
      {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDelete} title="Konfirmasi Hapus" message={`Yakin hapus transaksi "${itemToDelete.uraian}"?`}/>}
    </div>
  );
};
interface TransaksiKosFormProps { isOpen: boolean; onClose: () => void; onSave: (item: Partial<TransaksiKos>) => void; item: Partial<TransaksiKos>; isSubmitting: boolean; }
const TransaksiKosForm: React.FC<TransaksiKosFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<TransaksiKos>>(item);
    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-brand-secondary";
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Transaksi' : 'Tambah Transaksi'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div><label className="block font-medium mb-1">Tanggal</label><input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} className={inputClass} required /></div>
                <div><label className="block font-medium mb-1">Uraian</label><textarea name="uraian" value={formData.uraian || ''} onChange={handleChange} className={`${inputClass} h-24`} required /></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block font-medium mb-1">Penerimaan (Rp)</label><input type="number" name="penerimaan" value={formData.penerimaan || ''} onChange={handleChange} className={inputClass} /></div>
                    <div><label className="block font-medium mb-1">Pengeluaran (Rp)</label><input type="number" name="pengeluaran" value={formData.pengeluaran || ''} onChange={handleChange} className={inputClass} /></div>
                </div>
                <div className="flex justify-end pt-6 border-t mt-8"><button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 font-bold rounded-lg mr-4">Batal</button><button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-success text-white font-bold rounded-lg disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button></div>
            </form>
        </Modal>
    );
};


// --- APP & RENDER ---
function App() {
  return (
    <HashRouter>
      <div className="flex h-screen bg-brand-bg font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stok-barang" element={<StokBarang />} />
            <Route path="/kas-harian" element={<KasHarianPage />} />
            <Route path="/pendapatan-kos" element={<PendapatanKos />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <App />
);