'use client';

import React, { useEffect, useState } from 'react';
import { EmployeeTestimonial, employeeTestimonialService } from '@/services/employeeTestimonialService';
import { EmployeeTestimonialList } from '@/components/employee-testimonials/EmployeeTestimonialList';
import { EmployeeTestimonialForm } from '@/components/employee-testimonials/EmployeeTestimonialForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'react-hot-toast';

export default function EmployeeTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<EmployeeTestimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<EmployeeTestimonial | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);

    const fetchTestimonials = async () => {
        try {
            setIsLoading(true);
            const data = await employeeTestimonialService.getAll();
            setTestimonials(data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            toast.error('Failed to load testimonials');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleCreate = () => {
        setEditingTestimonial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (testimonial: EmployeeTestimonial) => {
        setEditingTestimonial(testimonial);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setTestimonialToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!testimonialToDelete) return;
        try {
            await employeeTestimonialService.delete(testimonialToDelete);
            toast.success('Testimonial deleted successfully');
            fetchTestimonials();
        } catch (error) {
            console.error('Failed to delete testimonial:', error);
            toast.error('Failed to delete testimonial');
        } finally {
            setDeleteModalOpen(false);
            setTestimonialToDelete(null);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setIsSaving(true);
            if (editingTestimonial) {
                await employeeTestimonialService.update(editingTestimonial.id, data);
                toast.success('Testimonial updated successfully');
            } else {
                await employeeTestimonialService.create(data);
                toast.success('Testimonial created successfully');
            }
            setIsModalOpen(false);
            fetchTestimonials();
        } catch (error) {
            console.error('Failed to save testimonial:', error);
            toast.error('Failed to save testimonial');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Testimonials</h1>
                <p className="mt-1 text-sm text-gray-500">Manage employee reviews and profiles.</p>
            </div>

            <div className="h-px bg-gray-200" />

            <EmployeeTestimonialList
                testimonials={testimonials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCreate={handleCreate}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            >
                <EmployeeTestimonialForm
                    testimonial={editingTestimonial}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSaving}
                />
            </Modal>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Testimonial"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
