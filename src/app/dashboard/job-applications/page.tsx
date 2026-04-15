'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Loader2, FileText, ExternalLink } from 'lucide-react';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';

interface JobApplication {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    position?: string;
    resumeUrl?: string;
    createdAt: string;
}

export default function JobApplicationsPage() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axiosInstance.get('/job-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching job applications:', error);
            toast.error('Failed to load job applications');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        const search = searchTerm.toLowerCase();
        return (
            app.fullName.toLowerCase().includes(search) ||
            app.email.toLowerCase().includes(search) ||
            (app.position && app.position.toLowerCase().includes(search))
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
                    <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
                    <p className="mt-1 text-sm text-gray-500">View and manage career applications.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search applicants..."
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
                                    Candidate Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Position Applied
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Resume
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No job applications found
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
                                            <div className="text-sm text-gray-900 font-medium">
                                                {app.position || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {app.resumeUrl ? (
                                                <a
                                                    href={app.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
                                                >
                                                    <FileText size={14} />
                                                    View Resume
                                                    <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No resume</span>
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
