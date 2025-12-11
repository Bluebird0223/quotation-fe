import React, { useState, useEffect } from 'react';
import { FileText, Plus, PenLine, Trash, Download, Eye } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import { communication } from '../../service/communication';
import InvoicePreview from './InvoicePreview';

const InvoiceList = ({ setView, setInvoiceToEdit }) => {
    const [invoices, setInvoices] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(null);

    const handlePreview = (id) => {
        setSelectedInvoiceId(id);
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setSelectedInvoiceId(null);
    };

    const handleDownload = async (invoice) => {
        try {
            setDownloading(invoice._id);

            // Generate PDF and download
            const response = await communication.generateInvoicePDF(invoice._id);

            if (response?.data?.status && response.data.pdfUrl) {
                // Create a temporary link to download the PDF
                const link = document.createElement('a');
                link.href = response.data.pdfUrl;
                link.download = `invoice_${invoice.invoiceNo}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Revoke the object URL after download
                setTimeout(() => {
                    URL.revokeObjectURL(response.data.pdfUrl);
                }, 100);
            } else {
                throw new Error(response?.data?.message || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert('Failed to download invoice: ' + error.message);
        } finally {
            setDownloading(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                const response = await communication.deleteInvoice(id);
                if (response?.data?.status) {
                    setInvoices(prev => prev.filter(invoice => invoice._id !== id));
                } else {
                    console.error('Delete failed:', response?.data?.message);
                    alert('Failed to delete invoice');
                }
            } catch (error) {
                console.error('Error deleting invoice:', error);
                alert('Error deleting invoice');
            }
        }
    };

    const getInvoices = async () => {
        try {
            setLoading(true);
            const response = await communication.getAllInvoices();
            const invoiceData = response?.data?.result || [];
            setInvoices(invoiceData);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getInvoices();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <FileText className="mr-3 text-green-600" size={30} /> Invoice Tax
                </h1>
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <FileText className="mr-3 text-green-600" size={30} /> Invoice Tax
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{invoices.length}</strong> invoices recorded.</p>
                <PrimaryButton icon={Plus} onClick={() => setView('create-invoice')}>
                    Create New Invoice
                </PrimaryButton>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                GST Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {invoice.invoiceNo}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(invoice.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {invoice.customerName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-700">
                                        {formatCurrency(invoice.totalAmount)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">
                                        {invoice.gstType || 'CGST+SGST'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handlePreview(invoice._id)}
                                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                            title="Preview Invoice"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setInvoiceToEdit(invoice);
                                                setView('edit-invoice');
                                            }}
                                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                                            title="Edit Invoice"
                                        >
                                            <PenLine size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(invoice)}
                                            disabled={downloading === invoice._id}
                                            className={`p-2 ${downloading === invoice._id ? 'text-gray-400' : 'text-green-600 hover:text-green-900 hover:bg-green-50'} rounded-lg transition-all duration-200`}
                                            title={downloading === invoice._id ? 'Downloading...' : 'Download PDF'}
                                        >
                                            {downloading === invoice._id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mx-auto"></div>
                                            ) : (
                                                <Download size={18} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice._id)}
                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Delete Invoice"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {invoices.length === 0 && !loading && (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 text-sm mb-4">
                        No invoices available. Click 'Create New Invoice' to get started!
                    </p>
                </div>
            )}

            {/* Invoice Preview Modal */}
            {showPreview && (
                <InvoicePreview
                    invoiceId={selectedInvoiceId}
                    onClose={handleClosePreview}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
};

export default InvoiceList;