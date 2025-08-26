
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Header from '../components/Header';
import Card from '../components/Card';
import { getBarang, getKasHarian, getTransaksiKos } from '../services/supabase';
import { Barang, KasHarian, TransaksiKos } from '../types';

// --- SVG Icons for Cards ---
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

const Dashboard = () => {
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
                    getBarang(),
                    getKasHarian(),
                    getTransaksiKos()
                ]);
                setBarang(barangData);
                setKasHarian(kasData);
                setTransaksiKos(kosData);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat data dasbor.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);
    
    // --- Card Metrics Calculation ---
    const currentMonth = new Date().getMonth();
    const totalPemasukan = kasHarian.filter(k => new Date(k.tanggal).getMonth() === currentMonth).reduce((sum, k) => sum + k.total, 0)
        + transaksiKos.filter(t => new Date(t.tanggal).getMonth() === currentMonth).reduce((sum, t) => sum + t.penerimaan, 0);

    const totalPengeluaranKos = transaksiKos.filter(t => new Date(t.tanggal).getMonth() === currentMonth).reduce((sum, t) => sum + t.pengeluaran, 0);
    const totalKeuntungan = totalPemasukan - totalPengeluaranKos;

    const totalItemStok = barang.reduce((sum, b) => sum + b.stok_akhir, 0);
    const stokKritis = barang.filter(b => b.stok_akhir < 10).length;

    // --- Chart Data Processing ---
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

    if (loading) return (
        <div>
            <Header title="Dasbor Analitik" />
            <div className="flex justify-center items-center h-96">
                <LoadingSpinner />
            </div>
        </div>
    );

    if (error) return (
        <div>
            <Header title="Dasbor Analitik" />
            <div className="text-center text-red-700 text-xl p-8 bg-red-50 border border-red-200 rounded-lg shadow-md mt-8">
                <strong className="block text-2xl mb-2">Terjadi Kesalahan</strong>
                <p className="text-base">{error}</p>
                 <p className="text-sm text-gray-500 mt-4">Ini mungkin karena masalah koneksi atau konfigurasi Row Level Security (RLS) di database Supabase Anda. Pastikan RLS diatur untuk mengizinkan akses baca.</p>
            </div>
        </div>
    );

  return (
    <div>
      <Header title="Dasbor Analitik" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <Card title="Total Pemasukan (Bulan Ini)" value={formatCurrencyShort(totalPemasukan)} description="Dari Mart & Kos" icon={<MoneyIcon />} color="blue" />
        <Card title="Total Keuntungan (Bulan Ini)" value={formatCurrencyShort(totalKeuntungan)} description="Pemasukan - Pengeluaran Kos" icon={<ProfitIcon />} color="green" />
        <Card title="Total Item Stok" value={totalItemStok.toString()} description={`${barang.length} jenis barang`} icon={<StockIcon />} color="amber" />
        <Card title="Stok Kritis" value={`${stokKritis} Item`} description="Stok di bawah 10 unit" icon={<AlertIcon />} color="red" />
      </div>

      {/* Charts */}
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
                    <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
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

export default Dashboard;