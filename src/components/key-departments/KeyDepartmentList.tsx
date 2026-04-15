'use client';

import React from 'react';
import { KeyDepartment } from '@/services/keyDepartmentService';
import { Button } from '@/components/ui/Button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface KeyDepartmentListProps {
    departments: KeyDepartment[];
    onEdit: (department: KeyDepartment) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
}

export function KeyDepartmentList({ departments, onEdit, onDelete, onCreate }: KeyDepartmentListProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Department List ({departments.length})</h3>
                    <p className="text-sm text-gray-500">Manage department listings.</p>
                </div>
                <Button onClick={onCreate} className="whitespace-nowrap">
                    <Plus className="mr-2 h-4 w-4" /> Add New Department
                </Button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Experience</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="sticky right-0 z-10 bg-gray-50 px-6 py-3 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No departments found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                departments.map((dept, index) => (
                                    <tr key={dept.id} className="group hover:bg-gray-50 bg-white">
                                        <td className="px-6 py-4 font-medium text-gray-900">{dept.title}</td>
                                        <td className="px-6 py-4">{dept.experience}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                dept.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            )}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => onEdit(dept)}>
                                                    <Edit2 className="h-4 w-4 text-gray-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => onDelete(dept.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
