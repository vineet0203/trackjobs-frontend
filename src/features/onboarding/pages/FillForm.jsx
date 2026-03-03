// features/onboarding/pages/FillForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Snackbar,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SendIcon from '@mui/icons-material/Send';
import ConsentHomecareForm from '../components/ConsentHomecareForm';
import onboardingService from '../services/onboardingService';
import { generateFilledPdf, pdfBytesToBlob, downloadPdfBlob } from '../utils/pdfGenerator';

const FillForm = () => {
  const { token } = useParams();

  // State
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({});
  const [signatures, setSignatures] = useState({});

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        setLoading(true);
        const response = await onboardingService.getByToken(token);
        if (response.success && response.data) {
          setAssignment(response.data);
          // Pre-fill employee name if available
          setFormData((prev) => ({
            ...prev,
            clientName: response.data.employee_name || '',
            agreementClientName: response.data.employee_name || '',
          }));
        } else {
          setError(response.message || 'Invalid link.');
        }
      } catch (err) {
        const msg =
          err.response?.data?.message || 'This link is invalid or has expired.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  // Validate required fields
  const validateForm = useCallback(() => {
    const required = ['clientName', 'address', 'phoneNumber', 'agreementClientName', 'startDate'];
    const missing = required.filter((f) => !formData[f]?.trim());

    if (missing.length > 0) {
      return `Please fill in: ${missing.join(', ')}`;
    }

    if (!signatures.clientSignature) {
      return 'Client signature on Page 1 is required.';
    }
    if (!signatures.clientSignaturePage2) {
      return 'Client signature on Page 2 is required.';
    }

    return null;
  }, [formData, signatures]);

  // Submit handler
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSnackbar({ open: true, message: validationError, severity: 'warning' });
      return;
    }

    try {
      setSubmitting(true);

      // Try to load the template PDF to fill
      // The template file_name comes from the assignment data
      let pdfBlob;

      try {
        // Fetch the blank template PDF from public folder
        const templateFileName = assignment?.template?.file_name || 'consent-homecare-service.pdf';
        const templateUrl = `/templates/${templateFileName}`;
        const templateResponse = await fetch(templateUrl);

        if (templateResponse.ok) {
          const templateBytes = await templateResponse.arrayBuffer();
          const filledPdfBytes = await generateFilledPdf(templateBytes, formData, signatures);
          pdfBlob = pdfBytesToBlob(filledPdfBytes);
        } else {
          // Fallback: generate a simple PDF with just the form data
          console.warn('Template PDF not found, generating standalone PDF');
          pdfBlob = await generateStandalonePdf(formData, signatures);
        }
      } catch (pdfError) {
        console.warn('PDF generation from template failed, using standalone:', pdfError);
        pdfBlob = await generateStandalonePdf(formData, signatures);
      }

      // Submit to backend
      const response = await onboardingService.submitForm(token, pdfBlob);

      if (response.success) {
        setSubmitted(true);
        setSnackbar({ open: true, message: 'Form submitted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: response.message || 'Submission failed.', severity: 'error' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render states ───

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f7fa' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography color="text.secondary">Validating your link...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f7fa' }}>
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Link Unavailable
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f7fa' }}>
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Form Submitted!
          </Typography>
          <Typography color="text.secondary">
            Thank you, {assignment?.employee_name}. Your onboarding form has been submitted successfully.
            You may close this tab.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7fa', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a5f' }}>
            TrackJobs
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, color: '#555' }}>
            {assignment?.template?.name || 'Onboarding Document'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Hello <strong>{assignment?.employee_name}</strong> — please fill in all sections below and sign where indicated.
          </Typography>
          {assignment?.expires_at && (
            <Alert severity="info" sx={{ mt: 1.5, display: 'inline-flex' }}>
              This form expires on {new Date(assignment.expires_at).toLocaleString()}
            </Alert>
          )}
        </Paper>

        {/* Form */}
        <ConsentHomecareForm
          formData={formData}
          onChange={setFormData}
          signatures={signatures}
          onSignatureChange={setSignatures}
          disabled={submitting}
        />

        {/* Submit */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              px: 5,
              py: 1.5,
              bgcolor: '#3574BB',
              '&:hover': { bgcolor: '#2a5e9a' },
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </Box>

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
    </Box>
  );
};

