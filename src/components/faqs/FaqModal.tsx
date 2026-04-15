'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { addFAQ, updateFAQ, FAQ } from '@/store/slices/faqsSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface FaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: FAQ | null;
}

export function FaqModal({ isOpen, onClose, initialData }: FaqModalProps) {
    const dispatch = useAppDispatch();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            question: '',
            answer: '',
            category: 'General',
            order: 0,
            isActive: true,
            defaultOpen: false
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                question: initialData.question,
                answer: initialData.answer,
                category: initialData.category || 'General',
                order: initialData.order || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                defaultOpen: initialData.defaultOpen !== undefined ? initialData.defaultOpen : false
            });
        } else {
            reset({
                question: '',
                answer: '',
                category: 'General',
                order: 0,
                isActive: true,
                defaultOpen: false
            });
        }
    }, [initialData, isOpen, reset]);

    const handleFormSubmit = (data: any) => {
        if (initialData) {
            dispatch(updateFAQ({ id: initialData.id, data }));
        } else {
            dispatch(addFAQ(data as Omit<FAQ, 'id'>));
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 text-gray-900">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit FAQ' : 'Add FAQ'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <Input
                        label="Question"
                        {...register('question', { required: 'Question is required' })}
                        error={errors.question?.message as string}
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Answer</label>
                        <textarea
                            {...register('answer', { required: 'Answer is required' })}
                            rows={4}
                            className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 ${errors.answer ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary'
                                }`}
                            placeholder="Enter the answer..."
                        />
                        {errors.answer && <p className="mt-1 text-sm text-red-500">{errors.answer.message as string}</p>}
                    </div>

                    <div className="mb-4">
                        <Input
                            label="Category"
                            {...register('category')}
                            placeholder="e.g. Loans"
                        />
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register('isActive')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register('defaultOpen')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Default Open</span>
                        </div>
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
