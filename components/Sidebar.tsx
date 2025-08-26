
import React from 'react';
import { NavLink } from 'react-router-dom';
import DashboardIcon from './icons/DashboardIcon';
import PackageIcon from './icons/PackageIcon';
import CashIcon from './icons/CashIcon';
import HomeIcon from './icons/HomeIcon';

const navItems = [
  { to: '/', text: 'Dasbor', icon: DashboardIcon },
  { to: '/stok-barang', text: 'Stok Barang', icon: PackageIcon },
  { to: '/kas-harian', text: 'Kas Harian', icon: CashIcon },
  { to: '/pendapatan-kos', text: 'Pendapatan Kos', icon: HomeIcon },
];

const Sidebar = () => {
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

export default Sidebar;
