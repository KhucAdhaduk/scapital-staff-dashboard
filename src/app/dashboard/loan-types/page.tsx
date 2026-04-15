'use client';

import React, { useEffect, useState } from 'react';
import { loanTypeService, LoanType, LoanDocument } from '@/services/loanTypeService';
import { Plus, Trash2, Edit2, X, AlertCircle, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoanTypesPage() {
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [documents, setDocuments] = useState<Omit<LoanDocument, 'id'>[]>([{ name: '', description: '' }]);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        fetchLoanTypes();
    }, []);

    const fetchLoanTypes = async () => {
        try {
            setLoading(true);
            const data = await loanTypeService.getLoanTypes();
            setLoanTypes(data);
        } catch (error) {
            console.error('Error fetching loan types:', error);
            toast.error('Failed to load loan types');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (loanType?: LoanType) => {
        if (loanType) {
            setSelectedLoanType(loanType);
            setName(loanType.name);
            setDocuments(loanType.documents.map(d => ({ name: d.name, description: d.description })));
        } else {
            setSelectedLoanType(null);
            setName('');
            setDocuments([{ name: '', description: '' }]);
        }
        setValidationError(null);
        setIsModalOpen(true);
    };

    const handleAddDocument = () => {
        setDocuments([...documents, { name: '', description: '' }]);
    };

    const handleRemoveDocument = (index: number) => {
        const newDocs = documents.filter((_, i) => i !== index);
        setDocuments(newDocs.length > 0 ? newDocs : [{ name: '', description: '' }]);
    };

    const handleDocumentChange = (index: number, field: keyof LoanDocument, value: string) => {
        const newDocs = [...documents];
        newDocs[index] = { ...newDocs[index], [field]: value };
        setDocuments(newDocs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!name.trim()) {
            setValidationError('Loan type name is required');
            return;
        }

        const validDocs = documents.filter(d => d.name.trim());
        if (validDocs.length === 0) {
            setValidationError('At least one document with a name is required');
            return;
        }

        try {
            const payload = { 
                name: name.trim(), 
                documents: validDocs 
            };

            if (selectedLoanType) {
                await loanTypeService.updateLoanType(selectedLoanType.id, payload);
                toast.success('Loan type updated successfully');
            } else {
                await loanTypeService.createLoanType(payload);
                toast.success('Loan type created successfully');
            }

            setIsModalOpen(false);
            fetchLoanTypes();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setValidationError(err.response?.data?.message || 'Failed to save loan type');
        }
    };

    const handleDelete = async () => {
        if (!selectedLoanType) return;
        try {
            await loanTypeService.deleteLoanType(selectedLoanType.id);
            toast.success('Loan type deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLoanTypes();
        } catch {
            toast.error('Failed to delete loan type');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan Types</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage loan products and their required documentation</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Loan Type
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Required Documents</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added On</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-6"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : loanTypes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400">
                                        No loan types found. Create your first one!
                                    </td>
                                </tr>
                            ) : (
                                loanTypes.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">{type.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {type.documents.map((doc, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100/50">
                                                        {doc.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(type.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(type)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedLoanType(type); setIsDeleteModalOpen(true); }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900">{selectedLoanType ? 'Edit Loan Type' : 'Create New Loan Type'}</h2>
                                <p className="text-xs text-gray-500 font-medium">Define the loan product and its required documentation</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {validationError && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    {validationError}
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Loan Product Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Personal Loan, Business Loan"
                                    className="w-full mt-2 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Required Documents</label>
                                    <button
                                        type="button"
                                        onClick={handleAddDocument}
                                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-xs"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {documents.map((doc, index) => (
                                        <div key={index} className="group relative bg-gray-50/30 border border-gray-100 rounded-2xl p-5 space-y-4 animate-in slide-in-from-left-4 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                                            <div className="flex items-start gap-4">
                                                <div className="flex-none w-6 h-6 rounded-full bg-cyan-50 flex items-center justify-center text-[10px] font-black text-cyan-600 mt-2 border border-cyan-100/50">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={doc.name}
                                                        onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                                                        placeholder="Document Name (e.g. Identity Proof)"
                                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-gray-900"
                                                    />
                                                    <textarea
                                                        value={doc.description || ''}
                                                        onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                                                        placeholder="Short description of what the document should contain..."
                                                        rows={2}
                                                        className="w-full px-4 py-2 bg-white border border-gray-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-xs font-medium text-gray-600 resize-none opacity-80"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocument(index)}
                                                    className="flex-none p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                            >
                                {selectedLoanType ? 'Update Loan Type' : 'Create Loan Type'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center space-y-6 animate-in zoom-in duration-200">
                        <div className="inline-flex p-4 bg-red-50 rounded-2xl">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Delete Loan Type?</h3>
                            <p className="text-sm text-gray-500 mt-2">This will permanently remove <b>{selectedLoanType?.name}</b> and all its associated document requirements.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
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
