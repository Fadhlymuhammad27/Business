
import React from 'react';

const HomeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3V16a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1V10l-7-7-7 7z" />
  </svg>
);

export default HomeIcon;
