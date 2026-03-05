// features/onboarding/pages/OnboardingAssign.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import onboardingService from '../services/onboardingService';

const OnboardingAssign = () => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    employee_name: '',
    employee_email: '',
    template_id: '',
    customer_id: '',
  });

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await onboardingService.getTemplates();
        if (response.success && response.data) {
          setTemplates(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
        setSnackbar({ open: true, message: 'Failed to load templates.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.employee_name.trim() || !form.employee_email.trim() || !form.template_id) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        employee_name: form.employee_name.trim(),
        employee_email: form.employee_email.trim(),
        template_id: Number(form.template_id),
        ...(form.customer_id ? { customer_id: Number(form.customer_id) } : {}),
      };

      const response = await onboardingService.assignDocument(payload);

      if (response.success) {
        setSnackbar({
          open: true,
          message: `Document assigned! Email sent to ${form.employee_email}.`,
          severity: 'success',
        });
        // Reset form
        setForm({ employee_name: '', employee_email: '', template_id: '', customer_id: '' });
      } else {
        setSnackbar({ open: true, message: response.message || 'Assignment failed.', severity: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign document.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/onboarding')} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Assign Onboarding Document
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Customer Name"
                value={form.employee_name}
                onChange={handleChange('employee_name')}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="email"
                label="Customer Email"
                value={form.employee_email}
                onChange={handleChange('employee_email')}
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="Document Template"
                value={form.template_id}
                onChange={handleChange('template_id')}
                disabled={submitting}
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer ID (Optional)"
                value={form.customer_id}
                onChange={handleChange('customer_id')}
                disabled={submitting}
                type="number"
                helperText="Link to a specific customer if applicable"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={submitting}
                sx={{ py: 1.5, fontWeight: 600 }}
              >
                {submitting ? 'Sending...' : 'Assign & Send Email'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OnboardingAssign;
