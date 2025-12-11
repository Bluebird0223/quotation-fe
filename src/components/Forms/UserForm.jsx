import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Lock, Shield, Plus, Trash2, ChevronDown } from 'lucide-react';
import { communication } from '../../service/communication';

const UserForm = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userRole: 'user',
        tabAccess: [{ tabName: '', access: 'read' }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Predefined list of available tabs
    const availableTabs = [
        { value: 'quotation', label: 'Quotations' },
        { value: 'item', label: 'Products' },
        { value: 'invoice', label: 'Invoice Tax' },
        { value: 'customer', label: 'Customer Ledger' },
        { value: 'boq', label: 'Boq' },
        { value: 'purchase', label: 'Purchase Order' },
        { value: 'proforma', label: 'Proforma Invoice' },
        { value: 'user', label: 'Users' }
    ];

    const accessLevels = [
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'none', label: 'None' }
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Don't pre-fill password for security
                userRole: user.userRole || 'user',
                tabAccess: user.tabAccess?.length > 0 ? user.tabAccess : [{ tabName: '', access: 'read' }]
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTabAccessChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            tabAccess: prev.tabAccess.map((tab, i) =>
                i === index ? { ...tab, [field]: value } : tab
            )
        }));
    };

    const addTabAccess = () => {
        setFormData(prev => ({
            ...prev,
            tabAccess: [...prev.tabAccess, { tabName: '', access: 'read' }]
        }));
    };

    const removeTabAccess = (index) => {
        if (formData.tabAccess.length > 1) {
            setFormData(prev => ({
                ...prev,
                tabAccess: prev.tabAccess.filter((_, i) => i !== index)
            }));
        }
    };

    const getAvailableTabOptions = (currentIndex) => {
        const selectedTabs = formData.tabAccess.map(tab => tab.tabName).filter(tab => tab);
        return availableTabs.filter(tab =>
            tab.value === formData.tabAccess[currentIndex]?.tabName ||
            !selectedTabs.includes(tab.value)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name || !formData.email || (!user && !formData.password)) {
                setError('Please fill in all required fields');
                setLoading(false);
                return;
            }

            // Validate tab access
            const invalidTabs = formData.tabAccess.some(tab => !tab.tabName);
            if (invalidTabs) {
                setError('Please fill in all tab names');
                setLoading(false);
                return;
            }

            // Filter out tabs with 'none' access
            const filteredTabAccess = formData.tabAccess.filter(tab => tab.access !== 'none');

            if (user) {
                // Update existing user
                const response = await communication.updateUser({
                    userId: user._id,
                    email: formData.email,
                    userRole: formData.userRole,
                    tabAccess: filteredTabAccess
                });
                if (response?.data?.status) {
                    onSuccess();
                } else {
                    setError(response?.data?.message || 'Failed to update user');
                }
            } else {
                // Create new user
                const response = await communication.createUser({
                    ...formData,
                    tabAccess: filteredTabAccess
                });
                if (response?.data?.status) {
                    onSuccess();
                } else {
                    setError(response?.data?.message || 'Failed to create user');
                }
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Error saving user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <User className="mr-3 text-green-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-900">
                            {user ? 'Edit User' : 'Create New User'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password - Only show for new users */}
                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* User Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Role *
                        </label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                name="userRole"
                                value={formData.userRole}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="sales">Sales</option>
                                <option value="service">Service</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {/* Tab Access */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Tab Access Permissions
                            </label>
                            <button
                                type="button"
                                onClick={addTabAccess}
                                className="flex items-center text-sm text-green-600 hover:text-green-700"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Tab
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.tabAccess.map((tab, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    {/* Tab Name Dropdown */}
                                    <div className="flex-1 relative">
                                        <select
                                            value={tab.tabName}
                                            onChange={(e) => handleTabAccessChange(index, 'tabName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                                        >
                                            <option value="">Select a tab</option>
                                            {getAvailableTabOptions(index).map(tabOption => (
                                                <option key={tabOption.value} value={tabOption.value}>
                                                    {tabOption.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    </div>

                                    {/* Access Level Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={tab.access}
                                            onChange={(e) => handleTabAccessChange(index, 'access', e.target.value)}
                                            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none min-w-[120px]"
                                        >
                                            {accessLevels.map(level => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    </div>

                                    {/* Remove Button */}
                                    {formData.tabAccess.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTabAccess(index)}
                                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition duration-200"
                                            title="Remove tab"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Helper Text */}
                        <p className="text-sm text-gray-500 mt-3">
                            <strong>Note:</strong> Tabs with "None" access will not be included in the user's permissions.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center disabled:opacity-50"
                        >
                            <Save size={20} className="mr-2" />
                            {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;