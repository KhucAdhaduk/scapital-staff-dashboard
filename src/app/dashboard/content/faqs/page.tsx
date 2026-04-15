'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchFAQs } from '@/store/slices/faqsSlice';
import { FaqList } from '@/components/faqs/FaqList';


export default function FaqsPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchFAQs());
    }, [dispatch]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">FAQS Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage Frequently Asked Questions.</p>
            </div>

            <div className="h-px bg-gray-200" />

            <FaqList />
        </div>
    );
}
