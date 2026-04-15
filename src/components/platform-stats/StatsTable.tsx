import React from 'react';
import { StatItem } from '@/store/slices/platformStatsSlice';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, CheckCircle, XCircle, Activity, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { iconMap } from '@/lib/iconLibrary';

interface StatsTableProps {
    stats: StatItem[];
    onEdit: (stat: StatItem) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
    onReorder: (result: DropResult) => void;
}

export function StatsTable({ stats, onEdit, onDelete, onToggleStatus, onReorder }: StatsTableProps) {
    if (stats.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-gray-500">No statistics added yet.</p>
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
                                <th className="px-6 py-3 font-bold">Icon</th>
                                <th className="px-6 py-3 font-bold">Value</th>
                                <th className="px-6 py-3 font-bold">Label</th>
                                <th className="px-6 py-3 font-bold">Status</th>
                                <th className="sticky right-0 z-10 bg-gray-50 px-6 py-3 font-bold text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="stats-table">
                            {(provided) => (
                                <tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="divide-y divide-gray-200 bg-white"
                                >
                                    {stats.map((stat, index) => {
                                        const Icon = iconMap[stat.icon] || Activity;
                                        return (
                                            <Draggable key={stat.id} draggableId={stat.id} index={index}>
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
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-gray-900 text-base">
                                                                {stat.value}{stat.suffix}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-gray-700">
                                                            {stat.label}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => onToggleStatus(stat.id)}
                                                                className={clsx(
                                                                    "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors",
                                                                    stat.status === 'active'
                                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                                )}
                                                            >
                                                                {stat.status === 'active' ? (
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
                                                                    onClick={() => onEdit(stat)}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => onDelete(stat.id)}
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
                                        );
                                    })}
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
