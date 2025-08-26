
export interface Barang {
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

export interface KasHarian {
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

export interface TransaksiKos {
  id: number;
  tanggal: string; // YYYY-MM-DD
  uraian: string;
  penerimaan: number;
  pengeluaran: number;
}
