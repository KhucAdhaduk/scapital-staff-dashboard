import { Testimonial, testimonialService } from '@/services/testimonialService';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
export type { Testimonial };

// Removed sectionContent
interface TestimonialsState {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
}

const initialState: TestimonialsState = {
  testimonials: [],
  loading: false,
  error: null,
};

export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetch',
  async () => {
    const data = await testimonialService.getAll();
    return data;
  }
);



export const addTestimonial = createAsyncThunk(
  'testimonials/add',
  async (testimonial: Omit<Testimonial, 'id'>) => {
    const data = await testimonialService.create(testimonial);
    return data;
  }
);

export const updateTestimonial = createAsyncThunk(
  'testimonials/update',
  async ({ id, data }: { id: string; data: Partial<Testimonial> }) => {
    const response = await testimonialService.update(id, data);
    return response;
  }
);

export const deleteTestimonial = createAsyncThunk(
  'testimonials/delete',
  async (id: string) => {
    await testimonialService.delete(id);
    return id;
  }
);



const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch testimonials';
      })
      // Add
      .addCase(addTestimonial.fulfilled, (state, action) => {
        state.testimonials.push(action.payload);
      })
      // Update
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        const index = state.testimonials.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.testimonials[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.testimonials = state.testimonials.filter((t) => t.id !== action.payload);
      });
  },
});

export const { } = testimonialsSlice.actions;

export default testimonialsSlice.reducer;
