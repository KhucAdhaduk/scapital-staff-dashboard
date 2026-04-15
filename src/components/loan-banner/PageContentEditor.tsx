import React, { useState } from 'react';
import {
    PageContentSection,
    SectionType,
    OverviewSection,
    BenefitsSection,
    DocumentsSection,
    ComparisonSection,
    RatesSection,
    StepsSection,
    BenefitItem,
    DocumentItem,
    RateItem,
    ComparisonItem,
    StepItem
} from '@/services/loanBannerService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { IconSelector } from '@/components/ui/IconSelector';
import {
    Plus, Trash, X, ArrowUp, ArrowDown, GripVertical,
    FileText, CheckCircle, TrendingUp, Percent, Layers,
    Copy, Zap, Shield, Clock, Smartphone, Globe, DollarSign, Award, Target, Smile, Star, Lock, ThumbsUp, RefreshCw
} from 'lucide-react';

// Reuse Benefit Icon options from parent form or redefine
const BENEFIT_ICON_OPTIONS = [
    { value: 'zap', label: 'Fast/Quick', icon: Zap },
    { value: 'check-circle', label: 'Easy/Simple', icon: CheckCircle },
    { value: 'shield', label: 'Secure', icon: Shield },
    { value: 'file-text', label: 'Documents', icon: FileText },
    { value: 'clock', label: 'Time', icon: Clock },
    { value: 'smartphone', label: 'Digital', icon: Smartphone },
    { value: 'globe', label: 'Online', icon: Globe },
    { value: 'dollar-sign', label: 'Money', icon: DollarSign },
    { value: 'percent', label: 'Rate', icon: Percent },
    { value: 'award', label: 'Best', icon: Award },
    { value: 'target', label: 'Flexible', icon: Target },
    { value: 'smile', label: 'Hassle-free', icon: Smile },
    { value: 'star', label: 'Top Rated', icon: Star },
    { value: 'trending-up', label: 'Growth', icon: TrendingUp },
    { value: 'lock', label: 'No Collateral', icon: Lock },
    { value: 'thumbs-up', label: 'Approval', icon: ThumbsUp },
    { value: 'layers', label: 'Options', icon: Layers },
    { value: 'refresh-cw', label: 'Process', icon: RefreshCw },
];

