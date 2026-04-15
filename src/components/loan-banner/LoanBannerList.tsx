'use client';

import React from 'react';
import { LoanBanner } from '@/services/loanBannerService';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus, GripVertical, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';

interface LoanBannerListProps {
    banners: LoanBanner[];
    onEdit: (banner: LoanBanner) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
    onReorder: (result: DropResult) => void;
}

export function LoanBannerList({ banners, onEdit, onDelete, onCreate, onReorder }: LoanBannerListProps) {
    // Sort by order before rendering if not dragging?
    // Actually, the parent component should handle the optimistic sort.
    // We'll trust the order coming in.

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Loan Tabs List ({banners.length})</h3>
                    <p className="text-sm text-gray-500">Manage loan tabs displaying in the hero section.</p>
                </div>
                <Button onClick={onCreate} className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add New Tab
                </Button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <DragDropContext onDragEnd={onReorder}>
                        <Droppable droppableId="loan-banners-list">
                            {(provided) => (
                                <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap" {...provided.droppableProps} ref={provided.innerRef}>
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                                        <tr>
                                            <th className="px-6 py-3">Order</th>
                                            <th className="px-6 py-3">Image</th>
                                            <th className="px-6 py-3">Loan Name</th>
                                            <th className="px-6 py-3">Default</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="sticky right-0 z-10 bg-gray-50 px-6 py-3 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {banners.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                                    No loan tabs found. Create one to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            banners.map((banner, index) => (
                                                <Draggable key={banner.id} draggableId={banner.id} index={index}>
                                                    {(provided) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className="group hover:bg-gray-50 bg-white"
                                                        >
                                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                                <div className="flex items-center gap-2" {...provided.dragHandleProps}>
                                                                    <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                                                                    {index + 1}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="h-10 w-16 overflow-hidden rounded bg-gray-100">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-gray-900">{banner.title}</td>
                                                            <td className="px-6 py-4">
                                                                {banner.isDefault && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                                        <CheckCircle className="h-3 w-3" /> Default
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={clsx(
                                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                                    banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                                                )}>
                                                                    {banner.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button size="sm" variant="ghost" onClick={() => onEdit(banner)}>
                                                                        <Edit2 className="h-4 w-4 text-gray-600" />
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={() => onDelete(banner.id)}>
                                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
}
