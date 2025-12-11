import React from 'react';
import { LayoutDashboard, Package, FileText, AlertTriangle, List } from 'lucide-react';
import PrimaryButton from '../UI/Button';
import StatusBadge from '../UI/StatusBadge';
import { formatCurrency } from '../../utils/helpers';

const Dashboard = ({ items, quotations, setView }) => {
    const totalItems = items.length;
    const totalQuotations = quotations.length;
    const pendingQuotes = quotations.filter(q => q.status === 'Pending').length;
    const totalQuotedValue = quotations.reduce((sum, q) => sum + q.total, 0);

    const stats = [
        { title: 'Total Items', value: totalItems, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Total Quotations', value: totalQuotations, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Pending Quotes', value: pendingQuotes, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { title: 'Total Quoted Value', value: formatCurrency(totalQuotedValue), icon: List, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const QuoteCard = ({ quote }) => (
        <div className="p-4 border border-gray-100 bg-white rounded-lg shadow hover:shadow-md transition duration-150">
            <h4 className="font-semibold text-gray-800 truncate">{quote.title}</h4>
            <p className="text-sm text-gray-600">Customer: {quote.customer}</p>
            <div className="flex justify-between items-center mt-2">
                <StatusBadge status={quote.status} />
                <span className="font-bold text-lg text-green-700">{formatCurrency(quote.total)}</span>
            </div>
        </div>
    );

    const ItemCard = ({ item }) => (
        <div className="p-3 border border-gray-100 bg-white rounded-lg shadow hover:shadow-md transition duration-150 text-sm flex items-center space-x-3">
            <img
                src={item.imageUrl || 'https://placehold.co/40x40/cccccc/ffffff?text=No+Img'}
                alt={item.name}
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
            // onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/ffffff?text=No+Img'; }}
            />
            <div>
                <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                <p className="font-medium text-green-600 mt-0.5 text-xs">{formatCurrency(item.price)} / {item.unit}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <LayoutDashboard className="mr-3 text-green-600" size={30} /> Quotation App Dashboard
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`p-5 rounded-xl shadow-lg flex items-center space-x-4 ${stat.bg} border-l-4 border-green-500`}>
                        <stat.icon size={36} className={`${stat.color}`} />
                        <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                <PrimaryButton icon={FileText} onClick={() => setView('quotation-list')}>
                    View All Quotations
                </PrimaryButton>
                <PrimaryButton icon={Package} onClick={() => setView('item-list')} className="bg-gray-700 hover:bg-gray-800">
                    View All Inventory
                </PrimaryButton>
            </div>


            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Recent Quotations</h2>
                    <div className="space-y-3">
                        {quotations.slice(0, 3).map(q => <QuoteCard key={q.id} quote={q} />)}
                        {quotations.length === 0 && <p className="text-gray-500">No recent quotations.</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Latest Items</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.slice(0, 4).map(item => <ItemCard key={item.id} item={item} />)}
                        {items.length === 0 && <p className="text-gray-500">No items available.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;