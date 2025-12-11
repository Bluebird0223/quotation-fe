import html2pdf from 'html2pdf.js';
import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Printer } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import { communication, getServerUrl } from '../../service/communication';

// Import your logo
import logo from '../../assets/logo.png';
import { generateQuotationPDF } from '../../utils/pdfutils';

const company = {
    name: "Quotation app",
    address: "Plot no.32,mumbai Metro Station,Mumbai-00",
    phone: "+91 1234513245,+91 1234512345",
    email: "strategicsolutions1999@gmail.com",
    website: "www.quotation.com",
    preparedBy: "Quotation app",
    city: "Nagpur",
    currency: '₹'
}

const QuotationPreview = ({ quotationId, onClose, onDownload }) => {
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        const fetchQuotationData = async () => {
            try {
                setLoading(true);
                const quotationResponse = await communication.getQuotationById(quotationId);
                if (quotationResponse?.data?.status) {
                    setQuotation(quotationResponse.data.result);
                } else {
                    throw new Error('Failed to fetch quotation details');
                }
            } catch (err) {
                console.error('Error fetching quotation data:', err);
                setError('Failed to load quotation preview');
            } finally {
                setLoading(false);
            }
        };

        if (quotationId) {
            fetchQuotationData();
        }
    }, [quotationId]);

    const handleDownload = async () => {
        try {
            setPdfLoading(true);

            // Use the utility function
            await generateQuotationPDF(quotation, company, totals, convertToWords);

            if (onDownload) {
                onDownload();
            }
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate quotation PDF');
        } finally {
            setPdfLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Calculate item-wise amounts using your estimate format logic
    const calculateItemAmounts = (item) => {
        const quantity = parseFloat(item.quantity) || 1;
        const rate = parseFloat(item.rate) || 0;
        const discountPercent = parseFloat(item.discount) || 0;
        const gstPercent = parseFloat(item.taxGST) || 0;

        // Calculate like your estimate format
        const subTotal = quantity * rate;
        const discountAmount = (subTotal * discountPercent) / 100;
        const taxableAmount = subTotal - discountAmount;
        const gstAmount = (taxableAmount * gstPercent) / 100;
        const totalAmount = subTotal - discountAmount + gstAmount;

        return {
            subTotal: subTotal.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            taxableAmount: taxableAmount.toFixed(2),
            gstAmount: gstAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            sgst: (gstAmount / 2).toFixed(2),
            cgst: (gstAmount / 2).toFixed(2)
        };
    };

    // Calculate totals
    const calculateTotals = () => {
        if (!quotation?.items) return {};

        let subTotal = 0;
        let totalDiscount = 0;
        let totalGST = 0;
        let grandTotal = 0;

        quotation.items.forEach(item => {
            const amounts = calculateItemAmounts(item);
            subTotal += parseFloat(amounts.subTotal);
            totalDiscount += parseFloat(amounts.discountAmount);
            totalGST += parseFloat(amounts.gstAmount);
            grandTotal += parseFloat(amounts.totalAmount);
        });

        return {
            subTotal: subTotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            totalGST: totalGST.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
            totalSGST: (totalGST / 2).toFixed(2),
            totalCGST: (totalGST / 2).toFixed(2),
            youSaved: totalDiscount.toFixed(2)
        };
    };

    // Convert amount to words (basic implementation)
    const convertToWords = (amount) => {
        const num = parseFloat(amount);
        if (num === 0) return 'Zero Rupees Only';

        const rupees = Math.floor(num);
        const paisa = Math.round((num - rupees) * 100);

        let words = `${rupees} Rupees`;
        if (paisa > 0) {
            words += ` and ${paisa} Paisa`;
        }
        words += ' Only';

        return words;
    };

    const totals = calculateTotals();

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading quotation preview...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-4">Error</div>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <PrimaryButton onClick={onClose}>Close</PrimaryButton>
                    </div>
                </div>
            </div>
        );
    }

    if (!quotation) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FileText className="mr-2 text-green-600" size={24} />
                        Quotation Preview - {quotation.refNo}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition duration-150"
                        disabled={pdfLoading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Preview Content */}
                <div className="overflow-auto max-h-[calc(90vh-140px)] p-6">
                    <div className="quotation-preview bg-white">
                        {/* Header Section with Logo */}
                        <div className="header flex justify-between items-start mb-6 border-b-2 border-green-500 pb-4">
                            <div className="logo-section flex items-center">
                                <img
                                    src={logo}
                                    alt="Auotation Logo"
                                    className="h-16 w-auto mr-4"
                                />
                                <div>
                                    <div className="company-name text-2xl font-bold text-green-600">
                                        {company.name}
                                    </div>
                                    <div className="company-tagline text-gray-600 text-sm">
                                        Home Automation and AV Solutions
                                    </div>
                                </div>
                            </div>
                            <div className="company-info text-right text-sm text-gray-600">
                                <div className="font-semibold text-gray-800">{company.address}</div>
                                <div>{company.phone}</div>
                                <div>{company.email}</div>
                                <div>{company.website}</div>
                            </div>
                        </div>

                        {/* Quotation Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-green-600 uppercase tracking-wide">QUOTATION</h1>
                            <div className="text-gray-600 mt-2">Ref: {quotation.refNo}</div>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-600 mb-2">Bill To:</h3>
                                <p className="font-semibold text-gray-800">{quotation.customerName}</p>
                                {quotation.customerAddress && (
                                    <p className="text-gray-600 text-sm">{quotation.customerAddress}</p>
                                )}
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-semibold">
                                        {new Date(quotation.date).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-600">Prepared By:</span>
                                    <span className="font-semibold">{company.preparedBy}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valid Until:</span>
                                    <span className="font-semibold">
                                        {new Date(new Date(quotation.date).setDate(new Date(quotation.date).getDate() + 30)).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6 overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-green-600 text-white">
                                        <th className="border border-gray-300 p-2 text-left">#</th>
                                        <th className="border border-gray-300 p-2 text-left">Image</th>
                                        <th className="border border-gray-300 p-2 text-left">Item Name</th>
                                        <th className="border border-gray-300 p-2 text-left">Description</th>
                                        <th className="border border-gray-300 p-2 text-center">HSN</th>
                                        <th className="border border-gray-300 p-2 text-center">Qty</th>
                                        <th className="border border-gray-300 p-2 text-center">Unit</th>
                                        <th className="border border-gray-300 p-2 text-right">Price/Unit</th>
                                        <th className="border border-gray-300 p-2 text-right">Discount</th>
                                        <th className="border border-gray-300 p-2 text-right">GST</th>
                                        <th className="border border-gray-300 p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items?.map((item, index) => {
                                        const amounts = calculateItemAmounts(item);

                                        // Get description and HSN from itemId if available, otherwise from item directly
                                        const description = item.itemId?.description || item.description || 'No description available';
                                        const hsnCode = item.itemId?.hsn || item.hsnCode || 'N/A';
                                        const itemName = item.itemId?.itemName || item.itemName || 'N/A';
                                        const itemUnit = item.itemId?.itemUnit || item.itemUnit || 'Nos';

                                        return (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                                <td className="border border-gray-300 p-2">
                                                    {item?.itemImage?.url ? (
                                                        <img
                                                            src={item.itemImage.url}
                                                            alt={itemName}
                                                            className="w-20 h-20 object-cover rounded"
                                                            crossOrigin="anonymous"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 p-2 font-semibold">
                                                    {itemName}
                                                </td>
                                                <td className="border border-gray-300 p-2 max-w-xs">
                                                    <div className="text-sm text-gray-700">
                                                        {description}
                                                    </div>
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {hsnCode}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {itemUnit}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-right">
                                                    {company.currency} {parseFloat(item.rate || 0).toFixed(2)}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-right">
                                                    {parseFloat(item.discount || 0) > 0 ? (
                                                        <>
                                                            {company.currency} {amounts.discountAmount}<br />
                                                            <span className="text-xs text-gray-500">({item.discount}%)</span>
                                                        </>
                                                    ) : '-'}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-right">
                                                    {item.withTax ? (
                                                        <>
                                                            {company.currency} {amounts.gstAmount}<br />
                                                            <span className="text-xs text-gray-500">({item.taxGST}%)</span>
                                                        </>
                                                    ) : 'N/A'}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-right font-semibold">
                                                    {company.currency} {amounts.totalAmount}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Total Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-green-600 mb-2">Amount in Words:</h3>
                                <p className="text-gray-700 italic">{convertToWords(totals.grandTotal)}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Amount Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Sub Total:</span>
                                        <span>{company.currency} {totals.subTotal}</span>
                                    </div>
                                    {parseFloat(totals.totalDiscount) > 0 && (
                                        <div className="flex justify-between text-red-600">
                                            <span>Discount:</span>
                                            <span>- {company.currency} {totals.totalDiscount}</span>
                                        </div>
                                    )}
                                    {parseFloat(totals.totalGST) > 0 && (
                                        <>
                                            <div className="flex justify-between text-blue-600">
                                                <span>SGST:</span>
                                                <span>+ {company.currency} {totals.totalSGST}</span>
                                            </div>
                                            <div className="flex justify-between text-blue-600">
                                                <span>CGST:</span>
                                                <span>+ {company.currency} {totals.totalCGST}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between border-t pt-2 font-bold text-lg text-green-600">
                                        <span>Grand Total:</span>
                                        <span>{company.currency} {totals.grandTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h3 className="font-semibold text-gray-700 mb-3">Terms & Conditions</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• This quotation is valid for 30 days from the date of issue</li>
                                <li>• Prices are subject to change without prior notice</li>
                                <li>• Delivery timeline will be confirmed upon order confirmation</li>
                                <li>• Payment terms: 50% advance, 50% before delivery</li>
                                <li>• All disputes are subject to {company.city} jurisdiction</li>
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="text-center border-t pt-4 text-gray-600 text-sm">
                            <div className="font-semibold mb-1">Thank you for your business!</div>
                            <div>{company.name} | {company.address} | {company.phone} | {company.email}</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex items-center space-x-2 px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
                        disabled={pdfLoading}
                    >
                        <X size={20} />
                        Cancel
                    </button>

                    <PrimaryButton
                        onClick={handleDownload}
                        icon={Download}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

export default QuotationPreview;