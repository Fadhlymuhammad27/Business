
import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center space-x-4">
        {children}
      </div>
    </div>
  );
};

export default Header;
