import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
  delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const verifyToken = () => {
  return api.get('/auth/verify');
};

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/ingest-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAverageSensorData = (period) => {
  return api.get(`/average-sensor-data?period=${period}`);
};

export const getLatestSensorData = (hours, equipmentId = null) => {
  let url = `/latest-sensor-data?hours=${hours}`;
  if (equipmentId) {
    url += `&equipmentId=${equipmentId}`;
  }
  return api.get(url);
};

export const getLatestSensorDataByLocation = (hours) => {
  let url = `/latest-sensor-data-by-location?hours=${hours}`;
  return api.get(url);
};

export const getAllEquipment = () => {
  return api.get('/iot-devices');
};