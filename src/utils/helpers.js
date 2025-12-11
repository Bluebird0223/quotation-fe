// Helper function to format currency
export const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

// Global variables for API Key (required for image generation)
export const apiKey = ""; // Leave this as-is; it is automatically provided by the environment

// Initial state for items and quotations, updated to include image data
export const initialItems = [
  { id: 1, name: 'Premium Gloss Finish Paint', sku: 'PGP-001', price: 45.99, unit: 'Liter', imagePrompt: 'Can of deep blue gloss paint', imageUrl: 'https://placehold.co/100x100/1e40af/ffffff?text=Blue+Paint' },
  { id: 2, name: 'Matte Grey Primer', sku: 'MGP-002', price: 22.50, unit: 'Liter', imagePrompt: 'Can of matte grey primer', imageUrl: 'https://placehold.co/100x100/4b5563/ffffff?text=Grey+Primer' },
  { id: 3, name: 'Color Mixing Agent (CM-100)', sku: 'CMA-100', price: 10.00, unit: 'Unit', imagePrompt: 'Small bottle of color additive', imageUrl: 'https://placehold.co/100x100/059669/ffffff?text=Additive' },
];

export const initialQuotations = [
  { id: 101, title: 'Project Alpha Coating', customer: 'Acme Corp', total: 1250.00, date: '2025-01-15', status: 'Pending', details: [] },
  { id: 102, title: 'Residential Color Consultation', customer: 'J. Doe', total: 450.00, date: '2025-02-01', status: 'Approved', details: [] },
];