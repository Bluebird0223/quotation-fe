import React from 'react';
import logo from "../../assets/logo.png"
const Header = ({ view }) => {
    return (
        <header className="flex justify-center items-center md:hidden p-4 bg-gray-100 text-white shadow-lg">
            <img src={logo} alt="logo" className='h-[40px] w-[60px]' />
            {/* <h1 className="text-xl font-bold">Quotation Manager</h1>
            <p className="text-sm mt-1">Current View: {view.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p> */}
        </header>
    );
};

export default Header;