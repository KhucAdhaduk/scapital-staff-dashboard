import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { platformStatsService, PlatformStat } from '@/services/platformStatsService';
export type StatItem = PlatformStat;
import { sectionContentService, SectionContent } from '@/services/sectionContentService';

interface PlatformStatsState {
  sectionContent: SectionContent | null;
  stats: PlatformStat[];
  loading: boolean;
  error: string | null;
}

const initialState: PlatformStatsState = {
  sectionContent: null,
  stats: [],
  loading: false,
  error: null,
};

export const fetchPlatformStats = createAsyncThunk(
  'platformStats/fetch',
  async () => {
    const data = await platformStatsService.getAll();
    return data;
  }
);

export const fetchStatsSectionContent = createAsyncThunk(
    'platformStats/fetchContent',
    async () => {
        try {
            const data = await sectionContentService.getSection('platform-stats');
            return data;
        } catch (error) {
            return null;
        }
    }
);

export const addStat = createAsyncThunk(
  'platformStats/add',
  async (stat: Omit<PlatformStat, 'id'>) => {
    const data = await platformStatsService.create(stat);
    return data;
  }
);

export const updateStat = createAsyncThunk(
  'platformStats/update',
  async ({ id, data }: { id: string; data: Partial<PlatformStat> }) => {
    const response = await platformStatsService.update(id, data);
    return response;
  }
);

export const deleteStat = createAsyncThunk(
  'platformStats/delete',
  async (id: string) => {
    await platformStatsService.delete(id);
    return id;
  }
);

export const updateSectionSettings = createAsyncThunk(
    'platformStats/updateContent',
    async (data: SectionContent) => {
        const response = await sectionContentService.updateSection('platform-stats', data);
        return response;
    }
);

const platformStatsSlice = createSlice({
  name: 'platformStats',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<PlatformStat[]>) => {
      state.stats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchPlatformStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPlatformStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch stats';
      })
      // Fetch Content
      .addCase(fetchStatsSectionContent.fulfilled, (state, action) => {
          if (action.payload) state.sectionContent = action.payload;
      })
      // Add Stat
      .addCase(addStat.fulfilled, (state, action) => {
        state.stats.push(action.payload);
      })
      // Update Stat
      .addCase(updateStat.fulfilled, (state, action) => {
        const index = state.stats.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.stats[index] = action.payload;
        }
      })
      // Delete Stat
      .addCase(deleteStat.fulfilled, (state, action) => {
        state.stats = state.stats.filter((s) => s.id !== action.payload);
      })
      // Update Content
       .addCase(updateSectionSettings.fulfilled, (state, action) => {
            state.sectionContent = action.payload;
        });
  },
});

export const { setStats } = platformStatsSlice.actions;

export default platformStatsSlice.reducer;
