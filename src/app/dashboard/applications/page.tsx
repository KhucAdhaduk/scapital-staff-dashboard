'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Loader2, Check, X } from 'lucide-react';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';

interface LoanApplication {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    loanType: string;
    loanAmount: string;
    tenure: string;
    documents: string[];
    status: string;
    createdAt: string;
}

export default function LoanApplicationsPage() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axiosInstance.get('/loan-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setUpdatingId(id);
        try {
            await axiosInstance.post(`/loan-applications/${id}/status`, { status });
            toast.success(`Application ${status.toLowerCase()} successfully`);
            fetchApplications();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.toLowerCase();
        return (
            app.fullName.toLowerCase().includes(search) ||
            app.email.toLowerCase().includes(search)
        );
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and track loan applications.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white placeholder-gray-500"
                    />
                </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loan Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Documents
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No applications found
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(app.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {app.fullName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{app.email}</div>
                                            <div className="text-sm text-gray-500">{app.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 capitalize">{app.loanType} Loan</div>
                                            <div className="text-sm text-gray-600 font-medium">₹{app.loanAmount}</div>
                                            <div className="text-xs text-gray-500">{app.tenure} months</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-2">
                                                {app.documents && app.documents.length > 0 ? (
                                                    app.documents.map((doc, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={doc}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-teal-600 hover:text-teal-800 text-xs border border-teal-200 bg-teal-50 px-2 py-1 rounded inline-flex items-center"
                                                        >
                                                            Doc {idx + 1}
                                                        </a>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No docs</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {app.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'APPROVED')}
                                                        disabled={updatingId === app.id}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-full hover:bg-green-100 transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {updatingId === app.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Check className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                        disabled={updatingId === app.id}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        {updatingId === app.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <X className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
