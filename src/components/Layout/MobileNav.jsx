import React from 'react';
import { LayoutDashboard, FileText, Package, UserCircle, File, CreditCard, Notebook, User, ReceiptIndianRupee } from 'lucide-react';

const MobileNav = ({ currentView, setView, setItemToEdit, setQuoteToEdit }) => {
    const NavItem = ({ viewName, icon: Icon, label }) => {
        const isActive = currentView.includes(viewName); // Use includes for list/create/edit views
        const baseClasses = "flex items-center p-3 rounded-xl transition duration-200 ease-in-out cursor-pointer";
        const activeClasses = isActive
            ? "bg-green-600 text-white shadow-lg"
            : "text-gray-600 hover:bg-green-50 hover:text-green-600";

        const navigate = () => {
            // Clear edit state when navigating to main pages
            setItemToEdit(null);
            setQuoteToEdit(null);
            setView(viewName);
        };

        return (
            <div className={`${baseClasses} ${activeClasses}`} onClick={navigate} title={label}>
                <Icon size={24} />

                {/* <span className="font-medium">{label}</span> */}
            </div>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-xl p-2 flex justify-around">
            <div className="flex"><NavItem viewName="dashboard" icon={LayoutDashboard} label="Dash" /></div>
            <div className="flex"><NavItem viewName="quotation-list" icon={FileText} label="Quotes" /></div>
            <div className="flex"><NavItem viewName="invoice-list" icon={ReceiptIndianRupee} label="Invoice" /></div>
            <div className="flex"><NavItem viewName="customer-list" icon={User} label="Customer" /></div>
            <div className="flex"><NavItem viewName="boq-list" icon={Notebook} label="Boq" /></div>
            {/* <div className="flex"><NavItem viewName="item-list" icon={CreditCard} label="Purchase" /></div>
            <div className="flex"><NavItem viewName="item-list" icon={File} label="Proforma" /></div> */}
            <div className="flex"><NavItem viewName="user-list" icon={UserCircle} label="Users" /></div>
        </nav>
    );
};

export default MobileNav;