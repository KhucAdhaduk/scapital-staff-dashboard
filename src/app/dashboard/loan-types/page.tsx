'use client';

import React, { useEffect, useState } from 'react';
import { loanTypeService, LoanType, LoanDocument } from '@/services/loanTypeService';
import { FileText, Plus, Edit2, Trash2, X, AlertCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function LoanTypesPage() {
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    const [formDocuments, setFormDocuments] = useState<LoanDocument[]>([]);
    const [newDocName, setNewDocName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLoanTypes();
    }, []);

    const fetchLoanTypes = async () => {
        try {
            setLoading(true);
            const data = await loanTypeService.getLoanTypes();
            setLoanTypes(data);
        } catch (error) {
            console.error('Failed to fetch loan types:', error);
            toast.error('Failed to load loan types');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setSelectedLoanType(null);
        setFormName('');
        setFormDocuments([{ name: '', description: '' }]);
        setNewDocName('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (loanType: LoanType) => {
        setSelectedLoanType(loanType);
        setFormName(loanType.name);
        // Ensure documents is always an array of objects
        setFormDocuments(Array.isArray(loanType.documents) ? loanType.documents : []);
        setNewDocName('');
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (loanType: LoanType) => {
        setSelectedLoanType(loanType);
        setIsDeleteModalOpen(true);
    };

    const handleAddDocument = () => {
        setFormDocuments([...formDocuments, { name: '', description: '' }]);
    };

    const handleUpdateDocument = (index: number, field: keyof LoanDocument, value: string) => {
        const updatedDocs = [...formDocuments];
        updatedDocs[index] = { ...updatedDocs[index], [field]: value };
        setFormDocuments(updatedDocs);
    };

    const handleRemoveDocument = (index: number) => {
        setFormDocuments(formDocuments.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!formName.trim()) {
            toast.error('Please enter a loan type name');
            return;
        }

        setIsSubmitting(true);
        try {
            if (selectedLoanType) {
                await loanTypeService.updateLoanType(selectedLoanType.id, {
                    name: formName.trim(),
                    documents: formDocuments,
                });
                toast.success('Loan type updated successfully');
            } else {
                await loanTypeService.createLoanType({
                    name: formName.trim(),
                    documents: formDocuments,
                });
                toast.success('Loan type created successfully');
            }
            setIsModalOpen(false);
            fetchLoanTypes();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const msg = err.response?.data?.message || 'Failed to save loan type';
            toast.error(typeof msg === 'string' ? msg : 'Error saving loan type');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLoanType) return;
        setIsSubmitting(true);
        try {
            await loanTypeService.deleteLoanType(selectedLoanType.id);
            toast.success('Loan type deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLoanTypes();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const msg = err.response?.data?.message || 'Failed to delete loan type';
            toast.error(typeof msg === 'string' ? msg : 'Error deleting loan type');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Loan Types Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure loan products and their required document checklists.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-95 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Loan Type</span>
                </button>
            </div>

            {/* Main Content Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-[#fcfdfd] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">Loan Name</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Required Documents</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">Added On</th>
                                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-4 w-32 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-5"><div className="h-6 w-48 bg-gray-100 rounded-full" /></td>
                                        <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-5 text-right"><div className="h-6 w-16 bg-gray-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : loanTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-1">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No Loan Types Found</h3>
                                            <p className="text-sm text-gray-500 max-w-sm">Create your first loan type to start organizing requirements.</p>
                                            <button
                                                onClick={handleOpenCreateModal}
                                                className="mt-4 px-6 py-2 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors"
                                            >
                                                Create Loan Type
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                loanTypes.map((loanType) => {
                                    const docs = Array.isArray(loanType.documents) ? loanType.documents : [];

                                    return (
                                        <tr key={loanType.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="text-[15px] font-bold text-[#1a202c]">
                                                    {loanType.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {docs.length === 0 ? (
                                                        <span className="text-xs text-gray-400 italic">No documents required</span>
                                                    ) : (
                                                        docs.map((doc, index) => (
                                                            <span
                                                                key={`${index}`}
                                                                className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1 bg-[#00a651]/10 text-[#00a651]"
                                                                title={doc.description || ''}
                                                            >
                                                                {doc.name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-500">
                                                    {format(new Date(loanType.createdAt), 'dd/MM/yyyy')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenEditModal(loanType)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm border border-indigo-100/50"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenDeleteModal(loanType)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-red-100/50 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                                                        disabled={loanType._count?.leads ? loanType._count.leads > 0 : false}
                                                        title={loanType._count?.leads && loanType._count.leads > 0 ? "Cannot delete loan type with associated leads" : "Delete"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compose Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">
                                {selectedLoanType ? 'Edit Loan Type' : 'Create New Loan Type'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow space-y-6">

                            {/* General Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loan Product Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g., Home Loan, Personal Loan"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#00a651]/10 focus:border-[#00a651] transition-all text-sm font-bold text-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Document Checklist */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[13px] font-bold text-gray-600">Documents List</label>
                                    <button
                                        onClick={handleAddDocument}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-sm active:scale-95"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Add Item</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formDocuments.length === 0 ? (
                                        <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                                            <p className="text-sm font-medium text-gray-400">No documents added yet. Click "Add Item" to start.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formDocuments.map((doc, index) => (
                                                <div key={index} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group relative animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {/* Number Badge */}
                                                    <div className="flex-shrink-0 mt-2">
                                                        <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                                                            {index + 1}
                                                        </div>
                                                    </div>

                                                    {/* Fields */}
                                                    <div className="flex-grow space-y-3">
                                                        <input
                                                            type="text"
                                                            value={doc.name}
                                                            onChange={(e) => handleUpdateDocument(index, 'name', e.target.value)}
                                                            placeholder="Document Name"
                                                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#00a651]/10 focus:border-[#00a651] transition-all"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={doc.description || ''}
                                                            onChange={(e) => handleUpdateDocument(index, 'description', e.target.value)}
                                                            placeholder="Description"
                                                            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#00a651]/10 focus:border-[#00a651] transition-all"
                                                        />
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={() => handleRemoveDocument(index)}
                                                            className={`p-2 rounded-xl transition-all ${formDocuments.length <= 1 ? 'text-gray-200 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                            title={formDocuments.length <= 1 ? "Minimum one document required" : "Delete"}
                                                            disabled={formDocuments.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSubmitting || !formName.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#00a651] text-white text-sm font-bold rounded-xl hover:bg-[#008d45] hover:shadow-md hover:shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>Save Loan Type</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedLoanType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center ring-8 ring-red-50/50 mb-2">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Loan Type</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Are you sure you want to delete <strong className="text-gray-900 border-b border-gray-200 pb-0.5">{selectedLoanType.name}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all focus:ring-4 focus:ring-gray-100 active:scale-95"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-red-500 border border-transparent rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 transition-all focus:ring-4 focus:ring-red-100 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Yes, Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
