import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { faqService, FAQ } from '@/services/faqService';
export type { FAQ };
interface FAQsState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
}

const initialState: FAQsState = {
  faqs: [],
  loading: false,
  error: null,
};

export const fetchFAQs = createAsyncThunk(
  'faqs/fetch',
  async () => {
    const data = await faqService.getAll();
    return data;
  }
);



export const addFAQ = createAsyncThunk(
  'faqs/add',
  async (faq: Omit<FAQ, 'id'>) => {
    const data = await faqService.create(faq);
    return data;
  }
);

export const updateFAQ = createAsyncThunk(
  'faqs/update',
  async ({ id, data }: { id: string; data: Partial<FAQ> }) => {
    const response = await faqService.update(id, data);
    return response;
  }
);

export const deleteFAQ = createAsyncThunk(
  'faqs/delete',
  async (id: string) => {
    await faqService.delete(id);
    return id;
  }
);



const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        // Fetch
      .addCase(fetchFAQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFAQs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
      })
      .addCase(fetchFAQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch FAQs';
      })
// Reducers will be simplified
      // Add
      .addCase(addFAQ.fulfilled, (state, action) => {
        state.faqs.push(action.payload);
      })
      // Update
      .addCase(updateFAQ.fulfilled, (state, action) => {
        const index = state.faqs.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.faqs[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteFAQ.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter((f) => f.id !== action.payload);
      });
  },
});

export const { } = faqsSlice.actions;

export default faqsSlice.reducer;
