'use client';

import { User, userService } from '@/services/userService';
import { format } from 'date-fns';
import { AlertCircle, Eye, EyeOff, Key, Pencil, Phone, Search, Shield, Trash2, User as UserIcon, UserPlus, X, ChevronDown, Check, ShieldCheck, Users } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { formatPhoneNumber } from '@/utils/phoneFormat';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        mobileNumber: '',
        password: '',
        role: 'USER'
    });

    const [newPassword, setNewPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Clear data when modals close
    useEffect(() => {
        if (!isAddModalOpen && !isEditModalOpen && !isResetModalOpen && !isDeleteModalOpen) {
            setFormData({ name: '', username: '', mobileNumber: '', password: '', role: 'USER' });
            setSelectedUser(null);
            setValidationError(null);
            setIsRoleDropdownOpen(false);
        }
    }, [isAddModalOpen, isEditModalOpen, isResetModalOpen, isDeleteModalOpen]);

    // Handle click outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
                setIsRoleDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validation for +91 followed by 10 digits
        const mobileRegex = /^\+91[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber)) {
            setValidationError('Please enter a valid mobile number (e.g. +919328573977)');
            return;
        }

        // Proper format: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setValidationError('Password: 8+ chars, uppercase, lowercase, number, and special character');
            return;
        }

        try {
            await userService.createUser(formData);
            toast.success('User created successfully');
            setIsAddModalOpen(false);
            setFormData({ name: '', username: '', mobileNumber: '', password: '', role: 'USER' });
            setShowPassword(false);
            fetchUsers();
        } catch (error: any) {
            setValidationError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (!selectedUser) return;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setValidationError('Password: 8+ chars, uppercase, lowercase, number, and special character');
            return;
        }

        try {
            await userService.resetPassword(selectedUser.id, newPassword);
            toast.success('Password reset successfully');
            setIsResetModalOpen(false);
            setNewPassword('');
            setShowResetPassword(false);
            setSelectedUser(null);
        } catch (error: any) {
            setValidationError(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setValidationError(null);

        // Validation for update (must include +91)
        const mobileRegex = /^\+91[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobileNumber)) {
            setValidationError('Please enter a valid mobile number (e.g. +919328573977)');
            return;
        }

        try {
            const dataToUpdate = {
                name: formData.name,
                username: formData.username,
                mobileNumber: formData.mobileNumber,
                role: formData.role
            };
            await userService.updateUser(selectedUser.id, dataToUpdate);
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            setFormData({ name: '', username: '', mobileNumber: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error: any) {
            setValidationError(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await userService.deleteUser(selectedUser.id);
            toast.success('User deleted successfully');
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 text-start">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500">Create and manage mobile application users</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', username: '', mobileNumber: '', password: '', role: 'USER' });
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-sm hover:shadow-md active:scale-95 text-sm font-semibold w-fit"
                >
                    <UserPlus className="h-4 w-4" />
                    Add New User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px] group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4.5 w-4.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, username or mobile..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                            <tr>
                                <th className="w-[20%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Full Name</th>
                                <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Username</th>
                                <th className="w-[15%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Mobile Number</th>
                                <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">User Type</th>
                                <th className="w-[18%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Registration Date</th>
                                <th className="w-[13%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield className="h-10 w-10 text-gray-200" />
                                            <p className="text-gray-500 font-medium">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    <span className="text-primary font-bold text-sm">
                                                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 leading-tight">
                                                        {user.name || '—'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-0.5">
                                                        Access: {user.role || 'USER'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                {user.username}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs text-gray-600 font-semibold inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                                <Phone className="h-3 w-3 text-gray-400" />
                                                {formatPhoneNumber(user.mobileNumber || '') || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100/50' :
                                                user.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                    'bg-indigo-50 text-indigo-600 border-indigo-100/50'
                                                }`}>
                                                {user.role || 'USER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs text-gray-900 font-medium">
                                                    {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    Registered
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setFormData({
                                                            name: user.name || '',
                                                            username: user.username || '',
                                                            mobileNumber: formatPhoneNumber(user.mobileNumber || ''),
                                                            password: '',
                                                            role: user.role || 'USER'
                                                        });
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm border border-indigo-100/50"
                                                    title="Edit User"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsResetModalOpen(true);
                                                    }}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors shadow-sm border border-amber-100/50"
                                                    title="Reset Password"
                                                >
                                                    <Key className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-red-100/50"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center text-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                                <p className="text-xs text-gray-500 mt-1">Fill in the details to create a mobile application account</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="px-8 pb-8 space-y-4">
                            {validationError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-600 font-medium leading-relaxed">{validationError}</p>
                                </div>
                            )}

                            <div className="space-y-1.5 text-start">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-start">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Username</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="username"
                                            autoComplete="off"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 font-mono"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') })}
                                            onFocus={() => {
                                                if (!formData.username && formData.name) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        username: prev.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-start">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Mobile</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            required
                                            type="tel"
                                            maxLength={10}
                                            placeholder="10-digit number"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900"
                                            value={formData.mobileNumber}
                                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-start" ref={roleDropdownRef}>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">User Type (Role)</label>
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                        className={`w-full flex items-center justify-between pl-4 pr-4 py-3 border rounded-xl text-sm transition-all duration-300 ${isRoleDropdownOpen ? 'bg-white border-primary shadow-lg shadow-primary/5 ring-4 ring-primary/10' : 'bg-gray-50 border-gray-100 text-gray-900 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className={`h-4 w-4 ${isRoleDropdownOpen ? 'text-primary' : 'text-gray-400'}`} />
                                            <span className="font-bold">
                                                {formData.role === 'ADMIN' ? 'Admin' :
                                                    formData.role === 'MANAGER' ? 'Manager' : 'User'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                                    </button>

                                    {isRoleDropdownOpen && (
                                        <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top max-h-60 overflow-y-auto custom-scrollbar">
                                            {[
                                                { id: 'USER', label: 'User', desc: 'Default mobile application access', icon: UserIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                                { id: 'MANAGER', label: 'Manager', desc: 'Access to team & lead management', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
                                                { id: 'ADMIN', label: 'Admin', desc: 'Restricted full system control', icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50' }
                                            ].map((role) => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, role: role.id });
                                                        setIsRoleDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all hover:bg-gray-50 group ${formData.role === role.id ? 'bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-xl ${formData.role === role.id ? 'bg-primary/10' : role.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                            <role.icon className={`h-5 w-5 ${formData.role === role.id ? 'text-primary' : role.color}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${formData.role === role.id ? 'text-primary' : 'text-gray-900'}`}>{role.label}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">{role.desc}</span>
                                                        </div>
                                                    </div>
                                                    {formData.role === role.id && (
                                                        <div className="bg-primary text-white p-1 rounded-lg">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-start">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Initial Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="T@st123"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 font-bold text-sm"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {isResetModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                                <Key className="h-6 w-6 text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                You are resetting the password for <span className="font-bold text-gray-900">{selectedUser.name || selectedUser.username}</span>
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword} className="px-8 pb-8 space-y-4">
                            {validationError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 animate-in slide-in-from-top-2 mb-4">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-600 font-medium leading-relaxed">{validationError}</p>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
                                <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                                    Ensure the user receives their new credentials immediately. This action cannot be undone.
                                </p>
                            </div>

                            <div className="space-y-1.5 text-start">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">New Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        type={showResetPassword ? "text" : "password"}
                                        placeholder="T@st123"
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {showResetPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsResetModalOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-500/20 font-bold text-sm"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                                <p className="text-xs text-gray-500 mt-1">Update mobile application user details</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <X className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="px-8 pb-8 space-y-4">
                            {validationError && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-600 font-medium leading-relaxed">{validationError}</p>
                                </div>
                            )}

                            <div className="space-y-1.5 text-start">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-start">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Username</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="username"
                                            autoComplete="off"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900 font-mono"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') })}
                                            onFocus={() => {
                                                if (!formData.username && formData.name) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        username: prev.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-start">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Mobile</label>
                                    <div className="relative group/edit-mobile">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 group-focus-within/edit-mobile:text-primary transition-colors">
                                            +91
                                        </div>
                                        <input
                                            required
                                            type="tel"
                                            maxLength={10}
                                            placeholder="10-digit number"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-gray-900"
                                            value={formData.mobileNumber.startsWith('+91') ? formData.mobileNumber.slice(3) : formData.mobileNumber.replace(/\D/g, '')}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setFormData({ ...formData, mobileNumber: `+91${val}` });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-start" ref={roleDropdownRef}>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">User Type (Role)</label>
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                        className={`w-full flex items-center justify-between pl-4 pr-4 py-3 border rounded-xl text-sm transition-all duration-300 ${isRoleDropdownOpen ? 'bg-white border-primary shadow-lg shadow-primary/5 ring-4 ring-primary/10' : 'bg-gray-50 border-gray-100 text-gray-900 hover:bg-white hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield className={`h-4 w-4 ${isRoleDropdownOpen ? 'text-primary' : 'text-gray-400'}`} />
                                            <span className="font-bold">
                                                {formData.role === 'ADMIN' ? 'Admin' :
                                                    formData.role === 'MANAGER' ? 'Manager' : 'User'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                                    </button>

                                    {isRoleDropdownOpen && (
                                        <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top max-h-60 overflow-y-auto custom-scrollbar">
                                            {[
                                                { id: 'USER', label: 'User', desc: 'Default mobile application access', icon: UserIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                                { id: 'MANAGER', label: 'Manager', desc: 'Access to team & lead management', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
                                                { id: 'ADMIN', label: 'Admin', desc: 'Restricted full system control', icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50' }
                                            ].map((role) => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, role: role.id });
                                                        setIsRoleDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-all hover:bg-gray-50 group ${formData.role === role.id ? 'bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-xl ${formData.role === role.id ? 'bg-primary/10' : role.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                            <role.icon className={`h-5 w-5 ${formData.role === role.id ? 'text-primary' : role.color}`} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-bold ${formData.role === role.id ? 'text-primary' : 'text-gray-900'}`}>{role.label}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">{role.desc}</span>
                                                        </div>
                                                    </div>
                                                    {formData.role === role.id && (
                                                        <div className="bg-primary text-white p-1 rounded-lg">
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20 font-bold text-sm"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="px-8 pt-8 pb-4">
                            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                                <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Are you sure you want to delete <span className="font-bold text-gray-900">{selectedUser.name || selectedUser.username}</span>? This action cannot be undone.
                            </p>
                        </div>

                        <div className="px-8 pb-8 flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 font-bold text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
