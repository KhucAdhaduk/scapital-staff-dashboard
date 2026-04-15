'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchBlogs } from '@/store/slices/blogsSlice';
import { BlogList } from '@/components/blogs/BlogList';

export default function BlogsPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                <p className="mt-1 text-sm text-gray-500">Create, edit, and manage blog posts.</p>
            </div>

            <div className="h-px bg-gray-200" />

            <BlogList />
        </div>
    );
}
