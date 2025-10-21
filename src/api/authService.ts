// src/api/authService.ts
import api from './axios';

export const login = (payload: { email: string; password: string }) =>
  api.post('/auth/login', payload);

export const signup = (payload: { name: string; email: string; password: string }) =>
  api.post('/auth/signup', payload);

export const logout = () =>
  api.post('/auth/logout');

export const refresh = () =>
  api.post('/auth/refresh');

export const me = () =>
  api.get('/auth/me');
