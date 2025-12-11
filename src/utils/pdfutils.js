// utils/pdfUtils.js
import html2pdf from 'html2pdf.js';
import { getServerUrl } from '../service/communication';

// Convert image to base64 data URL
const imageToBase64 = async (src) => {
    try {
        const response = await fetch(src);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

export const generateQuotationPDF = async (quotation, company, totals, convertToWords) => {
    try {
        // Convert logo to base64
        let logoBase64 = null;
        try {
            const logoModule = await import('../assets/logo.png');
            logoBase64 = await imageToBase64(logoModule.default);
        } catch (error) {
            console.warn('Could not load logo, using fallback:', error);
        }

        // Convert item images to base64 and log item data for debugging
        const itemsWithImages = await Promise.all(
            quotation.items?.map(async (item) => {
                let itemImageBase64 = null;
                if (item?.itemImage?.url) {
                    try {
                        const imageUrl = item.itemImage.url.startsWith('http')
                            ? item.itemImage.url
                            : `${getServerUrl()}${item.itemImage.url}`;
                        itemImageBase64 = await imageToBase64(imageUrl);
                    } catch (error) {
                        console.warn(`Could not load image for item ${item.itemName}:`, error);
                    }
                }

                // Get description and HSN from itemId if available, otherwise from item directly
                const description = item.itemId?.description || item.description || 'No description available';
                const hsnCode = item.itemId?.hsn || item.hsnCode || 'N/A';
                const itemName = item.itemId?.itemName || item.itemName || 'N/A';
                const itemUnit = item.itemId?.itemUnit || item.itemUnit || 'Nos';

                // Log item data to see what fields are available
                // console.log('PDF Item data:', {
                //     name: itemName,
                //     description: description,
                //     hsnCode: hsnCode,
                //     quantity: item.quantity,
                //     rate: item.rate,
                //     discount: item.discount,
                //     taxGST: item.taxGST,
                //     withTax: item.withTax,
                //     itemUnit: itemUnit
                // });

                return {
                    ...item,
                    imageBase64: itemImageBase64,
                    // Use the resolved values
                    description: description,
                    hsnCode: hsnCode,
                    itemName: itemName,
                    itemUnit: itemUnit,
                    quantity: item.quantity || 1,
                    rate: item.rate || 0,
                    discount: item.discount || 0,
                    taxGST: item.taxGST || 0,
                    withTax: item.withTax || false
                };
            }) || []
        );

        // Create a PDF-specific HTML structure
        const pdfHTML = `
            <div class="quotation-pdf" style="font-family: Arial, sans-serif; color: #000000; background: white; padding: 10px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 2px solid #ea580c; padding-bottom: 6px;">
                    <div style="display: flex; align-items: center;">
                        <div style="margin-right: 8px;">
                            ${logoBase64 ?
                `<img src="${logoBase64}" alt="${company.name} Logo" style="height: 40px; width: auto;" />` :
                `<div style="height: 40px; width: 40px; background: #ea580c; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 6px; font-size: 10px;">LOGO</div>`
            }
                        </div>
                        <div>
                            <div style="font-size: 18px; font-weight: bold; color: #ea580c;">${company.name}</div>
                            <div style="font-size: 10px; color: #666;">Home Automation and AV Solutions</div>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 10px; color: #666;">
                        <div style="font-weight: bold; color: #333;">${company.address}</div>
                        <div>${company.phone}</div>
                        <div>${company.email}</div>
                        <div>${company.website}</div>
                    </div>
                </div>

                <!-- Quotation Title -->
                <div style="text-align: center; margin-bottom: 8px;">
                    <h1 style="font-size: 20px; font-weight: bold; color: #ea580c; margin: 0; text-transform: uppercase;">QUOTATION</h1>
                    <div style="color: #666; margin-top: 2px; font-size: 10px;">Ref: ${quotation.refNo}</div>
                </div>

                <!-- Customer Details -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div style="background: #fff7ed; padding: 8px; border-radius: 6px; border-left: 3px solid #ea580c;">
                        <h3 style="font-weight: bold; color: #ea580c; margin: 0 0 4px 0; font-size: 11px;">Bill To:</h3>
                        <p style="font-weight: bold; color: #333; margin: 0; font-size: 11px;">${quotation.customerName}</p>
                        ${quotation.customerAddress ? `<p style="color: #666; font-size: 10px; margin: 2px 0 0 0;">${quotation.customerAddress}</p>` : ''}
                    </div>
                    <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px;">
                            <span style="color: #666;">Date:</span>
                            <span style="font-weight: bold;">${new Date(quotation.date).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px;">
                            <span style="color: #666;">Prepared By:</span>
                            <span style="font-weight: bold;">${company.preparedBy}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 10px;">
                            <span style="color: #666;">Valid Until:</span>
                            <span style="font-weight: bold;">
                                ${new Date(new Date(quotation.date).setDate(new Date(quotation.date).getDate() + 30)).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; border: 1px solid #d1d5db; table-layout: fixed;">
                    <thead>
                        <tr style="background-color: #ea580c; color: white;">
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left; width: 25px; font-size: 10px;">#</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left; width: 60px; font-size: 10px;">Image</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left; width: 110px; font-size: 10px;">Item Name</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left; width: 170px; font-size: 10px;">Description</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center; width: 50px; font-size: 10px;">HSN</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center; width: 40px; font-size: 10px;">Qty</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center; width: 40px; font-size: 10px;">Unit</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right; width: 70px; font-size: 10px;">Price/Unit</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right; width: 70px; font-size: 10px;">Discount</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right; width: 70px; font-size: 10px;">GST</th>
                            <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right; width: 80px; font-size: 10px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsWithImages.map((item, index) => {
                const subTotal = (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0);
                const discountAmount = (subTotal * (parseFloat(item.discount) || 0)) / 100;
                const taxableAmount = subTotal - discountAmount;
                const gstAmount = item.withTax ? (taxableAmount * (parseFloat(item.taxGST) || 0)) / 100 : 0;
                const totalAmount = subTotal - discountAmount + gstAmount;

                return `
                                <tr>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; vertical-align: top; font-size: 10px;">${index + 1}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; vertical-align: top;">
                                        ${item.imageBase64 ?
                        `<img src="${item.imageBase64}" alt="${item.itemName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 3px;" />` :
                        `<div style="width: 50px; height: 50px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-size: 8px; color: #9ca3af; text-align: center;">No Image</div>`
                    }
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; vertical-align: top; font-weight: bold; word-wrap: break-word; font-size: 10px;">
                                        ${item.itemName}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; vertical-align: top; word-wrap: break-word; font-size: 9px; line-height: 1.2;">
                                        ${item.description}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center; vertical-align: top; font-size: 9px;">
                                        ${item.hsnCode}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center; vertical-align: top; font-size: 10px;">
                                        ${item.quantity}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center; vertical-align: top; font-size: 10px;">
                                        ${item.itemUnit}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right; vertical-align: top; font-size: 10px;">
                                        ${company.currency} ${parseFloat(item.rate).toFixed(2)}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right; vertical-align: top; font-size: 10px;">
                                        ${parseFloat(item.discount) > 0 ?
                        `${company.currency} ${discountAmount.toFixed(2)}<br /><span style="font-size: 8px; color: #666;">(${item.discount}%)</span>`
                        : '-'}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right; vertical-align: top; font-size: 10px;">
                                        ${item.withTax ?
                        `${company.currency} ${gstAmount.toFixed(2)}<br /><span style="font-size: 8px; color: #666;">(${item.taxGST}%)</span>`
                        : 'N/A'}
                                    </td>
                                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right; vertical-align: top; font-weight: bold; font-size: 10px;">
                                        ${company.currency} ${totalAmount.toFixed(2)}
                                    </td>
                                </tr>
                            `;
            }).join('')}
                    </tbody>
                </table>

                <!-- Total Summary -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div style="background: #fff7ed; padding: 8px; border-radius: 6px;">
                        <h3 style="font-weight: bold; color: #ea580c; margin: 0 0 4px 0; font-size: 11px;">Amount in Words:</h3>
                        <p style="color: #333; font-style: italic; margin: 0; font-size: 10px; line-height: 1.3;">${convertToWords(totals.grandTotal)}</p>
                    </div>
                    <div style="background: #f9fafb; padding: 8px; border-radius: 6px;">
                        <h3 style="font-weight: bold; color: #333; margin: 0 0 6px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; font-size: 11px;">Amount Summary</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10px;">
                            <span>Sub Total:</span>
                            <span>${company.currency} ${totals.subTotal}</span>
                        </div>
                        ${parseFloat(totals.totalDiscount) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #dc2626; font-size: 10px;">
                                <span>Discount:</span>
                                <span>- ${company.currency} ${totals.totalDiscount}</span>
                            </div>
                        ` : ''}
                        ${totals.gstBreakdown && Object.keys(totals.gstBreakdown).length > 0 ?
                Object.entries(totals.gstBreakdown).sort((a, b) => b[0] - a[0]).map(([rate, data]) => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #2563eb; font-size: 9px;">
                                    <span>SGST @${parseFloat(rate) / 2}% (on ${parseFloat(rate)}%):</span>
                                    <span>+ ${company.currency} ${data.sgst.toFixed(2)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #2563eb; font-size: 9px;">
                                    <span>CGST @${parseFloat(rate) / 2}% (on ${parseFloat(rate)}%):</span>
                                    <span>+ ${company.currency} ${data.cgst.toFixed(2)}</span>
                                </div>
                            `).join('')
                :
                parseFloat(totals.totalGST) > 0 ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #2563eb; font-size: 10px;">
                                    <span>GST (Total):</span>
                                    <span>+ ${company.currency} ${totals.totalGST}</span>
                                </div>
                            ` : ''
            }
                        <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 2px solid #ea580c; font-size: 14px; font-weight: bold; color: #ea580c;">
                            <span>Grand Total:</span>
                            <span>${company.currency} ${totals.grandTotal}</span>
                        </div>
                        ${parseFloat(totals.totalDiscount) > 0 ? `
                            <div style="display: flex; justify-content: space-between; margin-top: 4px; color: #16a34a; font-weight: bold; font-size: 10px;">
                                <span>You Saved:</span>
                                <span>${company.currency} ${totals.youSaved}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Terms and Conditions -->
                <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                    <h3 style="font-weight: bold; color: #333; margin: 0 0 4px 0; font-size: 11px;">Terms & Conditions</h3>
                    <ul style="font-size: 9px; color: #666; margin: 0; padding-left: 12px; line-height: 1.3;">
                        <li style="margin-bottom: 2px;">This quotation is valid for 30 days from the date of issue</li>
                        <li style="margin-bottom: 2px;">Prices are subject to change without prior notice</li>
                        <li style="margin-bottom: 2px;">Delivery timeline will be confirmed upon order confirmation</li>
                        <li style="margin-bottom: 2px;">Payment terms: 50% advance, 50% before delivery</li>
                        <li>All disputes are subject to ${company.city} jurisdiction</li>
                    </ul>
                </div>

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 6px; color: #666; font-size: 9px;">
                    <div style="font-weight: bold; margin-bottom: 2px;">Thank you for your business!</div>
                    <div>${company.name} | ${company.address} | ${company.phone} | ${company.email}</div>
                </div>
            </div>
        `;

        // Create temporary container for PDF generation
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = pdfHTML;
        document.body.appendChild(tempContainer);

        const options = {
            margin: 0,
            filename: `quotation-${quotation?.refNo || 'unknown'}.pdf`,
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
                orientation: 'landscape'
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate PDF Blob
        const pdfBlob = await html2pdf().from(tempContainer).set(options).output('blob');

        // Clean up
        document.body.removeChild(tempContainer);

        // --- Steganography: Append JSON Data ---
        const jsonString = JSON.stringify(quotation);
        const separator = '\n\n__QUOTATION_DATA__\n\n';

        // Combine PDF and JSON
        const combinedBlob = new Blob([pdfBlob, separator, jsonString], { type: 'application/pdf' });

        // Trigger Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(combinedBlob);
        link.download = `quotation-${quotation?.refNo || 'unknown'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw new Error('Failed to generate quotation PDF');
    }
};

// Helper function to convert amount to words
export const convertToWords = (amount) => {
    const num = parseFloat(amount);
    if (num === 0) return 'Zero Rupees Only';

    const rupees = Math.floor(num);
    const paisa = Math.round((num - rupees) * 100);

    let words = `${rupees} Rupees`;
    if (paisa > 0) {
        words += ` and ${paisa} Paisa`;
    }
    words += ' Only';

    return words;
};

// Helper function to calculate totals
export const calculateTotals = (items, currency = '₹') => {
    if (!items || !Array.isArray(items)) return {};

    let subTotal = 0;
    let totalDiscount = 0;
    let totalGST = 0;
    let grandTotal = 0;

    const gstBreakdown = {};

    items.forEach(item => {
        const quantity = parseFloat(item.quantity) || 1;
        const rate = parseFloat(item.rate) || 0;
        const discountPercent = parseFloat(item.discount) || 0;
        const gstPercent = parseFloat(item.taxGST) || 0;

        const itemSubTotal = quantity * rate;
        const discountAmount = (itemSubTotal * discountPercent) / 100;
        const taxableAmount = itemSubTotal - discountAmount;
        const gstAmount = item.withTax ? (taxableAmount * gstPercent) / 100 : 0;
        const itemTotal = itemSubTotal - discountAmount + gstAmount;

        subTotal += itemSubTotal;
        totalDiscount += discountAmount;
        totalGST += gstAmount;
        grandTotal += itemTotal;

        // Group GST Breakdown
        if (item.withTax && gstPercent > 0) {
            if (!gstBreakdown[gstPercent]) {
                gstBreakdown[gstPercent] = {
                    taxableAmount: 0,
                    gstAmount: 0,
                    sgst: 0,
                    cgst: 0
                };
            }
            gstBreakdown[gstPercent].taxableAmount += taxableAmount;
            gstBreakdown[gstPercent].gstAmount += gstAmount;
            gstBreakdown[gstPercent].sgst += gstAmount / 2;
            gstBreakdown[gstPercent].cgst += gstAmount / 2;
        }
    });

    return {
        subTotal: subTotal.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
        totalGST: totalGST.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        totalSGST: (totalGST / 2).toFixed(2),
        totalCGST: (totalGST / 2).toFixed(2),
        youSaved: totalDiscount.toFixed(2),
        gstBreakdown // Include breakdown in result
    };
};