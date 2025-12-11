import React, { useEffect, useState } from 'react';
import { Eye, Plus, PenLine, Trash, User } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';
import { communication } from '../../service/communication';

const CustomerList = ({ setView, setCustomerToEdit, setCustomerToView, deleteCustomer }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete customer: ${name}?`)) {
            try {
                await communication.deleteCustomer(id);
                setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('Failed to delete customer');
            }
        }
    };

    const getCustomers = async () => {
        try {
            setLoading(true);
            const response = await communication.getAllCustomers();
            const customersData = response?.data?.result || [];

            const transformedCustomers = customersData.map(customer => {
                return {
                    id: customer._id || customer.id,
                    customerUniqueId: customer.customerUniqueId,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    city: customer.address?.city || 'N/A',
                    state: customer.address?.state || 'N/A',
                    amountPending: customer.amountPending || 0,
                    amountReceived: customer.amountReceived || 0,
                    totalAmount: customer.totalAmount || 0,
                    paymentMethod: customer.paymentMethod,
                    status: customer.status,
                    customerType: customer.customerType,
                    accountNumber: customer.accountNumber,
                    notes: customer.notes,
                    contactPerson: customer.contactPerson
                };
            });

            setCustomers(transformedCustomers);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'gray';
            case 'suspended': return 'red';
            case 'overdue': return 'green';
            case 'completed': return 'blue';
            default: return 'gray';
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'online': return 'Online';
            case 'offline': return 'Offline';
            case 'cash': return 'Cash';
            case 'cheque': return 'Cheque';
            case 'other': return 'Other';
            default: return 'Not specified';
        }
    };

    useEffect(() => {
        getCustomers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading customers...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <User className="mr-3 text-green-600" size={30} /> Customer Ledger
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{customers.length}</strong> customers.</p>
                <PrimaryButton icon={Plus} onClick={() => setView('create-customer')}>
                    Add New Customer
                </PrimaryButton>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {customer.customerUniqueId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {customer.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {customer.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {customer.phone || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                    {formatCurrency(customer.amountPending)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                    {formatCurrency(customer.amountReceived)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                    {formatCurrency(customer.totalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getPaymentMethodText(customer.paymentMethod)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge
                                        status={customer.status}
                                        color={getStatusColor(customer.status)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => {
                                            console.log(customer)
                                            setCustomerToView(customer);
                                            setView('customer-detail');
                                        }}
                                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCustomerToEdit(customer);
                                            setView('edit-customer');
                                        }}
                                        className="text-green-600 hover:text-green-900 cursor-pointer"
                                        title="Edit Customer"
                                    >
                                        <PenLine size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id, customer.name)}
                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                        title="Delete Customer"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {customers.length === 0 && !loading && (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No customers found. Click 'Add New Customer' to get started!</p>
                </div>
            )}
        </div>
    );
};

export default CustomerList;