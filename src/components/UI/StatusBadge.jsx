import React from 'react';

const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  if (status === 'Approved') colorClass = 'bg-green-100 text-green-800';
  if (status === 'Pending') colorClass = 'bg-yellow-100 text-yellow-800';
  if (status === 'Rejected') colorClass = 'bg-red-100 text-red-800';
  if (status === 'Completed') colorClass = 'bg-blue-100 text-blue-800';

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;