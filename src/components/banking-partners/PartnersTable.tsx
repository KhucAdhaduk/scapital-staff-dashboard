import React from 'react';
import { BankingPartner } from '@/store/slices/bankingPartnersSlice';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, CheckCircle, XCircle, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import NextImage from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface PartnersTableProps {
    partners: BankingPartner[];
    onEdit: (partner: BankingPartner) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
    onReorder: (result: DropResult) => void;
}

export function PartnersTable({ partners, onEdit, onDelete, onToggleStatus, onReorder }: PartnersTableProps) {
    if (partners.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-gray-500">No banking partners added yet.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <DragDropContext onDragEnd={onReorder}>
                    <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                            <tr>
                                <th className="w-10 px-4 py-3"></th>
                                <th className="px-6 py-3 font-bold">Order</th>
                                <th className="px-6 py-3 font-bold">Logo</th>
                                <th className="px-6 py-3 font-bold">Bank Name</th>
                                <th className="px-6 py-3 font-bold">Rel URL</th>
                                <th className="px-6 py-3 font-bold">Status</th>
                                <th className="sticky right-0 z-10 bg-gray-50 px-6 py-3 font-bold text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="partners-table">
                            {(provided) => (
                                <tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="divide-y divide-gray-200 bg-white"
                                >
                                    {partners.map((partner, index) => (
                                        <Draggable key={partner.id} draggableId={partner.id} index={index}>
                                            {(provided) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="group hover:bg-gray-50 bg-white"
                                                >
                                                    <td className="px-4 py-4" {...provided.dragHandleProps}>
                                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-gray-900">{index + 1}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="h-10 w-16 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
                                                            {partner.logoUrl ? (
                                                                <NextImage
                                                                    src={partner.logoUrl}
                                                                    alt={partner.name}
                                                                    width={64}
                                                                    height={40}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400">No IMG</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {partner.name}
                                                        {partner.isFeatured && (
                                                            <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                Featured
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-blue-600 truncate max-w-[150px]">
                                                        {partner.redirectUrl || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => onToggleStatus(partner.id)}
                                                            className={clsx(
                                                                "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors",
                                                                partner.isActive
                                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            )}
                                                        >
                                                            {partner.isActive ? (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3" /> Active
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="h-3 w-3" /> Inactive
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                onClick={() => onEdit(partner)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                onClick={() => onDelete(partner.id)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
            </div>
        </div>
    );
}
