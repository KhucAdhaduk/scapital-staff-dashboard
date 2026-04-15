'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';
import { BankingPartner } from '@/store/slices/bankingPartnersSlice';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadService } from '@/services/uploadService';

interface PartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (partner: Omit<BankingPartner, 'id'> | BankingPartner) => void;
    initialData?: BankingPartner | null;
}

export function PartnerModal({ isOpen, onClose, onSave, initialData }: PartnerModalProps) {
    const { register, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            logoUrl: '',
            redirectUrl: '',
            order: 0,
            isActive: true,
            isFeatured: false,
        }
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const logoUrl = watch('logoUrl');
    const isActive = watch('isActive');
    const isFeatured = watch('isFeatured');

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                logoUrl: initialData.logoUrl,
                redirectUrl: initialData.redirectUrl,
                order: initialData.order || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                isFeatured: initialData.isFeatured || false,
            });
        } else {
            reset({
                name: '',
                logoUrl: '',
                redirectUrl: '',
                order: 0,
                isActive: true,
                isFeatured: false,
            });
        }
        setSelectedFile(null);
        setUploadProgress(0);
    }, [initialData, isOpen, reset]);

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        if (file) clearErrors('logoUrl');
    };

    const handleFormSubmit = async (data: any) => {
        // Validation check for logo
        if (!data.logoUrl && !selectedFile) {
            setError('logoUrl', { type: 'manual', message: 'Banner Image is required' });
            return;
        }

        try {
            let finalLogoUrl = data.logoUrl;

            // Upload on Save
            if (selectedFile) {
                setIsUploading(true);
                setUploadProgress(0);

                try {
                    finalLogoUrl = await uploadService.uploadFile(selectedFile, (progress) => {
                        setUploadProgress(progress);
                    });
                } catch (uploadError) {
                    console.error("Upload failed", uploadError);
                    setIsUploading(false);
                    setError('logoUrl', { type: 'manual', message: 'Failed to upload logo' });
                    return;
                }

                setIsUploading(false);
            }

            if (!finalLogoUrl) {
                setError('logoUrl', { type: 'manual', message: 'Image upload failed or empty' });
                return;
            }

            onSave({
                ...(initialData?.id ? { id: initialData.id } : {}),
                ...data,
                logoUrl: finalLogoUrl,
            } as BankingPartner);

            // Only close on success
            onClose();

        } catch (err) {
            console.error("Failed to save partner", err);
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => !isUploading && onClose()}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Banking Partner' : 'Add Banking Partner'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        disabled={isUploading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Logo Upload */}
                    <div>
                        <ImageUpload
                            label="Banner Image *"
                            value={logoUrl}
                            onChange={(val) => {
                                setValue('logoUrl', val);
                                if (val) clearErrors('logoUrl');
                            }}
                            onFileSelect={handleFileSelect}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                            error={errors.logoUrl?.message as string}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Bank Name"
                            {...register('name', { required: 'Bank Name is required' })}
                            error={errors.name?.message as string}
                            placeholder="e.g. SBI"
                        />
                    </div>

                    <Input
                        label="Redirect URL"
                        {...register('redirectUrl', { required: 'Redirect URL is required' })}
                        error={errors.redirectUrl?.message as string}
                        placeholder="https://..."
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                            <select
                                {...register('isActive')}
                                className="block w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                onChange={(e) => setValue('isActive', e.target.value === 'true')}
                                value={isActive ? 'true' : 'false'}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('isFeatured')}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isUploading} disabled={isUploading}>
                            {isUploading ? 'Uploading...' : (initialData ? 'Save Changes' : 'Add Partner')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
