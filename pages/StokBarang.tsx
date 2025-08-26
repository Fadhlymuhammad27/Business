
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { Barang } from '../types';
import { getBarang, addBarang, updateBarang } from '../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';

const StokBarang = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<Barang> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const barangData = await getBarang();
      setData(barangData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data stok barang.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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
      body: filteredData.map(item => [
          item.kode_barang, 
          item.nama_barang, 
          item.stok_awal, 
          item.barang_masuk, 
          item.barang_keluar,
          item.stok_akhir, 
          item.harga_jual.toLocaleString('id-ID')
        ]),
    });
    doc.save(`laporan-stok-barang-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleOpenModal = (item: Partial<Barang> | null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData: Partial<Barang>) => {
    setIsSubmitting(true);
    try {
        const { id, ...rest } = formData;
        const submissionData = {
            kode_barang: rest.kode_barang || '',
            nama_barang: rest.nama_barang || '',
            stok_awal: Number(rest.stok_awal) || 0,
            barang_masuk: Number(rest.barang_masuk) || 0,
            barang_keluar: Number(rest.barang_keluar) || 0,
            alihkan: rest.alihkan || '',
            harga_jual: Number(rest.harga_jual) || 0,
            hpb: Number(rest.hpb) || 0,
        }

        if (id) {
            await updateBarang(id, submissionData);
        } else {
            await addBarang(submissionData);
        }
        fetchData();
        handleCloseModal();
    } catch (err: any) {
        alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Laporan Stok Barang">
        <button 
            className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary transition-colors flex items-center"
            onClick={() => handleOpenModal({})}
        >
            <PlusIcon className="w-6 h-6 mr-2"/>
            Tambah Barang
        </button>
        <button 
            className="px-4 py-3 bg-brand-success text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors"
            onClick={handleExportPDF}
        >
            Unduh Laporan (PDF)
        </button>
      </Header>
      
      <div className="mb-6">
          <input
              type="text"
              placeholder="Cari barang berdasarkan nama atau kode..."
              className="w-full max-w-lg p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-96">
                <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg m-4">
              <p className="text-xl font-semibold">Gagal memuat data stok barang</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-gray-500 p-8 text-xl">Tidak ada data stok barang yang cocok.</p>
          ) : (
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  {['Kode', 'Nama Barang', 'Stok Awal', 'Masuk', 'Keluar', 'Alihkan', 'Stok Akhir', 'Harga Jual', 'HPB', 'Aksi'].map(header => (
                    <th key={header} className="p-4 font-bold text-gray-600">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-semibold text-brand-primary">{item.kode_barang}</td>
                    <td className="p-4 font-semibold text-gray-800">{item.nama_barang}</td>
                    <td className="p-4 text-center">{item.stok_awal}</td>
                    <td className="p-4 text-center text-green-600 font-medium">{item.barang_masuk}</td>
                    <td className="p-4 text-center text-red-600 font-medium">{item.barang_keluar}</td>
                    <td className="p-4 text-gray-500 italic">{item.alihkan || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-base font-bold rounded-full ${getStockColor(item.stok_akhir)}`}>
                          {item.stok_akhir}
                      </span>
                    </td>
                    <td className="p-4">{item.harga_jual.toLocaleString('id-ID')}</td>
                    <td className="p-4">{item.hpb.toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"><EditIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {isModalOpen && currentItem && (
        <StokBarangForm 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSave}
            item={currentItem}
            isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Form Component
interface StokBarangFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<Barang>) => void;
    item: Partial<Barang>;
    isSubmitting: boolean;
}

const StokBarangForm: React.FC<StokBarangFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<Barang>>(item);

    useEffect(() => {
        setFormData(item);
    }, [item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Barang' : 'Tambah Barang Baru'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Kode Barang</label>
                        <input type="text" name="kode_barang" value={formData.kode_barang || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Nama Barang</label>
                        <input type="text" name="nama_barang" value={formData.nama_barang || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Stok Awal</label>
                        <input type="number" name="stok_awal" value={formData.stok_awal || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                     <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Alihkan</label>
                        <input type="text" name="alihkan" value={formData.alihkan || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Barang Masuk</label>
                        <input type="number" name="barang_masuk" value={formData.barang_masuk || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Barang Keluar</label>
                        <input type="number" name="barang_keluar" value={formData.barang_keluar || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Harga Jual (Rp)</label>
                        <input type="number" name="harga_jual" value={formData.harga_jual || ''} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">HPB (Rp)</label>
                        <input type="number" name="hpb" value={formData.hpb || ''} onChange={handleChange} className={inputClass} required />
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

export default StokBarang;
