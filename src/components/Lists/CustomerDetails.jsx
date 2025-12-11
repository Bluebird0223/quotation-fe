import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, User, Building, CreditCard, FileText } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';

const CustomerDetail = ({ customer, setView }) => {
    if (!customer) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500">No customer data available.</p>
                <PrimaryButton onClick={() => setView('customer-list')} className="mt-4">
                    Back to Customer List
                </PrimaryButton>
            </div>
        );
    }

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

    const getCustomerTypeIcon = (type) => {
        switch (type) {
            case 'business': return <Building size={20} />;
            case 'wholesale': return <CreditCard size={20} />;
            case 'retail': return <User size={20} />;
            default: return <User size={20} />;
        }
    };

    const getPaymentMethodText = (method) => {
        switch (method) {
            case 'online': return 'Online Payment';
            case 'offline': return 'Offline Payment';
            case 'cash': return 'Cash';
            case 'cheque': return 'Cheque';
            case 'other': return 'Other';
            default: return 'Not specified';
        }
    };

    const balance = customer.totalAmount - customer.amountReceived;
    const isOverdue = balance > 0 && customer.status === 'overdue';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => setView('customer-list')}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900">Customer Details</h1>
                </div>
                <StatusBadge
                    status={customer.status}
                    color={getStatusColor(customer.status)}
                    size="lg"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-lg mr-4">
                                    {getCustomerTypeIcon(customer.customerType)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                                    <p className="text-gray-600 capitalize">{customer.customerType} Customer</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Customer ID</p>
                                <p className="font-mono font-bold text-gray-900">{customer.customerUniqueId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="flex items-center text-gray-600">
                                <Mail className="mr-3 text-blue-500" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="mr-3 text-green-500" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">{customer.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            {customer.address && (
                                <div className="flex items-start text-gray-600">
                                    <MapPin className="mr-3 text-red-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">
                                            {[customer.address.city, customer.address.state, customer.address.location]
                                                .filter(Boolean)
                                                .join(', ') || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {customer.accountNumber && (
                                <div className="flex items-center text-gray-600">
                                    <CreditCard className="mr-3 text-purple-500" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Account Number</p>
                                        <p className="font-medium">{customer.accountNumber}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {customer.contactPerson && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">Contact Person</h3>
                                <p className="text-gray-700">
                                    <strong>{customer.contactPerson.name}</strong>
                                    {customer.contactPerson.position && ` - ${customer.contactPerson.position}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Notes Card */}
                    {customer.notes && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <FileText className="mr-2 text-gray-600" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
                        </div>
                    )}
                </div>

                {/* Financial Summary Card */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold text-blue-600">
                                    {formatCurrency(customer.totalAmount)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Amount Received:</span>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(customer.amountReceived)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-t pt-3">
                                <span className="text-gray-600">Amount Pending:</span>
                                <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatCurrency(customer.amountPending)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium text-gray-900">
                                    {getPaymentMethodText(customer.paymentMethod)}
                                </span>
                            </div>
                        </div>

                        {isOverdue && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-medium text-center">
                                    ⚠️ Payment Overdue
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <PrimaryButton
                                onClick={() => {
                                    // You can implement edit functionality here
                                    setView('edit-customer');
                                }}
                                className="w-full justify-center"
                            >
                                Edit Customer
                            </PrimaryButton>
                            <button
                                onClick={() => setView('customer-list')}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;