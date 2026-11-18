import axios, { AxiosError } from 'axios';
import { IssueResponse, VerifyResponse, RevokeRequest, RevokeResponse } from '../types';

/**
 * Axios instance configured for TrustDoc API.
 * In development, Vite proxies '/api' to 'http://localhost:8000'.
 * An optional VITE_API_URL can override the base URL if needed.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    Accept: 'application/json',
  },
  timeout: 45000,
});

/**
 * Helper to extract user-friendly error message from Axios errors.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ message?: string; detail?: string | { msg?: string }[] }>;
    if (axiosErr.response?.data) {
      if (typeof axiosErr.response.data === 'string') {
        return axiosErr.response.data;
      }
      if (axiosErr.response.data.message) {
        return axiosErr.response.data.message;
      }
      if (typeof axiosErr.response.data.detail === 'string') {
        return axiosErr.response.data.detail;
      }
      if (Array.isArray(axiosErr.response.data.detail) && axiosErr.response.data.detail.length > 0) {
        return axiosErr.response.data.detail[0].msg || 'Validation error';
      }
    }
    if (axiosErr.message === 'Network Error') {
      return 'Cannot connect to backend server. Ensure backend is running at http://localhost:8000';
    }
    return axiosErr.message || 'An error occurred during the request.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

/**
 * Issues and stamps a PDF document.
 * Endpoint: POST /api/v1/issue
 * Sends FormData with 'file' field.
 */
export async function issueDocument(file: File): Promise<IssueResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<IssueResponse>('/api/v1/issue', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Verifies a PDF document by uploading its content.
 * Endpoint: POST /api/v1/verify
 * Sends FormData with 'file' field.
 */
export async function verifyDocument(file: File): Promise<VerifyResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<VerifyResponse>('/api/v1/verify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Verifies a document by its unique UUID.
 * Endpoint: GET /api/v1/verify/{document_id}
 */
export async function verifyDocumentById(documentId: string): Promise<VerifyResponse> {
  const response = await apiClient.get<VerifyResponse>(`/api/v1/verify/${encodeURIComponent(documentId)}`);
  return response.data;
}

/**
 * Revokes a previously issued document.
 * Endpoint: POST /api/v1/revoke
 * Sends JSON { document_id, reason }
 */
export async function revokeDocument(payload: RevokeRequest): Promise<RevokeResponse> {
  const response = await apiClient.post<RevokeResponse>('/api/v1/revoke', payload);
  return response.data;
}

export default apiClient;
