import React, { useEffect, useState } from 'react';
import { Package, Plus, PenLine, Trash } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import { communication, getServerUrl } from '../../service/communication';

const ItemList = ({ setView, setItemToEdit }) => {
    const [items, setItems] = useState([]);
    // const [loading, setLoading] = useState(true);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete item: ${name}?`)) {
            try {
                await communication.deleteItem(id);
                setItems(prevItems => prevItems.filter(item => item.id !== id));
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const getItems = async () => {
        try {
            // setLoading(true);
            const response = await communication.getAllItem();
            const itemsData = response?.data?.result || [];

            const transformedItems = itemsData.map(item => {
                return {
                    id: item._id,
                    name: item.itemName,
                    price: parseFloat(item.itemType) || 0,
                    unit: item.itemUnit,
                    imageSrc: item.itemImage || null,
                    quantity: item.quantity,
                    rate: item.rate,
                    hsn: item.hsn,
                    description: item.description
                };
            });

            setItems(transformedItems);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            // setLoading(false);
        }
    };

    // Function to trim long descriptions
    const trimDescription = (description, maxLength = 50) => {
        if (!description) return 'No description';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
    };

    useEffect(() => {
        getItems();
    }, []);

    // if (loading) {
    //     return (
    //         <div className="space-y-6">
    //             <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
    //                 <Package className="mr-3 text-green-600" size={30} /> Item Inventory
    //             </h1>
    //             <div className="text-center p-8 bg-gray-50 rounded-xl">
    //                 <p className="text-gray-500">Loading items...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <Package className="mr-3 text-green-600" size={30} /> Products
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{items.length}</strong> products.</p>
                <PrimaryButton icon={Plus} onClick={() => setView('create-item')}>
                    Add New Product
                </PrimaryButton>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={item.imageSrc}
                                        alt={item.name}
                                        className="h-12 w-12 rounded-lg object-cover"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            const initials = item.name
                                                .split(' ')
                                                .map(word => word[0])
                                                .join('')
                                                .toUpperCase();
                                            e.target.outerHTML = `<div class="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">${initials}</div>`;
                                        }}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hsn}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">  <div
                                    className="max-w-xs truncate"
                                    title={item.description} // Show full description on hover
                                >
                                    {trimDescription(item.description, 30)}
                                </div></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            setItemToEdit(item);
                                            setView('edit-item');
                                        }}
                                        className="text-green-600 hover:text-green-900 mr-4 cursor-pointer"
                                    >
                                        <PenLine size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {items.length === 0 && (
                <div className="text-center p-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No items available. Click 'Add New Item' to get started!</p>
                </div>
            )}
        </div>
    );
};

export default ItemList;