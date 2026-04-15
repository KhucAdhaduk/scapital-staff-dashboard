'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';
import { StatItem } from '@/store/slices/platformStatsSlice';
import { IconSelector } from '@/components/ui/IconSelector';

interface StatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (stat: Omit<StatItem, 'id'> | StatItem) => void;
    initialData?: StatItem | null;
}

export function StatModal({ isOpen, onClose, onSave, initialData }: StatModalProps) {
    const [formData, setFormData] = useState<Partial<StatItem>>({
        icon: 'User',
        value: '0',
        suffix: '+',
        isAnimated: true,
        label: '',
        order: 0,
        status: 'active',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset for Add mode
            setFormData({
                icon: 'User',
                value: '0',
                suffix: '+',
                isAnimated: true,
                label: '',
                order: 0,
                status: 'active',
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            // Keep as string if name is 'value', else number
            if (name === 'value') {
                setFormData(prev => ({ ...prev, [name]: value }));
            } else {
                setFormData(prev => ({ ...prev, [name]: Number(value) }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as StatItem);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Statistic' : 'Add Statistic'}
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Icon Picker */}
                    <div>
                        <IconSelector
                            label="Statistic Icon"
                            value={formData.icon}
                            onChange={(val) => setFormData(prev => ({ ...prev, icon: val }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Numeric Value"
                            name="value"
                            type="number"
                            value={formData.value}
                            onChange={handleChange}
                            required
                        />
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Suffix</label>
                            <select
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleChange}
                                className="block w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">None</option>
                                <option value="+">+</option>
                                <option value="%">%</option>
                                <option value="K+">K+</option>
                                <option value="M+">M+</option>
                                <option value="B+">B+</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Label / Title"
                        name="label"
                        value={formData.label}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Happy Customers"
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isAnimated"
                                checked={formData.isAnimated}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Animate Value Display</span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {initialData ? 'Save Changes' : 'Add Metric'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
