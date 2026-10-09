// Unified API Client with Automatic Backend Connectivity & Demo Mode Fallback
// Connects to Express/PostgreSQL Backend (http://localhost:5000/api) with seamless LocalStorage fallback

const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('agrisahay_auth_token') : null;
    this.isBackendAvailable = false;
    this.hasCheckedBackend = false;
  }

  setToken(token) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('agrisahay_auth_token', token);
      else localStorage.removeItem('agrisahay_auth_token');
    }
  }

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/ops/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isBackendAvailable = true;
        this.hasCheckedBackend = true;
        return { isOnline: true, data };
      }
    } catch (e) {
      // Backend server is not running
    }
    this.isBackendAvailable = false;
    this.hasCheckedBackend = true;
    return { isOnline: false, message: 'Backend API offline. Operating in resilient client demo mode.' };
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Server request failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  // Authentication
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Farmers
  async getFarmers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/farmers${query ? `?${query}` : ''}`);
  }

  async createFarmer(farmerData) {
    return this.request('/farmers', {
      method: 'POST',
      body: JSON.stringify(farmerData)
    });
  }

  // Loans
  async getLoans(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/loans${query ? `?${query}` : ''}`);
  }

  async originateLoan(loanData) {
    return this.request('/loans', {
      method: 'POST',
      body: JSON.stringify(loanData)
    });
  }

  async sanctionLoan(loanId, sanctionData) {
    return this.request(`/loans/${loanId}/sanction`, {
      method: 'POST',
      body: JSON.stringify(sanctionData)
    });
  }

  // Offline Sync
  async getSyncEvents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/sync/events${query ? `?${query}` : ''}`);
  }

  async postSyncBatch(events) {
    return this.request('/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ events })
    });
  }

  async resolveSyncConflict(resolutionData) {
    return this.request('/sync/resolve-conflict', {
      method: 'POST',
      body: JSON.stringify(resolutionData)
    });
  }

  // Notifications
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationRead(notifId) {
    return this.request(`/notifications/${notifId}/read`, { method: 'PUT' });
  }

  // Pilot Study
  async getPilotAggregates() {
    return this.request('/pilot/aggregates');
  }

  async enrollParticipant(participantData) {
    return this.request('/pilot/participants', {
      method: 'POST',
      body: JSON.stringify(participantData)
    });
  }

  async recordTaskTiming(taskData) {
    return this.request('/pilot/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async submitSUSSurvey(surveyData) {
    return this.request('/pilot/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData)
    });
  }

  // Research Data Export
  async exportResearchDataset(format = 'json') {
    return this.request(`/export/research-dataset?format=${format}`);
  }

  // Operations Telemetry
  async getTelemetry() {
    return this.request('/ops/telemetry');
  }

  async verifyAuditChain() {
    return this.request('/ops/audit-verify');
  }
}

export const apiClient = new ApiClient();
