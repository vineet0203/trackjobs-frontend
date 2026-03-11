import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import scheduleService from "../../../features/schedule/services/scheduleService";

// ===== ASYNC THUNKS =====

export const fetchSchedules = createAsyncThunk(
  "schedules/fetchSchedules",
  async (
    { page = 1, perPage = 15, filters = {}, sort = {} } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        per_page: perPage,
        ...filters,
        sort_by: sort.field,
        sort_direction: sort.direction,
      };
      const response = await scheduleService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch schedules"
      );
    }
  }
);

export const createSchedule = createAsyncThunk(
  "schedules/createSchedule",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const newSchedule = await scheduleService.create(scheduleData);
      return newSchedule;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create schedule"
      );
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  "schedules/deleteSchedule",
  async (id, { rejectWithValue }) => {
    try {
      await scheduleService.deleteSchedule(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete schedule"
      );
    }
  }
);

// ===== INITIAL STATE =====

const initialState = {
  schedules: [],
  currentSchedule: null,
  pagination: {
    total: 0,
    perPage: 15,
    currentPage: 1,
    totalPages: 1,
    from: null,
    to: null,
  },
  loading: false,
  error: null,
  filters: {
    search: "",
    status: "",
    priority: "",
  },
  sort: {
    field: "start_datetime",
    direction: "desc",
  },
};

// ===== SLICE =====

const scheduleSlice = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPerPage: (state, action) => {
      state.pagination.perPage = action.payload;
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sort = initialState.sort;
      state.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = [action.payload, ...state.schedules];
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete schedule
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter((s) => s.id !== action.payload);
      });
  },
});

export const {
  setFilters,
  setSort,
  setCurrentPage,
  setPerPage,
  clearError,
  resetFilters,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
