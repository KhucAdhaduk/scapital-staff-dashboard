'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteBlog } from '@/store/slices/blogsSlice';
import { Blog } from '@/services/blogService';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { BlogModal } from './BlogModal';
import { Pencil, Trash2, Plus, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';

export function BlogList() {
    const dispatch = useAppDispatch();
    const { blogs } = useAppSelector((state) => state.blogs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Blog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: Blog) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteBlog(deleteId));
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Blog Posts ({blogs.length})</h3>
                    <p className="text-sm text-gray-500">Manage blog articles and news.</p>
                </div>
                <Button onClick={handleAdd} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Blog
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 overflow-hidden flex flex-col"
                    >
                        <div className="h-40 bg-gray-100 relative">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                {item.isPopular && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Popular</span>}
                                {item.isActive ?
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span> :
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Draft</span>
                                }
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" title={item.title}>{item.title}</h4>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">{item.content}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{item.author || 'Admin'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
                            <Button onClick={() => handleEdit(item)} size="sm" variant="ghost">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDelete(item.id)} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {blogs.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No blog posts found. Click &quot;Add Blog&quot; to create one.
                </div>
            )}

            <BlogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Blog"
                message="Are you sure you want to delete this blog post? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
