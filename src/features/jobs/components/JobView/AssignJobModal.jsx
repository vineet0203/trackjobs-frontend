import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import employeeService from '../../../employees/services/employeeService';
import jobService from '../../services/jobService';
import { useToast } from '../../../../components/common/ToastProvider';

const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

const AssignJobModal = ({ open, onClose, jobData, onAssigned }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [shift, setShift] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      fetchEmployees();
      setSelectedEmployee('');
      setShift('');
      setErrors({});
    }
  }, [open]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeService.getAll({ per_page: 100 });
      setEmployees(response.data || []);
    } catch (error) {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedEmployee) newErrors.employee = 'Please select an employee';
    if (!shift) newErrors.shift = 'Please select a shift';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await jobService.assignJob(jobData.id, {
        employee_id: selectedEmployee,
        shift,
      });
      showToast('Job assigned successfully', 'success');
      onAssigned?.();
      onClose();
      navigate('/jobs');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to assign job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>Assign Job</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Job Name"
            value={jobData?.title || ''}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
          />

          <TextField
            select
            label="Assign To"
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              setErrors((prev) => ({ ...prev, employee: '' }));
            }}
            error={!!errors.employee}
            helperText={errors.employee}
            fullWidth
            size="small"
            disabled={loadingEmployees}
            InputProps={{
              endAdornment: loadingEmployees ? <CircularProgress size={20} /> : null,
            }}
          >
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.firstName || emp.first_name} {emp.lastName || emp.last_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Select Shift"
            value={shift}
            onChange={(e) => {
              setShift(e.target.value);
              setErrors((prev) => ({ ...prev, shift: '' }));
            }}
            error={!!errors.shift}
            helperText={errors.shift}
            fullWidth
            size="small"
          >
            {SHIFT_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={submitting}
        >
          {submitting ? 'Assigning...' : 'Assign Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignJobModal;