interface PageContentEditorProps {
    sections: PageContentSection[];
    onChange: (sections: PageContentSection[]) => void;
    errors: Record<string, string>;
    onUploadFile: (file: File) => Promise<string>; // Callback for image upload handling
    activeSectionId: string | null;
    setActiveSectionId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function PageContentEditor({ sections, onChange, errors, onUploadFile, activeSectionId, setActiveSectionId }: PageContentEditorProps) {

    const addSection = (type: SectionType) => {
        const newSection: PageContentSection = {
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title: '',
            isActive: true,
            ...(type === 'overview' ? { content: '' } : {}),
            ...(type === 'benefits' ? { items: [{ title: '', description: '', icon: 'zap' }] } : {}),
            ...(type === 'documents' ? { items: [{ title: '', description: '' }] } : {}),
            ...(type === 'comparison' ? { items: [{ feature: '', scapital: '', banks: '', nbfcs: '' }] } : {}),
            ...(type === 'rates' ? { items: [{ label: '', value: '' }] } : {}),
            ...(type === 'steps' ? { items: [{ title: '', description: '' }] } : {}),
        } as any;

        onChange([...sections, newSection]);
        setActiveSectionId(newSection.id);
    };

    const removeSection = (id: string) => {
        onChange(sections.filter(s => s.id !== id));
    };

    const updateSection = (id: string, updates: Partial<PageContentSection>) => {
        onChange(sections.map(s => s.id === id ? { ...s, ...updates } as PageContentSection : s));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        onChange(newSections);
    };

    const renderSectionEditor = (section: PageContentSection, index: number) => {
        const sectionErrorPrefix = `section_${section.id}`;

        return (
            <div key={section.id} id={`section-${section.id}`} className={`border rounded-xl mb-6 bg-white shadow-sm transition-all ${activeSectionId === section.id ? 'ring-2 ring-teal-500 border-transparent z-10' : 'border-gray-200 hover:border-teal-300'}`}>
                {/* Section Header */}
                <div
                    className="flex items-center justify-between p-4 bg-gray-50/50 rounded-t-xl cursor-pointer select-none"
                    onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}
                >
                    <div className="flex items-center gap-3">
                        {/* <div className="p-2 bg-white rounded-md border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing text-gray-400">
                            <GripVertical size={16} />
                        </div> */}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full w-fit mb-1">
                                {section.type || 'Unknown'}
                            </span>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                {section.title || <span className="text-gray-400 italic">Untitled {section.type ? section.type.charAt(0).toUpperCase() + section.type.slice(1) : 'Section'}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative z-20" onClick={e => e.stopPropagation()}>
                        <div className="flex rounded-md bg-white border border-gray-200 mr-2 shadow-sm">
                            <button
                                type="button"
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-30 border-r border-gray-100"
                                title="Move Up"
                            >
                                <ArrowUp size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === sections.length - 1}
                                className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-30"
                                title="Move Down"
                            >
                                <ArrowDown size={16} />
                            </button>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={section.isActive}
                                onChange={(e) => updateSection(section.id, { isActive: e.target.checked })}
                                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            Active
                        </label>

                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeSection(section.id)}
                        >
                            <Trash size={16} />
                        </Button>
                    </div>
                </div>

                {/* Section Content Editor */}
                {activeSectionId === section.id && (
                    <div className="p-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        {/* Common Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Input
                                label="Section Title"
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                placeholder={`Title for ${section.type}`}
                                error={errors[`${sectionErrorPrefix}_title`]}
                            />
                            <div>
                                <Input
                                    label="Title Highlight"
                                    value={section.titleHighlight || ''}
                                    onChange={(e) => updateSection(section.id, { titleHighlight: e.target.value })}
                                    placeholder="Blue highlighted text"
                                    error={errors[`${sectionErrorPrefix}_titleHighlight`]}
                                />
                                <p className="text-xs text-gray-400 mt-1">Appended to title in theme color</p>
                            </div>
                        </div>

                        {/* Specific Editors */}
                        {section.type === 'overview' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                                <textarea
                                    className={`w-full rounded-md border p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 min-h-[150px] ${errors[`${sectionErrorPrefix}_content`]
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-teal-600 focus:border-transparent'
                                        }`}
                                    value={(section as OverviewSection).content}
                                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                    placeholder="Enter overview content..."
                                />
                                {errors[`${sectionErrorPrefix}_content`] && <p className="text-xs text-red-500 mt-1">{errors[`${sectionErrorPrefix}_content`]}</p>}
                            </div>
                        )}

                        {section.type === 'benefits' && (
                            <BenefitsEditor
                                section={section as BenefitsSection}
                                onUpdate={(s) => updateSection(section.id, s)}
                                errors={errors}
                                errorPrefix={sectionErrorPrefix}
                            />
                        )}

                        {section.type === 'documents' && (
                            <DocumentsEditor
                                section={section as DocumentsSection}
                                onUpdate={(s) => updateSection(section.id, s)}
                                errors={errors}
                                errorPrefix={sectionErrorPrefix}
                            />
                        )}

                        {section.type === 'comparison' && (
                            <ComparisonEditor
                                section={section as ComparisonSection}
                                onUpdate={(s) => updateSection(section.id, s)}
                                errors={errors}
                                errorPrefix={sectionErrorPrefix}
                            />
                        )}

                        {section.type === 'rates' && (
                            <RatesEditor
                                section={section as RatesSection}
                                onUpdate={(s) => updateSection(section.id, s)}
                                onUploadFile={onUploadFile}
                                errors={errors}
                                errorPrefix={sectionErrorPrefix}
                            />
                        )}

                        {section.type === 'steps' && (
                            <StepsEditor
                                section={section as StepsSection}
                                onUpdate={(s) => updateSection(section.id, s)}
                                errors={errors}
                                errorPrefix={sectionErrorPrefix}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Add Section Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                    { type: 'overview', icon: FileText, label: 'Overview' },
                    { type: 'benefits', icon: CheckCircle, label: 'Benefits' },
                    { type: 'documents', icon: Copy, label: 'Documents' }, // Using Copy as generic file icon substitute or FileText
                    { type: 'comparison', icon: TrendingUp, label: 'Compare' },
                    { type: 'rates', icon: Percent, label: 'Rates' },
                    { type: 'steps', icon: Layers, label: 'Steps' },
                ].map((item) => (
                    <button
                        key={item.type}
                        type="button"
                        onClick={() => addSection(item.type as SectionType)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-white hover:border-teal-500 hover:shadow-md transition-all group"
                    >
                        <item.icon className="h-6 w-6 text-gray-400 group-hover:text-teal-600 mb-2" />
                        <span className="text-xs font-medium text-gray-600 group-hover:text-teal-700">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Sections List */}
            {sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-gray-500">No content sections added yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Select a section type above to start building your page.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section, index) => renderSectionEditor(section, index))}
                </div>
            )}
        </div>
    );
}

// --- Sub-Editors ---

function BenefitsEditor({ section, onUpdate, errors, errorPrefix }: { section: BenefitsSection, onUpdate: (s: BenefitsSection) => void, errors: any, errorPrefix: string }) {
    const handleAdd = () => onUpdate({ ...section, items: [...section.items, { icon: 'check-circle', title: '', description: '' }] });
    const handleRemove = (idx: number) => {
        const newItems = [...section.items];
        newItems.splice(idx, 1);
        onUpdate({ ...section, items: newItems });
    };
    const handleChange = (idx: number, field: keyof BenefitItem, val: any) => {
        const newItems = [...section.items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onUpdate({ ...section, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Benefit Cards</h4>
                <Button size="sm" type="button" variant="secondary" onClick={handleAdd}><Plus size={14} className="mr-1" /> Add Card</Button>
            </div>
            {section.items.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 relative group">
                    <div className="grid gap-3">
                        <div className="flex gap-2 items-start">
                            <div className="flex-1">
                                <Input
                                    placeholder="Benefit Title"
                                    value={item.title}
                                    onChange={e => handleChange(idx, 'title', e.target.value)}
                                    error={errors[`${errorPrefix}_item_${idx}_title`]}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                disabled={section.items.length <= 1}
                                className={`text-gray-400 p-2 rounded-full mt-1 ${section.items.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500 hover:bg-red-50'}`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <textarea
                            className={`w-full rounded-md border p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors[`${errorPrefix}_item_${idx}_description`]
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-teal-600 focus:border-transparent'
                                }`}
                            rows={2}
                            placeholder="Description"
                            value={item.description}
                            onChange={e => handleChange(idx, 'description', e.target.value)}
                        />
                        <IconSelector
                            label="Icon"
                            value={item.icon}
                            onChange={(val) => handleChange(idx, 'icon', val)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function DocumentsEditor({ section, onUpdate, errors, errorPrefix }: { section: DocumentsSection, onUpdate: (s: DocumentsSection) => void, errors: any, errorPrefix: string }) {
    const handleAdd = () => onUpdate({ ...section, items: [...section.items, { title: '', description: '' }] });
    const handleRemove = (idx: number) => {
        const newItems = [...section.items];
        newItems.splice(idx, 1);
        onUpdate({ ...section, items: newItems });
    };
    const handleChange = (idx: number, field: keyof DocumentItem, val: any) => {
        const newItems = [...section.items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onUpdate({ ...section, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Documents List</h4>
                <Button size="sm" type="button" variant="secondary" onClick={handleAdd}><Plus size={14} className="mr-1" /> Add Item</Button>
            </div>
            {section.items.map((item, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-gray-50/50 flex gap-3 items-start relative group">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold mt-1 shrink-0">{idx + 1}</span>
                    <div className="flex-1 grid gap-2">
                        <Input
                            placeholder="Document Name"
                            value={item.title}
                            onChange={e => handleChange(idx, 'title', e.target.value)}
                            error={errors[`${errorPrefix}_item_${idx}_title`]}
                        />
                        <Input
                            placeholder="Description"
                            value={item.description}
                            onChange={e => handleChange(idx, 'description', e.target.value)}
                            error={errors[`${errorPrefix}_item_${idx}_description`]}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        disabled={section.items.length <= 1}
                        className={`text-gray-300 ${section.items.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

function ComparisonEditor({ section, onUpdate, errors, errorPrefix }: { section: ComparisonSection, onUpdate: (s: ComparisonSection) => void, errors: any, errorPrefix: string }) {
    const handleAdd = () => onUpdate({ ...section, items: [...section.items, { feature: '', scapital: '', banks: '', nbfcs: '' }] });
    const handleRemove = (idx: number) => {
        const newItems = [...section.items];
        newItems.splice(idx, 1);
        onUpdate({ ...section, items: newItems });
    };
    const handleChange = (idx: number, field: keyof ComparisonItem, val: any) => {
        const newItems = [...section.items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onUpdate({ ...section, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Comparison Rows</h4>
                <Button size="sm" type="button" variant="secondary" onClick={handleAdd}><Plus size={14} className="mr-1" /> Add Row</Button>
            </div>
            <div className="overflow-x-auto border rounded-lg bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                        <tr>
                            <th className="p-2 w-1/4 text-left">Feature</th>
                            <th className="p-2 w-1/4 text-left">SCAPITAL</th>
                            <th className="p-2 w-1/4 text-left">Banks</th>
                            <th className="p-2 w-1/4 text-left">NBFCs</th>
                            <th className="p-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {section.items.map((row, idx) => (
                            <tr key={idx}>
                                <td className="p-2"><input className={`w-full border-none bg-transparent p-1 focus:outline-none focus:ring-1 rounded text-gray-900 ${errors[`${errorPrefix}_item_${idx}_feature`] ? 'ring-1 ring-red-500 bg-red-50' : 'focus:ring-teal-600'}`} placeholder="Feature" value={row.feature} onChange={e => handleChange(idx, 'feature', e.target.value)} /></td>
                                <td className="p-2"><input className={`w-full border-none bg-transparent p-1 focus:outline-none focus:ring-1 rounded font-bold text-teal-700 ${errors[`${errorPrefix}_item_${idx}_scapital`] ? 'ring-1 ring-red-500 bg-red-50' : 'focus:ring-teal-600'}`} placeholder="Value" value={row.scapital} onChange={e => handleChange(idx, 'scapital', e.target.value)} /></td>
                                <td className="p-2"><input className={`w-full border-none bg-transparent p-1 focus:outline-none focus:ring-1 rounded text-gray-900 ${errors[`${errorPrefix}_item_${idx}_banks`] ? 'ring-1 ring-red-500 bg-red-50' : 'focus:ring-teal-600'}`} placeholder="Value" value={row.banks} onChange={e => handleChange(idx, 'banks', e.target.value)} /></td>
                                <td className="p-2"><input className={`w-full border-none bg-transparent p-1 focus:outline-none focus:ring-1 rounded text-gray-900 ${errors[`${errorPrefix}_item_${idx}_nbfcs`] ? 'ring-1 ring-red-500 bg-red-50' : 'focus:ring-teal-600'}`} placeholder="Value" value={row.nbfcs} onChange={e => handleChange(idx, 'nbfcs', e.target.value)} /></td>
                                <td className="p-2 text-center text-gray-300 hover:text-red-500 cursor-pointer">
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(idx)}
                                        disabled={section.items.length <= 1}
                                        className={`text-gray-400 hover:text-red-500 ${section.items.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Trash size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {section.items.length === 0 && <p className="text-center p-4 text-gray-400 italic">No rows added.</p>}
            </div>
            {errors[`${errorPrefix}_items`] && <p className="text-xs text-red-500">{errors[`${errorPrefix}_items`]}</p>}
        </div>
    );
}

function RatesEditor({ section, onUpdate, onUploadFile, errors, errorPrefix }: { section: RatesSection, onUpdate: (s: RatesSection) => void, onUploadFile: (f: File) => Promise<string>, errors: any, errorPrefix: string }) {
    const handleAdd = () => onUpdate({ ...section, items: [...section.items, { label: '', value: '' }] });
    const handleRemove = (idx: number) => {
        const newItems = [...section.items];
        newItems.splice(idx, 1);
        onUpdate({ ...section, items: newItems });
    };
    const handleChange = (idx: number, field: keyof RateItem, val: any) => {
        const newItems = [...section.items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onUpdate({ ...section, items: newItems });
    };
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="space-y-6">
            <ImageUpload
                label="Section Image"
                value={section.image || ''}
                onChange={(val) => onUpdate({ ...section, image: val })}
                onFileSelect={async (file) => {
                    if (file) {
                        setIsUploading(true);
                        try {
                            const url = await onUploadFile(file);
                            onUpdate({ ...section, image: url });
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setIsUploading(false);
                        }
                    }
                }}
                isUploading={isUploading}
                error={errors[`${errorPrefix}_image`]}
            />

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Rates List</h4>
                    <Button size="sm" type="button" variant="secondary" onClick={handleAdd}><Plus size={14} className="mr-1" /> Add Rate</Button>
                </div>
                <div className="space-y-2">
                    {section.items.map((item, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder="Label"
                                value={item.label}
                                onChange={e => handleChange(idx, 'label', e.target.value)}
                                className="flex-1"
                                error={errors[`${errorPrefix}_item_${idx}_label`]}
                            />
                            <Input
                                placeholder="Value (e.g. 5%)"
                                value={item.value}
                                onChange={e => handleChange(idx, 'value', e.target.value)}
                                className="flex-1"
                                error={errors[`${errorPrefix}_item_${idx}_value`]}
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`text-gray-400 h-9 w-9 p-0 ${section.items.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
                                onClick={() => handleRemove(idx)}
                                disabled={section.items.length <= 1}
                            >
                                <Trash size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StepsEditor({ section, onUpdate, errors, errorPrefix }: { section: StepsSection, onUpdate: (s: StepsSection) => void, errors: any, errorPrefix: string }) {
    const handleAdd = () => onUpdate({ ...section, items: [...section.items, { title: '', description: '' }] });
    const handleRemove = (idx: number) => {
        const newItems = [...section.items];
        newItems.splice(idx, 1);
        onUpdate({ ...section, items: newItems });
    };
    const handleChange = (idx: number, field: keyof StepItem, val: any) => {
        const newItems = [...section.items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onUpdate({ ...section, items: newItems });
    };

    return (
        <div className="space-y-6">
            <Input
                label="Bottom Button Label"
                value={section.buttonLabel || ''}
                onChange={e => onUpdate({ ...section, buttonLabel: e.target.value })}
                placeholder="e.g. Apply Now"
                error={errors[`${errorPrefix}_buttonLabel`]}
            />

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Steps Timeline</h4>
                    <Button size="sm" type="button" variant="secondary" onClick={handleAdd}><Plus size={14} className="mr-1" /> Add Step</Button>
                </div>

                <div className="space-y-4">
                    {section.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border rounded-lg bg-gray-50/50 relative">
                            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">{idx + 1}</div>
                            <div className="flex-1 grid gap-2">
                                <Input
                                    placeholder="Step Title"
                                    value={item.title}
                                    onChange={e => handleChange(idx, 'title', e.target.value)}
                                    className="font-bold"
                                    error={errors[`${errorPrefix}_item_${idx}_title`]}
                                />
                                <textarea className={`w-full rounded-md border p-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors[`${errorPrefix}_item_${idx}_description`]
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-teal-600 focus:border-transparent'
                                    }`} rows={2} placeholder="Description" value={item.description} onChange={e => handleChange(idx, 'description', e.target.value)} />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                disabled={section.items.length <= 1}
                                className={`self-start ${section.items.length <= 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-300 hover:text-red-500'}`}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
