export const handleDownload = async () => {
    try {
        setPdfLoading(true);

        // Create a PDF-specific HTML structure
        const pdfHTML = `
            <div class="quotation-pdf" style="font-family: Arial, sans-serif; color: #000000; background: white; padding: 20px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #ea580c; padding-bottom: 15px;">
                    <div style="display: flex; align-items: center;">
                        <img src="${logo}" alt="Company Logo" style="height: 60px; margin-right: 15px;" />
                        <div>
                            <div style="font-size: 24px; font-weight: bold; color: #ea580c;">${company.name}</div>
                            <div style="font-size: 12px; color: #666;">Home Automation and AV Solutions</div>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #666;">
                        <div style="font-weight: bold; color: #333;">${company.address}</div>
                        <div>${company.phone}</div>
                        <div>${company.email}</div>
                        <div>${company.website}</div>
                    </div>
                </div>

                <!-- Quotation Title -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 28px; font-weight: bold; color: #ea580c; margin: 0; text-transform: uppercase;">QUOTATION</h1>
                    <div style="color: #666; margin-top: 5px;">Ref: ${quotation.refNo}</div>
                </div>

                <!-- Customer Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #ea580c;">
                        <h3 style="font-weight: bold; color: #ea580c; margin: 0 0 10px 0;">Bill To:</h3>
                        <p style="font-weight: bold; color: #333; margin: 0;">${quotation.customerName}</p>
                        ${quotation.customerAddress ? `<p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">${quotation.customerAddress}</p>` : ''}
                    </div>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #666;">Date:</span>
                            <span style="font-weight: bold;">${new Date(quotation.date).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #666;">Prepared By:</span>
                            <span style="font-weight: bold;">${company.preparedBy}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666;">Valid Until:</span>
                            <span style="font-weight: bold;">
                                ${new Date(new Date(quotation.date).setDate(new Date(quotation.date).getDate() + 30)).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #d1d5db;">
                    <thead>
                        <tr style="background-color: #ea580c; color: white;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">#</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Item Name</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Qty</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Unit</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Price/Unit</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Discount</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">GST</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotation.items?.map((item, index) => {
            const amounts = calculateItemAmounts(item);
            return `
                                <tr>
                                    <td style="border: 1px solid #d1d5db; padding: 8px;">${index + 1}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">${item?.itemId?.itemName || 'N/A'}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.quantity}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${item.itemUnit || 'Nos'}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">${company.currency} ${parseFloat(item.rate || 0).toFixed(2)}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">
                                        ${parseFloat(item.discount || 0) > 0 ?
                    `${company.currency} ${amounts.discountAmount}<br /><span style="font-size: 10px; color: #666;">(${item.discount}%)</span>`
                    : '-'}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">
                                        ${item.withTax ?
                    `${company.currency} ${amounts.gstAmount}<br /><span style="font-size: 10px; color: #666;">(${item.taxGST}%)</span>`
                    : 'N/A'}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; font-weight: bold;">
                                        ${company.currency} ${amounts.totalAmount}
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>

                <!-- Total Summary -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div style="background: #fff7ed; padding: 15px; border-radius: 8px;">
                        <h3 style="font-weight: bold; color: #ea580c; margin: 0 0 10px 0;">Amount in Words:</h3>
                        <p style="color: #333; font-style: italic; margin: 0;">${convertToWords(totals.grandTotal)}</p>
                    </div>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <h3 style="font-weight: bold; color: #333; margin: 0 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Amount Summary</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Sub Total:</span>
                            <span>${company.currency} ${totals.subTotal}</span>
                        </div>
                        ${parseFloat(totals.totalDiscount) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626;">
                                <span>Discount:</span>
                                <span>- ${company.currency} ${totals.totalDiscount}</span>
                            </div>
                        ` : ''}
                        ${parseFloat(totals.totalGST) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #2563eb;">
                                <span>SGST:</span>
                                <span>+ ${company.currency} ${totals.totalSGST}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #2563eb;">
                                <span>CGST:</span>
                                <span>+ ${company.currency} ${totals.totalCGST}</span>
                            </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #ea580c; font-size: 18px; font-weight: bold; color: #ea580c;">
                            <span>Total:</span>
                            <span>${company.currency} ${amounts.totalAmount}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; color: #666; font-size: 12px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Thank you for your business!</div>
                    <div>${company.name} | ${company.address} | ${company.phone} | ${company.email}</div>
                </div>
            </div>
        `;

        // Create temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = pdfHTML;
        document.body.appendChild(tempContainer);

        const options = {
            margin: [10, 10, 10, 10],
            filename: `quotation-${quotation?.refNo || quotationId}.pdf`,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        await html2pdf().from(tempContainer).set(options).save();

        // Clean up
        document.body.removeChild(tempContainer);

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