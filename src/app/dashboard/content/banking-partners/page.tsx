'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addPartner,
    updatePartner,
    deletePartner,
    fetchBankingPartners,
    setPartners
} from '@/store/slices/bankingPartnersSlice';
import { BankingPartner, bankingPartnerService } from '@/services/bankingPartnerService';
import { PartnersTable } from '@/components/banking-partners/PartnersTable';
import { PartnerModal } from '@/components/banking-partners/PartnerModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';


export default function BankingPartnersPage() {
    const dispatch = useAppDispatch();
    const { partners } = useAppSelector((state) => state.bankingPartners);

    useEffect(() => {
        dispatch(fetchBankingPartners());
    }, [dispatch]);

    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<BankingPartner | null>(null);

    // Delete Confirmation
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAddClick = () => {
        setEditingPartner(null);
        setIsPartnerModalOpen(true);
    };

    const handleEditClick = (partner: BankingPartner) => {
        setEditingPartner(partner);
        setIsPartnerModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            dispatch(deletePartner(deleteId));
            setDeleteId(null);
        }
    };

    const handleToggleStatus = (id: string) => {
        const partner = partners.find(p => p.id === id);
        if (partner) {
            dispatch(updatePartner({
                id,
                data: { isActive: !partner.isActive }
            }));
        }
    };

    const handleSavePartner = (partnerData: Omit<BankingPartner, 'id'> | BankingPartner) => {
        if ('id' in partnerData) {
            // Edit mode
            dispatch(updatePartner({
                id: partnerData.id,
                data: partnerData as BankingPartner
            }));
        } else {
            // Add mode
            dispatch(addPartner(partnerData));
        }
    };

    // Sort partners by order
    const sortedPartners = [...partners].sort((a, b) => a.order - b.order);

    const handleReorder = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;

        const newItems = Array.from(sortedPartners);
        const [reorderedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(destinationIndex, 0, reorderedItem);

        const updatedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        // Update local state immediately (optimistic UI)
        dispatch(setPartners(updatedItems));

        try {
            // Update backend
            const ids = newItems.map(item => item.id);
            await bankingPartnerService.reorder(ids);
            toast.success('Order updated');
        } catch (error) {
            console.error('Failed to reorder:', error);
            toast.error('Failed to update order');
            dispatch(fetchBankingPartners()); // Revert on error
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banking Partners</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your &quot;Our 100+ Banking Partners&quot; section.</p>
                </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Partners List */}
            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Partners List ({partners.length})</h3>
                        <p className="text-sm text-gray-500">Manage your banking partners.</p>
                    </div>
                    <Button onClick={handleAddClick} className="gap-2 whitespace-nowrap">
                        <Plus className="h-4 w-4" />
                        Add New Partner
                    </Button>
                </div>

                <PartnersTable
                    partners={sortedPartners}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    onReorder={handleReorder}
                />
            </div>

            {/* Modals */}
            <PartnerModal
                isOpen={isPartnerModalOpen}
                onClose={() => setIsPartnerModalOpen(false)}
                onSave={handleSavePartner}
                initialData={editingPartner}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Partner"
                message="Are you sure you want to remove this banking partner? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
