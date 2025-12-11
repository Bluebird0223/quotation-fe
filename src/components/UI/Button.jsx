import React from 'react';

const PrimaryButton = ({ children, onClick, icon: Icon, className = '', disabled = false, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 ${className}`}
  >
    {Icon && <Icon size={20} />}
    <span>{children}</span>
  </button>
);

export default PrimaryButton;