'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyDepartment } from '@/services/keyDepartmentService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; // Assuming Input exists
import { X } from 'lucide-react';

interface KeyDepartmentFormProps {
    department?: KeyDepartment | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function KeyDepartmentForm({ department, onSubmit, onCancel, isLoading }: KeyDepartmentFormProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            experience: '',
            isActive: true
        }
    });

    useEffect(() => {
        if (department) {
            reset({
                title: department.title,
                experience: department.experience,
                isActive: department.isActive
            });
        }
    }, [department, reset]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div className="space-y-4">
                <Input
                    label="Department Title"
                    placeholder="e.g. Sales & Client Engagement"
                    error={errors.title?.message as string}
                    {...register('title', { required: 'Title is required' })}
                />

                <Input
                    label="Experience Required"
                    placeholder="e.g. 1-2 Year Experience"
                    error={errors.experience?.message as string}
                    {...register('experience', { required: 'Experience is required' })}
                />

                <div className="flex items-center">
                    <input
                        id="isActive"
                        type="checkbox"
                        {...register('isActive')}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Active
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (department ? 'Update' : 'Create')}
                </Button>
            </div>
        </form>
    );
}
