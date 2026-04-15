'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAppContent } from '@/store/slices/loanComparisonSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';
import { SectionContent } from '@/services/sectionContentService';

export function ComparisonContentForm() {
    const dispatch = useAppDispatch();
    const { sectionContent } = useAppSelector((state) => state.loanComparison);

    const [formData, setFormData] = useState<SectionContent>({
        heading: '',
        highlightedText: '',
        description: '',
        isActive: true,
        extraConfig: {}
    });
    const [isDirty, setIsDirty] = useState(false);

    React.useEffect(() => {
        if (sectionContent) {
            setFormData(sectionContent);
        }
    }, [sectionContent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
        setIsDirty(true);
    };

    const handleSave = () => {
        dispatch(updateAppContent(formData));
        setIsDirty(false);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Section Content</h2>
                    <p className="text-sm text-gray-500">Manage the main heading and description of the comparison section.</p>
                </div>
                {isDirty && (
                    <Button onClick={handleSave} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <Input
                        label="Main Heading"
                        name="heading"
                        value={formData.heading}
                        onChange={handleChange}
                        placeholder="e.g. Analyze & Compare"
                    />
                    <Input
                        label="Highlighted Heading Text"
                        name="highlightedText"
                        value={formData.highlightedText}
                        onChange={handleChange}
                        placeholder="e.g. Choose Smart"
                    />
                    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Section Active</p>
                            <p className="text-xs text-gray-500">Show this section on the frontend.</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={formData.isActive}
                                onChange={handleToggle}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Sub Description
                        </label>
                        <textarea
                            name="description"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
