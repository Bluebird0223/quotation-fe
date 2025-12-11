import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import ItemForm from '../components/Forms/ItemForm';
import QuotationForm from '../components/Forms/QuotationForm';
import ItemList from '../components/Lists/ItemList';
import QuotationList from '../components/Lists/QuotationList';
import InvoiceList from '../components/Lists/InvoiceList';
import InvoiceForm from '../components/Forms/InvoiceForm';
import UserList from '../components/Lists/UserList';
import BoqList from '../components/Lists/BoqList';
import BoqNoteForm from '../components/Forms/BoqNoteForm';
import CustomerList from '../components/Lists/CustomerList';
import CustomerForm from '../components/Forms/CustomerForm';

export const renderContent = (view, handlers) => {
    const {
        items,
        itemToEdit,
        setItemToEdit,
        addItem,
        updateItem,
        deleteItem,
        quotations,
        quoteToEdit,
        setView,
        setQuoteToEdit,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        invoices,
        setInvoiceToEdit,
        deleteInvoice,
        invoiceToEdit,
        addInvoice,
        updateInvoice,
        users,
        setUserToEdit,
        deleteUser,
        customer,
        customerToEdit,
        setCustomerToEdit,
        addCustomer,
        updateCustomer,
        deleteCustomer,

    } = handlers;

    switch (view) {
        // item
        case 'create-item':
        case 'edit-item':
            return (
                <ItemForm
                    itemToEdit={itemToEdit}
                    addItem={addItem}
                    updateItem={updateItem}
                    setView={setView}
                />
            );

        case 'item-list':
            return (
                <ItemList
                    items={items}
                    setView={setView}
                    setItemToEdit={setItemToEdit}
                    deleteItem={deleteItem}
                />
            );


        // quotation
        case 'create-quotation':
        case 'edit-quotation':
            return (
                <QuotationForm
                    items={items}
                    quoteToEdit={quoteToEdit}
                    addQuotation={addQuotation}
                    updateQuotation={updateQuotation}
                    setView={setView}
                />
            );

        case 'quotation-list':
            return (
                <QuotationList
                    quotations={quotations}
                    setView={setView}
                    setQuoteToEdit={setQuoteToEdit}
                    deleteQuotation={deleteQuotation}
                />
            );


        // invoice
        case 'invoice-list':
            return (
                <InvoiceList
                    invoices={invoices}
                    setView={setView}
                    setInvoiceToEdit={setInvoiceToEdit}
                    deleteInvoice={deleteInvoice}
                />
            );

        case 'create-invoice':
        case 'edit-invoice':
            return (
                <InvoiceForm
                    items={items}
                    invoiceToEdit={invoiceToEdit}
                    addInvoice={addInvoice}
                    updateInvoice={updateInvoice}
                    setView={setView}
                />
            );


        // user
        case 'user-list':
            return (
                <UserList
                    users={users}
                    setView={setView}
                    setUserToEdit={setUserToEdit}
                    deleteUser={deleteUser}
                />
            );

        case 'create-user':
        case 'edit-user':
            return (
                <InvoiceForm
                    items={items}
                    invoiceToEdit={invoiceToEdit}
                    addInvoice={addInvoice}
                    updateInvoice={updateInvoice}
                    setView={setView}
                />
            );


        // boq
        case 'boq-list':
            return (
                <BoqList
                    quotations={quotations}
                    setView={setView}
                    setQuoteToEdit={setQuoteToEdit}
                    deleteQuotation={deleteQuotation}
                />
            );
        case 'create-boq':
        case 'edit-boq':
            return (
                <BoqNoteForm
                    items={items}
                    quoteToEdit={quoteToEdit}
                    addQuotation={addQuotation}
                    updateQuotation={updateQuotation}
                    setView={setView}
                />
            );

        // customer
        case 'customer-list':
            return (
                <CustomerList
                    customer={customer}
                    setView={setView}
                    setCustomerToEdit={setCustomerToEdit}
                    deleteCustomer={deleteCustomer}
                />
            );
        case 'create-customer':
        case 'edit-customer':
            return (
                <CustomerForm
                    customer={customer}
                    customerToEdit={customerToEdit}
                    addCustomer={addCustomer}
                    updateCustomer={updateCustomer}
                    setView={setView}
                />
            );

        // dashboard
        case 'dashboard':
        default:
            return (
                <Dashboard
                    items={items}
                    quotations={quotations}
                    setView={setView}
                />
            );
    }
};