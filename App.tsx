
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import StokBarang from './pages/StokBarang.tsx';
import KasHarian from './pages/KasHarian.tsx';
import PendapatanKos from './pages/PendapatanKos.tsx';

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