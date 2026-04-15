"use client";
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchTestimonials } from '@/store/slices/testimonialsSlice';

import { TestimonialsList } from '@/components/testimonials/TestimonialsList';


export default function ClientTestimonialsPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchTestimonials());

    }, [dispatch]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Testimonials</h1>
                <p className="mt-1 text-sm text-gray-500">Manage customer reviews and slider configuration.</p>
            </div>



            <div className="h-px bg-gray-200" />

            <TestimonialsList />
        </div>
    );
}
