// features/onboarding/services/onboardingService.js
import httpClient from '../../../services/api/httpClient';
import { publicClient } from '../../../services/api/httpClient';

const PROTECTED_BASE = '/api/v1/onboarding';
const PUBLIC_BASE = '/api/v1/onboarding';

const onboardingService = {
  // ============================================
  // PROTECTED (vendor auth required)
  // ============================================

  /** Get all active document templates */
  async getTemplates() {
    const response = await httpClient.get(`${PROTECTED_BASE}/templates`);
    return response.data;
  },

  /** Assign a document to an employee */
  async assignDocument(data) {
    const response = await httpClient.post(`${PROTECTED_BASE}/assign`, data);
    return response.data;
  },

  /** List all assigned documents for current vendor */
  async getAssigned() {
    const response = await httpClient.get(`${PROTECTED_BASE}/assigned`);
    return response.data;
  },

  /** Download completed PDF */
  async downloadPdf(assignmentId) {
    const response = await httpClient.get(`${PROTECTED_BASE}/download/${assignmentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ============================================
  // PUBLIC (token-based, no auth)
  // ============================================

  /** Validate token and get assignment details */
  async getByToken(token) {
    const response = await publicClient.get(`${PUBLIC_BASE}/${token}`);
    return response.data;
  },

  /** Submit completed PDF */
  async submitForm(token, pdfBlob) {
    const formData = new FormData();
    formData.append('completed_pdf', pdfBlob, 'completed-form.pdf');

    const response = await publicClient.post(`${PUBLIC_BASE}/${token}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default onboardingService;
