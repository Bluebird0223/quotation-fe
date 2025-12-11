import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, Search } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import { communication } from '../../service/communication';

const InvoiceForm = ({ invoiceToEdit, setView, items: propItems }) => {
    const [formData, setFormData] = useState({
        invoiceNo: '',
        date: new Date().toISOString().split('T')[0],
        referenceNo: '',
        customerName: '',
        customerAddress: '',
        customerState: 'MAHARASHTRA',
        stateCode: '27',
        customerGSTIN: '',
        items: [{
            itemId: '',
            itemName: '',
            description: '',
            hsnCode: '',
            quantity: 1,
            unit: 'nos',
            rate: 0,
            total: 0
        }],
        gstType: 'cgst_sgst',
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        advance: 0,
        discount: 0
    });

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch items from API
    const fetchItems = async () => {
        try {
            const response = await communication.getAllItem();
            const itemsData = response?.data?.result || [];
            setItems(itemsData);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchItems();

        if (invoiceToEdit) {
            setFormData(invoiceToEdit);
        } else {
            const timestamp = Date.now();
            setFormData(prev => ({
                ...prev,
                invoiceNo: `CHROMA/${timestamp.toString().slice(-3)}/FY2526`,
                referenceNo: timestamp.toString().slice(-3)
            }));
        }
    }, [invoiceToEdit]);

    // Filter items based on search term
    const filteredItems = items.filter(item =>
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hsn?.includes(searchTerm)
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Calculate total if rate or quantity changes
        if (field === 'rate' || field === 'quantity') {
            updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].rate;
        }

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Add item from product catalog
    const addItemFromCatalog = (item) => {
        const updatedItems = [...formData.items];
        const newItem = {
            itemId: item._id,
            itemName: item.itemName,
            description: item.description,
            hsnCode: item.hsn,
            quantity: 1,
            unit: item.itemUnit || 'nos',
            rate: parseFloat(item.rate) || 0,
            total: parseFloat(item.rate) || 0
        };

        // Check if we're editing existing item or adding new
        const emptyItemIndex = updatedItems.findIndex(invItem => !invItem.itemName && !invItem.description);
        if (emptyItemIndex !== -1 && !updatedItems[emptyItemIndex].itemName) {
            updatedItems[emptyItemIndex] = newItem;
        } else {
            updatedItems.push(newItem);
        }

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));

        setShowItemSearch(false);
        setSearchTerm('');
    };

    const addEmptyItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    itemId: '',
                    itemName: '',
                    description: '',
                    hsnCode: '',
                    quantity: 1,
                    unit: 'nos',
                    rate: 0,
                    total: 0
                }
            ]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const updatedItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                items: updatedItems
            }));
        }
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const taxableAmount = subtotal - (formData.discount || 0);

        let cgst = 0, sgst = 0, igst = 0;

        if (formData.gstType === 'cgst_sgst') {
            cgst = taxableAmount * ((formData.cgstRate || 0) / 100);
            sgst = taxableAmount * ((formData.sgstRate || 0) / 100);
        } else {
            igst = taxableAmount * ((formData.igstRate || 0) / 100);
        }

        const totalAmount = taxableAmount + cgst + sgst + igst - (formData.advance || 0);

        return { subtotal, taxableAmount, cgst, sgst, igst, totalAmount };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const totals = calculateTotals();
            const invoiceData = {
                ...formData,
                ...totals,
                createdAt: invoiceToEdit ? formData.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (invoiceToEdit) {
                await communication.updateInvoice(invoiceToEdit._id, invoiceData);
            } else {
                await communication.createInvoice(invoiceData);
            }

            setView('invoice-list');
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {invoiceToEdit ? 'Edit Invoice' : 'Create New Invoice'}
                </h1>
                <button
                    onClick={() => setView('invoice-list')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Invoice No. *
                        </label>
                        <input
                            type="text"
                            name="invoiceNo"
                            value={formData.invoiceNo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference No.
                        </label>
                        <input
                            type="text"
                            name="referenceNo"
                            value={formData.referenceNo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Customer Information */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Name *
                            </label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GSTIN
                            </label>
                            <input
                                type="text"
                                name="customerGSTIN"
                                value={formData.customerGSTIN}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <textarea
                                name="customerAddress"
                                value={formData.customerAddress}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowItemSearch(true)}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                <Search size={16} />
                                <span>Add from Products</span>
                            </button>
                            <button
                                type="button"
                                onClick={addEmptyItem}
                                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                            >
                                <Plus size={16} />
                                <span>Add Custom Item</span>
                            </button>
                        </div>
                    </div>

                    {/* Item Search Modal */}
                    {showItemSearch && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold">Select Product</h3>
                                        <button
                                            onClick={() => {
                                                setShowItemSearch(false);
                                                setSearchTerm('');
                                            }}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            placeholder="Search products by name, description, or HSN code..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto p-4">
                                    {filteredItems.length > 0 ? (
                                        <div className="space-y-2">
                                            {filteredItems.map((item) => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => addItemFromCatalog(item)}
                                                    className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 cursor-pointer transition duration-200"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                                            <div className="flex space-x-4 mt-2">
                                                                <p className="text-xs text-gray-500">HSN: {item.hsn}</p>
                                                                <p className="text-xs text-gray-500">Unit: {item.itemUnit}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="font-semibold text-green-600">₹{parseFloat(item.rate || 0).toLocaleString('en-IN')}</p>
                                                            <p className="text-sm text-gray-500 mt-1">In Stock: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            {searchTerm ? 'No products found. Try a different search term.' : 'No products available.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="grid grid-cols-12 gap-4 items-end">
                                    <div className="col-span-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Enter item name"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            placeholder="Item description"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            HSN Code
                                        </label>
                                        <input
                                            type="text"
                                            value={item.hsnCode}
                                            onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-full p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-200"
                                            disabled={formData.items.length === 1}
                                        >
                                            <Trash2 size={18} className="mx-auto" />
                                        </button>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Unit
                                        </label>
                                        <select
                                            value={item.unit}
                                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="nos">nos</option>
                                            <option value="PCS">PCS</option>
                                            <option value="SET">SET</option>
                                            <option value="MTR">MTR</option>
                                            <option value="KG">KG</option>
                                        </select>
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rate (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total (₹)
                                        </label>
                                        <input
                                            type="text"
                                            value={(item.total || 0).toLocaleString('en-IN')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            &nbsp;
                                        </label>
                                        <div className="text-sm text-gray-500 text-center py-2">
                                            Item {index + 1}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tax and Totals */}
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax & Totals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GST Type
                            </label>
                            <select
                                name="gstType"
                                value={formData.gstType}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="cgst_sgst">CGST + SGST</option>
                                <option value="igst">IGST</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (₹)
                            </label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Advance (₹)
                            </label>
                            <input
                                type="number"
                                name="advance"
                                value={formData.advance}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-right">Subtotal:</div>
                            <div className="font-semibold">₹{totals.subtotal.toLocaleString('en-IN')}</div>

                            {formData.discount > 0 && (
                                <>
                                    <div className="text-right">Discount:</div>
                                    <div className="font-semibold">-₹{formData.discount.toLocaleString('en-IN')}</div>
                                </>
                            )}

                            {formData.gstType === 'cgst_sgst' ? (
                                <>
                                    <div className="text-right">CGST ({formData.cgstRate}%):</div>
                                    <div className="font-semibold">₹{totals.cgst.toLocaleString('en-IN')}</div>
                                    <div className="text-right">SGST ({formData.sgstRate}%):</div>
                                    <div className="font-semibold">₹{totals.sgst.toLocaleString('en-IN')}</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-right">IGST ({formData.igstRate}%):</div>
                                    <div className="font-semibold">₹{totals.igst.toLocaleString('en-IN')}</div>
                                </>
                            )}

                            {formData.advance > 0 && (
                                <>
                                    <div className="text-right">Advance:</div>
                                    <div className="font-semibold">-₹{formData.advance.toLocaleString('en-IN')}</div>
                                </>
                            )}

                            <div className="text-right font-bold border-t pt-2">Total Amount:</div>
                            <div className="font-bold text-green-600 border-t pt-2">₹{totals.totalAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => setView('invoice-list')}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                    >
                        Cancel
                    </button>
                    <PrimaryButton type="submit" icon={Save} disabled={loading}>
                        {loading ? 'Saving...' : (invoiceToEdit ? 'Update Invoice' : 'Create Invoice')}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;