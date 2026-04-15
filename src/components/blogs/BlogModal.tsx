'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { addBlog, updateBlog } from '@/store/slices/blogsSlice';
import { Blog, CreateBlogDto } from '@/services/blogService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { X } from 'lucide-react';
import axios from '@/utils/axios';
import toast from 'react-hot-toast';

interface BlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: Blog | null;
}

export function BlogModal({ isOpen, onClose, initialData }: BlogModalProps) {
    const dispatch = useAppDispatch();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CreateBlogDto>({
        defaultValues: {
            title: '',
            slug: '',
            category: 'General',
            content: '',
            imageUrl: '',
            author: '',
            isPopular: false,
            isActive: true,
        }
    });

    const title = watch('title');
    const imageUrl = watch('imageUrl');

    // Auto-generate slug from title if not editing
    useEffect(() => {
        if (!initialData && title) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setValue('slug', slug);
        }
    }, [title, initialData, setValue]);

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title,
                slug: initialData.slug,
                category: initialData.category || 'General',
                content: initialData.content,
                imageUrl: initialData.imageUrl || '',
                author: initialData.author || '',
                isPopular: initialData.isPopular,
                isActive: initialData.isActive,
            });
            setSelectedFile(null);
        } else {
            reset({
                title: '',
                slug: '',
                category: 'General',
                content: '',
                imageUrl: '',
                author: '',
                isPopular: false,
                isActive: true,
            });
            setSelectedFile(null);
        }
    }, [initialData, isOpen, reset]);

    const uploadImage = async (file: File): Promise<string | null> => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post<{ urls: string[] }>('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // Add authorization if needed. Usually handled by interceptors if configured.
                    // Assuming public upload or existing axios instance configuration for now. 
                    // If raw axios is used here, might need token. 
                    // Let's assume standard axios import if configured, otherwise we might fail auth.
                    // But wait, the previous code imported axios directly. Let's check `services/blogService` imports.
                    // `blogService` uses `axios` from `axios` or custom instance? 
                    // It used `import axios from 'axios'` but set base URL maybe? 
                    // Let's use absolute URL for now to be safe or check if there is a global config.
                }
            });

            // Check if response has urls array
            if (response.data && response.data.urls && response.data.urls.length > 0) {
                return response.data.urls[0];
            }
            return null;

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleFormSubmit = async (data: CreateBlogDto) => {
        let finalImageUrl = data.imageUrl;

        if (selectedFile) {
            const uploadedUrl = await uploadImage(selectedFile);
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            } else {
                return; // Stop partial submission if upload fails
            }
        }

        const formData = { ...data, imageUrl: finalImageUrl };

        if (initialData) {
            dispatch(updateBlog({ id: initialData.id, data: formData }));
            toast.success('Blog updated successfully');
        } else {
            dispatch(addBlog(formData));
            toast.success('Blog created successfully');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200 text-gray-900 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Blog' : 'Add Blog'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            {...register('title', { required: 'Title is required' })}
                            error={errors.title?.message as string}
                        />
                        <Input
                            label="Slug"
                            {...register('slug', { required: 'Slug is required' })}
                            error={errors.slug?.message as string}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            {...register('category')}
                            placeholder="e.g. Finance"
                        />
                        <Input
                            label="Author"
                            {...register('author')}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <ImageUpload
                        label="Blog Image"
                        value={imageUrl}
                        onChange={(val) => setValue('imageUrl', val)}
                        onFileSelect={(file) => setSelectedFile(file)}
                        isUploading={isUploading}
                    />


                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            {...register('content', { required: 'Content is required' })}
                            rows={8}
                            className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 ${errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary'
                                }`}
                            placeholder="Write your blog content here..."
                        />
                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message as string}</p>}
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
                                {...register('isPopular')}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Popular</span>
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
