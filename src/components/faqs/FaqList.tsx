'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteFAQ, FAQ } from '@/store/slices/faqsSlice';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { FaqModal } from './FaqModal';
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export function FaqList() {
    const dispatch = useAppDispatch();
    const { faqs } = useAppSelector((state) => state.faqs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FAQ | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: FAQ) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteFAQ(deleteId));
            setDeleteId(null);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedIds(newExpanded);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">FAQ List ({faqs.length})</h3>
                    <p className="text-sm text-gray-500">Manage questions and answers.</p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" /> Add FAQ
                </Button>
            </div>

            <div className="space-y-3">
                {faqs.map((item, index) => (
                    <div
                        key={item.id}
                        className="rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                            <div className="flex items-center gap-4 flex-1">
                                <span className="font-mono text-xs text-gray-400 w-6 text-center">#{index + 1}</span>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">{item.question}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-full">{item.category}</span>
                                        {item.isActive ?
                                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Active</span> :
                                            <span className="text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded-full">Inactive</span>
                                        }
                                        {item.defaultOpen && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Default Open</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <Button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} size="sm" variant="ghost" className="h-7 w-7 p-0">
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                {expandedIds.has(item.id) ?
                                    <ChevronUp className="h-4 w-4 text-gray-400" /> :
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                }
                            </div>
                        </div>

                        {expandedIds.has(item.id) && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {faqs.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No FAQs added yet. Click &quot;Add FAQ&quot; to get started.
                </div>
            )}

            <FaqModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete FAQ"
                message="Are you sure you want to delete this FAQ? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
