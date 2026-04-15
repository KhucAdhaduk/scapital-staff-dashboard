import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { EmployeeTestimonial } from '@/services/employeeTestimonialService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadService } from '@/services/uploadService';
import { toast } from 'react-hot-toast';

interface EmployeeTestimonialFormProps {
    testimonial?: EmployeeTestimonial | null;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function EmployeeTestimonialForm({ testimonial, onSubmit, onCancel, isLoading }: EmployeeTestimonialFormProps) {
    const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            position: '',
            content: '',
            imageUrl: '',
            isActive: true
        }
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const imageUrl = watch('imageUrl');

    useEffect(() => {
        if (testimonial) {
            reset({
                name: testimonial.name,
                position: testimonial.position,
                content: testimonial.content,
                imageUrl: testimonial.imageUrl,
                isActive: testimonial.isActive
            });
        }
        setSelectedFile(null);
        setUploadProgress(0);
    }, [testimonial, reset]);

    const handleFormSubmit = async (data: any) => {
        // Validate Photo
        if (!data.imageUrl && !selectedFile) {
            setError('imageUrl', { type: 'manual', message: 'Employee Photo is required' });
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

            await onSubmit({ ...data, imageUrl: finalImageUrl });
        } catch (error) {
            console.error('Submit failed:', error);
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="mb-4">
                <ImageUpload
                    label="Employee Photo *"
                    variant="avatar"
                    value={imageUrl}
                    onChange={(url) => {
                        setValue('imageUrl', url);
                        if (url) clearErrors('imageUrl');
                    }}
                    onFileSelect={(file) => {
                        setSelectedFile(file);
                        if (file) clearErrors('imageUrl');
                    }}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={errors.imageUrl?.message as string}
                />
            </div>

            <Input
                label="Name"
                placeholder="Employee Name"
                error={errors.name?.message as string}
                {...register('name', { required: 'Name is required' })}
            />

            <Input
                label="Position"
                placeholder="Job Position"
                error={errors.position?.message as string}
                {...register('position', { required: 'Position is required' })}
            />

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={4}
                    className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 ${errors.content ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary'
                        }`}
                    placeholder="Testimonial content..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message as string}</p>}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isUploading || isLoading}>Cancel</Button>
                <Button type="submit" disabled={isUploading || isLoading}>
                    {isUploading ? 'Uploading...' : (isLoading ? 'Saving...' : (testimonial ? 'Update' : 'Create'))}
                </Button>
            </div>
        </form>
    );
}
