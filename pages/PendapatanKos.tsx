import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { TransaksiKos } from '../types';
import { getTransaksiKos, addTransaksiKos, updateTransaksiKos, deleteTransaksiKos, SupabaseServiceError } from '../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

const PendapatanKos = () => {
  const [data, setData] = useState<TransaksiKos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<TransaksiKos> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<TransaksiKos | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const kosData = await getTransaksiKos();
      setData(kosData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      if (err instanceof SupabaseServiceError && err.code === '42501') {
          setError('Akses ditolak. Periksa konfigurasi Row Level Security (RLS) di Supabase untuk tabel "transaksi_kos".');
      } else {
          setError(err.message || 'Gagal memuat data pendapatan kos.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FIX: Calculate running balance in a pure way using useMemo to prevent render-side effects.
  const dataWithSaldo = useMemo(() => {
    return data.reduce((acc, item) => {
        const previousSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
        const saldo = previousSaldo + item.penerimaan - item.pengeluaran;
        acc.push({ ...item, saldo });
        return acc;
    }, [] as (TransaksiKos & { saldo: number })[]);
  }, [data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const bodyData = dataWithSaldo.map(item => [
        formatDate(item.tanggal),
        item.uraian,
        formatCurrency(item.penerimaan),
        formatCurrency(item.pengeluaran),
        formatCurrency(item.saldo)
    ]);

    doc.text("Laporan Pendapatan Kos Rosely", 14, 20);
    (doc as any).autoTable({
        startY: 25,
        head: [['Tanggal', 'Uraian', 'Penerimaan', 'Pengeluaran', 'Saldo']],
        body: bodyData,
    });
    doc.save(`laporan-kos-rosely-${new Date().toISOString().slice(0,10)}.pdf`);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for timezone offset
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return adjustedDate.toLocaleDateString('id-ID', options);
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  };
  
  const totalPenerimaan = data.reduce((sum, item) => sum + item.penerimaan, 0);
  const totalPengeluaran = data.reduce((sum, item) => sum + item.pengeluaran, 0);
  const totalSaldo = totalPenerimaan - totalPengeluaran;

  const handleOpenModal = (item: Partial<TransaksiKos> | null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData: Partial<TransaksiKos>) => {
    setIsSubmitting(true);
    try {
        const { id, ...rest } = formData;
        const submissionData = {
            tanggal: rest.tanggal || new Date().toISOString().split('T')[0],
            uraian: rest.uraian || '',
            penerimaan: Number(rest.penerimaan) || 0,
            pengeluaran: Number(rest.pengeluaran) || 0,
        };

        if (id) {
            await updateTransaksiKos(id, submissionData);
        } else {
            await addTransaksiKos(submissionData);
        }
        fetchData();
        handleCloseModal();
    } catch (err: any) {
        alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    try {
        await deleteTransaksiKos(itemToDelete.id);
        fetchData();
        setItemToDelete(null);
    } catch (err: any) {
        alert(`Gagal menghapus data: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Laporan Pendapatan Kos Rosely">
         <button 
            className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary transition-colors flex items-center"
            onClick={() => handleOpenModal({ tanggal: new Date().toISOString().split('T')[0] })}
        >
            <PlusIcon className="w-6 h-6 mr-2"/>
            Tambah Transaksi
        </button>
        <button 
            className="px-4 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
            onClick={handleExportPDF}
        >
            Unduh Laporan (PDF)
        </button>
      </Header>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-96">
                <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             </div>
          ) : error ? (
            <div className="p-6 text-left text-red-800 bg-red-50 border-l-4 border-red-400 rounded-lg m-4">
                <p className="font-bold text-lg mb-2">Gagal memuat data transaksi kos</p>
                <p className="whitespace-pre-wrap">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-500 p-8 text-xl">Tidak ada data transaksi kos.</p>
          ) : (
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600 w-1/6">Tanggal</th>
                  <th className="p-4 font-bold text-gray-600 w-2/5">Uraian</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Penerimaan</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Pengeluaran</th>
                  <th className="p-4 font-bold text-gray-600 text-right">Saldo</th>
                  <th className="p-4 font-bold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataWithSaldo.map((item, index) => (
                    <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium text-gray-700">{formatDate(item.tanggal)}</td>
                      <td className="p-4 font-semibold text-gray-800">{item.uraian}</td>
                      <td className="p-4 text-right text-green-600 font-medium">{formatCurrency(item.penerimaan)}</td>
                      <td className="p-4 text-right text-red-600 font-medium">{formatCurrency(item.pengeluaran)}</td>
                      <td className="p-4 text-right font-bold text-brand-primary">{formatCurrency(item.saldo)}</td>
                      <td className="p-4">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"><EditIcon /></button>
                          <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"><DeleteIcon /></button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot className="bg-gray-200 font-bold text-lg">
                  <tr>
                      <td colSpan={2} className="p-4 text-gray-800 text-center">Jumlah</td>
                      <td className="p-4 text-right text-green-700">{formatCurrency(totalPenerimaan)}</td>
                      <td className="p-4 text-right text-red-700">{formatCurrency(totalPengeluaran)}</td>
                      <td className="p-4 text-right text-brand-primary">{formatCurrency(totalSaldo)}</td>
                      <td className="p-4"></td>
                  </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
      {isModalOpen && currentItem && (
        <TransaksiKosForm 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            item={currentItem}
            isSubmitting={isSubmitting}
        />
      )}
      {itemToDelete && (
        <ConfirmationModal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleDelete}
            title="Konfirmasi Hapus"
            message={`Apakah Anda yakin ingin menghapus transaksi "${itemToDelete.uraian}"? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
    </div>
  );
};

// Form Component
interface TransaksiKosFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<TransaksiKos>) => void;
    item: Partial<TransaksiKos>;
    isSubmitting: boolean;
}

const TransaksiKosForm: React.FC<TransaksiKosFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<TransaksiKos>>(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Transaksi Kos' : 'Tambah Transaksi Kos'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Uraian</label>
                    <textarea name="uraian" value={formData.uraian || ''} onChange={handleChange} className={`${inputClass} h-24`} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Penerimaan (Rp)</label>
                        <input type="number" name="penerimaan" value={formData.penerimaan || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Pengeluaran (Rp)</label>
                        <input type="number" name="pengeluaran" value={formData.pengeluaran || ''} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-end pt-6 border-t mt-8">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg mr-4 hover:bg-gray-300 transition-colors">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


export default PendapatanKos;
