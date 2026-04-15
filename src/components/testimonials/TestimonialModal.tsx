'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { addTestimonial, updateTestimonial, Testimonial } from '@/store/slices/testimonialsSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Star, Upload } from 'lucide-react';
import NextImage from 'next/image';
import toast from 'react-hot-toast';

interface TestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Testimonial | null;
}

import { uploadService } from '@/services/uploadService';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function TestimonialModal({ isOpen, onClose, initialData }: TestimonialModalProps) {
    const dispatch = useAppDispatch();
    const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            designation: '',
            content: '',
            rating: 5,
            imageUrl: '',
            order: 0,
            isActive: true
        }
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const imageUrl = watch('imageUrl');
    const rating = watch('rating');
    const isActive = watch('isActive');

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                designation: initialData.designation || '',
                content: initialData.content,
                rating: initialData.rating || 5,
                imageUrl: initialData.imageUrl || '',
                order: initialData.order || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true
            });
        } else {
            reset({
                name: '',
                designation: '',
                content: '',
                rating: 5,
                imageUrl: '',
                order: 0,
                isActive: true
            });
        }
        setSelectedFile(null); // Reset file on open
        setUploadProgress(0);
    }, [initialData, isOpen, reset]);

    const handleRatingSelect = (newRating: number) => {
        setValue('rating', newRating);
    };

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        if (file) clearErrors('imageUrl');
    };

    const handleFormSubmit = async (data: any) => {
        if (!data.imageUrl && !selectedFile) {
            setError('imageUrl', { type: 'manual', message: 'Client Photo is required' });
            return;
        }

        try {
            let finalImageUrl = data.imageUrl;

            if (selectedFile) {
                setIsUploading(true);
                setUploadProgress(0);
                try {
                    finalImageUrl = await uploadService.uploadFile(selectedFile, (progress) => {
                        setUploadProgress(progress);
                    });
                } catch (uploadError) {
                    console.error('Upload failed:', uploadError);
                    toast.error('Failed to upload image');
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            const testimonialData = {
                ...data,
                imageUrl: finalImageUrl
            };

            if (initialData) {
                await dispatch(updateTestimonial({ id: initialData.id, data: testimonialData })).unwrap();
                toast.success('Testimonial updated successfully');
            } else {
                await dispatch(addTestimonial(testimonialData as Omit<Testimonial, 'id'>)).unwrap();
                toast.success('Testimonial created successfully');
            }
            onClose();
        } catch (error: any) {
            console.error('Failed to save testimonial:', error);
            const errorMessage = error?.message || 'Failed to save testimonial. Please check the form and try again.';
            toast.error(errorMessage);
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Image Upload */}
                    <div className="mb-4">
                        <ImageUpload
                            label="Client Photo *"
                            variant="avatar"
                            value={imageUrl}
                            onChange={(url) => {
                                setValue('imageUrl', url);
                                if (url) clearErrors('imageUrl');
                            }}
                            onFileSelect={handleFileSelect}
                            isUploading={isUploading}
                            uploadProgress={uploadProgress}
                            error={errors.imageUrl?.message as string}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Client Name"
                            {...register('name', { required: 'Client Name is required' })}
                            error={errors.name?.message as string}
                        />
                        <Input
                            label="Designation"
                            {...register('designation')}
                            placeholder="e.g. CEO"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Testimonial Content</label>
                        <textarea
                            {...register('content', { required: 'Content is required' })}
                            rows={4}
                            className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 ${errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary'
                                }`}
                            placeholder="What did the client say?"
                        />
                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message as string}</p>}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingSelect(star)}
                                    className={`p-1 hover:scale-110 transition-transform ${star <= (rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                >
                                    <Star className={`h-6 w-6 ${star <= (rating || 0) ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 my-4">
                        <input
                            type="checkbox"
                            {...register('isActive')}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Active Status</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
                        <Button type="submit" isLoading={isUploading} disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
