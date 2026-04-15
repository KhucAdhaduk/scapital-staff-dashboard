'use client';

import React from 'react';
import { EmployeeTestimonial } from '@/services/employeeTestimonialService';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus, User } from 'lucide-react';

interface EmployeeTestimonialListProps {
    testimonials: EmployeeTestimonial[];
    onEdit: (testimonial: EmployeeTestimonial) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
}

export function EmployeeTestimonialList({ testimonials, onEdit, onDelete, onCreate }: EmployeeTestimonialListProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Testimonials List ({testimonials.length})</h3>
                    <p className="text-sm text-gray-500">Manage employee reviews displaying in the slider.</p>
                </div>
                <Button onClick={onCreate} className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
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
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1">{item.position}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 line-clamp-3 italic">&quot;{item.content}&quot;</p>
                        </div>

                        <div className="flex items-center justify-end border-t pt-4 mt-2">
                            <div className="flex gap-2">
                                <Button onClick={() => onEdit(item)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                </Button>
                                <Button onClick={() => onDelete(item.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
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
        </div>
    );
}
