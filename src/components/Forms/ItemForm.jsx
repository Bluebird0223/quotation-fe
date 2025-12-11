import React, { useEffect, useState } from 'react';
import { Package, Plus, X, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import FormInput from '../UI/FormInput';
import Notification from '../UI/Notification';
import { communication, getServerUrl } from '../../service/communication';

const ItemForm = ({ itemToEdit, setView }) => {
  const [isNew] = useState(!itemToEdit);
  const [item, setItem] = useState(
    itemToEdit || {
      name: '',
      type: 'product', // 'product' or 'service'
      unit: 'nos',
      quantity: '',
      rate: '',
      description: '',
      imagePrompt: '',
      imageUrl: '',
      itemImage: null
    }
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with item data when editing
  useEffect(() => {
    if (itemToEdit) {
      setItem({
        name: itemToEdit.name || '',
        type: itemToEdit.itemType || 'product',
        unit: itemToEdit.unit || 'nos',
        quantity: itemToEdit.quantity || '',
        rate: itemToEdit.rate || '',
        description: itemToEdit.description || '',
        imagePrompt: '',
        imageUrl: '',
        itemImage: null
      });

      if (itemToEdit.imageSrc) {
        setImagePreview(itemToEdit.imageSrc);
      }
    }
  }, [itemToEdit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('item', '').toLowerCase();
    setItem(prev => ({ ...prev, [fieldName]: value }));
  };

  const toggleItemType = () => {
    setItem(prev => ({
      ...prev,
      type: prev.type === 'product' ? 'service' : 'product',
      // Reset unit when switching to service (if needed)
      unit: prev.type === 'product' ? '' : 'nos'
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setNotification({ type: 'error', message: 'Please select a valid image file (JPEG, PNG, GIF, WebP).' });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ type: 'error', message: 'Image size should be less than 5MB.' });
        return;
      }

      setItem(prev => ({ ...prev, itemImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setItem(prev => ({ ...prev, itemImage: null }));
    setImagePreview(itemToEdit?.imageSrc ? `${itemToEdit.imageSrc}` : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!item.name || !item.type) {
      setNotification({ type: 'error', message: 'Item Name and Type are required.' });
      return;
    }

    // For services, unit might be optional, for products it's usually required
    if (item.type === 'product' && !item.unit) {
      setNotification({ type: 'error', message: 'Unit of Measure is required for products.' });
      return;
    }

    // Validate numeric fields
    if (item.quantity && isNaN(item.quantity)) {
      setNotification({ type: 'error', message: 'Quantity must be a valid number.' });
      return;
    }

    if (item.rate && isNaN(item.rate)) {
      setNotification({ type: 'error', message: 'Rate must be a valid number.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('itemName', item.name);
      formData.append('itemUnit', item.unit || '');
      formData.append('itemType', item.type);
      formData.append('quantity', item.quantity || '');
      formData.append('rate', item.rate || '');
      formData.append('description', item.description || '');
      formData.append('itemId', itemToEdit?.id);
      formData.append('hsn', item.hsn);

      if (item.itemImage) {
        formData.append('image', item.itemImage);
      }

      let serverResponse;

      if (isNew) {
        // Create new item
        serverResponse = await communication.createItem(formData);
      } else {
        // Update existing item
        serverResponse = await communication.updateItem(formData);
      }

      if (serverResponse?.data?.status) {
        setNotification({
          type: 'success',
          message: `Item "${item.name}" ${isNew ? 'created' : 'updated'} successfully!`
        });

        // Delay navigation slightly to allow notification to show
        setTimeout(() => {
          setView('item-list');
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: serverResponse?.data?.message || `Failed to ${isNew ? 'create' : 'update'} item.`
        });
      }

    } catch (error) {
      console.error('Error saving item:', error);
      setNotification({
        type: 'error',
        message: `Failed to ${isNew ? 'create' : 'update'} item. Please try again.`
      });
    } finally {
      setIsGenerating(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center">
        <Package className="mr-2 text-green-600" size={24} />
        {isNew ? 'Create New Product' : `Edit Product: ${itemToEdit?.name || item.name}`}
      </h2>

      <Notification message={notification?.message} type={notification?.type} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <FormInput
              label="Product Name"
              id="itemName"
              value={item.name}
              onChange={handleChange}
              placeholder="e.g., Speakers or Installation Service"
              required
            />

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Product Type
              </label>
              <div className="flex items-center space-x-4 p-3 border border-gray-300 rounded-lg">
                <span className={`font-medium ${item.type === 'product' ? 'text-green-600' : 'text-gray-500'}`}>
                  Product
                </span>
                <button
                  type="button"
                  onClick={toggleItemType}
                  className="relative"
                >
                  {item.type === 'product' ? (
                    <ToggleLeft size={40} className="text-gray-400" />
                  ) : (
                    <ToggleRight size={40} className="text-green-600" />
                  )}
                </button>
                <span className={`font-medium ${item.type === 'service' ? 'text-green-600' : 'text-gray-500'}`}>
                  Service
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {item.type === 'product'
                  ? 'Products are physical items that can be inventoried.'
                  : 'Services are non-physical offerings like installation or maintenance.'
                }
              </p>
            </div>

            {(item.type === 'product' || item.unit) && (
              <div className="flex flex-col space-y-1">
                <label htmlFor="unit" className="text-sm font-medium text-gray-700">
                  Unit of Measure {item.type === 'product' && '*'}
                </label>
                <select
                  id="unit"
                  value={item.unit}
                  onChange={handleChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                  required={item.type === 'product'}
                >
                  <option value="nos">Numbers</option>
                  <option value="pcs">Pieces</option>
                  <option value="set">Set</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              <FormInput
                label="Quantity"
                id="quantity"
                type="number"
                value={item.quantity}
                onChange={handleChange}
                placeholder="e.g., 100"
                min="0"
                step="1"
              />

              <FormInput
                label="Rate (Price)"
                id="rate"
                type="number"
                value={item.rate}
                onChange={handleChange}
                placeholder="e.g., 99.99"
              />
              <FormInput
                label="HSN code"
                id="hsn"
                type="text"
                value={item.hsn}
                onChange={handleChange}
                placeholder="e.g., ABC123"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={item.description}
                onChange={handleChange}
                placeholder="Enter item description, features, or service details..."
                rows="4"
                className="p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 resize-vertical"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Product Image {item.type === 'product' && '(Recommended)'}
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      crossOrigin="anonymous"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-150 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition duration-150">
                    <Package className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500 mb-2">
                      {item.type === 'product' ? 'Product image' : 'Service image'}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  id="itemImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="itemImage"
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-150 ease-in-out cursor-pointer"
                >
                  <Plus size={20} />
                  <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                </label>
                <p className="text-xs text-gray-500 text-center">
                  Supported formats: JPEG, PNG, GIF, WebP (Max 2MB)
                </p>
                {itemToEdit?.imageSrc && !imagePreview.includes('data:') && (
                  <p className="text-xs text-gray-500 text-center">
                    Current image: {itemToEdit.imageSrc.split('/').pop()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <PrimaryButton type="submit" icon={isSubmitting ? Loader : Plus} disabled={isSubmitting || isGenerating} className={isSubmitting ? "opacity-70 cursor-not-allowed" : ""}>
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader className="animate-spin mr-2" size={18} />
                {isNew ? 'Saving...' : 'Updating...'}
              </span>
            ) : (
              isNew ? 'Save Item' : 'Update Item'
            )}
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setView('item-list')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150 ease-in-out cursor-pointer"
            disabled={isSubmitting}
          >
            <X size={20} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;