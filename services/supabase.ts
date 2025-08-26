import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Barang, KasHarian, TransaksiKos } from '../types';

const supabaseUrl = 'https://jxnmmlkzeyohhhdmtmcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bm1tbGt6ZXlvaGhoZG10bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTY5NTAsImV4cCI6MjA3MTc3Mjk1MH0.zaD-4Nj_UY8pmldJW4T5F4WUcdFdERCyEtB2pZxijkc';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Custom error for better diagnostics
export class SupabaseServiceError extends Error {
    details?: string;
    hint?: string;
    code?: string;

    constructor(error: PostgrestError, context: string) {
        // Pass Supabase message to parent Error constructor
        super(error.message); 
        this.name = 'SupabaseServiceError';
        // Add context to the message for easier debugging
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


// --- Stok Barang ---
export const getBarang = async (): Promise<Barang[]> => {
  const { data, error } = await supabase.from('stok_barang').select('*').order('kode_barang', { ascending: true });
  handleSupabaseError(error, 'mengambil data barang');
  return data || [];
};

export const addBarang = async (barang: Omit<Barang, 'id' | 'stok_akhir'>): Promise<Barang[] | null> => {
  const { data, error } = await supabase.from('stok_barang').insert([barang]).select();
  handleSupabaseError(error, 'menambah barang');
  return data;
};

export const updateBarang = async (id: number, barang: Partial<Omit<Barang, 'id' | 'stok_akhir'>>): Promise<Barang[] | null> => {
    const { data, error } = await supabase.from('stok_barang').update(barang).eq('id', id).select();
    handleSupabaseError(error, `memperbarui barang (id: ${id})`);
    return data;
};

export const deleteBarang = async (id: number): Promise<void> => {
    const { error } = await supabase.from('stok_barang').delete().eq('id', id);
    handleSupabaseError(error, `menghapus barang (id: ${id})`);
};


// --- Kas Harian ---
export const getKasHarian = async (): Promise<KasHarian[]> => {
  const { data, error } = await supabase.from('kas_harian').select('*').order('tanggal', { ascending: false });
  handleSupabaseError(error, 'mengambil data kas harian');
  return data || [];
};

export const addKasHarian = async (kas: Omit<KasHarian, 'id' | 'total'>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').insert([kas]).select();
    handleSupabaseError(error, 'menambah kas harian');
    return data;
};

export const updateKasHarian = async (id: number, kas: Partial<Omit<KasHarian, 'id' | 'total'>>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').update(kas).eq('id', id).select();
    handleSupabaseError(error, `memperbarui kas harian (id: ${id})`);
    return data;
};

export const deleteKasHarian = async (id: number): Promise<void> => {
    const { error } = await supabase.from('kas_harian').delete().eq('id', id);
    handleSupabaseError(error, `menghapus kas harian (id: ${id})`);
};


// --- Transaksi Kos ---
export const getTransaksiKos = async (): Promise<TransaksiKos[]> => {
  const { data, error } = await supabase.from('transaksi_kos').select('*').order('tanggal', { ascending: true });
  handleSupabaseError(error, 'mengambil data transaksi kos');
  return data || [];
};

export const addTransaksiKos = async (transaksi: Omit<TransaksiKos, 'id'>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').insert([transaksi]).select();
    handleSupabaseError(error, 'menambah transaksi kos');
    return data;
};

export const updateTransaksiKos = async (id: number, transaksi: Partial<Omit<TransaksiKos, 'id'>>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').update(transaksi).eq('id', id).select();
    handleSupabaseError(error, `memperbarui transaksi kos (id: ${id})`);
    return data;
};

export const deleteTransaksiKos = async (id: number): Promise<void> => {
    const { error } = await supabase.from('transaksi_kos').delete().eq('id', id);
    handleSupabaseError(error, `menghapus transaksi kos (id: ${id})`);
};
