import axios from '@/utils/axios';

export interface FeatureItem {
  text: string;
  isActive: boolean;
}

export interface CtaButton {
  label: string;
  url?: string;
  enabled: boolean;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

export interface DocumentItem {
  title: string;
  description: string;
}

export interface RateItem {
  label: string;
  value: string;
}



export interface StepItem {
  title: string;
  description: string;
}

export interface ComparisonItem {
  feature: string;
  scapital: string;
  banks: string;
  nbfcs: string;
}

export interface LoanBanner {
  id: string;
  title: string;
  heading?: string;
  headingHighlight?: string;
  imageUrl: string;
  icon?: string;
  redirectUrl?: string; // Kept for backward compatibility or simplistic banners
  description?: string;
  features?: FeatureItem[];
  ctaPrimary?: CtaButton;
  ctaSecondary?: CtaButton;
  
  // Overview Section
  overviewTitle?: string;
  overviewTitleHighlight?: string;
  overviewContent?: string;

  // Benefits Section
  benefitsTitle?: string;
  benefitsTitleHighlight?: string;
  benefits?: BenefitItem[];

  // Documents Section
  documentsTitle?: string;
  documents?: DocumentItem[];

  // Rates & Charges Section
  ratesTitle?: string;
  ratesTitleHighlight?: string;
  ratesImage?: string;
  ratesTable?: RateItem[];

  // Steps Section
  stepsTitle?: string;
  stepsTitleHighlight?: string;
  stepsButtonLabel?: string;
  steps?: StepItem[];

  // Comparison Section
  comparisonTitle?: string;
  comparisonTitleHighlight?: string;
  comparisonTable?: ComparisonItem[];

  // Calculator Configuration
  defaultAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  
  defaultTenure?: number;
  minTenure?: number;
  maxTenure?: number;
  
  defaultInterest?: number;
  minInterest?: number;
  maxInterest?: number;

  isActive: boolean;
  isDefault: boolean;
  order: number;
  
  // Dynamic Page Content
  pageContent?: PageContentSection[];
}

export type SectionType = 'overview' | 'benefits' | 'documents' | 'comparison' | 'rates' | 'steps';

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  titleHighlight?: string;
  isActive: boolean;
}

export interface OverviewSection extends BaseSection {
  type: 'overview';
  content: string;
}

export interface BenefitsSection extends BaseSection {
  type: 'benefits';
  items: BenefitItem[];
}

export interface DocumentsSection extends BaseSection {
  type: 'documents';
  items: DocumentItem[];
}

export interface ComparisonSection extends BaseSection {
  type: 'comparison';
  items: ComparisonItem[];
}

export interface RatesSection extends BaseSection {
  type: 'rates';
  image?: string;
  items: RateItem[];
}

export interface StepsSection extends BaseSection {
  type: 'steps';
  buttonLabel?: string;
  items: StepItem[];
}

export type PageContentSection = OverviewSection | BenefitsSection | DocumentsSection | ComparisonSection | RatesSection | StepsSection;

export const loanBannerService = {
  getAll: async () => {
    const response = await axios.get<LoanBanner[]>('/loan-banner');
    return response.data;
  },

  create: async (data: Omit<LoanBanner, 'id'>) => {
    const response = await axios.post<LoanBanner>('/loan-banner', data);
    return response.data;
  },

  update: async (id: string, data: Partial<LoanBanner>) => {
    const response = await axios.put<LoanBanner>(`/loan-banner/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`/loan-banner/${id}`);
  },

  reorder: async (ids: string[]) => {
    await axios.put('/loan-banner/reorder', { ids });
  },
};
