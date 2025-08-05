import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.request(config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      throw new Error(message);
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: { email, password },
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data: userData,
    });
  }

  async getCurrentUser() {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }

  // Prenup endpoints
  async getPrenups() {
    return this.request({
      method: 'GET',
      url: '/prenups',
    });
  }

  async getPrenup(id: string) {
    return this.request({
      method: 'GET',
      url: `/prenups/${id}`,
    });
  }

  async createPrenup(data: { title: string; state: string }) {
    return this.request({
      method: 'POST',
      url: '/prenups',
      data,
    });
  }

  async updatePrenup(id: string, data: any) {
    return this.request({
      method: 'PUT',
      url: `/prenups/${id}`,
      data,
    });
  }

  async invitePartner(prenupId: string, email: string) {
    return this.request({
      method: 'POST',
      url: `/prenups/${prenupId}/invite-partner`,
      data: { email },
    });
  }

  async getStateRequirements(state: string) {
    return this.request({
      method: 'GET',
      url: `/prenups/states/${state}/requirements`,
    });
  }

  // Financial disclosure endpoints
  async getFinancialDisclosure(prenupId: string) {
    return this.request({
      method: 'GET',
      url: `/financial/${prenupId}`,
    });
  }

  async saveFinancialDisclosure(data: any) {
    return this.request({
      method: 'POST',
      url: '/financial',
      data,
    });
  }

  async getFinancialSummary(prenupId: string) {
    return this.request({
      method: 'GET',
      url: `/financial/${prenupId}/summary`,
    });
  }

  async generateFinancialReport(prenupId: string) {
    return this.request({
      method: 'GET',
      url: `/financial/${prenupId}/report`,
    });
  }

  // Document endpoints
  async uploadDocument(prenupId: string, file: File, type?: string) {
    const formData = new FormData();
    formData.append('document', file);
    if (type) formData.append('type', type);

    return this.request({
      method: 'POST',
      url: `/documents/upload/${prenupId}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getDocuments(prenupId: string) {
    return this.request({
      method: 'GET',
      url: `/documents/${prenupId}`,
    });
  }

  async downloadDocument(documentId: string) {
    const response = await this.api.get(`/documents/download/${documentId}`, {
      responseType: 'blob',
    });
    return response;
  }

  async deleteDocument(documentId: string) {
    return this.request({
      method: 'DELETE',
      url: `/documents/${documentId}`,
    });
  }
}

export const apiService = new ApiService();