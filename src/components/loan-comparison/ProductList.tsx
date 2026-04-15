'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProduct, updateProduct, deleteProduct, reorderProducts, setProducts } from '@/store/slices/loanComparisonSlice';
import { fetchLoanBanners } from '@/store/slices/loanBannerSlice';
import { LoanProduct } from '@/services/loanComparisonService';
import { IconSelector } from '@/components/ui/IconSelector';
import { iconMap } from '@/lib/iconLibrary';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Pencil, Trash2, Plus, X, GripVertical } from 'lucide-react';

export function ProductList() {
    const dispatch = useAppDispatch();
    const { products } = useAppSelector((state) => state.loanComparison);
    const { banners: loanBanners } = useAppSelector((state) => state.loanBanner);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    React.useEffect(() => {
        dispatch(fetchLoanBanners());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: LoanProduct) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            dispatch(deleteProduct(deleteId));
            setDeleteId(null);
        }
    };

    const onReorder = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(products);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        dispatch(setProducts(reorderedItems));

        // Backend update
        const reorderPayload = reorderedItems.map(item => item.id);
        dispatch(reorderProducts(reorderPayload));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Loan Products</h3>
                    <p className="text-sm text-gray-500">Define the columns for the comparison table.</p>
                </div>
                <Button onClick={handleAdd} className="gap-2 whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <DragDropContext onDragEnd={onReorder}>
                    <table className="w-full text-left text-sm text-gray-500 table-fixed whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                            <tr>
                                <th className="w-10 px-4 py-3"></th>
                                <th className="w-[10%] px-6 py-3 font-bold">Order</th>
                                <th className="w-[10%] px-6 py-3 font-bold">Icon</th>
                                <th className="w-[40%] px-6 py-3 font-bold">Product Name</th>
                                <th className="w-[15%] px-6 py-3 font-bold">Status</th>
                                <th className="w-[15%] sticky right-0 z-10 bg-gray-50 px-6 py-3 font-bold text-right shadow-[-5px_0_15px_rgba(0,0,0,0.1)]">Actions</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="products-list">
                            {(provided) => (
                                <tbody
                                    className="divide-y divide-gray-200 bg-white"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {products.map((product, index) => {
                                        const Icon = iconMap[product.icon];
                                        return (
                                            <Draggable key={product.id} draggableId={product.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <tr
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`group hover:bg-gray-50 ${snapshot.isDragging ? 'bg-gray-50 shadow-lg relative z-20' : 'bg-white'}`}
                                                    >
                                                        <td className="w-10 px-4 py-4 text-center">
                                                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        </td>
                                                        <td className="w-[10%] px-6 py-4 font-mono text-gray-900">{index + 1}</td>
                                                        <td className="w-[10%] px-6 py-4">
                                                            <div className="h-8 w-8 flex items-center justify-center rounded bg-primary/10 text-primary">
                                                                {Icon && <Icon className="h-4 w-4" />}
                                                            </div>
                                                        </td>
                                                        <td className="w-[40%] px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                                        <td className="w-[15%] px-6 py-4">
                                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {product.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="w-[15%] sticky right-0 z-10 bg-white group-hover:bg-gray-50 px-6 py-4 text-right shadow-[-4px_0_12px_-2px_rgba(0,0,0,0.1)]">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button onClick={() => handleEdit(product)} size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button onClick={() => handleDelete(product.id)} size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingProduct}
                loanBanners={loanBanners}
                existingProducts={products}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Product"
                message="Are you sure? This will remove the entire column from the comparison matrix."
                confirmLabel="Delete"
                variant="danger"
            />
        </div>
    );
}

function ProductModal({ isOpen, onClose, initialData, loanBanners, existingProducts }: { isOpen: boolean; onClose: () => void; initialData: LoanProduct | null, loanBanners: any[], existingProducts: LoanProduct[] }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<Partial<LoanProduct>>({
        name: '', icon: '', applyLabel: 'Apply Now', applyUrl: '#', isActive: true, loanBannerId: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Calculate available banners
    const availableBanners = loanBanners.filter(banner => {
        const isUsed = existingProducts.some(p => p.loanBannerId === banner.id && p.id !== initialData?.id);
        return !isUsed;
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ name: '', icon: '', applyLabel: 'Apply Now', applyUrl: '#', isActive: true, loanBannerId: '' });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        else if (type === 'number') setFormData(prev => ({ ...prev, [name]: Number(value) }));
        else setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};
        if (!formData.icon) newErrors.icon = 'Product icon is required';
        if (!formData.name) newErrors.name = 'Product name is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (initialData) {
            dispatch(updateProduct({ id: initialData.id, data: formData }));
        } else {
            dispatch(addProduct(formData as Omit<LoanProduct, 'id'>));
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Add Product'}</h3>
                    <button onClick={onClose}><X className="h-5 w-5 text-gray-500 hover:text-gray-700" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} required />

                        <div className="relative" ref={dropdownRef}>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Loan Showcase</label>

                            {/* Custom Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center justify-between w-full p-3 bg-white border-2 rounded-xl cursor-pointer transition-all ${isDropdownOpen ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-teal-500'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {formData.loanBannerId && availableBanners.find(b => b.id === formData.loanBannerId) ? (
                                        <>
                                            {(() => {
                                                const selectedBanner = availableBanners.find(b => b.id === formData.loanBannerId);
                                                const Icon = selectedBanner?.icon ? iconMap[selectedBanner.icon] : null;
                                                return Icon ? <Icon size={20} className="text-teal-600" /> : null;
                                            })()}
                                            <span className="text-gray-900 font-medium">
                                                {availableBanners.find(b => b.id === formData.loanBannerId)?.title}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Select loan type</span>
                                    )}
                                </div>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Options */}
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-60 overflow-y-auto p-1">
                                        {availableBanners.length > 0 ? (
                                            availableBanners.map((banner) => {
                                                const Icon = banner.icon ? iconMap[banner.icon] : null;
                                                const isSelected = formData.loanBannerId === banner.id;

                                                return (
                                                    <div
                                                        key={banner.id}
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, loanBannerId: banner.id }));
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-md ${isSelected ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                {Icon ? <Icon size={18} /> : <div className="w-[18px] h-[18px]" />}
                                                            </div>
                                                            <span className="font-medium">{banner.title}</span>
                                                        </div>
                                                        {isSelected && <Check size={16} className="text-teal-600" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                No available showcases found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Select which loan page this product belongs to.</p>
                        </div>
                    </div>

                    <div>
                        <IconSelector
                            label="Product Icon"
                            value={formData.icon}
                            onChange={(val) => {
                                setFormData(prev => ({ ...prev, icon: val }));
                                if (val) setErrors(prev => ({ ...prev, icon: '' }));
                            }}
                            error={errors.icon}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Apply Button Label" name="applyLabel" value={formData.applyLabel} onChange={handleChange} />
                        <Input label="Apply URL" name="applyUrl" value={formData.applyUrl} onChange={handleChange} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="text-sm font-medium text-gray-700">Active Status</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
