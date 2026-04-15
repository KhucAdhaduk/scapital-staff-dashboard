'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateSectionSettings } from '@/store/slices/platformStatsSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save } from 'lucide-react';

export function StatsSettingsForm() {
    const dispatch = useAppDispatch();
    const { sectionContent } = useAppSelector((state) => state.platformStats);

    const [formData, setFormData] = useState<any>(sectionContent || {});
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: any) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
        setIsDirty(true);
    };

    const handleSave = () => {
        dispatch(updateSectionSettings(formData));
        setIsDirty(false);
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Section Settings</h2>
                    <p className="text-sm text-gray-500">Configure global settings for the statistics section.</p>
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
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                                className="h-10 w-20 rounded border border-gray-300 p-1"
                            />
                            <Input
                                name="backgroundColor"
                                value={formData.backgroundColor}
                                onChange={handleChange}
                                placeholder="#ffffff"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Theme Mode</label>
                        <select
                            name="themeMode"
                            value={formData.themeMode}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Counter Animation</p>
                            <p className="text-xs text-gray-500">Animate numbers when scrolling into view.</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="enableAnimation"
                                className="peer sr-only"
                                checked={formData.enableAnimation}
                                onChange={handleChange}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Section Active</p>
                            <p className="text-xs text-gray-500">Show this section on the frontend.</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                className="peer sr-only"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-gray-300 after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
