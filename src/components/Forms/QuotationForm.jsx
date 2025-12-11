import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Plus, X, List, AlertTriangle, Calculator, Search, Package, Loader } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import FormInput from '../UI/FormInput';
import Notification from '../UI/Notification';
import { communication } from '../../service/communication';
import { formatDateForAPI, formatDateForInput } from '../../utils/dateUtils';

const QuotationForm = ({ quoteToEdit, addQuotation, updateQuotation, setView }) => {
  const [isNew] = useState(!quoteToEdit);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState(quoteToEdit?.customerName || '');
  const [date, setDate] = useState(quoteToEdit?.date ? formatDateForInput(quoteToEdit.date) : new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState(
    quoteToEdit?.items && quoteToEdit.items.length > 0
      ? quoteToEdit.items.map(item => ({
        itemId: item.itemId || '',
        itemName: item.itemName || item?.itemId?.itemName || '',
        hsnCode: item.hsnCode || item?.itemId?.hsnCode || '',
        quantity: item.quantity || 1,
        rate: item.rate || '',
        withTax: item.withTax || false,
        discount: item.discount || '',
        taxGST: item.taxGST || 18,
        itemImage: item?.itemImage?.url || '',
        itemImageFile: null
      }))
      : [{
        itemId: '',
        itemName: '',
        hsnCode: '',
        quantity: 1,
        rate: '',
        withTax: false,
        discount: '',
        taxGST: 18,
        itemImage: '',
        itemImageFile: null
      }]
  );
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchRefs = useRef([]);
  const [imagePreviews, setImagePreviews] = useState({});

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await communication.getAllItem();
        const itemsData = response?.data?.result || [];

        const transformedItems = itemsData.map(item => ({
          id: item._id,
          name: item.itemName,
          hsnCode: item.hsn || '',
          price: parseFloat(item.rate) || parseFloat(item.itemType) || '',
          unit: item.itemUnit,
          type: item.itemType,
          itemImage: item.itemImage || ''
        }));

        setItems(transformedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
        setNotification({ type: 'error', message: 'Failed to load items.' });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideAll = searchRefs.current.every(ref =>
        ref && !ref.contains(event.target)
      );

      if (isOutsideAll) {
        setShowSuggestions(false);
        setSelectedItemIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize refs array
  useEffect(() => {
    searchRefs.current = searchRefs.current.slice(0, lineItems.length);
  }, [lineItems.length]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Calculate totals for each line item using reverse calculation
  const { lineItemTotals, summary } = useMemo(() => {
    const lineItemTotals = lineItems.map(line => {
      const quantity = parseFloat(line.quantity) || 1;
      const rate = parseFloat(line.rate) || 0;
      const discountPercent = parseFloat(line.discount) || 0;
      const gstPercent = parseFloat(line.taxGST) || 0;

      if (line.withTax) {
        const totalWithTax = quantity * rate;
        const subtotal = totalWithTax / (1 + gstPercent / 100);
        const discountAmount = (subtotal * discountPercent) / 100;
        const taxableAmount = subtotal - discountAmount;
        const gstAmount = taxableAmount * (gstPercent / 100);
        const sgst = gstAmount / 2;
        const cgst = gstAmount / 2;
        const finalTotal = subtotal - discountAmount + gstAmount;

        return {
          subtotal: subtotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          taxableAmount: taxableAmount.toFixed(2),
          gstAmount: gstAmount.toFixed(2),
          sgst: sgst.toFixed(2),
          cgst: cgst.toFixed(2),
          totalAmount: finalTotal.toFixed(2),
          originalTotalWithTax: totalWithTax.toFixed(2),
          unit: items.find(item => item.id === line.itemId)?.unit || ''
        };
      } else {
        const subtotal = quantity * rate;
        const discountAmount = (subtotal * discountPercent) / 100;
        const taxableAmount = subtotal - discountAmount;
        const totalAmount = taxableAmount;

        return {
          subtotal: subtotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          taxableAmount: taxableAmount.toFixed(2),
          gstAmount: '0.00',
          sgst: '0.00',
          cgst: '0.00',
          totalAmount: totalAmount.toFixed(2),
          originalTotalWithTax: subtotal.toFixed(2),
          unit: items.find(item => item.id === line.itemId)?.unit || ''
        };
      }
    });

    const subtotal = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const totalDiscount = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.discountAmount), 0);
    const totalGST = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.gstAmount), 0);
    const totalSGST = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.sgst), 0);
    const totalCGST = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.cgst), 0);
    const grandTotal = lineItemTotals.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);

    return {
      lineItemTotals,
      summary: {
        subtotal: subtotal.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalGST: totalGST.toFixed(2),
        totalSGST: totalSGST.toFixed(2),
        totalCGST: totalCGST.toFixed(2),
        grandTotal: grandTotal.toFixed(2)
      }
    };
  }, [lineItems, items]);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await communication.uploadImage(formData);
      if (response.data.status && response.data.data?.url) {
        return response.data.data.url;
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed. Please try again.');
    }
  };

  const handleItemSearch = (index, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index].itemName = value;
    newLineItems[index].itemId = ''; // Clear ID as it's now a custom/search entry
    // Do NOT clear rate or HSN here, allow user to keep existing values or edit them
    newLineItems[index].itemImage = '';
    newLineItems[index].itemImageFile = null;
    setLineItems(newLineItems);
    setSearchTerm(value);
    setSelectedItemIndex(index);
    setShowSuggestions(true);
  };

  const selectItem = (index, item) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      itemId: item.id,
      itemName: item.name,
      hsnCode: item.hsnCode,
      rate: item.price,
      itemImage: item.itemImage,
      itemImageFile: null
    };
    setLineItems(newLineItems);
    setSearchTerm('');
    setShowSuggestions(false);
    setSelectedItemIndex(null);
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];

    if (field === 'quantity' || field === 'taxGST') {
      newLineItems[index][field] = parseFloat(value) || 0;
    } else if (field === 'rate' || field === 'discount') {
      newLineItems[index][field] = value; // Allow empty string
    } else if (field === 'withTax') {
      newLineItems[index][field] = value;
    } else if (field === 'itemName') {
      handleItemSearch(index, value);
      return;
    }

    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      itemId: '',
      itemName: '',
      hsnCode: '',
      quantity: 1,
      rate: '',
      withTax: false,
      discount: '',
      taxGST: 18,
      itemImage: '',
      itemImageFile: null
    }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
    } else {
      setNotification({ type: 'error', message: 'At least one line item is required.' });
    }
  };

  const handleImageUpload = (index, file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setNotification({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, GIF, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'Image size should be less than 5MB.' });
      return;
    }

    const newLineItems = [...lineItems];
    newLineItems[index].itemImageFile = file;
    setLineItems(newLineItems);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews(prev => ({
        ...prev,
        [index]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const newLineItems = [...lineItems];
    newLineItems[index].itemImageFile = null;
    setLineItems(newLineItems);

    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  };

  // Check if item exists in database
  const isItemInDatabase = (itemName) => {
    return items.some(item =>
      item.name.toLowerCase() === itemName.toLowerCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || lineItems.length === 0) {
      setNotification({ type: 'error', message: 'Customer name and at least one line item are required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload all images to Cloudinary and get URLs
      const updatedLineItems = await Promise.all(
        lineItems.map(async (line, index) => {
          let itemImageUrl = line.itemImage;

          // Upload new image file to Cloudinary
          if (line.itemImageFile && line.itemImageFile instanceof File) {
            try {
              itemImageUrl = await uploadImageToCloudinary(line.itemImageFile);
            } catch (uploadError) {
              console.error(`Failed to upload image for item ${index}:`, uploadError);
              throw new Error(`Failed to upload image for ${line.itemName || 'item ' + (index + 1)}`);
            }
          }

          const itemTotal = lineItemTotals[index];
          return {
            itemId: line.itemId || null,
            itemName: line.itemName,
            quantity: line.quantity.toString(),
            rate: line.rate.toString(),
            withTax: line.withTax,
            subTotal: itemTotal.totalAmount.toString(),
            discount: line.discount.toString(),
            taxGST: line.taxGST.toString(),
            hsnCode: line.hsnCode,
            SGST: itemTotal.sgst,
            CGST: itemTotal.cgst,
            itemImage: itemImageUrl ? {
              url: itemImageUrl,
              publicId: ""
            } : null
          };
        })
      );

      // Create the quotation data with image URLs included
      const quotationData = {
        customerName,
        date: formatDateForAPI(date),
        totalAmount: summary.grandTotal.toString(),
        items: updatedLineItems
      };

      // Add ID if editing
      if (quoteToEdit?._id || quoteToEdit?.id) {
        quotationData.id = quoteToEdit._id || quoteToEdit.id;
      }

      if (isNew) {
        await communication.addQuotation(quotationData);
        setNotification({ type: 'success', message: `Quotation for "${customerName}" created successfully!` });
      } else {
        await communication.updateQuotation(quotationData);
        setNotification({ type: 'success', message: `Quotation for "${customerName}" updated successfully!` });
      }

      setTimeout(() => {
        setView('quotation-list');
      }, 1500);

    } catch (error) {
      console.error('Error submitting quotation:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to save quotation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-8 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <AlertTriangle className="mr-2 text-yellow-600" size={24} /> Cannot Create Quotation
        </h2>
        <p className="text-yellow-800">Please create at least one Item first before creating a quotation.</p>
        <PrimaryButton className="mt-4" onClick={() => setView('create-item')}>
          Go to Create Item
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
        <FileText className="mr-2 text-green-600" size={24} />
        {isNew ? 'Create New Quotation' : `Edit Quotation: ${quoteToEdit?.refNo || ''}`}
      </h2>

      <Notification message={notification?.message} type={notification?.type} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Customer Name"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g., Jane Doe"
            required
          />
          <FormInput
            label="Date"
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Add Items Section */}
        <div className="border border-gray-200 p-6 rounded-lg bg-white">
          <h3 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
            <Plus className="mr-2 text-green-600" size={20} />
            Add Items to Quotation
          </h3>

          <div className="space-y-6">
            {lineItems.map((line, index) => (
              <div key={index} className="border border-gray-300 p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  {/* Item Search with Autocomplete */}
                  <div
                    className="lg:col-span-4 relative"
                    ref={el => searchRefs.current[index] = el}
                  >
                    <label className="text-sm font-medium text-gray-700 block mb-2">Item Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={line.itemName}
                        onChange={(e) => handleItemSearch(index, e.target.value)}
                        onFocus={() => {
                          setSelectedItemIndex(index);
                          if (line.itemName && filteredItems.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        placeholder="Search items..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 pr-10"
                        required
                      />
                      <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && selectedItemIndex === index && filteredItems.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                            onClick={() => selectItem(index, item)}
                          >
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-600">HSN: {item.hsnCode} | ₹{item.price}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HSN Code */}
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-2">HSN Code</label>
                    <input
                      type="text"
                      value={line.hsnCode}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div className="lg:col-span-1">
                    <label className="text-sm font-medium text-gray-700 block mb-2">Unit</label>
                    <div className="min-h-12 w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                      {lineItemTotals[index]?.unit || 'Pcs'}
                    </div>
                  </div>

                  {/* Rate */}
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      {line.withTax ? 'Price/Unit (Incl. Tax)' : 'Price/Unit (Excl. Tax)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.rate}
                      onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="w-full p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-150 border border-red-200"
                    >
                      <X size={20} className="mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Item Image Section - Only show when no product is found in database */}
                {!line.itemId && line.itemName && !isItemInDatabase(line.itemName) && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Item not found in database. Upload image for new item:
                    </label>

                    <div className="flex flex-col space-y-2">
                      {/* Image Preview */}
                      {(imagePreviews[index] || line.itemImage) ? (
                        <div className="relative">
                          <img
                            src={imagePreviews[index] || line.itemImage}
                            alt="Item preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                            crossOrigin="anonymous"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-150 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition duration-150">
                          <Package className="mx-auto text-gray-400 mb-2" size={24} />
                          <p className="text-sm text-gray-500">
                            Upload item image
                          </p>
                        </div>
                      )}

                      {/* File Input */}
                      <input
                        type="file"
                        id={`itemImage-${index}`}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(index, file);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor={`itemImage-${index}`}
                        className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out cursor-pointer text-sm"
                      >
                        <Plus size={16} />
                        <span>{imagePreviews[index] || line.itemImage ? 'Change Image' : 'Upload Image'}</span>
                      </label>
                      <p className="text-xs text-gray-500 text-center">
                        Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Show existing item image if product is found in database */}
                {line.itemId && line.itemImage && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <label className="text-sm font-medium text-green-700 block mb-2">
                      Item found in database:
                    </label>
                    <div className="flex items-center space-x-4">
                      {line.itemImage && (
                        <img
                          src={line.itemImage}
                          alt="Item preview"
                          className="w-16 h-16 object-cover rounded-lg border-2 border-green-300"
                          crossOrigin="anonymous"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-green-800">{line.itemName}</p>
                        <p className="text-xs text-green-600">HSN: {line.hsnCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax and Discount Section */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tax Toggle */}
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`tax-${index}`}
                        checked={!line.withTax}
                        onChange={() => handleLineItemChange(index, 'withTax', false)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Without Tax</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`tax-${index}`}
                        checked={line.withTax}
                        onChange={() => handleLineItemChange(index, 'withTax', true)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">With Tax</span>
                    </label>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={line.discount}
                      onChange={(e) => handleLineItemChange(index, 'discount', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  {/* GST */}
                  {line.withTax && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">GST %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={line.taxGST}
                        onChange={(e) => handleLineItemChange(index, 'taxGST', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Calculation Display */}
                {lineItemTotals[index] && (
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                      <Calculator className="mr-2 text-green-600" size={18} />
                      Item Calculation
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-sm">
                        {line.withTax ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total with Tax:</span>
                              <span className="font-medium">₹ {lineItemTotals[index].originalTotalWithTax}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Subtotal (after tax reverse calc):</span>
                              <span>₹ {lineItemTotals[index].subtotal}</span>
                            </div>
                            {parseFloat(line.discount) > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Discount ({line.discount}%):</span>
                                <span>- ₹ {lineItemTotals[index].discountAmount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-blue-600">
                              <span>SGST ({line.taxGST / 2}%):</span>
                              <span>+ ₹ {lineItemTotals[index].sgst}</span>
                            </div>
                            <div className="flex justify-between text-blue-600">
                              <span>CGST ({line.taxGST / 2}%):</span>
                              <span>+ ₹ {lineItemTotals[index].cgst}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">₹ {lineItemTotals[index].subtotal}</span>
                            </div>
                            {parseFloat(line.discount) > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Discount ({line.discount}%):</span>
                                <span>- ₹ {lineItemTotals[index].discountAmount}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">Final Amount:</div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹ {lineItemTotals[index].totalAmount}
                          </div>
                          {line.withTax && (
                            <div className="text-xs text-gray-500 mt-2">
                              Includes {line.taxGST}% GST
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <PrimaryButton
            type="button"
            onClick={addLineItem}
            icon={Plus}
            className="mt-6 bg-green-600 hover:bg-green-700"
          >
            Add Another Item
          </PrimaryButton>
        </div>

        {/* Overall Summary */}
        <div className="border border-gray-200 p-6 rounded-lg bg-white">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
            <Calculator className="mr-2 text-green-600" size={20} />
            Quotation Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between text-lg border-b pb-2">
                <span className="text-gray-700 font-semibold">Sub Total:</span>
                <span className="font-bold">₹ {summary.subtotal}</span>
              </div>

              {parseFloat(summary.totalDiscount) > 0 && (
                <div className="flex justify-between text-lg border-b pb-2">
                  <span className="text-gray-700 font-semibold">Total Discount:</span>
                  <span className="font-bold text-red-600">- ₹ {summary.totalDiscount}</span>
                </div>
              )}

              {parseFloat(summary.totalGST) > 0 && (
                <>
                  <div className="flex justify-between text-lg border-b pb-2">
                    <span className="text-gray-700 font-semibold">SGST @{parseFloat(summary.totalSGST) > 0 ? (parseFloat(lineItems.find(item => item.withTax)?.taxGST || 0) / 2).toFixed(1) : '0.0'}%:</span>
                    <span className="font-bold text-blue-600">+ ₹ {summary.totalSGST}</span>
                  </div>
                  <div className="flex justify-between text-lg border-b pb-2">
                    <span className="text-gray-700 font-semibold">CGST @{parseFloat(summary.totalCGST) > 0 ? (parseFloat(lineItems.find(item => item.withTax)?.taxGST || 0) / 2).toFixed(1) : '0.0'}%:</span>
                    <span className="font-bold text-blue-600">+ ₹ {summary.totalCGST}</span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2 font-semibold">GRAND TOTAL:</div>
                <div className="text-4xl font-bold text-green-600 mb-4">
                  ₹ {summary.grandTotal}
                </div>
                <div className="text-sm text-gray-500">
                  Total Items: {lineItems.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setView('quotation-list')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out"
            disabled={isSubmitting}
          >
            <X size={20} />
            Cancel
          </button>
          <PrimaryButton
            type="submit"
            icon={isSubmitting ? Loader : FileText}
            className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isNew ? 'Save Quotation' : 'Update Quotation')}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;