
import { createClient } from '@supabase/supabase-js';
import { Barang, KasHarian, TransaksiKos } from '../types';

const supabaseUrl = 'https://jxnmmlkzeyohhhdmtmcb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4bm1tbGt6ZXlvaGhoZG10bWNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTY5NTAsImV4cCI6MjA3MTc3Mjk1MH0.zaD-4Nj_UY8pmldJW4T5F4WUcdFdERCyEtB2pZxijkc';

export const supabase = createClient(supabaseUrl, supabaseKey);


// --- Stok Barang ---
export const getBarang = async (): Promise<Barang[]> => {
  const { data, error } = await supabase.from('stok_barang').select('*').order('kode_barang', { ascending: true });
  if (error) {
      console.error('Error fetching barang:', error.message);
      throw new Error(error.message);
  }
  return data || [];
};

export const addBarang = async (barang: Omit<Barang, 'id' | 'stok_akhir'>): Promise<Barang[] | null> => {
  const { data, error } = await supabase.from('stok_barang').insert([barang]).select();
  if (error) {
    console.error('Error adding barang:', error.message);
    throw new Error(error.message);
  }
  return data;
};

export const updateBarang = async (id: number, barang: Partial<Omit<Barang, 'id' | 'stok_akhir'>>): Promise<Barang[] | null> => {
    const { data, error } = await supabase.from('stok_barang').update(barang).eq('id', id).select();
    if (error) {
        console.error('Error updating barang:', error.message);
        throw new Error(error.message);
    }
    return data;
};

export const deleteBarang = async (id: number): Promise<void> => {
    const { error } = await supabase.from('stok_barang').delete().eq('id', id);
    if (error) {
        console.error('Error deleting barang:', error.message);
        throw new Error(error.message);
    }
};


// --- Kas Harian ---
export const getKasHarian = async (): Promise<KasHarian[]> => {
  const { data, error } = await supabase.from('kas_harian').select('*').order('tanggal', { ascending: false });
  if (error) {
    console.error('Error fetching kas harian:', error.message);
    throw new Error(error.message);
  }
  return data || [];
};

export const addKasHarian = async (kas: Omit<KasHarian, 'id' | 'total'>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').insert([kas]).select();
    if (error) {
      console.error('Error adding kas harian:', error.message);
      throw new Error(error.message);
    }
    return data;
};

export const updateKasHarian = async (id: number, kas: Partial<Omit<KasHarian, 'id' | 'total'>>): Promise<KasHarian[] | null> => {
    const { data, error } = await supabase.from('kas_harian').update(kas).eq('id', id).select();
    if (error) {
        console.error('Error updating kas harian:', error.message);
        throw new Error(error.message);
    }
    return data;
};

export const deleteKasHarian = async (id: number): Promise<void> => {
    const { error } = await supabase.from('kas_harian').delete().eq('id', id);
    if (error) {
        console.error('Error deleting kas harian:', error.message);
        throw new Error(error.message);
    }
};


// --- Transaksi Kos ---
export const getTransaksiKos = async (): Promise<TransaksiKos[]> => {
  const { data, error } = await supabase.from('transaksi_kos').select('*').order('tanggal', { ascending: true });
  if (error) {
    console.error('Error fetching transaksi kos:', error.message);
    throw new Error(error.message);
  }
  return data || [];
};

export const addTransaksiKos = async (transaksi: Omit<TransaksiKos, 'id'>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').insert([transaksi]).select();
    if (error) {
      console.error('Error adding transaksi kos:', error.message);
      throw new Error(error.message);
    }
    return data;
};

export const updateTransaksiKos = async (id: number, transaksi: Partial<Omit<TransaksiKos, 'id'>>): Promise<TransaksiKos[] | null> => {
    const { data, error } = await supabase.from('transaksi_kos').update(transaksi).eq('id', id).select();
    if (error) {
        console.error('Error updating transaksi kos:', error.message);
        throw new Error(error.message);
    }
    return data;
};

export const deleteTransaksiKos = async (id: number): Promise<void> => {
    const { error } = await supabase.from('transaksi_kos').delete().eq('id', id);
    if (error) {
        console.error('Error deleting transaksi kos:', error.message);
        throw new Error(error.message);
    }
};
