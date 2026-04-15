'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/section-content/privacy_policy');
            if (response.data) {
                setFormData({
                    heading: response.data.heading || 'Privacy Policy',
                    description: response.data.description || '',
                    isActive: response.data.isActive ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching privacy policy:', error);
            // Don't show error if 404/not found, just start fresh
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axiosInstance.post('/section-content/privacy_policy', {
                ...formData,
                sectionKey: 'privacy_policy'
            });
            toast.success('Privacy Policy updated successfully');
        } catch (error) {
            console.error('Error saving privacy policy:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Privacy Policy Editor</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your privacy policy content.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Heading
                    </label>
                    <input
                        type="text"
                        value={formData.heading}
                        onChange={(e) => setFormData(prev => ({ ...prev, heading: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                        placeholder="e.g. Privacy Policy"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content (Markdown supported)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-mono text-sm text-gray-900"
                        placeholder="# Privacy Policy..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Page is Active (Visible to public)
                    </label>
                </div>
            </div>
        </div>
    );
}
