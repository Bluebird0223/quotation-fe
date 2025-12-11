import React, { useEffect, useState } from 'react';
import { FileText, Plus, PenLine, Trash, StickyNote, Send } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';
import { communication } from '../../service/communication';
// import QuotationPreview from './QuotationPreview';

const BoqList = ({ setView, setQuoteToEdit }) => {
    const [quotations, setQuotations] = useState([]);
    // const [showPreview, setShowPreview] = useState(false);
    const [selectedQuotationId, setSelectedQuotationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(null);

    // const handleGenerate = (id) => {
    //     setSelectedQuotationId(id);
    //     setShowPreview(true);
    // };

    // const handleClosePreview = () => {
    //     setShowPreview(false);
    //     setSelectedQuotationId(null);
    // };

    // const handleDownloadSuccess = () => {
    //     console.log('Quotation downloaded successfully');
    // };

    // const handleDelete = async (id) => {
    //     if (window.confirm(`Are you sure you want to delete this quotation?`)) {
    //         try {
    //             const response = await communication.deleteQuotation(id);
    //             if (response?.data?.status) {
    //                 setQuotations(prev => prev.filter(quote => quote._id !== id));
    //                 console.log('Quotation deleted successfully');
    //             } else {
    //                 console.error('Delete failed:', response?.data?.message);
    //                 alert('Failed to delete quotation');
    //             }
    //         } catch (error) {
    //             console.error('Error deleting quotation:', error);
    //             alert('Error deleting quotation');
    //         }
    //     }
    // };

    const getQuotation = async () => {
        try {
            setLoading(true);
            const response = await communication.getAllQuotation();
            const quotationData = response?.data?.result || [];
            setQuotations(quotationData);
        } catch (error) {
            console.error('Error fetching quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getQuotation();
    }, []);

    // Format currency function
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Format date function
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <FileText className="mr-3 text-green-600" size={30} /> Quotation List
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{quotations.length}</strong> quotations recorded.</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ref No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Note
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {quotations.map((quote) => (
                            <tr key={quote._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {quote.refNo}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {quote.customerName}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(quote.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-700">
                                        {quote?.note?.length > 40 ? `${quote.note.substring(0, 40)}...` : quote.note}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setQuoteToEdit(quote);
                                                setView('edit-boq');
                                            }}
                                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                                            title="Edit Quotation"
                                        >
                                            <PenLine size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BoqList;