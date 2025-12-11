import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { communication } from '../../service/communication';

const InvoicePreview = ({ invoiceId, onClose }) => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            const response = await communication.getInvoice(invoiceId);
            setInvoice(response?.data?.result);
        } catch (error) {
            console.error('Error fetching invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');
    };

    // Convert number to words
    const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return 'Zero';

        const convertMillions = (n) => {
            if (n >= 10000000) {
                return convertMillions(Math.floor(n / 10000000)) + ' Crore ' + convertMillions(n % 10000000);
            } else if (n >= 100000) {
                return convertMillions(Math.floor(n / 100000)) + ' Lakh ' + convertMillions(n % 100000);
            } else if (n >= 1000) {
                return convertHundreds(Math.floor(n / 1000)) + ' Thousand ' + convertHundreds(n % 1000);
            } else {
                return convertHundreds(n);
            }
        };

        const convertHundreds = (n) => {
            if (n > 99) {
                return ones[Math.floor(n / 100)] + ' Hundred ' + convertTens(n % 100);
            } else {
                return convertTens(n);
            }
        };

        const convertTens = (n) => {
            if (n < 20) {
                return ones[n];
            } else {
                return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
            }
        };

        let result = convertMillions(num);
        return result + ' Only';
    };

    // Calculate values exactly like the PDF
    const calculateValues = (invoice) => {
        if (!invoice) return {};

        // Calculate subtotal from items
        const subtotal = invoice.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

        // Calculate taxable amount (after discount)
        const taxableAmount = subtotal - (invoice.discount || 0);

        // Calculate taxes based on GST type
        let cgst = 0, sgst = 0, igst = 0;

        if (invoice.gstType === 'cgst_sgst') {
            cgst = taxableAmount * ((invoice.cgstRate || 9) / 100);
            sgst = taxableAmount * ((invoice.sgstRate || 9) / 100);
        } else {
            igst = taxableAmount * ((invoice.igstRate || 18) / 100);
        }

        // Calculate final total (after advance)
        const totalAmount = taxableAmount + cgst + sgst + igst - (invoice.advance || 0);

        return {
            subtotal,
            taxableAmount,
            cgst,
            sgst,
            igst,
            totalAmount,
            taxAmount: cgst + sgst + igst
        };
    };

    const calculatedValues = calculateValues(invoice);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
                    <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                            <Download size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="border border-gray-800 p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                        {/* Header Section */}
                        <div className="text-center mb-4">
                            <h1 className="text-2xl font-bold uppercase mb-1">TAX INVOICE</h1>
                            <h2 className="text-xl font-bold">QUOTATION APP</h2>
                        </div>

                        {/* Date and Invoice No Section - EXACT PDF FORMAT */}
                        <div className="flex justify-between mb-4">
                            <div>
                                <span className="font-semibold">DATE:</span>
                                <span className="ml-2">{formatDate(invoice?.date)}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold">INVOICE NO.</span>
                                <span className="ml-2">{invoice?.invoiceNo}</span>
                            </div>
                        </div>

                        {/* Company Address Section - EXACT PDF FORMAT */}
                        <div className="mb-4">
                            <div className="flex justify-between">
                                <div className="w-2/3">
                                    FLAT NO. G2, PLOT NO. 39<br />
                                    SUBHAM APARTMENT, HINGANA ROAD,<br />
                                    NAGPUR (MS) – 440036<br />
                                    STATE NAME - MAHARASHTRA (CODE 27)<br />
                                    <span className="font-semibold">SHIP TO:</span><br />
                                    4B, 2ND FLOOR, TILAK NAGAR<br />
                                    Mobile:- +91 8208060297<br />
                                    AMRAWATI ROAD, NAGPUR - 440010<br />
                                    E-mail:- strategicsolutions1999@gmail.com<br />
                                    STATE NAME - MAHARASHTRA (CODE 27)<br />
                                    PAN:- AATFC5964E<br />
                                    GSTIN :<br />
                                    27AAACV5706B2ZN
                                </div>
                                <div className="w-1/3 text-right">
                                    <span className="font-semibold">REFERENCE NO.</span><br />
                                    {invoice?.referenceNo}<br />
                                    <br />
                                    GST No: 27AATFC5964E1Z0<br />
                                    <br />
                                    <span className="font-semibold">BILL TO:</span><br />
                                    4B, 2ND FLOOR, TILAK NAGAR<br />
                                    AMRAWATI ROAD, NAGPUR - 440010<br />
                                    STATE NAME - MAHARASHTRA (CODE 27)<br />
                                    GSTIN :<br />
                                    27AAACV5706B2ZN
                                </div>
                            </div>
                        </div>

                        {/* Items Table - EXACT PDF FORMAT */}
                        <table className="w-full border-collapse border border-gray-800 mb-2">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-800 p-1 text-center w-8">S. NO.</th>
                                    <th className="border border-gray-800 p-1 text-left">DESCRIPTION OF GOODS</th>
                                    <th className="border border-gray-800 p-1 text-center w-16">HSN CODE</th>
                                    <th className="border border-gray-800 p-1 text-center w-12">QTY</th>
                                    <th className="border border-gray-800 p-1 text-center w-12">UOM</th>
                                    <th className="border border-gray-800 p-1 text-right w-24">RATE (IN RS.)</th>
                                    <th className="border border-gray-800 p-1 text-right w-28">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice?.items?.filter(item => item.itemName || item.description).map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-800 p-1 text-center">{index + 1}</td>
                                        <td className="border border-gray-800 p-1">{item.itemName || item.description}</td>
                                        <td className="border border-gray-800 p-1 text-center">{item.hsnCode}</td>
                                        <td className="border border-gray-800 p-1 text-center">{item.quantity?.toFixed(2)}</td>
                                        <td className="border border-gray-800 p-1 text-center">{item.unit}</td>
                                        <td className="border border-gray-800 p-1 text-right">{formatCurrency(item.rate)}</td>
                                        <td className="border border-gray-800 p-1 text-right">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section - EXACT PDF FORMAT */}
                        <div className="flex justify-between mb-2">
                            {/* Left side - Tax breakdown */}
                            <div className="w-1/2">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        {invoice?.gstType === 'cgst_sgst' ? (
                                            <>
                                                <tr>
                                                    <td className="p-1 font-semibold w-32">CGST</td>
                                                    <td className="p-1 text-right w-16">9.00%</td>
                                                    <td className="p-1 text-right w-24">{formatCurrency(calculatedValues.cgst)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-1 font-semibold">SGST</td>
                                                    <td className="p-1 text-right">9.00%</td>
                                                    <td className="p-1 text-right">{formatCurrency(calculatedValues.sgst)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-1 font-semibold">IGST</td>
                                                    <td className="p-1 text-right">18.00%</td>
                                                    <td className="p-1 text-right"></td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td className="p-1 font-semibold">IGST</td>
                                                <td className="p-1 text-right">18.00%</td>
                                                <td className="p-1 text-right">{formatCurrency(calculatedValues.igst)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Right side - Amount breakdown */}
                            <div className="w-1/2">
                                <table className="w-full border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="p-1 font-semibold w-40">SUBTOTAL</td>
                                            <td className="p-1 text-right w-28">{formatCurrency(calculatedValues.subtotal)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1 font-semibold">ADVANCE</td>
                                            <td className="p-1 text-right">- {formatCurrency(invoice?.advance || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1 font-semibold">DISCOUNT</td>
                                            <td className="p-1 text-right">- {formatCurrency(invoice?.discount || 0)}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1 font-semibold">TOTAL (Outstanding)</td>
                                            <td className="p-1 text-right">{formatCurrency(calculatedValues.totalAmount)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Amount in Words - EXACT PDF FORMAT */}
                        <div className="mb-2">
                            <div>
                                <span className="font-semibold">Invoice Value (in Words) - </span>
                                INR {numberToWords(Math.round(calculatedValues.totalAmount))}
                            </div>
                            <div>
                                <span className="font-semibold">Tax Amount (in Words) - </span>
                                INR {numberToWords(Math.round(calculatedValues.taxAmount))}
                            </div>
                        </div>

                        {/* Bank Details - EXACT PDF FORMAT */}
                        <div className="mb-2">
                            <div><span className="font-semibold">Bank Name</span> : KOTAK MAHINDRA BANK</div>
                            <div><span className="font-semibold">A/c No.</span> : 3750309249</div>
                            <div><span className="font-semibold">Branch & IFS Code:</span> GANDHI BAUG, NAGPUR & KKBK0001837</div>
                        </div>

                        {/* Footer Section - EXACT PDF FORMAT */}
                        <div className="flex justify-between items-start">
                            <div className="w-2/3">
                                <div className="text-lg font-semibold mb-1">
                                    THANK YOU FOR YOUR ASSOCIATION WITH US!
                                </div>
                                <div className="mb-2">
                                    For QUOTATION App
                                </div>
                                <div className="text-sm">
                                    <div className="font-semibold mb-1">Declaration</div>
                                    <div>
                                        We declare that this invoice shows the actual price of <br />
                                        the goods/services described and that all particulars are true.
                                    </div>
                                    <div className="mt-4">
                                        (Partner - Hrishikesh Chaudhari)
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/3 text-right text-sm">
                                VARDAN FINANCIAL SERVICES PVT LTD<br />
                                VARDAN FINANCIAL SERVICES PVT LTD<br />
                                Company's Bank Details
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;