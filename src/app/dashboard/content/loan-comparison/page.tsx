'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchComparisonData } from '@/store/slices/loanComparisonSlice';
import { ProductList } from '@/components/loan-comparison/ProductList';
import { ParameterList } from '@/components/loan-comparison/ParameterList';
import { ComparisonMatrix } from '@/components/loan-comparison/ComparisonMatrix';
import { clsx } from 'clsx';


export default function LoanComparisonPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchComparisonData());
    }, [dispatch]);

    const [activeTab, setActiveTab] = useState<'products' | 'parameters' | 'matrix'>('products');

    const tabs = [
        { id: 'products', label: 'Products (Columns)' },
        { id: 'parameters', label: 'Parameters (Rows)' },
        { id: 'matrix', label: 'Comparison Matrix' },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Loan Comparison</h1>
                <p className="mt-1 text-sm text-gray-500">Manage the Analyze & Compare section.</p>
            </div>


            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'products' && <ProductList />}
                {activeTab === 'parameters' && <ParameterList />}
                {activeTab === 'matrix' && <ComparisonMatrix />}
            </div>
        </div>
    );
}
