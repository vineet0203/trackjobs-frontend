import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  TablePagination,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Add, Delete, Visibility } from "@mui/icons-material";
import { CalendarDays } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import HeaderSearch from "../../../components/common/HeaderSearch";
import CustomButton from "../../../components/common/CustomButton";
import { useSchedules } from "../hooks/useSchedules";
import { useToast } from "../../../components/common/ToastProvider";
import CreateScheduleModal from "../components/CreateScheduleModal";
import {
  PRIORITY_COLORS,
  STATUS_COLORS,
} from "../constants/scheduleConstants";
import jobService from "../../jobs/services/jobService";

const formatDateTime = (isoStr) => {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ScheduleDashboard = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    schedules,
    loading,
    error,
    pagination,
    filters,
    handleSearch,
    handlePageChange: hookHandlePageChange,
    handleSetPerPage,
    handleFilterChange,
    refreshSchedules,
    handleDeleteSchedule,
  } = useSchedules({ autoFetch: true });

  const [modalOpen, setModalOpen] = useState(false);
  const [prefillJobData, setPrefillJobData] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const searchDebounceRef = useRef(null);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchInput(value);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    },
    [handleSearch]
  );

  const handlePageChange = useCallback(
    (event, newPage) => {
      hookHandlePageChange(event, newPage);
    },
    [hookHandlePageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      handleSetPerPage(parseInt(event.target.value, 10));
    },
    [handleSetPerPage]
  );

  // Auto-open modal when navigated from Job Details
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    const openCreate = searchParams.get("openCreate");
    if (openCreate === "true" && jobId) {
      jobService.getById(jobId).then((res) => {
        const job = res.data || res;
        setPrefillJobData(job);
        setModalOpen(true);
        setSearchParams({}, { replace: true });
      }).catch(() => {
        showToast("Failed to load job details", "error");
        setSearchParams({}, { replace: true });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenModal = () => {
    setPrefillJobData(null);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setPrefillJobData(null);
  };

  const handleScheduleCreated = () => {
    refreshSchedules();
  };

  const onDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      await handleDeleteSchedule(id);
    }
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const renderSkeletonRows = () =>
    Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={idx}>
        {Array.from({ length: 7 }).map((_, cidx) => (
          <TableCell key={cidx}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));

  return (
    <div className="min-h-full bg-gray-50">
      <PageHeader
        breadcrumb={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Schedule", current: true },
        ]}
        title="Schedule"
        subtitle="Manage and view all scheduled jobs."
        actions={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <HeaderSearch
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search schedules..."
            />
            <CustomButton
              label="Create Schedule"
              onClick={handleOpenModal}
              icon={Add}
            />
          </Box>
        }
      />

      {/* Status filter chips */}
      <Box sx={{ px: 3, pt: 2, pb: 1, display: "flex", gap: 1 }}>
        {["all", "scheduled", "draft", "completed", "cancelled"].map(
          (status) => (
            <Chip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              variant={
                (filters.status === status) ||
                (status === "all" && !filters.status)
                  ? "filled"
                  : "outlined"
              }
              color={
                (filters.status === status) ||
                (status === "all" && !filters.status)
                  ? "primary"
                  : "default"
              }
              onClick={() =>
                handleFilterChange({
                  status: status === "all" ? "" : status,
                })
              }
              size="small"
              sx={{ textTransform: "capitalize", cursor: "pointer" }}
            />
          )
        )}
      </Box>

      {/* Schedule Table */}
      <Box sx={{ px: 3, pt: 1 }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Job</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Crew</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={1}
                    >
                      <CalendarDays size={40} color="#bbb" />
                      <Typography variant="body1" color="text.secondary">
                        No schedules found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create your first schedule to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {schedule.job?.title || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {schedule.job?.job_number || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {schedule.crew?.name || "Unassigned"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(schedule.start_datetime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(schedule.end_datetime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.priority}
                        size="small"
                        sx={{
                          backgroundColor:
                            PRIORITY_COLORS[schedule.priority]?.bg || "#f5f5f5",
                          color:
                            PRIORITY_COLORS[schedule.priority]?.text ||
                            "#757575",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status}
                        size="small"
                        sx={{
                          backgroundColor:
                            STATUS_COLORS[schedule.status]?.bg || "#f5f5f5",
                          color:
                            STATUS_COLORS[schedule.status]?.text || "#757575",
                          fontWeight: 500,
                          textTransform: "capitalize",
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDeleteSchedule(schedule.id)}
                          sx={{ color: "#d32f2f" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!loading && schedules.length > 0 && (
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.currentPage - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.perPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 15, 25]}
            />
          )}
        </TableContainer>
      </Box>

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        open={modalOpen}
        onClose={handleCloseModal}
        jobData={prefillJobData}
        onSuccess={handleScheduleCreated}
      />
    </div>
  );
};

export default ScheduleDashboard;
