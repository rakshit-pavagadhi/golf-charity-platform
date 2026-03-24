const API_URL = import.meta.env.VITE_API_URL || '';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  get(endpoint) { return this.request(endpoint); }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }

  // Auth
  signup(data) { return this.post('/api/auth/signup', data); }
  login(data) { return this.post('/api/auth/login', data); }
  getMe() { return this.get('/api/auth/me'); }
  updateProfile(data) { return this.put('/api/auth/profile', data); }

  // Scores
  getScores() { return this.get('/api/scores'); }
  addScore(data) { return this.post('/api/scores', data); }
  updateScore(id, data) { return this.put(`/api/scores/${id}`, data); }
  deleteScore(id) { return this.delete(`/api/scores/${id}`); }

  // Subscriptions
  createCheckout(plan) { return this.post('/api/subscriptions/create-checkout', { plan }); }
  getSubscriptionStatus() { return this.get('/api/subscriptions/status'); }
  cancelSubscription() { return this.post('/api/subscriptions/cancel'); }

  // Draws
  getDraws() { return this.get('/api/draws'); }
  getDraw(id) { return this.get(`/api/draws/${id}`); }
  executeDraw(data) { return this.post('/api/draws/execute', data); }
  simulateDraw(data) { return this.post('/api/draws/simulate', data); }
  publishDraw(id) { return this.post(`/api/draws/${id}/publish`); }

  // Charities
  getCharities(params = '') { return this.get(`/api/charities?${params}`); }
  getFeaturedCharities() { return this.get('/api/charities/featured'); }
  getCharity(id) { return this.get(`/api/charities/${id}`); }
  createCharity(data) { return this.post('/api/charities', data); }
  updateCharity(id, data) { return this.put(`/api/charities/${id}`, data); }
  deleteCharity(id) { return this.delete(`/api/charities/${id}`); }
  selectCharity(data) { return this.put('/api/charities/select/mine', data); }

  // Winners
  getWinners(params = '') { return this.get(`/api/winners?${params}`); }
  getMyWinnings() { return this.get('/api/winners/me'); }
  submitProof(id, data) { return this.post(`/api/winners/${id}/proof`, data); }
  verifyWinner(id, data) { return this.put(`/api/winners/${id}/verify`, data); }
  markPaid(id) { return this.put(`/api/winners/${id}/pay`); }

  // Admin
  getAdminUsers(params = '') { return this.get(`/api/admin/users?${params}`); }
  getAdminUser(id) { return this.get(`/api/admin/users/${id}`); }
  updateAdminUser(id, data) { return this.put(`/api/admin/users/${id}`, data); }
  updateUserScores(id, data) { return this.put(`/api/admin/users/${id}/scores`, data); }
  getAnalytics() { return this.get('/api/admin/analytics'); }

  // Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const headers = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }
}

export default new ApiService();
