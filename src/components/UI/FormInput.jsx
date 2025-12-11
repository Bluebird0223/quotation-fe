import React from 'react';

const FormInput = ({ label, id, type = 'text', value, onChange, placeholder, required = false, className = '', disabled = false }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 ${className}`}
    />
  </div>
);

export default FormInput;