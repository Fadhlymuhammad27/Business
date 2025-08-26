
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import { KasHarian } from '../types';
import { getKasHarian, addKasHarian, updateKasHarian, deleteKasHarian } from '../services/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PlusIcon from '../components/icons/PlusIcon';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

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
      setLoading(true);
      const kasData = await getKasHarian();
      setData(kasData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kas harian.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("Laporan Penerimaan Kas Harian - Jamfadly Mart", 14, 20);
    (doc as any).autoTable({
        startY: 25,
        head: [['Tanggal', '100rb', '50rb', '20rb', '10rb', '5rb', '2rb', '1rb', '500', 'Total']],
        body: data.map(item => [
            formatDate(item.tanggal),
            item.rp_100k, item.rp_50k, item.rp_20k, item.rp_10k, item.rp_5k, item.rp_2k, item.rp_1k, item.rp_500,
            item.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
        ]),
        foot: [
            ['Total', 
             data.reduce((s, i) => s + i.rp_100k, 0),
             data.reduce((s, i) => s + i.rp_50k, 0),
             data.reduce((s, i) => s + i.rp_20k, 0),
             data.reduce((s, i) => s + i.rp_10k, 0),
             data.reduce((s, i) => s + i.rp_5k, 0),
             data.reduce((s, i) => s + i.rp_2k, 0),
             data.reduce((s, i) => s + i.rp_1k, 0),
             data.reduce((s, i) => s + i.rp_500, 0),
             data.reduce((s, i) => s + i.total, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
            ]
        ]
    });
    doc.save(`laporan-kas-harian-${new Date().toISOString().slice(0,10)}.pdf`);
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
  
  const handleOpenModal = (item: Partial<KasHarian> | null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData: Partial<KasHarian>) => {
    setIsSubmitting(true);
    try {
        const { id, total, ...rest } = formData; // Exclude total from submission
        const submissionData = Object.entries(rest).reduce((acc, [key, value]) => {
            // FIX: Cast accumulator to 'any' to allow dynamic key assignment.
            // This resolves a TypeScript error where assigning mixed types (string | number)
            // to a dynamically keyed property of a typed object is disallowed because it
            // can't guarantee type safety for all possible keys.
            (acc as any)[key] = key === 'tanggal' ? value : Number(value) || 0;
            return acc;
        }, {} as Omit<KasHarian, 'id' | 'total'>);
        
        if (!submissionData.tanggal) {
            alert('Tanggal wajib diisi.');
            setIsSubmitting(false);
            return;
        }

        if (id) {
            await updateKasHarian(id, submissionData);
        } else {
            await addKasHarian(submissionData);
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
        await deleteKasHarian(itemToDelete.id);
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
      <Header title="Laporan Penerimaan Kas Harian">
         <button 
            className="px-4 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary transition-colors flex items-center"
            onClick={() => handleOpenModal({ tanggal: new Date().toISOString().split('T')[0] })}
        >
            <PlusIcon className="w-6 h-6 mr-2"/>
            Tambah Data
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
             <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg m-4">
              <p className="text-xl font-semibold">Gagal memuat data kas harian</p>
              <p className="mt-2">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-gray-500 p-8 text-xl">Tidak ada data kas harian.</p>
          ) : (
            <table className="w-full text-left text-lg">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Tanggal</th>
                  {['100rb', '50rb', '20rb', '10rb', '5rb', '2rb', '1rb', '500'].map(denom => (
                    <th key={denom} className="p-4 font-bold text-gray-600 text-center">Rp. {denom}</th>
                  ))}
                  <th className="p-4 font-bold text-gray-600 text-right">Total</th>
                   <th className="p-4 font-bold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-semibold text-gray-800">{formatDate(item.tanggal)}</td>
                    <td className="p-4 text-center">{item.rp_100k}</td>
                    <td className="p-4 text-center">{item.rp_50k}</td>
                    <td className="p-4 text-center">{item.rp_20k}</td>
                    <td className="p-4 text-center">{item.rp_10k}</td>
                    <td className="p-4 text-center">{item.rp_5k}</td>
                    <td className="p-4 text-center">{item.rp_2k}</td>
                    <td className="p-4 text-center">{item.rp_1k}</td>
                    <td className="p-4 text-center">{item.rp_500}</td>
                    <td className="p-4 text-right font-bold text-brand-primary">
                      {item.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"><EditIcon /></button>
                        <button onClick={() => setItemToDelete(item)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"><DeleteIcon /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
               <tfoot className="bg-gray-200 font-bold">
                  <tr>
                      <td className="p-4 text-gray-800">Total</td>
                      {(['rp_100k', 'rp_50k', 'rp_20k', 'rp_10k', 'rp_5k', 'rp_2k', 'rp_1k', 'rp_500'] as const).map(denom => (
                          <td key={denom} className="p-4 text-center text-gray-800">
                              {data.reduce((sum, item) => sum + item[denom], 0)}
                          </td>
                      ))}
                      <td className="p-4 text-right text-brand-success">
                          {data.reduce((sum, item) => sum + item.total, 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                      </td>
                      <td className="p-4"></td>
                  </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
       {isModalOpen && currentItem && (
        <KasHarianForm 
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
            message={`Apakah Anda yakin ingin menghapus data kas tanggal ${formatDate(itemToDelete.tanggal)}? Tindakan ini tidak dapat dibatalkan.`}
        />
      )}
    </div>
  );
};

// Form Component
interface KasHarianFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Partial<KasHarian>) => void;
    item: Partial<KasHarian>;
    isSubmitting: boolean;
}

const KasHarianForm: React.FC<KasHarianFormProps> = ({ isOpen, onClose, onSave, item, isSubmitting }) => {
    const [formData, setFormData] = useState<Partial<KasHarian>>(item);

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
    const denoms: (keyof KasHarian)[] = ['rp_100k', 'rp_50k', 'rp_20k', 'rp_10k', 'rp_5k', 'rp_2k', 'rp_1k', 'rp_500'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={item.id ? 'Edit Data Kas Harian' : 'Tambah Data Kas Harian'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="date" name="tanggal" value={formData.tanggal || ''} onChange={handleChange} className={inputClass} required />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {denoms.map(denom => (
                         <div key={denom}>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Jml {denom.replace('rp_', '').toUpperCase()}</label>
                            <input type="number" name={denom} value={formData[denom] as number || ''} onChange={handleChange} className={inputClass} required />
                        </div>
                    ))}
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
}

export default KasHarianPage;
