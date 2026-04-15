import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogService, Blog, CreateBlogDto, UpdateBlogDto } from '@/services/blogService';

interface BlogsState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  blogs: [],
  loading: false,
  error: null,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetch',
  async (params?: { isPopular?: boolean; isActive?: boolean }) => {
    const data = await blogService.getAll(params);
    return data;
  }
);

export const addBlog = createAsyncThunk(
  'blogs/add',
  async (blog: CreateBlogDto) => {
    const data = await blogService.create(blog);
    return data;
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/update',
  async ({ id, data }: { id: string; data: UpdateBlogDto }) => {
    const response = await blogService.update(id, data);
    return response;
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/delete',
  async (id: string) => {
    await blogService.delete(id);
    return id;
  }
);

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        // Fetch
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      })
      // Add
      .addCase(addBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
      })
      // Update
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b.id !== action.payload);
      });
  },
});

export default blogsSlice.reducer;
