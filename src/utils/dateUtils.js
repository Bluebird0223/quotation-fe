// utils/dateUtils.js
export const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
        // If it's already in YYYY-MM-DD format, return as is
        if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // If it's an ISO string, extract date part
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toISOString().split('T')[0];
    }
};

export const formatDateForAPI = (dateString) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
};