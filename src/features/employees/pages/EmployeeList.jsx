// features/employees/pages/EmployeeList.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Fade } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useEmployees } from "../hooks/useEmployees";
import EmployeeTable from "../components/EmployeeTable/EmployeeTable";
import EmployeeModal from "../components/EmployeeModal/EmployeeModal";
import PageHeader from "../../../components/common/PageHeader";
import TableSkeleton from "../../../components/common/Loader/TableSkeleton";
import ErrorAlert from "../../../components/feedback/ErrorAlert";
import HeaderSearch from "../../../components/common/HeaderSearch";
import CustomButton from "../../../components/common/CustomButton";

const EmployeeList = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  
  // Track loading states for smooth transitions
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [showRefreshSkeleton, setShowRefreshSkeleton] = useState(false);

  const searchDebounceRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  const {
    employees,
    loading,
    error,
    pagination,
    filters,
    handleSearch,
    handlePageChange: hookHandlePageChange,
    handleSetPerPage,
    refresh,
    clearError,
    deleteEmployee,
  } = useEmployees({ autoFetch: true, limit: 5 });

  // Handle search with debounce
  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        setShowRefreshSkeleton(true);
        handleSearch(value);
        setSelectAll(false);
        setSelectedEmployees([]);
      }, 500);
    },
    [handleSearch]
  );

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setShowRefreshSkeleton(true);
    hookHandlePageChange(null, page - 1);
    setSelectAll(false);
    setSelectedEmployees([]);
  }, [hookHandlePageChange]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((event) => {
    const newPerPage = parseInt(event.target.value, 10);
    console.log('Changing rows per page to:', newPerPage);
    if (handleSetPerPage) {
      setShowRefreshSkeleton(true);
      handleSetPerPage(newPerPage);
      setSelectAll(false);
      setSelectedEmployees([]);
    }
  }, [handleSetPerPage]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Sync search input with filter value
  useEffect(() => {
    if (filters?.search !== undefined) {
      setSearchInput(filters.search || '');
    }
  }, [filters?.search]);

  // Handle loading states
  useEffect(() => {
    if (loading) {
      if (employees.length > 0) {
        setShowRefreshSkeleton(true);
      } else {
        setShowInitialSkeleton(true);
      }
    } else {
      refreshTimeoutRef.current = setTimeout(() => {
        setShowInitialSkeleton(false);
        setShowRefreshSkeleton(false);
      }, 300);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loading, employees.length]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((emp) => emp.id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelectEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedEmployeeId(null);
    setModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (employeeId) => {
    setModalMode("edit");
    setSelectedEmployeeId(employeeId);
    setModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployeeId(null);
  };

  // Handle success after modal operation
  const handleModalSuccess = () => {
    refresh();
    setSelectAll(false);
    setSelectedEmployees([]);
  };

  // Handle delete
  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(employeeId);
    }
  };

  // Update selectAll when employees change
  useEffect(() => {
    if (employees.length > 0 && selectedEmployees.length === employees.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [employees, selectedEmployees]);

  return (
    <div className="min-h-full bg-gray-50">
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Employees", current: true },
        ]}
        title="Employees"
        subtitle="Manage employees, roles, and information in one place."
        actions={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <HeaderSearch
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search employees..."
            />
            <CustomButton
              label="New Employee"
              onClick={handleOpenCreateModal}
              icon={Add}
            />
          </Box>
        }
      />

      {error && (
        <ErrorAlert
          message={error}
          onRetry={refresh}
          onClose={clearError}
          className="mb-6"
        />
      )}

      <div className="bg-white rounded-lg mt-6">
        {/* Initial load skeleton */}
        {showInitialSkeleton && (
          <Fade in={showInitialSkeleton} timeout={300}>
            <Box>
              <TableSkeleton
                rows={pagination?.perPage || 5}
                columns={7}
                hasCheckbox={true}
                hasAvatar={true}
                hasStatus={true}
                showPagination={true}
              />
            </Box>
          </Fade>
        )}

        {/* Main content */}
        {!showInitialSkeleton && (
          <Box sx={{ position: 'relative' }}>
            {/* Main table */}
            <EmployeeTable
              employees={employees}
              selectedEmployees={selectedEmployees}
              onSelectEmployee={handleSelectEmployee}
              onSelectAll={handleSelectAll}
              selectAll={selectAll}
              onPageChange={handlePageChange}
              currentPage={pagination?.currentPage || 1}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.totalItems || 0}
              itemsPerPage={pagination?.perPage || 5}
              onRowsPerPageChange={handleRowsPerPageChange}
              showPagination={true}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />

            {/* Refresh skeleton overlay */}
            {showRefreshSkeleton && (
              <Fade in={showRefreshSkeleton} timeout={300}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'white',
                    zIndex: 10,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <TableSkeleton
                    rows={pagination?.perPage || 5}
                    columns={7}
                    hasCheckbox={true}
                    hasAvatar={true}
                    hasStatus={true}
                    showPagination={true}
                  />
                </Box>
              </Fade>
            )}
          </Box>
        )}
      </div>

      {/* Employee Modal for Create/Edit */}
      <EmployeeModal
        open={modalOpen}
        onClose={handleCloseModal}
        employeeId={selectedEmployeeId}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default EmployeeList;