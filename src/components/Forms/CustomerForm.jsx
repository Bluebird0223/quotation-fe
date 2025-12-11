import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import { communication } from '../../service/communication';

const CustomerForm = ({ customerToEdit, updateCustomer, setView }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            city: '',
            state: '',
            location: ''
        },
        amountPending: 0,
        amountReceived: 0,
        totalAmount: 0,
        paymentMethod: 'online',
        status: 'active',
        contactPerson: {
            name: '',
            position: ''
        },
        notes: '',
        customerType: 'individual',
        accountNumber: ''
    });

    const [loading, setLoading] = useState(false);

    // Calculate pending amount whenever totalAmount or amountReceived changes
    useEffect(() => {
        const pending = Math.max(0, formData.totalAmount - formData.amountReceived);
        setFormData(prev => ({
            ...prev,
            amountPending: pending
        }));
    }, [formData.totalAmount, formData.amountReceived]);

    useEffect(() => {
        if (customerToEdit) {
            setFormData({
                name: customerToEdit.name || '',
                email: customerToEdit.email || '',
                phone: customerToEdit.phone || '',
                address: {
                    city: customerToEdit.address?.city || '',
                    state: customerToEdit.address?.state || '',
                    location: customerToEdit.address?.location || ''
                },
                amountPending: customerToEdit.amountPending || 0,
                amountReceived: customerToEdit.amountReceived || 0,
                totalAmount: customerToEdit.totalAmount || 0,
                paymentMethod: customerToEdit.paymentMethod || 'online',
                status: customerToEdit.status || 'active',
                contactPerson: {
                    name: customerToEdit.contactPerson?.name || '',
                    position: customerToEdit.contactPerson?.position || ''
                },
                notes: customerToEdit.notes || '',
                customerType: customerToEdit.customerType || 'individual',
                accountNumber: customerToEdit.accountNumber || ''
            });
        }
    }, [customerToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            // Convert to number for financial fields
            const numericFields = ['totalAmount', 'amountReceived', 'amountPending'];
            const finalValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

            setFormData(prev => ({
                ...prev,
                [name]: finalValue
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (customerToEdit) {
                await updateCustomer(customerToEdit.id, formData);
            } else {
                await communication.addCustomer(formData);
            }
            setView('customer-list');
        } catch (error) {
            console.error('Error saving customer:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <button
                    onClick={() => setView('customer-list')}
                    className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Customer Type
                        </label>
                        <select
                            name="customerType"
                            value={formData.customerType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                            <option value="wholesale">Wholesale</option>
                            <option value="retail">Retail</option>
                        </select>
                    </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State
                            </label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                name="address.location"
                                value={formData.address.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Amount
                            </label>
                            <input
                                type="number"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount Received
                            </label>
                            <input
                                type="number"
                                name="amountReceived"
                                value={formData.amountReceived}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max={formData.totalAmount}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount Pending
                            </label>
                            <input
                                type="number"
                                name="amountPending"
                                value={formData.amountPending}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method
                            </label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="cash">Cash</option>
                                <option value="cheque">Cheque</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="overdue">Overdue</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Person */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Person Name
                            </label>
                            <input
                                type="text"
                                name="contactPerson.name"
                                value={formData.contactPerson.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position
                            </label>
                            <input
                                type="text"
                                name="contactPerson.position"
                                value={formData.contactPerson.position}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Additional notes about the customer..."
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => setView('customer-list')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <PrimaryButton
                        type="submit"
                        icon={Save}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (customerToEdit ? 'Update Customer' : 'Create Customer')}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;