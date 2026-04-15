import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import loanBannerReducer from './slices/loanBannerSlice';
import bankingPartnersReducer from './slices/bankingPartnersSlice';

import platformStatsReducer from './slices/platformStatsSlice';
import loanComparisonReducer from './slices/loanComparisonSlice';
import testimonialsReducer from './slices/testimonialsSlice';
import faqsReducer from './slices/faqsSlice';
import blogsReducer from './slices/blogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bankingPartners: bankingPartnersReducer,
    platformStats: platformStatsReducer,
    loanComparison: loanComparisonReducer,
    testimonials: testimonialsReducer,
    faqs: faqsReducer,
    blogs: blogsReducer,
    loanBanner: loanBannerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
