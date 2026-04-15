'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axios';
import { toast } from 'react-hot-toast';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface Slide {
    id: string;
    imageUrl: string;
    redirectUrl: string;
}

export default function PromoSlideshowPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/section-content/promo_slideshow');
            if (response.data && response.data.extraConfig && Array.isArray(response.data.extraConfig.slides)) {
                setSlides(response.data.extraConfig.slides);
            } else {
                setSlides([]);
            }
        } catch (error) {
            console.error('Error fetching promo slideshow:', error);
            // Default empty array if not found
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axiosInstance.post('/section-content/promo_slideshow', {
                heading: 'Promo Slideshow',
                description: 'Promo Slideshow Images',
                isActive: true,
                sectionKey: 'promo_slideshow',
                extraConfig: {
                    slides: slides
                }
            });
            toast.success('Promo Slideshow updated successfully');
        } catch (error) {
            console.error('Error saving promo slideshow:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const addSlide = () => {
        setSlides([
            ...slides,
            { id: Date.now().toString(), imageUrl: '', redirectUrl: '' }
        ]);
    };

    const removeSlide = (id: string) => {
        setSlides(slides.filter(slide => slide.id !== id));
    };

    const updateSlide = (id: string, field: keyof Slide, value: string) => {
        setSlides(slides.map(slide => slide.id === id ? { ...slide, [field]: value } : slide));
    };

    const handleImageUpload = async (file: File | null, slideId: string) => {
        if (!file) {
            updateSlide(slideId, 'imageUrl', '');
            return;
        }

        try {
            // Import uploadService at top of file, or do it dynamically if preferred.
            // Better to use axiosInstance directly to avoid rewriting too much,
            // we just need to fix response.data.urls[0] over response.data.url.
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'promos');

            const response = await axiosInstance.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.urls && response.data.urls.length > 0) {
                updateSlide(slideId, 'imageUrl', response.data.urls[0]);
                toast.success('Image uploaded successfully');
            } else if (response.data && response.data.url) {
                // Fallback just in case
                updateSlide(slideId, 'imageUrl', response.data.url);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promo Slideshow</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage the promotional banners shown on the home page.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={addSlide}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Slide
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="space-y-6">
                {slides.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No slides added yet. Click &quot;Add Slide&quot; to create one.</p>
                    </div>
                ) : (
                    slides.map((slide, index) => (
                        <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-6 items-start">
                            <div className="pt-2 text-gray-400">
                                <GripVertical className="w-5 h-5 cursor-grab" />
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <ImageUpload
                                        label={`Slide ${index + 1} Image`}
                                        value={slide.imageUrl}
                                        onChange={(val) => updateSlide(slide.id, 'imageUrl', val)}
                                        onFileSelect={(file) => handleImageUpload(file, slide.id)}
                                        variant="banner"
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Redirect Link Target (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={slide.redirectUrl}
                                            onChange={(e) => updateSlide(slide.id, 'redirectUrl', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                                            placeholder="e.g. /credit-cards or https://..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Where should the user go when they click this image?
                                        </p>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={() => removeSlide(slide.id)}
                                            className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remove Slide
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
