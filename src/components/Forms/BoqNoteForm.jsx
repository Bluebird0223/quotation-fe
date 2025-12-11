import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, Save, ArrowLeft } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import FormInput from '../UI/FormInput';
import Notification from '../UI/Notification';
import { communication } from '../../service/communication';
import { formatDateForAPI, formatDateForInput } from '../../utils/dateUtils';

const BoqNoteForm = ({ quoteToEdit, addQuotation, updateQuotation, setView }) => {
    
    const [customerName, setCustomerName] = useState(quoteToEdit?.customerName || '');
    const [refNo, setRefNo] = useState(quoteToEdit?.refNo || '');
    const [date, setDate] = useState(quoteToEdit?.date ? formatDateForInput(quoteToEdit.date) : new Date().toISOString().split('T')[0]);
    const [createdAt, setCreatedAt] = useState(quoteToEdit?.createdAt ? formatDateForInput(quoteToEdit.createdAt) : new Date().toISOString().split('T')[0]);
    const [updatedAt, setUpdatedAt] = useState(quoteToEdit?.updatedAt ? formatDateForInput(quoteToEdit.updatedAt) : new Date().toISOString().split('T')[0]);
    const [isNew] = useState(!quoteToEdit);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(quoteToEdit?.note || '');
    const [quotationId, setQuotationId] = useState(quoteToEdit?._id || '');
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchRefs = useRef([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerName) {
            setNotification({ type: 'error', message: 'Customer name is required.' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Create the quotation data with updated note
            const quotationData = {
                id: quotationId,
                note: note,
            };

            // Add ID if editing
            if (quoteToEdit?._id || quoteToEdit?.id) {
                quotationData.id = quoteToEdit._id || quoteToEdit.id;
            }

            await communication.updateQuotation(quotationData);
            setNotification({ type: 'success', message: `Quotation note for "${customerName}" updated successfully!` });

            setTimeout(() => {
                setView('boq-list');
            }, 1500);

        } catch (error) {
            console.error('Error submitting quotation:', error);
            setNotification({ type: 'error', message: error.message || 'Failed to save quotation note. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNoteChange = (e) => {
        setNote(e.target.value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => setView('boq-list')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <FileText className="mr-3 text-blue-600" size={30} />
                        Quotation Details
                    </h1>
                </div>
            </div>

            {/* Quotation Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Reference No.</h3>
                            <p className="text-lg font-semibold text-gray-900">{refNo}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Name</h3>
                            <p className="text-lg font-semibold text-gray-900">{customerName}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Note</h3>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {isSubmitting ? 'Updating...' : 'Update Note'}
                            </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-1">
                            <textarea
                                value={note}
                                onChange={handleNoteChange}
                                placeholder="Enter quotation description/note..."
                                className="w-full h-48 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 leading-relaxed p-5 resize-none"
                                rows="8"
                            />
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Created:</span>{' '}
                                {new Date(createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span>{' '}
                                {new Date(updatedAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default BoqNoteForm;