/**
 * Fallback: create a standalone PDF with form data if template is unavailable.
 */
async function generateStandalonePdf(formData, signatures) {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ─── Page 1 ───
  const page1 = pdfDoc.addPage([612, 792]); // Letter size
  let y = 750;
  const leftMargin = 50;

  page1.drawText('Consent for Homecare Service', { x: leftMargin, y, size: 18, font: boldFont, color: rgb(0.12, 0.23, 0.37) });
  y -= 30;

  const fields1 = [
    ['Full Name', formData.clientName],
    ['Address', formData.address],
    ['Phone Number', formData.phoneNumber],
    ['Date of Birth', formData.dateOfBirth],
    ['Emergency Contact', formData.emergencyContact],
    ['Emergency Phone', formData.emergencyPhone],
    ['Initials', formData.consentInitials],
    ['Date', formData.signatureDate],
    ['Witness Name', formData.witnessName],
  ];

  for (const [label, value] of fields1) {
    if (value) {
      page1.drawText(`${label}: ${value}`, { x: leftMargin, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 20;
    }
  }

  // Consent checkboxes
  const consents = [
    ['Personal Care', formData.consentPersonalCare],
    ['Medication', formData.consentMedication],
    ['Emergency', formData.consentEmergency],
    ['Privacy', formData.consentPrivacy],
  ];
  y -= 10;
  for (const [label, checked] of consents) {
    page1.drawText(`[${checked ? 'X' : ' '}] Consent - ${label}`, { x: leftMargin, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 18;
  }

  // Embed client signature on page 1 if available
  if (signatures.clientSignature) {
    try {
      const base64 = signatures.clientSignature.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const image = await pdfDoc.embedPng(bytes);
      const dims = image.scaleToFit(200, 60);
      y -= 20;
      page1.drawText('Client Signature:', { x: leftMargin, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
      y -= dims.height + 5;
      page1.drawImage(image, { x: leftMargin, y, width: dims.width, height: dims.height });
      y -= 10;
    } catch (e) {
      console.error('Failed to embed client signature:', e);
    }
  }

  // ─── Page 2 ───
  const page2 = pdfDoc.addPage([612, 792]);
  y = 750;

  page2.drawText('Client Agreement', { x: leftMargin, y, size: 18, font: boldFont, color: rgb(0.12, 0.23, 0.37) });
  y -= 30;

  const fields2 = [
    ['Client Name', formData.agreementClientName],
    ['Service Plan', formData.servicePlan],
    ['Start Date', formData.startDate],
    ['Rate Per Hour', formData.ratePerHour ? `$${formData.ratePerHour}` : null],
    ['Hours Per Week', formData.hoursPerWeek],
    ['Date', formData.datePage2],
    ['Representative Name', formData.representativeName],
  ];

  for (const [label, value] of fields2) {
    if (value) {
      page2.drawText(`${label}: ${value}`, { x: leftMargin, y, size: 11, font, color: rgb(0, 0, 0) });
      y -= 20;
    }
  }

  // Embed client signature on page 2
  if (signatures.clientSignaturePage2) {
    try {
      const base64 = signatures.clientSignaturePage2.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const image = await pdfDoc.embedPng(bytes);
      const dims = image.scaleToFit(200, 60);
      y -= 20;
      page2.drawText('Client Signature:', { x: leftMargin, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
      y -= dims.height + 5;
      page2.drawImage(image, { x: leftMargin, y, width: dims.width, height: dims.height });
    } catch (e) {
      console.error('Failed to embed page2 signature:', e);
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

export default FillForm;
