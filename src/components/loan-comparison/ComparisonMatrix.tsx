'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateComparisonValue, ComparisonValuesMap } from '@/store/slices/loanComparisonSlice';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

export function ComparisonMatrix() {
    const dispatch = useAppDispatch();
    const { products, parameters, comparisonValues } = useAppSelector((state) => state.loanComparison);

    const [localValues, setLocalValues] = useState<ComparisonValuesMap>({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize local values from redux state
    useEffect(() => {
        setLocalValues(JSON.parse(JSON.stringify(comparisonValues)));
    }, [comparisonValues]);

    const sortedProducts = [...products].filter(p => p.isActive).sort((a, b) => a.order - b.order);
    const sortedParams = [...parameters].filter(p => p.isActive).sort((a, b) => a.order - b.order);

    const handleValueChange = (parameterId: string, productId: string, value: string) => {
        setLocalValues(prev => {
            const newState = { ...prev };
            if (!newState[parameterId]) {
                newState[parameterId] = {};
            }
            newState[parameterId][productId] = value;
            return newState;
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = [];

            // Iterate through local values and find changes
            for (const paramId of Object.keys(localValues)) {
                for (const prodId of Object.keys(localValues[paramId])) {
                    const newValue = localValues[paramId][prodId];
                    const oldValue = comparisonValues[paramId]?.[prodId];

                    if (newValue !== oldValue) {
                        promises.push(
                            dispatch(updateComparisonValue({
                                parameterId: paramId,
                                productId: prodId,
                                value: newValue
                            })).unwrap()
                        );
                    }
                }
            }

            await Promise.all(promises);
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to save comparison values", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Comparison Matrix</h3>
                    <p className="text-sm text-gray-500">Enter the values for the comparison table. Save changes to apply.</p>
                </div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    disabled={!hasChanges || isSaving}
                    className="whitespace-nowrap"
                >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="relative overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 font-medium min-w-[200px] border-r">
                                Parameter / Product
                            </th>
                            {sortedProducts.map(product => (
                                <th key={product.id} className="px-6 py-3 font-medium min-w-[200px]">
                                    {product.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {sortedParams.map(param => (
                            <tr key={param.id} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900 border-r">
                                    {param.title}
                                </td>
                                {sortedProducts.map(product => {
                                    const value = localValues[param.id]?.[product.id] || '';
                                    return (
                                        <td key={`${param.id}-${product.id}`} className="p-2">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handleValueChange(param.id, product.id, e.target.value)}
                                                className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Enter val..."
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedProducts.length === 0 && (
                    <div className="p-12 text-center text-gray-500">No active products to display.</div>
                )}
                {sortedParams.length === 0 && (
                    <div className="p-12 text-center text-gray-500">No active parameters to display.</div>
                )}
            </div>
        </div>
    );
}
