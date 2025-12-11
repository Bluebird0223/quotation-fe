import React from 'react';

const Notification = ({ message, type }) => {
    if (!message) return null;
    const classes = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`mb-4 p-3 rounded-lg text-white font-semibold ${classes}`}>
            {message}
        </div>
    );
};

export default Notification;