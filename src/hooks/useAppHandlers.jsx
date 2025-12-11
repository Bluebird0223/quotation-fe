import { useState, useEffect } from 'react';
import { initialItems, initialQuotations } from '../utils/helpers';

export const useAppHandlers = () => {
    const [view, setView] = useState('dashboard');
    const [items, setItems] = useState(initialItems);
    const [quotations, setQuotations] = useState(initialQuotations);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [quoteToEdit, setQuoteToEdit] = useState(null);

    // --- Item CRUD Handlers ---
    const addItem = (newItem) => {
        setItems(prev => [...prev, newItem]);
    };

    const updateItem = (updatedItem) => {
        setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        setItemToEdit(null);
    };

    const deleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // --- Quotation CRUD Handlers ---
    const addQuotation = (newQuotation) => {
        setQuotations(prev => [...prev, newQuotation]);
    };

    const updateQuotation = (updatedQuotation) => {
        setQuotations(prev => prev.map(quote => quote.id === updatedQuotation.id ? updatedQuotation : quote));
        setQuoteToEdit(null);
    };

    const deleteQuotation = (id) => {
        setQuotations(prev => prev.filter(quote => quote.id !== id));
    };

    // When switching views, ensure the edit state is correct if landing on a form
    useEffect(() => {
        if (view !== 'edit-item') setItemToEdit(null);
        if (view !== 'edit-quotation') setQuoteToEdit(null);
    }, [view]);

    return {
        view,
        setView,
        items,
        quotations,
        itemToEdit,
        setItemToEdit,
        quoteToEdit,
        setQuoteToEdit,
        addItem,
        updateItem,
        deleteItem,
        addQuotation,
        updateQuotation,
        deleteQuotation
    };
};