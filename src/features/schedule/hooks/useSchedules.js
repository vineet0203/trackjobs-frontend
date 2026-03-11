import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSchedules,
  createSchedule,
  deleteSchedule,
  setFilters,
  setSort,
  setCurrentPage,
  setPerPage,
  clearError,
  resetFilters,
} from "../../../store/slices/features/scheduleSlice";
import { useToast } from "../../../components/common/ToastProvider";

export const useSchedules = ({ autoFetch = true } = {}) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { schedules, pagination, loading, error, filters, sort } = useSelector(
    (state) => state.schedules
  );

  const isFirstMount = useRef(true);
  const fetchInProgressRef = useRef(false);

  const fetchSchedulesData = useCallback(async () => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;

    try {
      await dispatch(
        fetchSchedules({
          page: pagination.currentPage,
          perPage: pagination.perPage,
          filters,
          sort,
        })
      ).unwrap();
    } catch (err) {
      console.error("Error fetching schedules:", err);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [dispatch, pagination.currentPage, pagination.perPage, filters, sort]);

  useEffect(() => {
    if (!autoFetch) return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchSchedulesData();
    } else {
      fetchSchedulesData();
    }
  }, [autoFetch, fetchSchedulesData]);

  return {
    schedules,
    loading,
    error,
    pagination,
    filters,
    sort,
    handleSearch: (term) => dispatch(setFilters({ search: term })),
    handleFilterChange: (filterObj) => dispatch(setFilters(filterObj)),
    handlePageChange: (event, newPage) => dispatch(setCurrentPage(newPage + 1)),
    handleSetPerPage: (perPage) => dispatch(setPerPage(perPage)),
    handleSortChange: (sortObj) => dispatch(setSort(sortObj)),
    handleResetFilters: () => dispatch(resetFilters()),
    handleClearError: () => dispatch(clearError()),
    refreshSchedules: fetchSchedulesData,
    handleCreateSchedule: async (data) => {
      try {
        await dispatch(createSchedule(data)).unwrap();
        showToast("Schedule created successfully", "success");
        return true;
      } catch (err) {
        showToast(err || "Failed to create schedule", "error");
        return false;
      }
    },
    handleDeleteSchedule: async (id) => {
      try {
        await dispatch(deleteSchedule(id)).unwrap();
        showToast("Schedule deleted successfully", "success");
        return true;
      } catch (err) {
        showToast(err || "Failed to delete schedule", "error");
        return false;
      }
    },
  };
};
