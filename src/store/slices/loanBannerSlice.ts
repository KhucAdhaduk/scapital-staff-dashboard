import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loanBannerService, LoanBanner } from '@/services/loanBannerService';
export type { LoanBanner };

interface LoanBannerState {
  banners: LoanBanner[];
  loading: boolean;
  error: string | null;
}

const initialState: LoanBannerState = {
  banners: [],
  loading: false,
  error: null,
};

export const fetchLoanBanners = createAsyncThunk(
  'loanBanner/fetch',
  async () => {
    const data = await loanBannerService.getAll();
    return data;
  }
);

export const addBanner = createAsyncThunk(
  'loanBanner/add',
  async (banner: Omit<LoanBanner, 'id'>, { rejectWithValue }) => {
    try {
      const data = await loanBannerService.create(banner);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'loanBanner/update',
  async ({ id, data }: { id: string; data: Partial<LoanBanner> }, { rejectWithValue }) => {
    try {
      const response = await loanBannerService.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'loanBanner/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await loanBannerService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete banner');
    }
  }
);

const loanBannerSlice = createSlice({
  name: 'loanBanner',
  initialState,
  reducers: {
    setBanners(state, action: PayloadAction<LoanBanner[]>) {
        state.banners = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchLoanBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoanBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchLoanBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch banners';
      })
      // Add
      .addCase(addBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload);
      })
      .addCase(addBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((b) => b.id !== action.payload);
      });
  },
});

export const { setBanners } = loanBannerSlice.actions;
export default loanBannerSlice.reducer;
