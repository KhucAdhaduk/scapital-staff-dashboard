'use client';

import React, { useEffect, useState } from 'react';
import { KeyDepartment, keyDepartmentService } from '@/services/keyDepartmentService';
import { KeyDepartmentList } from '@/components/key-departments/KeyDepartmentList';
import { KeyDepartmentForm } from '@/components/key-departments/KeyDepartmentForm';
import { Modal } from '@/components/ui/Modal'; // Assuming Modal exists
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'react-hot-toast'; // Assuming toast exists

export default function KeyDepartmentsPage() {
    const [departments, setDepartments] = useState<KeyDepartment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<KeyDepartment | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const data = await keyDepartmentService.getAll();
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            toast.error('Failed to load departments');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleCreate = () => {
        setEditingDepartment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (department: KeyDepartment) => {
        setEditingDepartment(department);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDepartmentToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!departmentToDelete) return;
        try {
            await keyDepartmentService.delete(departmentToDelete);
            toast.success('Department deleted successfully');
            fetchDepartments();
        } catch (error) {
            console.error('Failed to delete department:', error);
            toast.error('Failed to delete department');
        } finally {
            setDeleteModalOpen(false);
            setDepartmentToDelete(null);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setIsSaving(true);
            if (editingDepartment) {
                await keyDepartmentService.update(editingDepartment.id, data);
                toast.success('Department updated successfully');
            } else {
                await keyDepartmentService.create(data);
                toast.success('Department created successfully');
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (error) {
            console.error('Failed to save department:', error);
            toast.error('Failed to save department');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Key Departments</h1>
                <p className="mt-1 text-sm text-gray-500">Manage key departments and their details.</p>
            </div>

            <div className="h-px bg-gray-200" />
            <KeyDepartmentList
                departments={departments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreate={handleCreate}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDepartment ? 'Edit Department' : 'Add New Department'}
            >
                <KeyDepartmentForm
                    department={editingDepartment}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSaving}
                />
            </Modal>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Department"
                message="Are you sure you want to delete this department? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
