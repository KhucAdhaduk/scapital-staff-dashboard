'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addBanner, updateBanner, deleteBanner, fetchLoanBanners, setBanners } from '@/store/slices/loanBannerSlice';
import { LoanBanner, loanBannerService } from '@/services/loanBannerService';
import { LoanBannerList } from '@/components/loan-banner/LoanBannerList';
import { LoanBannerForm } from '@/components/loan-banner/LoanBannerForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';

import { useRouter } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';

export default function LoanShowcasePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { banners } = useAppSelector((state) => state.loanBanner);

    // Local state for view
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingBanner, setEditingBanner] = useState<LoanBanner | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchLoanBanners());
    }, [dispatch]);

    const handleCreate = () => {
        setEditingBanner(null);
        setView('form');
    };

    const handleEdit = (banner: LoanBanner) => {
        setEditingBanner(banner);
        setView('form');
    };

    const handleDelete = (id: string) => {
        setBannerToDelete(id);
        setDeleteError(null);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteError) {
            // Redirect to Loan Comparison page
            router.push('/dashboard/content/loan-comparison');
            return;
        }

        if (bannerToDelete) {
            // Clear previous error if retrying
            setDeleteError(null);

            const resultAction = await dispatch(deleteBanner(bannerToDelete));

            if (deleteBanner.fulfilled.match(resultAction)) {
                toast.success('Loan Tab deleted successfully');
                setDeleteModalOpen(false);
                setBannerToDelete(null);
                setDeleteError(null);
            } else {
                // Correctly extract the error message.
                // rejectWithValue sends a string in payload if we did error.response?.data?.message
                const payload = resultAction.payload;
                const errorMsg = typeof payload === 'string' ? payload : (payload as any)?.message || 'Failed to delete Loan Tab';

                setDeleteError(errorMsg);
                // Do NOT close modal, show error in it.
            }
        }
    };

    const handleSave = async (bannerData: Omit<LoanBanner, 'id'> | LoanBanner) => {
        const toastId = toast.loading(editingBanner ? 'Updating Loan Tab...' : 'Creating Loan Tab...');
        try {
            let resultAction;
            if (editingBanner) {
                resultAction = await dispatch(updateBanner({
                    id: editingBanner.id,
                    data: bannerData
                }));
            } else {
                resultAction = await dispatch(addBanner(bannerData as Omit<LoanBanner, 'id'>));
            }

            if (addBanner.fulfilled.match(resultAction) || updateBanner.fulfilled.match(resultAction)) {
                toast.success(editingBanner ? 'Tab updated successfully' : 'Tab created successfully', { id: toastId });
                setView('list');
            } else {
                const errorMsg = (resultAction.payload as string) || 'Failed to save Loan Tab';
                toast.error(errorMsg, { id: toastId });
                // If it failed, we stay on the form so the user can see/fix any issues
            }
        } catch (err) {
            console.error('Error in handleSave:', err);
            toast.error('An unexpected error occurred', { id: toastId });
        }
    };

    const handleReorder = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;

        const newItems = Array.from(banners);
        const [reorderedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(destinationIndex, 0, reorderedItem);

        // Optimistic update
        dispatch(setBanners(newItems));

        try {
            const ids = newItems.map(item => item.id);
            await loanBannerService.reorder(ids);
            toast.success('Order updated');
        } catch (err) {
            console.error(err);
            toast.error("Failed to reorder");
            dispatch(fetchLoanBanners()); // Revert
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                {view === 'form' && (
                    <BackButton onClick={() => setView('list')} />
                )}
                <h1 className="text-2xl font-bold text-gray-900">Loan Showcase Management</h1>
                <p className="text-sm text-gray-500">Manage the hero section loan tabs.</p>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Content */}
            <div className="mt-6">
                {view === 'list' ? (
                    <LoanBannerList
                        banners={banners}
                        onCreate={handleCreate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                    />
                ) : (
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{editingBanner ? 'Edit Loan Tab' : 'Create New Loan Tab'}</h2>
                        </div>
                        <LoanBannerForm
                            initialData={editingBanner}
                            onSave={handleSave}
                            onCancel={() => setView('list')}
                        />
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteError ? "Action Failed" : "Delete Loan Tab"}
                message={deleteError || "Are you sure you want to delete this loan tab? This action cannot be undone."}
                confirmLabel={deleteError ? "Go to Loan Comparison" : "Delete"}
                variant="danger"
            />
        </div>
    );
}
