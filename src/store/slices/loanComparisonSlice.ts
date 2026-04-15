import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    loanComparisonService, 
    LoanProduct, 
    ComparisonParameter, 
    ComparisonValue 
} from '@/services/loanComparisonService';
import { sectionContentService, SectionContent } from '@/services/sectionContentService';

// Map of parameterId -> productId -> value
export type ComparisonValuesMap = Record<string, Record<string, string>>;

interface LoanComparisonState {
  sectionContent: SectionContent | null;
  products: LoanProduct[];
  parameters: ComparisonParameter[];
  comparisonValues: ComparisonValuesMap;
  loading: boolean;
  error: string | null;
}

const initialState: LoanComparisonState = {
  sectionContent: null,
  products: [],
  parameters: [],
  comparisonValues: {},
  loading: false,
  error: null,
};

// --- Thunks ---

export const fetchComparisonData = createAsyncThunk(
  'loanComparison/fetchAll',
  async () => {
    const [products, parameters, values] = await Promise.all([
      loanComparisonService.getProducts(),
      loanComparisonService.getParameters(),
      loanComparisonService.getValues(),
    ]);
    return { products, parameters, values };
  }
);

export const fetchComparisonSectionContent = createAsyncThunk(
    'loanComparison/fetchContent',
    async () => {
        try {
            const data = await sectionContentService.getSection('loan-comparison');
            return data;
        } catch (error) {
            return null;
        }
    }
);

// Products
export const addProduct = createAsyncThunk(
  'loanComparison/addProduct',
  async (product: Omit<LoanProduct, 'id'>) => {
    const data = await loanComparisonService.createProduct(product);
    return data;
  }
);

export const updateProduct = createAsyncThunk(
  'loanComparison/updateProduct',
  async ({ id, data }: { id: string; data: Partial<LoanProduct> }) => {
    const response = await loanComparisonService.updateProduct(id, data);
    return response;
  }
);

export const deleteProduct = createAsyncThunk(
  'loanComparison/deleteProduct',
  async (id: string) => {
    await loanComparisonService.deleteProduct(id);
    return id;
  }
);

// Parameters
export const addParameter = createAsyncThunk(
  'loanComparison/addParameter',
  async (param: Omit<ComparisonParameter, 'id'>) => {
    const data = await loanComparisonService.createParameter(param);
    return data;
  }
);

export const updateParameter = createAsyncThunk(
  'loanComparison/updateParameter',
  async ({ id, data }: { id: string; data: Partial<ComparisonParameter> }) => {
    const response = await loanComparisonService.updateParameter(id, data);
    return response;
  }
);

export const deleteParameter = createAsyncThunk(
  'loanComparison/deleteParameter',
  async (id: string) => {
    await loanComparisonService.deleteParameter(id);
    return id;
  }
);

// Values
export const updateComparisonValue = createAsyncThunk(
  'loanComparison/updateValue',
  async (data: { productId: string; parameterId: string; value: string }) => {
    const response = await loanComparisonService.updateValue(data);
    return response;
  }
);

export const reorderProducts = createAsyncThunk(
  'loanComparison/reorderProducts',
  async (ids: string[]) => {
    await loanComparisonService.reorderProducts(ids);
    return ids;
  }
);

export const reorderParameters = createAsyncThunk(
  'loanComparison/reorderParameters',
  async (items: { id: string; order: number }[]) => {
    await loanComparisonService.reorderParameters(items);
    return items;
  }
);

export const updateAppContent = createAsyncThunk(
    'loanComparison/updateAppContent',
    async (data: SectionContent) => {
        const response = await sectionContentService.updateSection('loan-comparison', data);
        return response;
    }
);


const loanComparisonSlice = createSlice({
  name: 'loanComparison',
  initialState,
  reducers: {
    setProducts(state, action: { payload: LoanProduct[] }) {
        state.products = action.payload;
    },
    setParameters(state, action: { payload: ComparisonParameter[] }) {
        state.parameters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
        // Fetch All
      .addCase(fetchComparisonData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComparisonData.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.parameters = action.payload.parameters;
        
        // Transform values array to map
        const valuesMap: ComparisonValuesMap = {};
        action.payload.values.forEach((v: ComparisonValue) => {
            if (!valuesMap[v.parameterId]) {
                valuesMap[v.parameterId] = {};
            }
            valuesMap[v.parameterId][v.productId] = v.value;
        });
        state.comparisonValues = valuesMap;
      })
      .addCase(fetchComparisonData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comparison data';
      })

      // Content
      .addCase(fetchComparisonSectionContent.fulfilled, (state, action) => {
          if (action.payload) state.sectionContent = action.payload;
      })
      .addCase(updateAppContent.fulfilled, (state, action) => {
          state.sectionContent = action.payload;
      })

      // Products
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.products[index] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })

      // Parameters
      .addCase(addParameter.fulfilled, (state, action) => {
        state.parameters.push(action.payload);
      })
      .addCase(updateParameter.fulfilled, (state, action) => {
        const index = state.parameters.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.parameters[index] = action.payload;
      })
      .addCase(deleteParameter.fulfilled, (state, action) => {
        state.parameters = state.parameters.filter((p) => p.id !== action.payload);
        if (state.comparisonValues[action.payload]) {
            delete state.comparisonValues[action.payload];
        }
      })

      // Values
      .addCase(updateComparisonValue.fulfilled, (state, action) => {
          const { parameterId, productId, value } = action.payload;
          if (!state.comparisonValues[parameterId]) {
              state.comparisonValues[parameterId] = {};
          }
          state.comparisonValues[parameterId][productId] = value;
      })
      
      // Reorder
      .addCase(reorderProducts.fulfilled, (state, action) => {
        // Optimistic update handled in component
      })
      .addCase(reorderParameters.fulfilled, (state, action) => {
        const orderMap = new Map(action.payload.map(i => [i.id, i.order]));
        state.parameters = state.parameters.map(p => ({
            ...p,
            order: orderMap.get(p.id) ?? p.order
        })).sort((a, b) => a.order - b.order);
      });
  },
});

export const { setProducts, setParameters } = loanComparisonSlice.actions;
export default loanComparisonSlice.reducer;
