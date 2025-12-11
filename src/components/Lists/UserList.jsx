import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users, Shield, Mail, ChevronUp, ChevronDown } from 'lucide-react';
import { communication } from '../../service/communication';
import PrimaryButton from '../UI/Button';
import UserForm from '../Forms/UserForm';
// import UserForm from './UserForm';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await communication.getAllUsers();
            if (response?.data?.status) {
                setUsers(response.data.result || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await communication.deleteUser({ id: userId });
            if (response?.data?.status) {
                setUsers(users.filter(user => user._id !== userId));
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingUser(null);
        fetchUsers();
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-green-100 text-green-800 border-green-200';
            case 'service': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'sales': return 'bg-purple-100 text-purple-800 border-purple-200 ';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getAccessColor = (access) => {
        switch (access) {
            case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'write': return 'bg-red-100 text-red-800 border-red-200';
            case 'full': return 'bg-green-100 text-green-800 border-green-200';
            case 'none': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };;

    // Filter and sort users
    const filteredUsers = users
        .filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userRole?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'name' || sortField === 'email') {
                aValue = aValue?.toLowerCase() || '';
                bValue = bValue?.toLowerCase() || '';
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                <Users className="mr-3 text-green-600" size={30} /> User Management
            </h1>

            <div className="flex justify-between items-center">
                <p className="text-gray-600">Total: <strong>{users.length}</strong> users.</p>
                <PrimaryButton icon={Plus} onClick={handleCreateUser}>
                    Add New User
                </PrimaryButton>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    <div className="col-span-3 flex items-center space-x-2 cursor-pointer hover:text-gray-900">
                        <span>User Name</span>
                    </div>
                    <div className="col-span-3 flex items-center space-x-2 cursor-pointer hover:text-gray-900">
                        <span>Email</span>
                    </div>
                    <div
                        className="col-span-2 flex items-center space-x-2 cursor-pointer hover:text-gray-900"
                    // onClick={() => handleSort('userRole')}
                    >
                        <span>Role</span>
                        {/* <SortIcon field="userRole" /> */}
                    </div>
                    <div className="col-span-3">Access Permissions</div>
                    <div className="col-span-1 text-center">Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <div key={user._id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition duration-200">
                            <div className="col-span-3">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-3 flex items-center">
                                <div className="flex items-center text-gray-600">
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.userRole)}`}>
                                    {user.userRole}
                                </span>
                            </div>
                            <div className="col-span-3">
                                <div className="flex flex-wrap gap-2"> {/* Increased gap for better spacing */}
                                    {user.tabAccess?.map((access, index) => (
                                        <div key={index} className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-white">
                                            <span className="text-gray-700 text-xs font-medium">
                                                {access.tabName}:
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getAccessColor(access.access)}`}>
                                                {access.access}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => handleEditUser(user)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                                    title="Edit User"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(user._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                                    title="Delete User"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {users.length === 0 ? 'No users found' : 'No matching users'}
                        </h3>
                        <p className="text-gray-600">
                            {users.length === 0
                                ? 'Get started by creating your first user.'
                                : 'Try adjusting your search terms.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {showForm && (
                <UserForm
                    user={editingUser}
                    onClose={() => {
                        setShowForm(false);
                        setEditingUser(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete User
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(deleteConfirm)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition duration-200 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;