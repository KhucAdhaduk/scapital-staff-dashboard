'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addParameter, updateParameter, deleteParameter, reorderParameters, setParameters } from '@/store/slices/loanComparisonSlice';
import { ComparisonParameter } from '@/services/loanComparisonService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Pencil, Trash2, Plus, X, GripVertical } from 'lucide-react';

export function ParameterList() {
    const dispatch = useAppDispatch();
    const { parameters } = useAppSelector((state) => state.loanComparison);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParam, setEditingParam] = useState<ComparisonParameter | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingParam(null);
        setIsModalOpen(true);
    };

    const handleEdit = (param: ComparisonParameter) => {
        setEditingParam(param);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteParameter(deleteId));
            setDeleteId(null);
        }
    };

    const onReorder = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(parameters);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        dispatch(setParameters(reorderedItems));

        // Backend update
        const reorderPayload = reorderedItems.map(item => ({
            id: item.id,
            order: item.order
        }));
        dispatch(reorderParameters(reorderPayload));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Comparison Parameters</h3>
                    <p className="text-sm text-gray-500">Define the rows for the comparison table (e.g., Interest Rate, Tenure).</p>
                </div>
                <Button onClick={handleAdd} className="gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add Parameter
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <DragDropContext onDragEnd={onReorder}>
                    <table className="w-full text-left text-sm text-gray-500 table-fixed whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                            <tr>
                                <th className="w-10 px-4 py-3"></th>
                                <th className="w-[10%] px-6 py-3 font-bold">Order</th>
                                <th className="w-[50%] px-6 py-3 font-bold">Parameter Title</th>
                                <th className="w-[20%] px-6 py-3 font-bold">Status</th>
                                <th className="w-[10%] sticky right-0 z-10 bg-gray-50 px-6 py-3 font-bold text-right shadow-[-5px_0_15px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="parameters-list">
                            {(provided) => (
                                <tbody
                                    className="divide-y divide-gray-200 bg-white"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {parameters.map((param, index) => (
                                        <Draggable key={param.id} draggableId={param.id} index={index}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`group hover:bg-gray-50 ${snapshot.isDragging ? 'bg-gray-50 shadow-lg relative z-20' : 'bg-white'}`}
                                                >
                                                    <td className="w-10 px-4 py-4 text-center">
                                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                                            <GripVertical className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </td>
                                                    <td className="w-[10%] px-6 py-4 font-mono text-gray-900">{index + 1}</td>
                                                    <td className="w-[50%] px-6 py-4 font-medium text-gray-900">{param.title}</td>
                                                    <td className="w-[20%] px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${param.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {param.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="w-[10%] sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button onClick={() => handleEdit(param)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button onClick={() => handleDelete(param.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
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

            <ParameterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingParam}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Parameter"
                message="Are you sure? This will remove the entire row from comparison matrix."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}

function ParameterModal({ isOpen, onClose, initialData }: { isOpen: boolean; onClose: () => void; initialData: ComparisonParameter | null }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<Partial<ComparisonParameter>>({
        title: '', isActive: true
    });

    React.useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ title: '', isActive: true });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        else if (type === 'number') setFormData(prev => ({ ...prev, [name]: Number(value) }));
        else setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            dispatch(updateParameter({
                id: initialData.id,
                data: formData
            }));
        }
        else dispatch(addParameter(formData as Omit<ComparisonParameter, 'id'>));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Parameter' : 'Add Parameter'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-gray-500 hover:text-gray-700" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Parameter Title" name="title" value={formData.title} onChange={handleChange} required />

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm font-medium text-gray-700">Active Status</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
