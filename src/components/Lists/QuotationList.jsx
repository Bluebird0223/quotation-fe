import React, { useEffect, useState } from 'react';
import { FileText, Plus, PenLine, Trash, StickyNote, Send, Upload, Download } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';
import { communication } from '../../service/communication';
import QuotationPreview from './QuotationPreview';
import { generateQuotationPDF, calculateTotals, convertToWords } from '../../utils/pdfutils';

// Define Company Constants Locally for now (or import from constants)
const COMPANY_INFO = {
    name: "Quotation app",
    address: "Plot no.32, mumbai Metro Station, Mumbai-00",
    phone: "+91 12345 12345, +91 12345 1235",
    email: "quotation@gmail.com",
    website: "www.quotation.com",
    preparedBy: "Quotations",
    city: "Mumbai",
    currency: "₹"
};

const QuotationList = ({ setView, setQuoteToEdit }) => {
    const [quotations, setQuotations] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedQuotationId, setSelectedQuotationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(null); // Track which quotation is being sent/downloaded
    const [importing, setImporting] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleGenerate = (id) => {
        setSelectedQuotationId(id);
        setShowPreview(true);
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setSelectedQuotationId(null);
    };

    const handleDownloadSuccess = () => {
        console.log('Quotation downloaded successfully');
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Are you sure you want to delete this quotation?`)) {
            try {
                const response = await communication.deleteQuotation(id);
                if (response?.data?.status) {
                    setQuotations(prev => prev.filter(quote => quote._id !== id));
                    console.log('Quotation deleted successfully');
                } else {
                    console.error('Delete failed:', response?.data?.message);
                    alert('Failed to delete quotation');
                }
            } catch (error) {
                console.error('Error deleting quotation:', error);
                alert('Error deleting quotation');
            }
        }
    };

    const generatePDFAndShare = async (quotation) => {
        try {
            setSending(quotation._id);

            // Generate PDF (you'll need to implement this API call)
            const pdfResponse = await communication.generateQuotationPDF(quotation._id);

            if (pdfResponse?.data?.pdfUrl || pdfResponse?.data?.pdfData) {
                // Format the message
                const message = `Hello ${quotation.customerName},\n\nHere is your quotation ${quotation.refNo} dated ${formatDate(quotation.date)}.\nTotal Amount: ${formatCurrency(quotation.totalAmount)}\n\nThank you for your business!`;

                // Encode the message for URL
                const encodedMessage = encodeURIComponent(message);

                // Get PDF URL - adjust this based on your API response structure
                const pdfUrl = pdfResponse.data.pdfUrl ||
                    URL.createObjectURL(new Blob([pdfResponse.data.pdfData], { type: 'application/pdf' }));

                // Create WhatsApp share URL
                const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

                // Open WhatsApp in new tab
                window.open(whatsappUrl, '_blank');

                // Optional: Show success message
                console.log('Quotation shared successfully');
            } else {
                throw new Error('Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF for sharing:', error);
            alert('Failed to generate quotation PDF for sharing');
        } finally {
            setSending(null);
        }
    };

    const handleDownload = async (quotation) => {
        try {
            setSending(quotation._id);
            const totals = calculateTotals(quotation.items);
            await generateQuotationPDF(quotation, COMPANY_INFO, totals, convertToWords);
            console.log('Quotation downloaded successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to delete quotation');
        } finally {
            setSending(null);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const separator = '__QUOTATION_DATA__';
                const parts = text.split(separator);

                if (parts.length < 2) {
                    alert('Invalid PDF: No embedded quotation data found.');
                    setImporting(false);
                    return;
                }

                // The last part should contain our JSON
                const jsonString = parts[parts.length - 1].trim();
                const quotationData = JSON.parse(jsonString);

                // Sanitize data -> Remove fields that should be generated new
                const { _id, createdAt, updatedAt, ...cleanData } = quotationData;

                // If items have IDs (ObjectId), might want to keep or clear them?
                // Usually keeping them is fine if they refer to Item Master. 
                // But for pure "copy", usually we want a fresh start.
                // Let's keep items as is from the backup.

                const response = await communication.addQuotation(cleanData);

                if (response?.data?.status) {
                    alert('Quotation imported successfully!');
                    getQuotation(); // Refresh list
                } else {
                    alert('Import failed: ' + (response?.data?.message || 'Unknown error'));
                }

            } catch (error) {
                console.error('Import Error:', error);
                alert('Failed to import quotation. File might be corrupted.');
            } finally {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
            }
        };

        reader.onerror = () => {
            alert('Error reading file');
            setImporting(false);
        };

        // We need to read as Text (or BinaryString) to find our string marker.
        // PDF is binary, but our appended data is text at the end. 
        // Reading as text might corrupt binary PDF header but we only care about the END.
        // A safer way is ensuring we read distinct lines or use ArrayBuffer, but "readAsText" usually works for recovering string data if encoding is standard.
        // Standard PDFs are mixed binary/text.
        reader.readAsText(file);
    };

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

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                    <FileText className="mr-3 text-green-600" size={30} /> Quotation List
                </h1>
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading quotations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <FileText className="mr-3 text-green-600" size={30} /> Quotation List
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{quotations.length}</strong> quotations recorded.</p>
                <div className="flex space-x-3">
                    <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <PrimaryButton
                        icon={importing ? null : Upload}
                        onClick={handleImportClick}
                        disabled={importing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {importing ? 'Importing...' : 'Import PDF'}
                    </PrimaryButton>
                    <PrimaryButton icon={Plus} onClick={() => setView('create-quotation')}>
                        Create New Quotation
                    </PrimaryButton>
                </div>
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
                                Total Amount
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
                                        {formatCurrency(quote.totalAmount)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    // Fetch full details to ensure items are populated
                                                    setLoading(true);
                                                    const res = await communication.getQuotationById(quote._id);
                                                    if (res?.data?.status) {
                                                        setQuoteToEdit(res.data.result);
                                                        setView('edit-quotation');
                                                    } else {
                                                        alert('Failed to fetch quotation details');
                                                    }
                                                } catch (err) {
                                                    console.error('Error fetching quotation for edit:', err);
                                                    alert('Error loading quotation details');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                                            title="Edit Quotation"
                                        >
                                            <PenLine size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(quote)}
                                            disabled={sending === quote._id}
                                            className={`p-2 ${sending === quote._id ? 'text-gray-400' : 'text-orange-600 hover:text-orange-900'} hover:bg-orange-50 rounded-lg transition-all duration-200`}
                                            title="Download PDF"
                                        >
                                            {sending === quote._id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                            ) : (
                                                <Download size={18} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleGenerate(quote._id)}
                                            className="p-2 text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-all duration-200"
                                            title="Generate PDF"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quote._id)}
                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                            title="Delete Quotation"
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

            {quotations.length === 0 && !loading && (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 text-sm mb-4">
                        No quotation available. Click 'Add New Quotation' to get started!
                    </p>
                </div>
            )}

            {/* Quotation Preview Modal */}
            {showPreview && (
                <QuotationPreview
                    quotationId={selectedQuotationId}
                    onClose={handleClosePreview}
                    onDownload={handleDownloadSuccess}
                />
            )}
        </div>
    );
};

export default QuotationList;