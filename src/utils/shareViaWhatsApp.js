const shareViaWhatsApp = async (quotation) => {
    try {
        setSending(quotation._id);

        const message = `Hello ${quotation.customerName},\n\nHere is your quotation details:\n\n📋 Quotation: ${quotation.refNo}\n📅 Date: ${formatDate(quotation.date)}\n💰 Total Amount: ${formatCurrency(quotation.totalAmount)}\n\nYou can download the full quotation PDF from our portal.\n\nThank you for your business!`;

        const encodedMessage = encodeURIComponent(message);

        // If you have phone number in quotation data
        const phoneNumber = quotation.phoneNumber || quotation.mobile;

        if (phoneNumber) {
            // Direct message to specific number
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        } else {
            // Open WhatsApp for user to choose contact
            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }

    } catch (error) {
        console.error('Error sharing via WhatsApp:', error);
        alert('Failed to share quotation via WhatsApp');
    } finally {
        setSending(null);
    }
};