
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StokBarang from './pages/StokBarang';
import KasHarian from './pages/KasHarian';
import PendapatanKos from './pages/PendapatanKos';

function App() {
  return (
    <HashRouter>
      <div className="flex h-screen bg-brand-bg font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stok-barang" element={<StokBarang />} />
            <Route path="/kas-harian" element={<KasHarian />} />
            <Route path="/pendapatan-kos" element={<PendapatanKos />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
