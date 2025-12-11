import React from 'react';

const NavItem = ({ viewName, icon: Icon, label, currentView, setView }) => {
    const isActive = currentView === viewName;
    const baseClasses = "flex items-center space-x-3 p-3 rounded-xl transition duration-200 ease-in-out cursor-pointer";
    const activeClasses = isActive
        ? "bg-green-600 text-white shadow-lg"
        : "text-gray-600 hover:bg-green-50 hover:text-green-600";

    return (
        <div className={`${baseClasses} ${activeClasses}`} onClick={() => setView(viewName)}>
            <Icon size={24} />
            <span className="font-medium">{label}</span>
        </div>
    );
};

export default NavItem;