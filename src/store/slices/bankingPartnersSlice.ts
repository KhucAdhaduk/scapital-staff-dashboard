import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bankingPartnerService, BankingPartner } from '@/services/bankingPartnerService';
export type { BankingPartner };
interface BankingPartnersState {
  partners: BankingPartner[];
  loading: boolean;
  error: string | null;
}

const initialState: BankingPartnersState = {
  partners: [],
  loading: false,
  error: null,
};

export const fetchBankingPartners = createAsyncThunk(
  'bankingPartners/fetch',
  async () => {
    const data = await bankingPartnerService.getAll();
    return data;
  }
);



export const addPartner = createAsyncThunk(
  'bankingPartners/add',
  async (partner: Omit<BankingPartner, 'id'>) => {
    const data = await bankingPartnerService.create(partner);
    return data;
  }
);

export const updatePartner = createAsyncThunk(
  'bankingPartners/update',
  async ({ id, data }: { id: string; data: Partial<BankingPartner> }) => {
    const response = await bankingPartnerService.update(id, data);
    return response;
  }
);

export const deletePartner = createAsyncThunk(
  'bankingPartners/delete',
  async (id: string) => {
    await bankingPartnerService.delete(id);
    return id;
  }
);



const bankingPartnersSlice = createSlice({
  name: 'bankingPartners',
  initialState,
  reducers: {
    setPartners: (state, action: PayloadAction<BankingPartner[]>) => {
        state.partners = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Partners
      .addCase(fetchBankingPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBankingPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.partners = action.payload;
      })
      .addCase(fetchBankingPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch partners';
      })
      // Add Partner
      .addCase(addPartner.fulfilled, (state, action) => {
        state.partners.push(action.payload);
      })
      // Update Partner
      .addCase(updatePartner.fulfilled, (state, action) => {
        const index = state.partners.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.partners[index] = action.payload;
        }
      })
      // Delete Partner
      .addCase(deletePartner.fulfilled, (state, action) => {
        state.partners = state.partners.filter((p) => p.id !== action.payload);
      });
  },
});

export const { setPartners } = bankingPartnersSlice.actions;

export default bankingPartnersSlice.reducer;
