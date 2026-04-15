'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteTestimonial } from '@/store/slices/testimonialsSlice';
import { Testimonial } from '@/services/testimonialService';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { TestimonialModal } from './TestimonialModal';
import { Pencil, Trash2, Plus, Star, CircleUser } from 'lucide-react';
import NextImage from 'next/image';

export function TestimonialsList() {
    const dispatch = useAppDispatch();
    const { testimonials } = useAppSelector((state) => state.testimonials);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: Testimonial) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteTestimonial(deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Testimonials List ({testimonials.length})</h3>
                    <p className="text-sm text-gray-500">Manage client reviews displaying in the slider.</p>
                </div>
                <Button onClick={handleAdd} className="gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add Testimonial
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((item) => (
                    <div
                        key={item.id}
                        className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        {/* Status Badge */}
                        <div className="absolute right-4 top-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4 mt-2">
                            <div className="relative h-12 w-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                {item.imageUrl ? (
                                    <NextImage src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <CircleUser className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <p className="text-xs text-gray-500">{item.designation}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex gap-0.5 text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'fill-current' : 'text-gray-200'}`} />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 italic">&quot;{item.content}&quot;</p>
                        </div>

                        <div className="flex items-center justify-end border-t pt-4 mt-2">
                            <div className="flex gap-2">
                                <Button onClick={() => handleEdit(item)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDelete(item.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {testimonials.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No testimonials added yet. Click &quot;Add Testimonial&quot; to get started.
                </div>
            )}

            <TestimonialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Testimonial"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
