
import React from 'react';

interface CardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
};

const Card: React.FC<CardProps> = ({ title, value, description, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-start space-x-6">
      <div className={`p-4 rounded-full ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium text-gray-500">{title}</p>
        <p className="text-4xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-md text-gray-400 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default Card;
