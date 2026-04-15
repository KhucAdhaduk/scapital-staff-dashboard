'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addStat,
    updateStat,
    deleteStat,
    fetchPlatformStats,
    fetchStatsSectionContent,
    setStats
} from '@/store/slices/platformStatsSlice';
import { PlatformStat as StatItem, platformStatsService } from '@/services/platformStatsService';
import { StatsTable } from '@/components/platform-stats/StatsTable';
import { StatModal } from '@/components/platform-stats/StatModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DropResult } from '@hello-pangea/dnd';
import { toast } from 'react-hot-toast';


export default function PlatformStatsPage() {
    const dispatch = useAppDispatch();
    const { stats } = useAppSelector((state) => state.platformStats);

    useEffect(() => {
        dispatch(fetchPlatformStats());
        dispatch(fetchStatsSectionContent());
    }, [dispatch]);

    const [isStatModalOpen, setIsStatModalOpen] = useState(false);
    const [editingStat, setEditingStat] = useState<StatItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAddClick = () => {
        setEditingStat(null);
        setIsStatModalOpen(true);
    };

    const handleEditClick = (stat: StatItem) => {
        setEditingStat(stat);
        setIsStatModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = () => {
        if (deleteId) {
            dispatch(deleteStat(deleteId));
            setDeleteId(null);
        }
    };

    const handleToggleStatus = (id: string) => {
        const stat = stats.find(s => s.id === id);
        if (stat) {
            dispatch(updateStat({
                id,
                data: { isActive: !stat.isActive }
            }));
        }
    };

    const handleSaveStat = (statData: Omit<StatItem, 'id'> | StatItem) => {
        if ('id' in statData) {
            dispatch(updateStat({
                id: statData.id,
                data: statData as StatItem
            }));
        } else {
            dispatch(addStat(statData));
        }
    };

    const sortedStats = [...stats].sort((a, b) => a.order - b.order);

    const handleReorder = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;

        const newItems = Array.from(sortedStats);
        const [reorderedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(destinationIndex, 0, reorderedItem);

        const updatedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        // Update local state immediately (optimistic UI)
        dispatch(setStats(updatedItems));

        try {
            // Update backend
            const ids = newItems.map(item => item.id);
            await platformStatsService.reorder(ids);
            toast.success('Order updated');
        } catch (error) {
            console.error('Failed to reorder:', error);
            toast.error('Failed to update order');
            dispatch(fetchPlatformStats()); // Revert on error
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage key metrics and counters displayed on the interface.</p>
                </div>
            </div>

            <div className="h-px bg-gray-200" />

            {/* Section 2: Stats List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Metrics List ({stats.length})</h3>
                        <p className="text-sm text-gray-500">Manage statistics metrics.</p>
                    </div>
                    <Button onClick={handleAddClick} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Metric
                    </Button>
                </div>

                <StatsTable
                    stats={sortedStats}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleStatus={handleToggleStatus}
                    onReorder={handleReorder}
                />
            </div>

            {/* Modals */}
            <StatModal
                isOpen={isStatModalOpen}
                onClose={() => setIsStatModalOpen(false)}
                onSave={handleSaveStat}
                initialData={editingStat}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Statistic"
                message="Are you sure you want to remove this metric? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}
