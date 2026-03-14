// features/employees/hooks/useEmployees.js
import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  setFilters,
  setSort,
  setCurrentPage,
  setPerPage,
  clearCurrentEmployee,
  clearError,
  clearSuccess,
  resetFilters,
} from "../../../store/slices/features/employeeSlice";
import { useToast } from "../../../components/common/ToastProvider";

export const useEmployees = ({ autoFetch = true, limit = 5 } = {}) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const {
    employees,
    currentEmployee,
    pagination,
    loading,
    error,
    success,
    filters,
    sort,
  } = useSelector((state) => state.employees);

  const [localError, setLocalError] = useState(null);
  
  // Use refs to track if this is the first mount
  const isFirstMount = useRef(true);
  const fetchInProgressRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  /* ---------------------------------------------------------
     FETCH EMPLOYEES FUNCTION
  --------------------------------------------------------- */
  const fetchEmployeesData = useCallback(async () => {
    if (fetchInProgressRef.current) return;

    fetchInProgressRef.current = true;

    try {
      await dispatch(
        fetchEmployees({
          page: pagination.currentPage,
          perPage: pagination.perPage,
          filters,
          sort,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [dispatch, pagination.currentPage, pagination.perPage, filters, sort]);

  /* ---------------------------------------------------------
     AUTO FETCH EMPLOYEES - FIXED
  --------------------------------------------------------- */
  useEffect(() => {
    if (!autoFetch) return;
    
    // Only fetch on mount and when dependencies change
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchEmployeesData();
    } else {
      fetchEmployeesData();
    }
  }, [
    pagination.currentPage,
    pagination.perPage,
    filters,
    sort,
    autoFetch,
    fetchEmployeesData,
  ]);

  /* ---------------------------------------------------------
     FILTER / SEARCH / SORT HANDLERS
  --------------------------------------------------------- */
  const handleSearch = useCallback(
    (searchTerm) => {
      dispatch(setFilters({ search: searchTerm }));
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleSort = useCallback(
    (field, direction) => {
      dispatch(setSort({ field, direction }));
    },
    [dispatch]
  );

  const handlePageChange = useCallback(
    (event, newPage) => {
      dispatch(setCurrentPage(newPage + 1));
    },
    [dispatch]
  );

  const handleSetPerPage = useCallback(
    (perPage) => {
      dispatch(setPerPage(perPage));
    },
    [dispatch]
  );

  const refresh = useCallback(() => {
    fetchEmployeesData();
  }, [fetchEmployeesData]);

  /* ---------------------------------------------------------
     CRUD OPERATIONS
  --------------------------------------------------------- */
  const getEmployee = useCallback(
    async (id) => {
      try {
        return await dispatch(fetchEmployeeById(id)).unwrap();
      } catch (err) {
        const msg = err?.message || err?.data?.message || "Failed to fetch employee";
        setLocalError(msg);
        showToast(msg, "error");
        throw new Error(msg);
      }
    },
    [dispatch, showToast]
  );

  const createEmployeeHandler = useCallback(
    async (data) => {
      try {
        const result = await dispatch(createEmployee(data)).unwrap();
        showToast("Employee created successfully", "success");
        setTimeout(() => refresh(), 500);
        return result;
      } catch (err) {
        const msg = err?.message || err?.data?.message || "Failed to create employee";
        setLocalError(msg);
        showToast(msg, "error");
        throw err;
      }
    },
    [dispatch, refresh, showToast]
  );

  const updateEmployeeHandler = useCallback(
    async (id, data) => {
      try {
        const result = await dispatch(updateEmployee({ id, data })).unwrap();
        showToast("Employee updated successfully", "success");
        refresh();
        return result;
      } catch (err) {
        const msg = err?.message || err?.data?.message || "Failed to update employee";
        setLocalError(msg);
        showToast(msg, "error");
        throw err;
      }
    },
    [dispatch, showToast]
  );

  const deleteEmployeeHandler = useCallback(
    async (id) => {
      try {
        await dispatch(deleteEmployee(id)).unwrap();
        showToast("Employee deleted successfully", "success");
        refresh();
      } catch (err) {
        const msg = err?.message || err?.data?.message || "Failed to delete employee";
        setLocalError(msg);
        showToast(msg, "error");
        throw err;
      }
    },
    [dispatch, refresh, showToast]
  );

  /* ---------------------------------------------------------
     FILTER UTILITIES
  --------------------------------------------------------- */
  const updateFilters = useCallback(
    (newFilters) => dispatch(setFilters(newFilters)),
    [dispatch]
  );

  const updateSort = useCallback(
    (field, direction) => dispatch(setSort({ field, direction })),
    [dispatch]
  );

  const setPage = useCallback(
    (page) => dispatch(setCurrentPage(page)),
    [dispatch]
  );

  const resetAllFilters = useCallback(() => {
    dispatch(resetFilters());
    dispatch(setCurrentPage(1));
  }, [dispatch]);

  /* ---------------------------------------------------------
     CLEAR HELPERS
  --------------------------------------------------------- */
  const clearCurrent = useCallback(
    () => dispatch(clearCurrentEmployee()),
    [dispatch]
  );

  const clearEmployeeError = useCallback(() => {
    setLocalError(null);
    dispatch(clearError());
  }, [dispatch]);

  const clearEmployeeSuccess = useCallback(
    () => dispatch(clearSuccess()),
    [dispatch]
  );

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */
  const getEmployeesByDepartment = useCallback(
    (department) => employees.filter((e) => e.department === department),
    [employees]
  );

  const getEmployeesByDesignation = useCallback(
    (designation) => employees.filter((e) => e.designation === designation),
    [employees]
  );

  const getActiveEmployees = useCallback(
    () => employees.filter((e) => e.is_active),
    [employees]
  );

  const getInactiveEmployees = useCallback(
    () => employees.filter((e) => !e.is_active),
    [employees]
  );

  /* ---------------------------------------------------------
     RETURN API
  --------------------------------------------------------- */
  return {
    // State
    employees,
    currentEmployee,
    loading,
    error: error || localError,
    success,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.total,
      perPage: pagination.perPage,
      from: pagination.from,
      to: pagination.to,
    },
    filters,
    sort,
    
    // Employee operations
    loadEmployees: refresh,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    handleSort,
    handleSetPerPage,
    refresh,
    getEmployee,
    createEmployee: createEmployeeHandler,
    updateEmployee: updateEmployeeHandler,
    deleteEmployee: deleteEmployeeHandler,
    
    // Filter utilities
    updateFilters,
    updateSort,
    setPage,
    setPerPage: handleSetPerPage,
    resetFilters: resetAllFilters,
    
    // Derived data
    getEmployeesByDepartment,
    getEmployeesByDesignation,
    getActiveEmployees,
    getInactiveEmployees,
    
    // Clear functions
    clearCurrent,
    clearError: clearEmployeeError,
    clearSuccess: clearEmployeeSuccess,
  };
};