import React, { useState } from 'react';
import { LayoutDashboard, FileText, Package, ChevronLeft, ChevronRight, LogOut, ReceiptIndianRupee, UserCircle, User, Notebook, CreditCard, File } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ currentView, setView, setItemToEdit, setQuoteToEdit, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { logout, user } = useAuth();

    const allTabs = [
        { viewName: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { viewName: "quotation-list", icon: FileText, label: "Quotations" },
        { viewName: "item-list", icon: Package, label: "Products" },
        { viewName: "invoice-list", icon: ReceiptIndianRupee, label: "Invoice Tax" },
        { viewName: "customer-list", icon: User, label: "Customer Ledger" },
        { viewName: "boq-list", icon: Notebook, label: "Boq" },
        // { viewName: "purchase-order", icon: CreditCard, label: "Purchase Order" },
        // { viewName: "proforma-invoice", icon: File, label: "Proforma Invoice" },
        { viewName: "user-list", icon: UserCircle, label: "Users" }
    ];

    // Filter tabs based on user role and tab access
    const getAccessibleTabs = () => {
        if (!user) return [];

        // Admin has access to all tabs
        if (user.userRole === 'admin') {
            return allTabs;
        }

        // For non-admin users, check tab access
        if (user.tabAccess && Array.isArray(user.tabAccess)) {
            return allTabs.filter(tab => {
                const tabAccess = user.tabAccess.find(access => access.tabName === tab.viewName);
                return tabAccess && tabAccess.access !== 'none';
            });
        }

        // Default to no access if no tabAccess defined
        return [];
    };

    const accessibleTabs = getAccessibleTabs();


    const NavItem = ({ viewName, icon: Icon, label }) => {
        const isActive = currentView.includes(viewName);
        const baseClasses = "flex items-center rounded-xl transition duration-200 ease-in-out cursor-pointer relative group";
        const activeClasses = isActive
            ? "bg-green-600 text-white shadow-lg"
            : "text-gray-600 hover:bg-green-50 hover:text-green-600";

        const navigate = () => {
            setItemToEdit(null);
            setQuoteToEdit(null);
            setView(viewName);
        };

        return (
            <div
                className={`${baseClasses} ${activeClasses} ${isCollapsed ? 'justify-center p-4' : 'space-x-3 p-3'
                    }`}
                title={isCollapsed ? label : ''}
                onClick={navigate}
            >
                <Icon size={30} />
                {!isCollapsed && <span className="font-medium">{label}</span>}

                {/* Tooltip for collapsed state */}
                {/* {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {label}
                    </div>
                )} */}
            </div>
        );
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogoutClick = () => {
        if (isCollapsed) {

            // If sidebar is collapsed, show confirmation immediately
            setShowLogoutConfirm(true);
        } else {
            // If sidebar is expanded, show confirmation dialog
            if (window.confirm('Are you sure you want to sign out?')) {
                logout()
                // onLogout();
            }
        }
    };

    const handleConfirmLogout = () => {
        onLogout();
        setShowLogoutConfirm(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <aside className={`hidden md:flex flex-col h-screen bg-white shadow-2xl sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-26' : 'w-72'
                }`}>
                <div className="p-6 relative shrink-0">
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-8 bg-green-600 text-white p-1 rounded-full shadow-lg hover:bg-green-700 transition duration-200 z-10"
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>

                    <div className={`flex items-center justify-center mb-10 ${isCollapsed ? 'px-0' : 'px-4'}`}>
                        {isCollapsed ? (
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img
                                    src={logo}
                                    alt="logo"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                        ) : (

                            <img
                                src={logo}
                                alt="logo"
                                className="w-full max-w-[200px] object-contain"
                            />
                        )}
                    </div>
                </div>

                {/* Navigation - Icons only when collapsed. Added flex-grow and scroll classes here. */}
                <div className="grow overflow-y-auto px-6 pb-6 overflow-x-hidden">
                    <nav className="space-y-3">
                        {accessibleTabs.map(tab => (
                            <NavItem
                                key={tab.viewName}
                                viewName={tab.viewName}
                                icon={tab.icon}
                                label={tab.label}
                            />
                        ))}
                    </nav>
                </div>

                {/* Bottom Section - Sign Out and Copyright */}
                <div className="shrink-0 border-t border-gray-100">
                    {/* Sign Out Button */}
                    <div className="p-4">
                        <button
                            onClick={handleLogoutClick}
                            className={`flex items-center w-full rounded-xl transition duration-200 ease-in-out cursor-pointer group text-gray-600 hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'justify-center p-3' : 'space-x-3 p-3'
                                }`}
                            title={isCollapsed ? "Sign Out" : ""}
                        >
                            <LogOut size={30} className={isCollapsed ? "" : "text-red-500"} />
                            {!isCollapsed && (
                                <span className="font-medium text-red-600">Sign Out</span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                    Sign Out
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Footer - Hide when collapsed */}
                    {!isCollapsed && (
                        <footer className="px-6 pb-6 text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Quotation App
                        </footer>
                    )}
                </div>
            </aside>

            {/* Logout Confirmation Modal for Collapsed State */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Sign Out
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to sign out?
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelLogout}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmLogout}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;