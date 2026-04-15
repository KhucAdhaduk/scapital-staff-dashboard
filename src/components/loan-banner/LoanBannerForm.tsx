'use client';

import React, { useState, useEffect } from 'react';
import { LoanBanner, FeatureItem, CtaButton, BenefitItem, PageContentSection, SectionType, OverviewSection, BenefitsSection, DocumentsSection, ComparisonSection, RatesSection, StepsSection } from '@/services/loanBannerService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadService } from '@/services/uploadService';
import { Plus, Trash, X, User, Home, Briefcase, Building, Car, Bike, Percent, CreditCard, Truck, FileText, CheckCircle, Calculator, Clock, Zap, Shield, Smartphone, Globe, DollarSign, Award, Target, Smile, Star, TrendingUp, Lock, ThumbsUp, Layers, RefreshCw, Landmark, PiggyBank, GraduationCap, Coins, Wallet, Banknote, Building2, Stethoscope, Plane, Gem, ArrowUp, ArrowDown, GripVertical, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { IconSelector } from '@/components/ui/IconSelector';
import { PageContentEditor } from './PageContentEditor';

const ICON_OPTIONS = [
    { value: 'user', label: 'Personal', icon: User },
    { value: 'home', label: 'Home', icon: Home },
    { value: 'briefcase', label: 'Business', icon: Briefcase },
    { value: 'building', label: 'Property', icon: Building },
    { value: 'car', label: 'Car', icon: Car },
    { value: 'bike', label: 'Bike', icon: Bike },
    { value: 'truck', label: 'Commercial', icon: Truck },
    { value: 'percent', label: 'Percent', icon: Percent },
    { value: 'credit-card', label: 'Credit', icon: CreditCard },
    { value: 'landmark', label: 'Bank', icon: Landmark },
    { value: 'piggy-bank', label: 'Savings', icon: PiggyBank },
    { value: 'graduation-cap', label: 'Education', icon: GraduationCap },
    { value: 'coins', label: 'Gold/Assets', icon: Coins },
    { value: 'wallet', label: 'Wallet', icon: Wallet },
    { value: 'banknote', label: 'Cash', icon: Banknote },
    { value: 'building-2', label: 'Commercial', icon: Building2 },
    { value: 'stethoscope', label: 'Medical', icon: Stethoscope },
    { value: 'plane', label: 'Travel', icon: Plane },
    { value: 'gem', label: 'Jewelry', icon: Gem },
];

const BENEFIT_ICON_OPTIONS = [
    { value: 'zap', label: 'Fast/Quick', icon: Zap },
    { value: 'check-circle', label: 'Easy/Simple', icon: CheckCircle },
    { value: 'shield', label: 'Secure', icon: Shield },
    { value: 'file-text', label: 'Documents', icon: FileText },
    { value: 'credit-card', label: 'Wallet', icon: CreditCard },
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

interface BenefitItemEditorProps {
    benefit: BenefitItem;
    index: number;
    onChange: (index: number, field: keyof BenefitItem, value: any) => void;
    onRemove: (index: number) => void;
    titleError?: string;
    descriptionError?: string;
}

function BenefitItemEditor({ benefit, index, onChange, onRemove, titleError, descriptionError }: BenefitItemEditorProps) {
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const SelectedIcon = BENEFIT_ICON_OPTIONS.find(opt => opt.value === benefit.icon)?.icon || CheckCircle;

    return (
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm relative group hover:border-teal-300 hover:shadow-md z-0 hover:z-10">
            <div className="space-y-4">

                {/* 1. Header: Title & Remove */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Benefit Title"
                            value={benefit.title}
                            onChange={(e) => onChange(index, 'title', e.target.value)}
                            className="font-bold text-gray-900 placeholder:font-normal"
                            error={titleError}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Card"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                </div>

                {/* 2. Description */}
                <div>
                    <textarea
                        className={`w-full rounded-lg border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all resize-none ${descriptionError ? 'border-red-500 bg-red-50' : ''}`}
                        rows={2}
                        value={benefit.description}
                        onChange={(e) => onChange(index, 'description', e.target.value)}
                        placeholder="Description of this benefit..."
                    />
                    {descriptionError && <p className="mt-1 text-xs text-red-500">{descriptionError}</p>}
                </div>

                {/* 3. Icon Selector (Bottom) */}
                <div className="pt-2 border-t border-gray-50">
                    <IconSelector
                        label="Select Icon"
                        value={benefit.icon}
                        onChange={(val) => onChange(index, 'icon', val)}
                        position="bottom"
                    />
                </div>

            </div>
        </div>
    );
}

interface LoanBannerFormProps {
    initialData?: LoanBanner | null;
    onSave: (data: Omit<LoanBanner, 'id'> | LoanBanner) => void;
    onCancel: () => void;
}

export function LoanBannerForm({ initialData, onSave, onCancel }: LoanBannerFormProps) {
    const [formData, setFormData] = useState<Partial<LoanBanner>>({
        title: '',
        imageUrl: '',
        icon: '',
        description: '',
        features: [{ text: '', isActive: true }],
        ctaPrimary: { label: 'Apply Now', url: '', enabled: true },
        ctaSecondary: { label: 'Learn More', url: '', enabled: false },
        isActive: true,
        isDefault: false,
        order: 0,
        // List Defaults
        benefits: [{ icon: 'check-circle', title: '', description: '' }],
        documents: [{ title: '', description: '' }],
        comparisonTable: [{ feature: '', scapital: '', banks: '', nbfcs: '' }],
        ratesTable: [{ label: '', value: '' }],
        steps: [{ title: '', description: '' }],
        // Calculator Defaults
        defaultAmount: 500000,
        minAmount: 10000,
        maxAmount: 10000000,
        defaultTenure: 5,
        minTenure: 1,
        maxTenure: 30,
        defaultInterest: 10.5,
        minInterest: 5.0,
        maxInterest: 25.0,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    console.log("LoanBannerForm initialData:", initialData);
    console.log("LoanBannerForm formData:", formData);

    useEffect(() => {
        if (initialData) {
            // Normalize documents to ensure they are always objects
            const normalizedDocuments = (initialData.documents || []).map((doc: any) => {
                if (typeof doc === 'string') {
                    return { title: doc, description: '' };
                }
                return doc;
            });

            setFormData({
                ...initialData,
                features: initialData.features || [],
                documents: normalizedDocuments,
                ctaPrimary: initialData.ctaPrimary || { label: 'Apply Now', url: '', enabled: true },
                ctaSecondary: initialData.ctaSecondary || { label: 'Learn More', url: '', enabled: false },
                steps: initialData.steps || [],
                pageContent: (typeof initialData.pageContent === 'string'
                    ? JSON.parse(initialData.pageContent)
                    : initialData.pageContent) || [],
            });

            // Migration / Sync Logic: If pageContent is empty but legacy fields exist, populate pageContent.
            // This runs only once when initialData is loaded.
            if ((!initialData.pageContent || initialData.pageContent.length === 0)) {
                const migratedSections: PageContentSection[] = [];

                if (initialData.overviewTitle || initialData.overviewContent) {
                    migratedSections.push({
                        id: 'overview-legacy',
                        type: 'overview',
                        title: initialData.overviewTitle || 'Overview',
                        titleHighlight: initialData.overviewTitleHighlight,
                        content: initialData.overviewContent || '',
                        isActive: true
                    });
                }

                if (initialData.benefits && initialData.benefits.length > 0) {
                    migratedSections.push({
                        id: 'benefits-legacy',
                        type: 'benefits',
                        title: initialData.benefitsTitle || 'Benefits',
                        titleHighlight: initialData.benefitsTitleHighlight,
                        items: initialData.benefits,
                        isActive: true
                    });
                }

                if (initialData.documents && normalizedDocuments.length > 0) {
                    migratedSections.push({
                        id: 'documents-legacy',
                        type: 'documents',
                        title: initialData.documentsTitle || 'Documents',
                        items: normalizedDocuments,
                        isActive: true
                    });
                }

                if (initialData.ratesTable && initialData.ratesTable.length > 0) {
                    migratedSections.push({
                        id: 'rates-legacy',
                        type: 'rates',
                        title: initialData.ratesTitle || 'Rates',
                        titleHighlight: initialData.ratesTitleHighlight,
                        image: initialData.ratesImage,
                        items: initialData.ratesTable,
                        isActive: true
                    });
                }

                if (initialData.steps && initialData.steps.length > 0) {
                    migratedSections.push({
                        id: 'steps-legacy',
                        type: 'steps',
                        title: initialData.stepsTitle || 'Steps',
                        titleHighlight: initialData.stepsTitleHighlight,
                        buttonLabel: initialData.stepsButtonLabel,
                        items: initialData.steps,
                        isActive: true
                    });
                }

                if (initialData.comparisonTable && initialData.comparisonTable.length > 0) {
                    migratedSections.push({
                        id: 'comparison-legacy',
                        type: 'comparison',
                        title: initialData.comparisonTitle || 'Comparison',
                        titleHighlight: initialData.comparisonTitleHighlight,
                        items: initialData.comparisonTable,
                        isActive: true
                    });
                }

                if (migratedSections.length > 0) {
                    // We update the local state to include these migrated sections so the user sees them in the new editor
                    setFormData(prev => ({ ...prev, pageContent: migratedSections }));
                }
            }
        }
    }, [initialData]);

    const handleChange = (field: keyof LoanBanner, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // ... (existing handlers)

    const removeRateItem = (index: number) => {
        const newItems = [...(formData.ratesTable || [])];
        newItems.splice(index, 1);
        handleChange('ratesTable', newItems);
    };

    // Steps Handlers
    const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
        const newItems = [...(formData.steps || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange('steps', newItems);
    };

    const addStep = () => {
        handleChange('steps', [...(formData.steps || []), { title: '', description: '' }]);
    };

    const removeStep = (index: number) => {
        const newItems = [...(formData.steps || [])];
        newItems.splice(index, 1);
        handleChange('steps', newItems);
    };

    const handleFeatureChange = (index: number, field: keyof FeatureItem, value: any) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        handleChange('features', newFeatures);
    };

    const addFeature = () => {
        handleChange('features', [...(formData.features || []), { text: '', isActive: true }]);
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...(formData.features || [])];
        newFeatures.splice(index, 1);
        handleChange('features', newFeatures);
    };

    const handleCtaChange = (type: 'ctaPrimary' | 'ctaSecondary', field: keyof CtaButton, value: any) => {
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type]!, [field]: value }
        }));
    };

    // Benefits Handlers
    const handleBenefitChange = (index: number, field: keyof BenefitItem, value: any) => {
        const newItems = [...(formData.benefits || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange('benefits', newItems);
    };

    const addBenefit = () => {
        handleChange('benefits', [...(formData.benefits || []), { icon: 'check-circle', title: '', description: '' }]);
    };

    const removeBenefit = (index: number) => {
        const newItems = [...(formData.benefits || [])];
        newItems.splice(index, 1);
        handleChange('benefits', newItems);
    };

    // Documents Handlers
    const handleDocumentChange = (index: number, field: 'title' | 'description', value: string) => {
        const newItems = [...(formData.documents || [])];
        // Ensure item is an object (handle potential legacy string data)
        const currentItem = typeof newItems[index] === 'string'
            ? { title: newItems[index] as any, description: '' }
            : newItems[index];

        newItems[index] = { ...currentItem, [field]: value };
        handleChange('documents', newItems);
    };

    const addDocument = () => {
        handleChange('documents', [...(formData.documents || []), { title: '', description: '' }]);
    };

    const removeDocument = (index: number) => {
        const newItems = [...(formData.documents || [])];
        newItems.splice(index, 1);
        handleChange('documents', newItems);
    };

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        if (file) {
            setErrors((prev) => ({ ...prev, imageUrl: '' }));
        }
    };

    const [selectedRatesFile, setSelectedRatesFile] = useState<File | null>(null);
    const [isRatesUploading, setIsRatesUploading] = useState(false);
    const [ratesUploadProgress, setRatesUploadProgress] = useState(0);

    // Rates Handlers
    const handleRatesFileSelect = (file: File | null) => {
        setSelectedRatesFile(file);
    };

    const handleRateChange = (index: number, field: 'label' | 'value', value: string) => {
        const newItems = [...(formData.ratesTable || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange('ratesTable', newItems);
    };

    const addRateItem = () => {
        handleChange('ratesTable', [...(formData.ratesTable || []), { label: '', value: '' }]);
    };



    const validate = () => {
        const newErrors: Record<string, string> = {};

        // 1. General Info Validation
        if (!formData.title?.trim()) newErrors.title = 'Loan Name is required';
        if (!formData.heading?.trim()) newErrors.heading = 'Page Heading is required';
        if (!formData.headingHighlight?.trim()) newErrors.headingHighlight = 'Highlight Text is required';
        if (!formData.icon) newErrors.icon = 'Icon is required';
        if (!formData.imageUrl && !selectedFile) newErrors.imageUrl = 'Banner Image is required';

        // 2. Hero Section Validation
        if (!formData.description?.trim()) newErrors.description = 'Description is required';

        // Validate enabled CTAs
        if (formData.ctaPrimary?.enabled) {
            if (!formData.ctaPrimary.label?.trim()) newErrors.ctaPrimaryLabel = 'Primary Button Label is required';
            if (!formData.ctaPrimary.url?.trim()) newErrors.ctaPrimaryUrl = 'Primary Button URL is required';
        }
        if (formData.ctaSecondary?.enabled) {
            if (!formData.ctaSecondary.label?.trim()) newErrors.ctaSecondaryLabel = 'Secondary Button Label is required';
            if (!formData.ctaSecondary.url?.trim()) newErrors.ctaSecondaryUrl = 'Secondary Button URL is required';
        }

        // Validate Hero Features (at least 1 active)
        const activeFeatures = formData.features?.filter(f => f.isActive);
        if (!activeFeatures || activeFeatures.length === 0) {
            newErrors.features = 'At least one active hero feature is required';
        }
        // Validate individual features don't have empty text if active
        formData.features?.forEach((f, idx) => {
            if (f.isActive && !f.text?.trim()) {
                newErrors[`feature_${idx}`] = 'Feature text cannot be empty';
            }
        });

        // 3. Content Section Validation

        // 3. Content Section Validation
        // If pageContent is used, validate it. Otherwise fallback (or we can validate both if we are migrating)
        if (formData.pageContent && formData.pageContent.length > 0) {
            formData.pageContent.forEach(section => {
                if (!section.title?.trim()) newErrors[`section_${section.id}_title`] = 'Section Title is required';
                if (!section.titleHighlight?.trim()) newErrors[`section_${section.id}_titleHighlight`] = 'Title Highlight is required';

                if (section.type === 'overview' && !(section as OverviewSection).content?.trim()) {
                    newErrors[`section_${section.id}_content`] = 'Overview content is required';
                }

                if (section.type === 'benefits') {
                    const s = section as BenefitsSection;
                    if (!s.items || s.items.length === 0) newErrors[`section_${section.id}_items`] = 'At least one benefit card is required';
                    s.items.forEach((item, idx) => {
                        if (!item.title?.trim()) newErrors[`section_${section.id}_item_${idx}_title`] = 'Benefit title is required';
                        if (!item.description?.trim()) newErrors[`section_${section.id}_item_${idx}_description`] = 'Benefit description is required';
                        if (!item.icon?.trim()) newErrors[`section_${section.id}_item_${idx}_icon`] = 'Benefit icon is required';
                    });
                }

                if (section.type === 'documents') {
                    const s = section as DocumentsSection;
                    if (!s.items || s.items.length === 0) newErrors[`section_${section.id}_items`] = 'At least one document is required';
                    s.items.forEach((item, idx) => {
                        if (!item.title?.trim()) newErrors[`section_${section.id}_item_${idx}_title`] = 'Document name is required';
                        if (!item.description?.trim()) newErrors[`section_${section.id}_item_${idx}_description`] = 'Document description is required';
                    });
                }

                if (section.type === 'comparison') {
                    const s = section as ComparisonSection;
                    if (!s.items || s.items.length === 0) newErrors[`section_${section.id}_items`] = 'At least one comparison row is required';
                    s.items.forEach((item, idx) => {
                        if (!item.feature?.trim()) newErrors[`section_${section.id}_item_${idx}_feature`] = 'Feature is required';
                        if (!item.scapital?.trim()) newErrors[`section_${section.id}_item_${idx}_scapital`] = 'Value is required';
                        if (!item.banks?.trim()) newErrors[`section_${section.id}_item_${idx}_banks`] = 'Value is required';
                        if (!item.nbfcs?.trim()) newErrors[`section_${section.id}_item_${idx}_nbfcs`] = 'Value is required';
                    });
                }

                if (section.type === 'rates') {
                    const s = section as RatesSection;
                    if (!s.items || s.items.length === 0) newErrors[`section_${section.id}_items`] = 'At least one rate is required';
                    if (!s.image?.trim()) newErrors[`section_${section.id}_image`] = 'Section Image is required';
                    s.items.forEach((item, idx) => {
                        if (!item.label?.trim()) newErrors[`section_${section.id}_item_${idx}_label`] = 'Label is required';
                        if (!item.value?.trim()) newErrors[`section_${section.id}_item_${idx}_value`] = 'Value is required';
                    });
                }

                if (section.type === 'steps') {
                    const s = section as StepsSection;
                    if (!s.items || s.items.length === 0) newErrors[`section_${section.id}_items`] = 'At least one step is required';
                    if (!s.buttonLabel?.trim()) newErrors[`section_${section.id}_buttonLabel`] = 'Bottom Button Label is required';
                    s.items.forEach((item, idx) => {
                        if (!item.title?.trim()) newErrors[`section_${section.id}_item_${idx}_title`] = 'Step Title is required';
                        if (!item.description?.trim()) newErrors[`section_${section.id}_item_${idx}_description`] = 'Description is required';
                    });
                }
            });
        }
        // Legacy validation (optional: only if pageContent is empty or we want to support mixed mode, 
        // but ideally we migrate everything to pageContent)
        if ((!formData.pageContent || formData.pageContent.length === 0)) {
            // Overview
            if (!formData.overviewTitle?.trim()) newErrors.overviewTitle = 'Overview Section Title is required';
            if (!formData.overviewContent?.trim()) newErrors.overviewContent = 'Overview Content is required';

            if (!formData.overviewTitleHighlight?.trim()) newErrors.overviewTitleHighlight = 'Overview title highlight is required';

            // Benefits
            if (!formData.benefitsTitle?.trim()) newErrors.benefitsTitle = 'Benefits Section Title is required';
            if (!formData.benefitsTitleHighlight?.trim()) newErrors.benefitsTitleHighlight = 'Benefits title highlight is required';
            if (!formData.benefits || formData.benefits.length === 0) {
                newErrors.benefits = 'At least one benefit card is required';
            } else {
                formData.benefits.forEach((benefit, idx) => {
                    if (!benefit.title?.trim()) newErrors[`benefit_title_${idx}`] = 'Benefit title is required';
                    if (!benefit.description?.trim()) newErrors[`benefit_desc_${idx}`] = 'Benefit description is required';
                });
            }

            // Documents
            if (!formData.documentsTitle?.trim()) newErrors.documentsTitle = 'Documents Section Title is required';
            // Check if documents are added (optional, but if added must be valid)
            if (!formData.documents || formData.documents.length === 0) {
                newErrors.documents = 'At least one document is required';
            } else {
                formData.documents.forEach((doc: any, idx) => {
                    const title = typeof doc === 'string' ? doc : doc.title;
                    const description = typeof doc === 'string' ? '' : doc.description;

                    if (!title?.trim()) newErrors[`document_${idx}`] = 'Document title is required';
                    if (!description?.trim()) newErrors[`document_desc_${idx}`] = 'Document description is required';
                });
            }

            // Comparison Section
            if (!formData.comparisonTitle?.trim()) newErrors.comparisonTitle = 'Comparison Title is required';
            if (!formData.comparisonTitleHighlight?.trim()) newErrors.comparisonTitleHighlight = 'Comparison title highlight is required';
            if (!formData.comparisonTable || formData.comparisonTable.length === 0) {
                newErrors.comparisonTable = 'At least one comparison row is required';
            } else {
                formData.comparisonTable.forEach((row, idx) => {
                    if (!row.feature?.trim()) newErrors[`comparison_feature_${idx}`] = 'Feature name is required';
                    if (!row.scapital?.trim()) newErrors[`comparison_scapital_${idx}`] = 'Scapital value is required';
                    if (!row.banks?.trim()) newErrors[`comparison_banks_${idx}`] = 'Bank value is required';
                    if (!row.nbfcs?.trim()) newErrors[`comparison_nbfcs_${idx}`] = 'NBFC value is required';
                });
            }

            // Rates Section
            if (!formData.ratesTitle?.trim()) newErrors.ratesTitle = 'Rates Section Title is required';
            if (!formData.ratesTitleHighlight?.trim()) newErrors.ratesTitleHighlight = 'Rates title highlight is required';
            if (!formData.ratesImage && !selectedRatesFile) newErrors.ratesImage = 'Rates section image is required';
            if (!formData.ratesTable || formData.ratesTable.length === 0) {
                newErrors.ratesTable = 'At least one rate item is required';
            } else {
                formData.ratesTable.forEach((rate, idx) => {
                    if (!rate.label?.trim()) newErrors[`rate_label_${idx}`] = 'Rate label is required';
                    if (!rate.value?.trim()) newErrors[`rate_value_${idx}`] = 'Rate value is required';
                });
            }

            // Steps Section
            if (!formData.stepsTitle?.trim()) newErrors.stepsTitle = 'Steps Section Title is required';
            if (!formData.stepsTitleHighlight?.trim()) newErrors.stepsTitleHighlight = 'Steps title highlight is required';
            if (!formData.stepsButtonLabel?.trim()) newErrors.stepsButtonLabel = 'Steps button label is required';
            if (!formData.steps || formData.steps.length === 0) {
                newErrors.steps = 'At least one step is required';
            } else {
                formData.steps.forEach((step, idx) => {
                    if (!step.title?.trim()) newErrors[`step_title_${idx}`] = 'Step title is required';
                    if (!step.description?.trim()) newErrors[`step_desc_${idx}`] = 'Step description is required';
                });
            }
        }

        // 4. Calculator Validation
        const validateRequiredPositive = (val: number | undefined, fieldName: string, label: string) => {
            if (val === undefined || val === null || val === 0) { // Assuming 0 is not valid or just checking existence
                newErrors[fieldName] = `${label} is required`;
            } else if (val < 0) {
                newErrors[fieldName] = `${label} cannot be negative`;
            }
        };

        validateRequiredPositive(formData.defaultAmount, 'defaultAmount', 'Default Amount');
        validateRequiredPositive(formData.minAmount, 'minAmount', 'Min Amount');
        validateRequiredPositive(formData.maxAmount, 'maxAmount', 'Max Amount');

        validateRequiredPositive(formData.defaultTenure, 'defaultTenure', 'Default Tenure');
        validateRequiredPositive(formData.minTenure, 'minTenure', 'Min Tenure');
        validateRequiredPositive(formData.maxTenure, 'maxTenure', 'Max Tenure');

        validateRequiredPositive(formData.defaultInterest, 'defaultInterest', 'Default Interest');
        validateRequiredPositive(formData.minInterest, 'minInterest', 'Min Interest');
        validateRequiredPositive(formData.maxInterest, 'maxInterest', 'Max Interest');

        // Logic checks (Min < Max)
        if (formData.minAmount && formData.maxAmount && formData.minAmount > formData.maxAmount) {
            newErrors.amountRange = 'Min Amount cannot be greater than Max Amount';
        }
        if (formData.minTenure && formData.maxTenure && formData.minTenure > formData.maxTenure) {
            newErrors.tenureRange = 'Min Tenure cannot be greater than Max Tenure';
        }
        if (formData.minInterest && formData.maxInterest && formData.minInterest > formData.maxInterest) {
            newErrors.interestRange = 'Min Interest cannot be greater than Max Interest';
        }

        setErrors(newErrors);

        // Auto-switch to tab with error
        if (Object.keys(newErrors).length > 0) {
            const firstErrorKey = Object.keys(newErrors)[0];
            if (['imageUrl', 'title', 'heading', 'headingHighlight', 'icon'].includes(firstErrorKey)) setActiveTab('general');
            else if (['description', 'ctaPrimaryUrl', 'ctaPrimaryLabel', 'features'].includes(firstErrorKey) || firstErrorKey.startsWith('feature_')) setActiveTab('hero');
            else if (['overviewTitle', 'overviewContent', 'benefitsTitle', 'comparisonTitle', 'ratesTitle', 'stepsTitle', 'benefits', 'documents', 'comparisonTable', 'ratesTable', 'steps', 'ratesImage'].includes(firstErrorKey) || firstErrorKey.startsWith('benefit_') || firstErrorKey.startsWith('document_') || firstErrorKey.startsWith('comparison_') || firstErrorKey.startsWith('rate_') || firstErrorKey.startsWith('step_') || firstErrorKey.startsWith('section_')) {
                setActiveTab('content');

                // Auto-expand dynamic section if it has an error
                if (firstErrorKey.startsWith('section_')) {
                    // Extract section ID from error key (format: section_ID_field)
                    const parts = firstErrorKey.split('_');
                    if (parts.length >= 2) {
                        const sectionId = parts[1];
                        setActiveSectionId(sectionId);

                        // Scroll to section
                        setTimeout(() => {
                            const element = document.getElementById(`section-${sectionId}`);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                }
            }
            else if (['defaultAmount', 'minAmount', 'maxAmount', 'amountRange', 'defaultTenure', 'minTenure', 'maxTenure', 'defaultInterest', 'minInterest', 'maxInterest', 'tenureRange', 'interestRange'].includes(firstErrorKey)) setActiveTab('calculator');
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            let finalImageUrl = formData.imageUrl;
            let finalRatesImageUrl = formData.ratesImage;

            if (selectedFile) {
                setIsUploading(true);
                setUploadProgress(0);
                finalImageUrl = await uploadService.uploadFile(selectedFile, (progress) => {
                    setUploadProgress(progress);
                });
                setIsUploading(false);
            }

            if (selectedRatesFile) {
                setIsRatesUploading(true);
                setRatesUploadProgress(0);
                finalRatesImageUrl = await uploadService.uploadFile(selectedRatesFile, (progress) => {
                    setRatesUploadProgress(progress);
                });
                setIsRatesUploading(false);
            }

            if (!finalImageUrl) {
                setErrors((prev) => ({ ...prev, imageUrl: 'Image upload failed or empty' }));
                return;
            }

            // If using pageContent, ensure legacy fields don't cause validation issues by clearing them
            // or setting them to undefined if they are empty/invalid.
            const cleanFormData = { ...formData };

            if (formData.pageContent && formData.pageContent.length > 0) {
                // Explicitly clear legacy arrays if they are present but likely invalid/empty
                cleanFormData.benefits = undefined;
                cleanFormData.documents = undefined;
                cleanFormData.comparisonTable = undefined;
                cleanFormData.ratesTable = undefined;
                cleanFormData.steps = undefined;

                // Also clear legacy titles to be safe
                cleanFormData.overviewTitle = undefined;
                cleanFormData.overviewContent = undefined;
                cleanFormData.benefitsTitle = undefined;
                cleanFormData.documentsTitle = undefined;
                cleanFormData.ratesTitle = undefined;
                cleanFormData.stepsTitle = undefined;
                cleanFormData.comparisonTitle = undefined;
            }

            console.log("Submitting Payload:", {
                ...cleanFormData,
                imageUrl: finalImageUrl,
                ratesImage: finalRatesImageUrl,
            });

            onSave({
                ...cleanFormData,
                imageUrl: finalImageUrl,
                ratesImage: finalRatesImageUrl,
            } as LoanBanner);

        } catch (error: any) {
            console.error("Failed to save banner", error);
            setIsUploading(false);
            setIsRatesUploading(false);
            const errorMsg = error.response?.data?.message || 'Failed to upload image or save banner.';
            setErrors((prev) => ({ ...prev, form: errorMsg }));
            toast.error(errorMsg);
        }
    };

    const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'content' | 'calculator'>('general');

    const tabs = [
        { id: 'general', label: 'General Info' },
        { id: 'hero', label: 'Hero Section' },
        { id: 'content', label: 'Page Content' },
        { id: 'calculator', label: 'Calculator' }
    ];

    // ... (Keep existing handlers: handleChange, handleFeatureChange, addFeature, removeFeature, handleCtaChange, handleBenefitChange, addBenefit, removeBenefit, handleDocumentChange, addDocument, removeDocument, handleFileSelect, validate, handleSubmit)

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-32">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Error Summary */}


            {/* GENERAL TAB */}
            {activeTab === 'general' && (
                <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in duration-300">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Tab Label / Loan Name"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    error={errors.title}
                                    placeholder="e.g. Personal Loan"
                                />

                                <Input
                                    label="Page Heading (Long Title)"
                                    value={formData.heading || ''}
                                    onChange={(e) => handleChange('heading', e.target.value)}
                                    placeholder="e.g. Instant personal loan with fast approval"
                                    error={errors.heading}
                                />

                                <Input
                                    label="Highlight Text (Partial Heading)"
                                    value={formData.headingHighlight || ''}
                                    onChange={(e) => handleChange('headingHighlight', e.target.value)}
                                    placeholder="e.g. low interest"
                                    error={errors.headingHighlight}
                                />
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500">Text entered here will be appended to the heading in teal color.</p>
                                </div>
                            </div>
                        </div>

                        <IconSelector
                            label="Icon"
                            value={formData.icon}
                            onChange={(val) => handleChange('icon', val)}
                            error={errors.icon}
                        />

                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Image & Status</h3>
                            <ImageUpload
                                value={formData.imageUrl}
                                onChange={(val) => handleChange('imageUrl', val)}
                                onFileSelect={handleFileSelect}
                                uploadProgress={uploadProgress}
                                isUploading={isUploading}
                                error={errors.imageUrl}
                            />
                            <p className="text-xs text-gray-500 mt-2">Recommended size: 600x700px (JPG, PNG, WebP)</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-900">Active (Visible to users)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) => handleChange('isDefault', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-gray-900">Default Selected Tab</span>
                            </label>
                        </div>
                    </div>
                </div >
            )
            }

            {/* HERO TAB */}
            {
                activeTab === 'hero' && (
                    <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in duration-300">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 sr-only">Description</label>
                                    <textarea
                                        className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900`}
                                        rows={6}
                                        value={formData.description || ''}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="Enter the main hero description here..."
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </div>
                            </div>

                            {/* CTAs */}
                            <div>
                                <div className="flex items-center justify-between border-b pb-2 mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Call to Action Buttons</h3>
                                </div>

                                {/* Primary CTA */}
                                <div className="space-y-3 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm text-gray-700">Primary Button (Solid)</span>
                                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.ctaPrimary?.enabled}
                                                onChange={(e) => handleCtaChange('ctaPrimary', 'enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-primary"
                                            />
                                            Enable
                                        </label>
                                    </div>
                                    {formData.ctaPrimary?.enabled && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                placeholder="Label"
                                                value={formData.ctaPrimary.label}
                                                onChange={(e) => handleCtaChange('ctaPrimary', 'label', e.target.value)}
                                                error={errors.ctaPrimaryLabel}
                                            />
                                            <Input
                                                placeholder="URL"
                                                value={formData.ctaPrimary.url || ''}
                                                onChange={(e) => handleCtaChange('ctaPrimary', 'url', e.target.value)}
                                                error={errors.ctaPrimaryUrl}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Secondary CTA */}
                                <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm text-gray-700">Secondary Button (Outline)</span>
                                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.ctaSecondary?.enabled}
                                                onChange={(e) => handleCtaChange('ctaSecondary', 'enabled', e.target.checked)}
                                                className="rounded border-gray-300 text-primary"
                                            />
                                            Enable
                                        </label>
                                    </div>
                                    {formData.ctaSecondary?.enabled && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                placeholder="Label"
                                                value={formData.ctaSecondary.label}
                                                onChange={(e) => handleCtaChange('ctaSecondary', 'label', e.target.value)}
                                                error={errors.ctaSecondaryLabel}
                                            />
                                            <Input
                                                placeholder="URL"
                                                value={formData.ctaSecondary.url || ''}
                                                onChange={(e) => handleCtaChange('ctaSecondary', 'url', e.target.value)}
                                                error={errors.ctaSecondaryUrl}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div>
                            <div className="flex items-center justify-between border-b pb-2 mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Hero Features</h3>
                                <Button
                                    size="sm"
                                    variant={errors.features ? "outline" : "secondary"}
                                    className={errors.features ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100" : ""}
                                    onClick={addFeature}
                                    disabled={formData.features && formData.features.length >= 6}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> {formData.features && formData.features.length >= 6 ? 'Max Reached' : 'Add Feature'}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">These appear in the hero section (optional).</p>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                {formData.features?.map((feature, index) => (
                                    <div key={index} className={`flex items-center gap-2 p-2 bg-gray-50 rounded border group transition-colors ${errors[`feature_${index}`] ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-300'}`}>
                                        <input
                                            type="checkbox"
                                            checked={feature.isActive}
                                            onChange={(e) => handleFeatureChange(index, 'isActive', e.target.checked)}
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                            title="Active"
                                        />
                                        <input
                                            type="text"
                                            value={feature.text}
                                            onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                                            className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none p-0 text-gray-900 focus:bg-transparent shadow-none"
                                            placeholder="Feature text..."
                                        />
                                        <button type="button" onClick={() => removeFeature(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {formData.features?.length === 0 && (
                                    <div className={`text-center py-8 border-2 border-dashed rounded-lg ${errors.features ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>
                                        <p className="text-sm italic">{errors.features || "No hero features added."}</p>
                                        <Button type="button" size="sm" variant="ghost" className="mt-2 text-primary" onClick={addFeature}>Add one now</Button>
                                    </div>
                                )}
                            </div>
                            {errors.features && <p className="mt-1 text-xs text-red-500">{errors.features}</p>}
                        </div>
                    </div>
                )
            }

            {/* CONTENT TAB */}
            {
                activeTab === 'content' && (
                    <div className="space-y-6 animate-in fade-in duration-300">


                        <PageContentEditor
                            sections={formData.pageContent || []}
                            onChange={(sections) => setFormData(prev => ({ ...prev, pageContent: sections }))}
                            errors={errors}
                            activeSectionId={activeSectionId}
                            setActiveSectionId={setActiveSectionId}
                            onUploadFile={async (file) => {
                                const url = await uploadService.uploadFile(file);
                                return url;
                            }}
                        />
                    </div>
                )
            }

            {/* CALCULATOR TAB */}
            {
                activeTab === 'calculator' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <Calculator size={20} className="text-teal-600" />
                                Loan Amount Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Default Amount"
                                    type="number"
                                    value={formData.defaultAmount || ''}
                                    onChange={(e) => handleChange('defaultAmount', Number(e.target.value))}
                                    placeholder="500000"
                                    error={errors.defaultAmount}
                                />
                                <Input
                                    label="Min Amount"
                                    type="number"
                                    value={formData.minAmount || ''}
                                    onChange={(e) => handleChange('minAmount', Number(e.target.value))}
                                    placeholder="10000"
                                    error={errors.minAmount}
                                />
                                <Input
                                    label="Max Amount"
                                    type="number"
                                    value={formData.maxAmount || ''}
                                    onChange={(e) => handleChange('maxAmount', Number(e.target.value))}
                                    placeholder="10000000"
                                    error={errors.maxAmount || errors.amountRange}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-teal-600" />
                                Tenure Configuration (Years)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Default Tenure"
                                    type="number"
                                    value={formData.defaultTenure || ''}
                                    onChange={(e) => handleChange('defaultTenure', Number(e.target.value))}
                                    placeholder="5"
                                    error={errors.defaultTenure}
                                />
                                <Input
                                    label="Min Tenure"
                                    type="number"
                                    value={formData.minTenure || ''}
                                    onChange={(e) => handleChange('minTenure', Number(e.target.value))}
                                    placeholder="1"
                                    error={errors.minTenure}
                                />
                                <Input
                                    label="Max Tenure"
                                    type="number"
                                    value={formData.maxTenure || ''}
                                    onChange={(e) => handleChange('maxTenure', Number(e.target.value))}
                                    placeholder="30"
                                    error={errors.maxTenure || errors.tenureRange}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                                <Percent size={20} className="text-teal-600" />
                                Interest Rate Configuration (%)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Input
                                    label="Default Interest"
                                    type="number"
                                    step="0.1"
                                    value={formData.defaultInterest || ''}
                                    onChange={(e) => handleChange('defaultInterest', Number(e.target.value))}
                                    placeholder="10.5"
                                    error={errors.defaultInterest}
                                />
                                <Input
                                    label="Min Interest"
                                    type="number"
                                    step="0.1"
                                    value={formData.minInterest || ''}
                                    onChange={(e) => handleChange('minInterest', Number(e.target.value))}
                                    placeholder="5.0"
                                    error={errors.minInterest}
                                />
                                <Input
                                    label="Max Interest"
                                    type="number"
                                    step="0.1"
                                    value={formData.maxInterest || ''}
                                    onChange={(e) => handleChange('maxInterest', Number(e.target.value))}
                                    placeholder="25.0"
                                    error={errors.maxInterest || errors.interestRange}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* FORM ACTIONS */}
            <div className="flex items-center justify-between px-6 border-t mt-8 bg-white sticky -bottom-8 z-20 py-4">
                <div className="text-sm text-gray-500">
                    {/* Optional Status Text */}
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={isUploading}>Cancel</Button>
                    <Button type="submit" isLoading={isUploading} disabled={isUploading} className="min-w-[140px]">
                        {isUploading ? 'Uploading...' : 'Save All Changes'}
                    </Button>
                </div>
            </div>
        </form >
    );
}
